const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateYieldPrediction(formData, weatherData = null, historicalData = null) {
    if (!this.genAI) {
      console.log('Gemini AI not available, using mock prediction');
      return this.generateMockPrediction(formData);
    }

    try {
      console.log('Generating prediction with Gemini AI...');
      const prompt = this.buildPredictionPrompt(formData, weatherData, historicalData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response received, parsing...');
      // Parse the Gemini response
      return this.parseGeminiResponse(text, formData);
    } catch (error) {
      console.error('Gemini AI Error:', error);
      // Fallback to mock prediction
      console.log('Falling back to mock prediction');
      return this.generateMockPrediction(formData);
    }
  }

  buildPredictionPrompt(formData, weatherData, historicalData) {
    const {
      cropType,
      fieldSize,
      soilType,
      irrigationType,
      plantingDate,
      location,
      previousYield,
      fertilizer,
      notes
    } = formData;

    return `
You are an expert agricultural AI assistant. Analyze the farm data and provide a yield prediction.

FARM DATA:
- Crop: ${cropType}
- Field Size: ${fieldSize} acres
- Soil Type: ${soilType || 'Not specified'}
- Irrigation: ${irrigationType || 'Not specified'}
- Planting Date: ${plantingDate || 'Not specified'}
- Location: ${location}
- Previous Yield: ${previousYield || 'Not available'} tons/acre
- Fertilizer: ${fertilizer || 'Not specified'}
- Notes: ${notes || 'None'}

${weatherData ? `WEATHER DATA:\n${JSON.stringify(weatherData, null, 2)}` : ''}

Provide ONLY a valid JSON response with this EXACT structure (no extra text, no markdown, no explanations):

{
  "predictedYield": 5200,
  "unit": "kg/ha",
  "confidence": 85,
  "variance": 300,
  "explanation": "Brief explanation",
  "factors": {
    "positive": ["Good soil conditions", "Adequate irrigation"],
    "negative": ["Weather uncertainty", "Pest risk"]
  },
  "recommendations": [
    {
      "category": "irrigation",
      "action": "Monitor soil moisture",
      "priority": "high",
      "timing": "Weekly",
      "expectedImpact": "Better water efficiency"
    }
  ],
  "riskAssessment": {
    "pestRisk": "medium",
    "diseaseRisk": "low",
    "weatherRisk": "medium",
    "overallRisk": "medium"
  },
  "seasonalAdvice": {
    "currentStage": "Vegetative growth",
    "nextSteps": ["Monitor growth", "Check irrigation"],
    "criticalPeriods": ["Flowering", "Harvest"]
  },
  "sustainability": {
    "waterEfficiency": "Good",
    "soilHealth": "Moderate",
    "suggestions": ["Use cover crops", "Rotate crops"]
  }
}

IMPORTANT: Return ONLY the JSON object above with actual values. No markdown, no explanations, no extra text.
`;
  }

  parseGeminiResponse(text, formData) {
    try {
      console.log('Raw Gemini response length:', text.length);
      console.log('First 200 chars:', text.substring(0, 200));
      
      // Clean the text - remove markdown, extra whitespace, etc.
      let cleanedText = text.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      
      // Find JSON object boundaries
      const startIndex = cleanedText.indexOf('{');
      const lastIndex = cleanedText.lastIndexOf('}');
      
      if (startIndex === -1 || lastIndex === -1 || startIndex >= lastIndex) {
        console.log('No valid JSON boundaries found');
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = cleanedText.substring(startIndex, lastIndex + 1);
      console.log('Extracted JSON string length:', jsonString.length);
      console.log('JSON preview:', jsonString.substring(0, 300));
      
      // Try to fix common JSON issues
      let fixedJson = jsonString
        // Fix unquoted property names
        .replace(/(\w+):/g, '"$1":')
        // Fix single quotes to double quotes
        .replace(/'/g, '"')
        // Fix trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix multiple commas
        .replace(/,,+/g, ',');
      
      console.log('Attempting to parse fixed JSON...');
      const parsedData = JSON.parse(fixedJson);
      console.log('JSON parsed successfully');
      
      // Validate and structure the response
      return this.validateAndStructureResponse(parsedData, formData);
      
    } catch (error) {
      console.error('Error parsing Gemini response:', error.message);
      console.log('Falling back to mock prediction due to parse error');
      return this.generateMockPrediction(formData);
    }
  }

  validateAndStructureResponse(parsedData, formData) {
    try {
      // Ensure all required fields exist with defaults
      const result = {
        predictedYield: this.validateNumber(parsedData.predictedYield) || this.getBaseYield(formData.cropType),
        unit: parsedData.unit || 'kg/ha',
        confidence: this.validateNumber(parsedData.confidence, 70, 95) || 85,
        variance: this.validateNumber(parsedData.variance) || Math.round((parsedData.predictedYield || this.getBaseYield(formData.cropType)) * 0.06),
        explanation: parsedData.explanation || 'AI-generated prediction based on provided data',
        factors: {
          positive: this.validateArray(parsedData.factors?.positive) || ['Suitable growing conditions'],
          negative: this.validateArray(parsedData.factors?.negative) || ['Weather uncertainty'],
          neutral: this.validateArray(parsedData.factors?.neutral) || []
        },
        recommendations: this.validateRecommendations(parsedData.recommendations || []),
        riskAssessment: this.validateRiskAssessment(parsedData.riskAssessment || {}),
        seasonalAdvice: this.validateSeasonalAdvice(parsedData.seasonalAdvice || {}),
        sustainability: this.validateSustainability(parsedData.sustainability || {}),
        aiGenerated: true,
        processingTime: new Date().toISOString()
      };

      console.log('Response validation completed successfully');
      return result;
      
    } catch (error) {
      console.error('Error validating response structure:', error);
      return this.generateMockPrediction(formData);
    }
  }

  validateNumber(value, min = null, max = null) {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return null;
    if (min !== null && num < min) return min;
    if (max !== null && num > max) return max;
    return num;
  }

  validateArray(arr) {
    return Array.isArray(arr) ? arr.filter(item => typeof item === 'string' && item.trim()) : null;
  }

  validateRecommendations(recommendations) {
    if (!Array.isArray(recommendations)) return this.getDefaultRecommendations();
    
    return recommendations.map(rec => ({
      category: rec.category || 'general',
      action: rec.action || 'Monitor crop conditions',
      priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
      timing: rec.timing || 'As needed',
      expectedImpact: rec.expectedImpact || 'Improved crop health',
      icon: this.getRecommendationIcon(rec.category)
    })).slice(0, 5); // Limit to 5 recommendations
  }

  validateRiskAssessment(risk) {
    const validLevels = ['low', 'medium', 'high'];
    return {
      pestRisk: validLevels.includes(risk.pestRisk) ? risk.pestRisk : 'medium',
      diseaseRisk: validLevels.includes(risk.diseaseRisk) ? risk.diseaseRisk : 'low',
      weatherRisk: validLevels.includes(risk.weatherRisk) ? risk.weatherRisk : 'medium',
      marketRisk: validLevels.includes(risk.marketRisk) ? risk.marketRisk : 'low',
      overallRisk: validLevels.includes(risk.overallRisk) ? risk.overallRisk : 'medium'
    };
  }

  validateSeasonalAdvice(advice) {
    return {
      currentStage: advice.currentStage || 'Vegetative growth stage',
      nextSteps: this.validateArray(advice.nextSteps) || ['Monitor crop health regularly'],
      criticalPeriods: this.validateArray(advice.criticalPeriods) || ['Flowering period', 'Harvest time']
    };
  }

  validateSustainability(sustainability) {
    return {
      waterEfficiency: sustainability.waterEfficiency || 'Moderate',
      soilHealth: sustainability.soilHealth || 'Good',
      suggestions: this.validateArray(sustainability.suggestions) || ['Implement sustainable practices']
    };
  }

  getDefaultRecommendations() {
    return [
      {
        category: 'irrigation',
        action: 'Monitor soil moisture levels regularly',
        priority: 'high',
        timing: 'Weekly',
        expectedImpact: 'Improved water efficiency',
        icon: '💧'
      },
      {
        category: 'fertilizer',
        action: 'Apply balanced NPK fertilizer',
        priority: 'medium',
        timing: 'Pre-flowering stage',
        expectedImpact: 'Enhanced nutrient uptake',
        icon: '🌱'
      }
    ];
  }

  getRecommendationIcon(category) {
    const icons = {
      irrigation: '💧',
      fertilizer: '🌱',
      pest_control: '🐛',
      soil_management: '🌍',
      timing: '⏰',
      general: '📋'
    };
    return icons[category] || '📋';
  }

  getBaseYield(cropType) {
    const baseYields = {
      corn: 5200,
      wheat: 4800,
      soybeans: 3100,
      rice: 6000,
      tomatoes: 45000,
      potatoes: 25000,
      cotton: 1200
    };
    return baseYields[cropType?.toLowerCase()] || 4000;
  }

  generateMockPrediction(formData) {
    const baseYield = this.getBaseYield(formData.cropType);
    
    console.log('Generating mock prediction for', formData.cropType);
    
    return {
      predictedYield: baseYield,
      unit: 'kg/ha',
      confidence: 82,
      variance: Math.round(baseYield * 0.06),
      explanation: 'Prediction based on statistical models and historical data',
      factors: {
        positive: ['Suitable crop variety for region', 'Adequate field size for efficient farming'],
        negative: ['Weather uncertainty during growing season', 'Potential pest pressure'],
        neutral: ['Standard farming practices applied']
      },
      recommendations: [
        {
          category: 'irrigation',
          action: 'Monitor soil moisture levels regularly',
          priority: 'high',
          timing: 'Weekly throughout growing season',
          expectedImpact: 'Improved water efficiency and yield stability',
          icon: '💧'
        },
        {
          category: 'fertilizer',
          action: 'Apply balanced NPK fertilizer based on soil test',
          priority: 'medium',
          timing: 'Pre-flowering stage',
          expectedImpact: 'Enhanced nutrient uptake and growth',
          icon: '🌱'
        },
        {
          category: 'pest_control',
          action: 'Implement integrated pest management',
          priority: 'medium',
          timing: 'Continuous monitoring',
          expectedImpact: 'Reduced crop loss from pests',
          icon: '🐛'
        }
      ],
      riskAssessment: {
        pestRisk: 'medium',
        diseaseRisk: 'low',
        weatherRisk: 'medium',
        marketRisk: 'low',
        overallRisk: 'medium'
      },
      seasonalAdvice: {
        currentStage: 'Vegetative growth stage',
        nextSteps: ['Monitor for pest activity', 'Maintain consistent irrigation', 'Apply growth stage appropriate fertilizer'],
        criticalPeriods: ['Flowering period - critical for yield formation', 'Grain filling stage - determines final yield']
      },
      sustainability: {
        waterEfficiency: 'Good with proper irrigation management',
        soilHealth: 'Maintain with organic matter addition',
        suggestions: ['Use cover crops during off-season', 'Implement crop rotation', 'Consider precision agriculture techniques']
      },
      aiGenerated: false,
      processingTime: new Date().toISOString()
    };
  }

  async getDiseaseIdentification(imageBase64, cropType, symptoms) {
    if (!this.genAI) {
      return this.generateMockDiseaseAnalysis(symptoms);
    }

    try {
      const prompt = `
You are an agricultural disease expert. Analyze the crop image and symptoms.

Crop Type: ${cropType}
Symptoms: ${symptoms}

Provide analysis in this EXACT JSON format:
{
  "disease": "identified disease name",
  "confidence": 75,
  "severity": "medium",
  "treatment": ["treatment 1", "treatment 2"],
  "prevention": ["prevention 1", "prevention 2"],
  "urgency": "medium"
}
`;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg"
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return this.parseGeminiResponse(text, { cropType });
    } catch (error) {
      console.error('Disease identification error:', error);
      return this.generateMockDiseaseAnalysis(symptoms);
    }
  }

  generateMockDiseaseAnalysis(symptoms) {
    return {
      disease: "General crop stress",
      confidence: 75,
      severity: "medium",
      treatment: [
        "Improve drainage if waterlogged",
        "Apply balanced fertilizer",
        "Monitor for pest activity"
      ],
      prevention: [
        "Maintain proper plant spacing",
        "Regular field inspection",
        "Implement crop rotation"
      ],
      urgency: "medium"
    };
  }

  // server/services/geminiService.js (Add generateFarmingPlan method)

// Add this method to the existing GeminiService class:

async generateFarmingPlan(planData) {
  if (!this.genAI) {
    console.log('Gemini AI not available, using mock plan');
    return this.generateMockPlan(planData);
  }

  try {
    console.log('Generating farming plan with Gemini AI...');
    const prompt = this.buildPlanPrompt(planData);
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini plan response received, parsing...');
    return this.parsePlanResponse(text, planData);
  } catch (error) {
    console.error('Gemini AI Plan Error:', error);
    console.log('Falling back to mock plan');
    return this.generateMockPlan(planData);
  }
}

buildPlanPrompt(planData) {
  const { planType, field, startDate, duration, objectives } = planData;
  
  return `
You are an expert agricultural planner. Create a detailed farming plan.

PLAN DATA:
- Plan Type: ${planType}
- Field: ${field.name} (${field.area} acres)
- Crop: ${field.currentCrop?.type || 'Not specified'}
- Soil Type: ${field.soilType || 'Not specified'}
- Irrigation: ${field.irrigationSystem || 'Not specified'}
- Start Date: ${startDate}
- Duration: ${duration} days
- Objectives: ${objectives.join(', ')}

Provide ONLY a valid JSON response with this EXACT structure:

{
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description",
      "type": "irrigation|fertilizer|pesticide|planting|harvesting|monitoring|maintenance",
      "priority": "low|medium|high",
      "scheduledDate": "2024-04-01T10:00:00Z",
      "estimatedDuration": 2,
      "instructions": "Step-by-step instructions",
      "resources": [
        {
          "type": "equipment|material|labor",
          "name": "Resource name",
          "quantity": 100,
          "unit": "kg"
        }
      ]
    }
  ],
  "recommendations": [
    {
      "category": "irrigation",
      "recommendation": "Monitor soil moisture daily",
      "reasoning": "Clay soil retains water longer",
      "confidence": 85,
      "priority": "high"
    }
  ],
  "resourceRequirements": [
    {
      "type": "fertilizer",
      "name": "NPK 20-20-20",
      "totalQuantity": 200,
      "unit": "kg",
      "estimatedCost": 5000,
      "timing": "Week 1-2"
    }
  ]
}

Create 5-15 tasks spread across the ${duration} day period. Include specific dates and practical instructions.
`;
}

parsePlanResponse(text, planData) {
  try {
    const cleanedText = text.trim()
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '');
    
    const startIndex = cleanedText.indexOf('{');
    const lastIndex = cleanedText.lastIndexOf('}');
    
    if (startIndex === -1 || lastIndex === -1) {
      throw new Error('No valid JSON found');
    }
    
    const jsonString = cleanedText.substring(startIndex, lastIndex + 1);
    const parsedData = JSON.parse(jsonString);
    
    return this.validatePlanResponse(parsedData, planData);
  } catch (error) {
    console.error('Error parsing plan response:', error);
    return this.generateMockPlan(planData);
  }
}

validatePlanResponse(parsedData, planData) {
  const { startDate, duration } = planData;
  const start = new Date(startDate);
  
  return {
    tasks: (parsedData.tasks || []).map((task, index) => {
      // Ensure task has a valid scheduled date within the plan period
      let taskDate = new Date(task.scheduledDate);
      if (isNaN(taskDate.getTime())) {
        // If invalid date, distribute tasks evenly across the plan period
        const dayOffset = Math.floor((duration / (parsedData.tasks.length || 1)) * index);
        taskDate = new Date(start.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
      }
      
      return {
        title: task.title || `Task ${index + 1}`,
        description: task.description || '',
        type: this.validateTaskType(task.type),
        priority: this.validatePriority(task.priority),
        scheduledDate: taskDate,
        estimatedDuration: this.validateNumber(task.estimatedDuration, 1, 24) || 2,
        instructions: task.instructions || '',
        resources: this.validateArray(task.resources) || []
      };
    }),
    recommendations: this.validateArray(parsedData.recommendations) || [],
    resourceRequirements: this.validateArray(parsedData.resourceRequirements) || []
  };
}

validateTaskType(type) {
  const validTypes = ['irrigation', 'fertilizer', 'pesticide', 'planting', 'harvesting', 'monitoring', 'maintenance'];
  return validTypes.includes(type) ? type : 'monitoring';
}

validatePriority(priority) {
  const validPriorities = ['low', 'medium', 'high'];
  return validPriorities.includes(priority) ? priority : 'medium';
}

generateMockPlan(planData) {
  const { planType, startDate, duration } = planData;
  const start = new Date(startDate);
  
  const mockTasks = this.generateMockTasks(planType, start, duration);
  
  return {
    tasks: mockTasks,
    recommendations: [
      {
        category: 'general',
        recommendation: 'Monitor weather conditions regularly',
        reasoning: 'Weather significantly impacts farming operations',
        confidence: 90,
        priority: 'high'
      },
      {
        category: 'irrigation',
        recommendation: 'Check soil moisture before each irrigation',
        reasoning: 'Prevents over-watering and water waste',
        confidence: 85,
        priority: 'medium'
      }
    ],
    resourceRequirements: [
      {
        type: 'labor',
        name: 'Farm workers',
        totalQuantity: duration * 2,
        unit: 'hours',
        estimatedCost: duration * 200,
        timing: 'Throughout plan period'
      }
    ]
  };
}

generateMockTasks(planType, startDate, duration) {
  const tasks = [];
  const start = new Date(startDate);
  
  switch (planType) {
    case 'irrigation':
      return this.generateIrrigationPlanTasks(start, duration);
    case 'fertilizer':
      return this.generateFertilizerPlanTasks(start, duration);
    case 'pest_control':
      return this.generatePestControlPlanTasks(start, duration);
    case 'complete_season':
      return this.generateCompleteSeasonTasks(start, duration);
    default:
      return this.generateGeneralPlanTasks(start, duration);
  }
}

generateIrrigationPlanTasks(start, duration) {
  const tasks = [];
  
  // Initial assessment
  tasks.push({
    title: 'Irrigation System Check',
    description: 'Inspect and test irrigation equipment',
    type: 'maintenance',
    priority: 'high',
    scheduledDate: start,
    estimatedDuration: 3,
    instructions: 'Check all sprinklers, pipes, and pumps for proper operation.',
    resources: []
  });
  
  // Weekly irrigation schedule
  for (let week = 1; week <= Math.ceil(duration / 7); week++) {
    const taskDate = new Date(start.getTime() + (week * 7 * 24 * 60 * 60 * 1000));
    tasks.push({
      title: `Week ${week} Irrigation`,
      description: 'Monitor and irrigate as needed',
      type: 'irrigation',
      priority: 'medium',
      scheduledDate: taskDate,
      estimatedDuration: 2,
      instructions: 'Check soil moisture and apply water based on crop needs.',
      resources: []
    });
  }
  
  return tasks;
}

generateFertilizerPlanTasks(start, duration) {
  const tasks = [];
  
  // Base application
  tasks.push({
    title: 'Base Fertilizer Application',
    description: 'Apply initial NPK fertilizer',
    type: 'fertilizer',
    priority: 'high',
    scheduledDate: start,
    estimatedDuration: 4,
    instructions: 'Apply 200kg/ha of NPK fertilizer uniformly across the field.',
    resources: []
  });
  
  // Follow-up applications
  if (duration > 30) {
    const midDate = new Date(start.getTime() + (30 * 24 * 60 * 60 * 1000));
    tasks.push({
      title: 'Mid-Season Top Dressing',
      description: 'Apply nitrogen top-dressing',
      type: 'fertilizer',
      priority: 'medium',
      scheduledDate: midDate,
      estimatedDuration: 3,
      instructions: 'Apply 100kg/ha of urea as side-dressing.',
      resources: []
    });
  }
  
  return tasks;
}

generatePestControlPlanTasks(start, duration) {
  const tasks = [];
  
  // Weekly monitoring
  for (let week = 0; week < Math.ceil(duration / 7); week++) {
    const taskDate = new Date(start.getTime() + (week * 7 * 24 * 60 * 60 * 1000));
    tasks.push({
      title: `Week ${week + 1} Pest Scouting`,
      description: 'Monitor for pest and disease activity',
      type: 'monitoring',
      priority: 'medium',
      scheduledDate: taskDate,
      estimatedDuration: 1.5,
      instructions: 'Inspect plants for signs of pests, diseases, or nutrient deficiencies.',
      resources: []
    });
  }
  
  return tasks;
}

generateCompleteSeasonTasks(start, duration) {
  const tasks = [];
  
  // Pre-planting
  tasks.push({
    title: 'Field Preparation',
    description: 'Prepare field for planting season',
    type: 'maintenance',
    priority: 'high',
    scheduledDate: start,
    estimatedDuration: 6,
    instructions: 'Clear field, till soil, and prepare planting beds.',
    resources: []
  });
  
  // Planting
  const plantDate = new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000));
  tasks.push({
    title: 'Crop Planting',
    description: 'Plant seeds or transplant seedlings',
    type: 'planting',
    priority: 'high',
    scheduledDate: plantDate,
    estimatedDuration: 8,
    instructions: 'Plant seeds at recommended depth and spacing.',
    resources: []
  });
  
  // Regular monitoring throughout season
  for (let week = 2; week < Math.ceil(duration / 7) - 2; week++) {
    const taskDate = new Date(start.getTime() + (week * 7 * 24 * 60 * 60 * 1000));
    tasks.push({
      title: `Week ${week} Monitoring`,
      description: 'Weekly crop health assessment',
      type: 'monitoring',
      priority: 'medium',
      scheduledDate: taskDate,
      estimatedDuration: 2,
      instructions: 'Check crop growth, pest activity, and irrigation needs.',
      resources: []
    });
  }
  
  // Harvest preparation
  if (duration > 90) {
    const harvestDate = new Date(start.getTime() + ((duration - 7) * 24 * 60 * 60 * 1000));
    tasks.push({
      title: 'Harvest Preparation',
      description: 'Prepare for harvest activities',
      type: 'harvesting',
      priority: 'high',
      scheduledDate: harvestDate,
      estimatedDuration: 4,
      instructions: 'Prepare harvesting equipment and storage facilities.',
      resources: []
    });
  }
  
  return tasks;
}

generateGeneralPlanTasks(start, duration) {
  return [
    {
      title: 'Plan Initiation',
      description: 'Begin farming plan implementation',
      type: 'maintenance',
      priority: 'high',
      scheduledDate: start,
      estimatedDuration: 2,
      instructions: 'Review plan objectives and prepare necessary resources.',
      resources: []
    }
  ];
}
async analyzeFieldInitialization(fieldContext) {
  if (!this.genAI) {
    console.log('Gemini AI not available, using basic field analysis');
    return this.getBasicFieldAnalysis(fieldContext);
  }

  try {
    console.log('Analyzing field with Gemini AI:', fieldContext.fieldName);
    
    const prompt = `
You are an expert agricultural advisor. Analyze this field and provide comprehensive insights.

FIELD DATA:
- Field Name: ${fieldContext.fieldName}
- Area: ${fieldContext.area} acres
- Crop: ${fieldContext.cropType}
- Growth Stage: ${fieldContext.growthStage}
- Soil Type: ${fieldContext.soilType}
- Irrigation: ${fieldContext.irrigationType}
- Water Availability: ${fieldContext.waterAvailability}
- Planting Date: ${fieldContext.plantingDate || 'Not provided'}
- Previous Yield: ${fieldContext.previousYield || 'Not provided'} kg/acre
- Known Issues: ${fieldContext.knownIssues || 'None reported'}
- Farming Method: ${fieldContext.farmingMethod}
- Location: ${fieldContext.location.district}, ${fieldContext.location.state}

SOIL HEALTH:
- pH: ${fieldContext.soilHealth.pH || 'Not tested'}
- Nitrogen: ${fieldContext.soilHealth.nitrogen || 'Not tested'}
- Phosphorus: ${fieldContext.soilHealth.phosphorus || 'Not tested'}
- Potassium: ${fieldContext.soilHealth.potassium || 'Not tested'}
- Organic Matter: ${fieldContext.soilHealth.organicMatter || 'Not tested'}%

CURRENT WEATHER:
- Temperature: ${fieldContext.weather?.temperature || 'N/A'}°C
- Humidity: ${fieldContext.weather?.humidity || 'N/A'}%
- Conditions: ${fieldContext.weather?.description || 'N/A'}

Provide ONLY a valid JSON response with this EXACT structure:

{
  "summary": "Brief 2-3 sentence analysis of current field status",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "immediateActions": [
    {
      "action": "Specific action to take",
      "priority": "high|medium|low",
      "reason": "Why this is needed",
      "timing": "When to do it"
    }
  ],
  "recommendations": [
    {
      "category": "irrigation|fertilizer|pest_control|soil_health",
      "recommendation": "Specific recommendation",
      "expectedBenefit": "What will improve"
    }
  ],
  "riskAssessment": {
    "weatherRisk": "low|medium|high",
    "pestRisk": "low|medium|high",
    "yieldRisk": "low|medium|high",
    "notes": "Brief explanation"
  },
  "nextMilestone": {
    "stage": "Next growth stage name",
    "expectedDate": "Estimated date",
    "preparations": ["preparation 1", "preparation 2"]
  }
}

Return ONLY the JSON, no markdown, no extra text. no comments in the json. Make it just plain json
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return this.parseJsonResponse(text, () => this.getBasicFieldAnalysis(fieldContext));
    
  } catch (error) {
    console.error('Field analysis error:', error);
    return this.getBasicFieldAnalysis(fieldContext);
  }
}

// New method: Generate farm-wide recommendations
async generateFarmRecommendations(context) {
  if (!this.genAI) {
    console.log('Gemini AI not available, using basic recommendations');
    return this.getBasicFarmRecommendations(context);
  }

  try {
    console.log('Generating farm recommendations with Gemini AI');
    
    const prompt = `
You are an expert farm management advisor. Analyze this farm and provide comprehensive recommendations.

FARM PROFILE:
- Experience Level: ${context.farmingExperience}
- Total Farm Size: ${context.farmSize} acres
- Primary Crops: ${context.primaryCrops.join(', ')}
- Farming Method: ${context.farmingMethod}
- Location: ${context.location.district}, ${context.location.state}

FIELDS ANALYSIS:
${context.fields.map((f, i) => `
Field ${i + 1}: ${f.fieldName}
- Analysis: ${JSON.stringify(f.analysis.summary)}
- Strengths: ${f.analysis.strengths?.join(', ')}
- Concerns: ${f.analysis.concerns?.join(', ')}
`).join('\n')}

Provide ONLY a valid JSON response with this EXACT structure:

{
  "farmStrategy": {
    "overallApproach": "2-3 sentence strategy for the whole farm",
    "focusAreas": ["area 1", "area 2", "area 3"],
    "seasonalTips": ["tip 1", "tip 2", "tip 3"]
  },
  "resourceOptimization": [
    {
      "resource": "water|labor|fertilizer|equipment",
      "currentStatus": "assessment of current usage",
      "improvementStrategy": "how to optimize",
      "potentialSavings": "estimated benefit"
    }
  ],
  "cropManagement": {
    "diversificationSuggestions": ["suggestion 1", "suggestion 2"],
    "rotationPlan": "Brief rotation strategy",
    "companionPlanting": ["plant pairing 1", "plant pairing 2"]
  },
  "sustainabilityTips": [
    {
      "practice": "Sustainable practice name",
      "implementation": "How to implement",
      "benefits": ["benefit 1", "benefit 2"]
    }
  ],
  "marketingAdvice": {
    "harvestTiming": "Optimal timing strategy",
    "qualityImprovement": ["tip 1", "tip 2"],
    "valueAddition": ["opportunity 1", "opportunity 2"]
  }
}
Return ONLY the JSON, no markdown, no extra text. No comments (strict json)
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return this.parseJsonResponse(text, () => this.getBasicFarmRecommendations(context));
    
  } catch (error) {
    console.error('Farm recommendations error:', error);
    return this.getBasicFarmRecommendations(context);
  }
}

// Helper: Parse JSON response with fallback
parseJsonResponse(text, fallbackFn) {
  try {
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json\s*/g, '');
    cleanedText = cleanedText.replace(/```\s*/g, '');
    
    const startIndex = cleanedText.indexOf('{');
    const lastIndex = cleanedText.lastIndexOf('}');
    
    if (startIndex === -1 || lastIndex === -1) {
      throw new Error('No valid JSON found');
    }
    
    const jsonString = cleanedText.substring(startIndex, lastIndex + 1);
    return JSON.parse(jsonString);
    
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    return fallbackFn();
  }
}

// Helper: Basic field analysis fallback
getBasicFieldAnalysis(fieldContext) {
  return {
    summary: `${fieldContext.fieldName} is a ${fieldContext.area} acre field growing ${fieldContext.cropType}. Currently in ${fieldContext.growthStage} stage.`,
    strengths: [
      `Good ${fieldContext.soilType} soil type for ${fieldContext.cropType}`,
      `${fieldContext.irrigationType} irrigation available`,
      `Adequate area for efficient farming`
    ],
    concerns: [
      fieldContext.waterAvailability === 'limited' ? 'Limited water availability' : null,
      fieldContext.knownIssues ? fieldContext.knownIssues : null,
      'Regular monitoring recommended'
    ].filter(Boolean),
    immediateActions: [
      {
        action: 'Monitor crop health daily',
        priority: 'high',
        reason: 'Early detection of issues prevents larger problems',
        timing: 'Daily, preferably morning hours'
      },
      {
        action: 'Check soil moisture levels',
        priority: 'medium',
        reason: 'Ensure optimal watering schedule',
        timing: 'Every 2-3 days'
      }
    ],
    recommendations: [
      {
        category: 'irrigation',
        recommendation: 'Maintain consistent irrigation schedule based on crop needs',
        expectedBenefit: 'Improved water efficiency and crop health'
      },
      {
        category: 'soil_health',
        recommendation: 'Consider soil testing for nutrient management',
        expectedBenefit: 'Optimized fertilizer application and better yields'
      }
    ],
    riskAssessment: {
      weatherRisk: 'medium',
      pestRisk: 'medium',
      yieldRisk: 'low',
      notes: 'Standard risks for the region and crop type'
    },
    nextMilestone: {
      stage: this.getNextGrowthStage(fieldContext.growthStage),
      expectedDate: 'Based on typical crop cycle',
      preparations: [
        'Monitor for stage-specific requirements',
        'Prepare necessary inputs in advance'
      ]
    }
  };
}

// Helper: Get next growth stage
getNextGrowthStage(currentStage) {
  const stages = {
    'not_planted': 'Land Preparation',
    'land_preparation': 'Sowing/Planting',
    'sowing': 'Germination',
    'germination': 'Vegetative Growth',
    'vegetative': 'Flowering',
    'flowering': 'Fruiting/Grain Filling',
    'fruiting': 'Maturity',
    'maturity': 'Harvest',
    'harvest_ready': 'Post-Harvest'
  };
  return stages[currentStage] || 'Next Stage';
}

// Helper: Basic farm recommendations fallback
getBasicFarmRecommendations(context) {
  return {
    farmStrategy: {
      overallApproach: `Focus on sustainable farming practices with ${context.farmingMethod} methods across your ${context.farmSize} acres.`,
      focusAreas: [
        'Soil health maintenance',
        'Water conservation',
        'Integrated pest management'
      ],
      seasonalTips: [
        'Plan crop rotation for next season',
        'Maintain farm equipment regularly',
        'Keep detailed farm records'
      ]
    },
    resourceOptimization: [
      {
        resource: 'water',
        currentStatus: 'Standard irrigation practices in use',
        improvementStrategy: 'Consider drip irrigation for water-intensive crops',
        potentialSavings: '20-30% water savings possible'
      },
      {
        resource: 'fertilizer',
        currentStatus: 'Regular fertilizer application',
        improvementStrategy: 'Soil testing for targeted nutrient application',
        potentialSavings: '15-20% cost reduction with same yields'
      }
    ],
    cropManagement: {
      diversificationSuggestions: [
        'Consider adding legumes for nitrogen fixation',
        'Mix of short and long duration crops'
      ],
      rotationPlan: 'Alternate between nitrogen-fixing and nitrogen-consuming crops',
      companionPlanting: [
        'Plant marigolds near vegetables for pest control',
        'Grow nitrogen-fixing plants between main crops'
      ]
    },
    sustainabilityTips: [
      {
        practice: 'Composting',
        implementation: 'Set up compost pit using farm waste',
        benefits: ['Reduced fertilizer costs', 'Improved soil structure']
      },
      {
        practice: 'Cover Cropping',
        implementation: 'Plant cover crops during off-season',
        benefits: ['Soil protection', 'Weed suppression', 'Organic matter addition']
      }
    ],
    marketingAdvice: {
      harvestTiming: 'Harvest at optimal maturity for best market prices',
      qualityImprovement: [
        'Proper post-harvest handling',
        'Timely pest and disease management'
      ],
      valueAddition: [
        'Explore direct-to-consumer sales',
        'Consider organic certification if applicable'
      ]
    }
  };
}
}

module.exports = new GeminiService();