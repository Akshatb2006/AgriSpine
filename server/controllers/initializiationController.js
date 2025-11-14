// server/controllers/initializationController.js
const User = require('../models/user');
const Field = require('../models/Field');
const Task = require('../models/Task');
const Alert = require('../models/Alert');
const Prediction = require('../models/Prediction');
const geminiService = require('../services/geminiService');
const weatherService = require('../services/weatherService');

// Store initialization jobs in memory (in production, use Redis or database)
const initializationJobs = new Map();

exports.initializeFarm = async (req, res) => {
  try {
    const userId = req.user.id;
    const onboardingData = req.body;

    // Generate unique job ID
    const jobId = `init_${userId}_${Date.now()}`;

    // Update user initialization status
    await User.findByIdAndUpdate(userId, {
      initializationStatus: 'processing',
      initializationJobId: jobId
    });

    // Store job in memory
    initializationJobs.set(jobId, {
      userId,
      status: 'processing',
      progress: 0,
      currentStep: 'analyzing',
      startedAt: new Date(),
      data: onboardingData
    });

    // Return immediately with job ID
    res.json({
      success: true,
      jobId,
      message: 'Initialization started'
    });

    // Process initialization asynchronously
    processInitialization(jobId, userId, onboardingData);

  } catch (err) {
    console.error('Initialize farm error:', err);
    return res.status(500).json({ error: 'Failed to start initialization' });
  }
};

exports.getInitializationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const job = initializationJobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Initialization job not found' });
    }

    // Verify ownership
    if (job.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.json({
      success: true,
      data: {
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        error: job.error || null
      }
    });

  } catch (err) {
    console.error('Get initialization status error:', err);
    return res.status(500).json({ error: 'Failed to get initialization status' });
  }
};

// Main processing function
async function processInitialization(jobId, userId, onboardingData) {
  const job = initializationJobs.get(jobId);

  try {
    console.log(`Starting initialization for user ${userId}, job ${jobId}`);

    // Step 1: Analyze fields (20%)
    updateJobProgress(jobId, 10, 'analyzing');
    const fieldsAnalysis = await analyzeFields(userId, onboardingData);
    updateJobProgress(jobId, 20, 'analyzing');

    // Step 2: Generate recommendations (45%)
    updateJobProgress(jobId, 25, 'recommendations');
    const recommendations = await generateRecommendations(userId, onboardingData, fieldsAnalysis);
    updateJobProgress(jobId, 45, 'recommendations');

    // Step 3: Create tasks (70%)
    updateJobProgress(jobId, 50, 'tasks');
    await createInitialTasks(userId, onboardingData, recommendations);
    updateJobProgress(jobId, 70, 'tasks');

    // Step 4: Setup alerts (90%)
    updateJobProgress(jobId, 75, 'alerts');
    await setupInitialAlerts(userId, onboardingData, fieldsAnalysis);
    updateJobProgress(jobId, 90, 'alerts');

    // Step 5: Generate baseline predictions
    await generateBaselinePredictions(userId, onboardingData);
    updateJobProgress(jobId, 95, 'alerts');

    // Mark as completed
    updateJobProgress(jobId, 100, 'completed');
    job.status = 'completed';
    job.completedAt = new Date();

    // Update user status
    await User.findByIdAndUpdate(userId, {
      initializationStatus: 'completed',
      initializationCompletedAt: new Date()
    });

    console.log(`Initialization completed for user ${userId}`);

    // Clean up job after 5 minutes
    setTimeout(() => {
      initializationJobs.delete(jobId);
    }, 300000);

  } catch (error) {
    console.error(`Initialization failed for user ${userId}:`, error);

    job.status = 'failed';
    job.error = error.message;

    await User.findByIdAndUpdate(userId, {
      initializationStatus: 'failed'
    });

    // Try fallback basic setup
    try {
      await createBasicSetup(userId, onboardingData);
    } catch (fallbackError) {
      console.error('Fallback setup also failed:', fallbackError);
    }
  }
}

function updateJobProgress(jobId, progress, step) {
  const job = initializationJobs.get(jobId);
  if (job) {
    job.progress = progress;
    if (step) job.currentStep = step;
  }
}

// Step 1: Analyze fields
async function analyzeFields(userId, data) {
  const { fields, location, farmingMethod } = data;

  const analysisPromises = fields.map(async (field) => {
    try {
      // Get weather data for the location
      const weather = await weatherService.getCurrentWeather(
        `${location.district}, ${location.state}`
      );

      // Build analysis context
      const fieldContext = {
        fieldName: field.name,
        area: field.area,
        cropType: field.cropType,
        soilType: field.soilType,
        growthStage: field.growthStage,
        plantingDate: field.plantingDate,
        irrigationType: field.irrigationType,
        waterAvailability: field.waterAvailability,
        soilHealth: field.soilHealth,
        previousYield: field.previousYield,
        knownIssues: field.knownIssues,
        location: location,
        farmingMethod: farmingMethod,
        weather: weather
      };

      // Call AI service for field analysis
      const analysis = await geminiService.analyzeFieldInitialization(fieldContext);

      return {
        fieldId: field.id,
        fieldName: field.name,
        analysis
      };
    } catch (error) {
      console.error(`Field analysis failed for ${field.name}:`, error);
      return {
        fieldId: field.id,
        fieldName: field.name,
        analysis: getBasicFieldAnalysis(field)
      };
    }
  });

  return await Promise.all(analysisPromises);
}

// Step 2: Generate recommendations
async function generateRecommendations(userId, data, fieldsAnalysis) {
  try {
    const recommendationsContext = {
      farmingExperience: data.farmingExperience,
      farmSize: data.farmSize,
      primaryCrops: data.primaryCrops,
      location: data.location,
      farmingMethod: data.farmingMethod,
      fields: fieldsAnalysis
    };

    const recommendations = await geminiService.generateFarmRecommendations(recommendationsContext);
    return recommendations;

  } catch (error) {
    console.error('Recommendations generation failed:', error);
    return getBasicRecommendations(data);
  }
}

// Step 3: Create initial tasks
async function createInitialTasks(userId, data, recommendations) {
  const tasks = [];

  for (const field of data.fields) {
    // Get field from database
    const dbField = await Field.findOne({
      farmerId: userId,
      name: field.name
    });

    if (!dbField) continue;

    // Generate tasks based on growth stage
    const fieldTasks = generateTasksForField(field, dbField._id, recommendations);

    // Create tasks in database
    for (const taskData of fieldTasks) {
      try {
        const task = await Task.create({
          farmerId: userId,
          fieldId: dbField._id,
          ...taskData,
          aiGenerated: true,
          initialSetup: true
        });
        tasks.push(task);
      } catch (error) {
        console.error('Task creation failed:', error);
      }
    }
  }

  return tasks;
}

// Step 4: Setup initial alerts
async function setupInitialAlerts(userId, data, fieldsAnalysis) {
  const alerts = [];

  for (const fieldAnalysis of fieldsAnalysis) {
    const field = data.fields.find(f => f.id === fieldAnalysis.fieldId);
    if (!field) continue;

    const dbField = await Field.findOne({
      farmerId: userId,
      name: field.name
    });

    if (!dbField) continue;

    // Generate alerts based on field analysis
    const fieldAlerts = generateAlertsForField(field, dbField._id, fieldAnalysis.analysis);

    // Create alerts in database
    for (const alertData of fieldAlerts) {
      try {
        const alert = await Alert.create({
          farmerId: userId,
          fieldId: dbField._id,
          ...alertData,
          initialSetup: true
        });
        alerts.push(alert);
      } catch (error) {
        console.error('Alert creation failed:', error);
      }
    }
  }

  return alerts;
}

// Step 5: Generate baseline predictions
async function generateBaselinePredictions(userId, data) {
  for (const field of data.fields) {
    if (!field.cropType || field.growthStage === 'not_planted') continue;

    try {
      const dbField = await Field.findOne({
        farmerId: userId,
        name: field.name
      });

      if (!dbField) continue;

      const predictionData = {
        cropType: field.cropType,
        fieldSize: field.area,
        soilType: field.soilType,
        irrigationType: field.irrigationType,
        plantingDate: field.plantingDate,
        location: `${data.location.district}, ${data.location.state}`,
        previousYield: field.previousYield,
        growthStage: field.growthStage
      };

      // Generate yield prediction
      const weather = await weatherService.getCurrentWeather(
        `${data.location.district}, ${data.location.state}`
      );

      const prediction = await geminiService.generateYieldPrediction(
        predictionData,
        { current: weather },
        {}
      );

      // Store prediction
      await Prediction.create({
        farmerId: userId,
        fieldId: dbField._id,
        predictionType: 'yield',
        inputData: predictionData,
        aiResponse: prediction,
        prediction: prediction,
        predictedYield: prediction.predictedYield,
        confidence: prediction.confidence,
        status: 'completed',
        initialSetup: true
      });

    } catch (error) {
      console.error(`Prediction generation failed for ${field.name}:`, error);
    }
  }
}

// Helper: Generate tasks for a field
function generateTasksForField(field, fieldId, recommendations) {
  const tasks = [];
  const today = new Date();

  // Tasks based on growth stage
  switch (field.growthStage) {
    case 'not_planted':
    case 'land_preparation':
      tasks.push({
        title: `Prepare ${field.name} for Planting`,
        description: 'Till soil, remove weeds, and prepare beds',
        type: 'maintenance',
        priority: 'high',
        status: 'pending',
        scheduledDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
      });
      break;

    case 'sowing':
    case 'germination':
      tasks.push({
        title: `Monitor Germination in ${field.name}`,
        description: 'Check for uniform germination and seedling health',
        type: 'monitoring',
        priority: 'high',
        status: 'pending',
        scheduledDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)
      });
      break;

    case 'vegetative':
      tasks.push({
        title: `Apply Fertilizer to ${field.name}`,
        description: 'Apply balanced NPK fertilizer for vegetative growth',
        type: 'fertilizer',
        priority: 'high',
        status: 'pending',
        scheduledDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
      });
      break;

    case 'flowering':
      tasks.push({
        title: `Monitor ${field.name} for Pests`,
        description: 'Check for pest activity during flowering stage',
        type: 'monitoring',
        priority: 'high',
        status: 'pending',
        scheduledDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)
      });
      break;

    case 'harvest_ready':
      tasks.push({
        title: `Prepare for Harvest in ${field.name}`,
        description: 'Check crop maturity and prepare harvesting equipment',
        type: 'harvest',
        priority: 'high',
        status: 'pending',
        scheduledDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
      });
      break;
  }

  // Add irrigation task if needed
  if (field.waterAvailability === 'limited' || field.waterAvailability === 'scarce') {
    tasks.push({
      title: `Check Irrigation in ${field.name}`,
      description: 'Monitor soil moisture and irrigate if needed',
      type: 'irrigation',
      priority: 'medium',
      status: 'pending',
      scheduledDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    });
  }

  return tasks;
}

// Helper: Generate alerts for a field
function generateAlertsForField(field, fieldId, analysis) {
  const alerts = [];

  // Weather-based alerts
  alerts.push({
    type: 'weather',
    severity: 'low',
    title: `Weather Update for ${field.name}`,
    description: 'Monitor weather conditions for optimal farming',
    actionRequired: false,
    recommendations: ['Check daily weather forecast', 'Plan activities accordingly'],
    isRead: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // Growth stage specific alerts
  if (field.growthStage === 'flowering' || field.growthStage === 'fruiting') {
    alerts.push({
      type: 'pest',
      severity: 'medium',
      title: `Monitor ${field.name} - Critical Growth Stage`,
      description: 'Flowering/fruiting stage requires close monitoring for pests',
      actionRequired: true,
      recommendations: ['Scout field daily', 'Check for pest signs', 'Apply preventive measures'],
      isRead: false,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
  }

  // Soil health alerts
  if (field.soilHealth.pH && (parseFloat(field.soilHealth.pH) < 5.5 || parseFloat(field.soilHealth.pH) > 8)) {
    alerts.push({
      type: 'irrigation',
      severity: 'medium',
      title: `Soil pH Issue in ${field.name}`,
      description: `Soil pH is ${field.soilHealth.pH} - may need adjustment`,
      actionRequired: true,
      recommendations: ['Conduct detailed soil test', 'Consider pH adjustment', 'Consult agronomist'],
      isRead: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }

  return alerts;
}

// Fallback: Create basic setup without AI
async function createBasicSetup(userId, data) {
  console.log('Creating basic setup for user', userId);

  for (const field of data.fields) {
    const dbField = await Field.findOne({
      farmerId: userId,
      name: field.name
    });

    if (!dbField) continue;

    // Create one basic task
    await Task.create({
      farmerId: userId,
      fieldId: dbField._id,
      title: `Review ${field.name}`,
      description: 'Review field status and plan next actions',
      type: 'monitoring',
      priority: 'medium',
      status: 'pending',
      scheduledDate: new Date(),
      aiGenerated: false,
      initialSetup: true
    });

    // Create one basic alert
    await Alert.create({
      farmerId: userId,
      fieldId: dbField._id,
      type: 'weather',
      severity: 'low',
      title: `Welcome to ${field.name}`,
      description: 'Your field has been added successfully',
      actionRequired: false,
      recommendations: ['Start monitoring your field', 'Add more details for better insights'],
      isRead: false,
      initialSetup: true
    });
  }
}

// Helper functions for basic analysis
function getBasicFieldAnalysis(field) {
  return {
    summary: `Basic analysis for ${field.name}`,
    recommendations: ['Monitor field regularly', 'Maintain proper irrigation'],
    risks: ['Weather variations', 'Pest activity'],
    opportunities: ['Good soil type', 'Suitable crop selection']
  };
}

function getBasicRecommendations(data) {
  return {
    general: ['Follow best farming practices', 'Monitor weather regularly'],
    fieldSpecific: {}
  };
}

module.exports = exports;