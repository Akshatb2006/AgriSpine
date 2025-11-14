// server/controllers/plansController.js (Complete Implementation)
const Plan = require('../models/Plan');
const Field = require('../models/Field');
const geminiService = require('../services/geminiService');

// Get all plans for a farmer
exports.getAll = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { fieldId, status, planType } = req.query;

    let query = { farmerId };

    if (fieldId) query.fieldId = fieldId;
    if (status) query.status = status;
    if (planType) query.planType = planType;

    const plans = await Plan.find(query)
      .populate('fieldId', 'name area currentCrop')
      .sort({ createdAt: -1 });

    const formattedPlans = plans.map(plan => ({
      id: plan._id,
      title: plan.title,
      planType: plan.planType,
      status: plan.status,
      priority: plan.priority,
      startDate: plan.startDate,
      endDate: plan.endDate,
      duration: plan.duration,
      fieldName: plan.fieldId?.name || 'Unknown Field',
      fieldId: plan.fieldId?._id,
      progress: plan.progress.percentage,
      tasksTotal: plan.progress.totalTasks,
      tasksCompleted: plan.progress.completedTasks,
      objectives: plan.objectives,
      createdAt: plan.createdAt,
      overdueTasks: plan.getOverdueTasks().length,
      upcomingTasks: plan.getUpcomingTasks().length
    }));

    return res.json({ success: true, data: formattedPlans });
  } catch (err) {
    console.error('Plans fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

// Get a specific plan by ID
exports.getOne = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const plan = await Plan.findOne({ _id: id, farmerId })
      .populate('fieldId', 'name area currentCrop soilType irrigationSystem');

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const formattedPlan = {
      id: plan._id,
      title: plan.title,
      planType: plan.planType,
      status: plan.status,
      priority: plan.priority,
      startDate: plan.startDate,
      endDate: plan.endDate,
      duration: plan.duration,
      field: plan.fieldId,
      objectives: plan.objectives,
      expectedOutcomes: plan.expectedOutcomes,
      tasks: plan.tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        status: task.status,
        scheduledDate: task.scheduledDate,
        estimatedDuration: task.estimatedDuration,
        resources: task.resources,
        instructions: task.instructions,
        completedDate: task.completedDate,
        actualDuration: task.actualDuration,
        notes: task.notes,
        aiGenerated: task.aiGenerated
      })),
      aiRecommendations: plan.aiRecommendations,
      resourceRequirements: plan.resourceRequirements,
      progress: plan.progress,
      weatherFactors: plan.weatherFactors,
      notes: plan.notes,
      createdBy: plan.createdBy,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      overdueTasks: plan.getOverdueTasks(),
      upcomingTasks: plan.getUpcomingTasks()
    };

    return res.json({ success: true, data: formattedPlan });
  } catch (err) {
    console.error('Plan detail error:', err);
    return res.status(500).json({ error: 'Failed to fetch plan details' });
  }
};

// Create a new plan
// Fixed server/controllers/plansController.js - create function
exports.create = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const {
      title,
      planType,
      fieldId,
      startDate,
      duration,
      priority,
      objectives,
      notes
    } = req.body;

    // Validation
    if (!title || !planType || !fieldId || !startDate || !duration) {
      return res.status(400).json({
        error: 'Title, plan type, field, start date, and duration are required'
      });
    }

    // Verify field ownership
    const field = await Field.findOne({ _id: fieldId, farmerId });
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }

    // Calculate end date
    const start = new Date(startDate);
    const end = new Date(start.getTime() + (parseInt(duration) * 24 * 60 * 60 * 1000));

    // Create plan with processing status
    const plan = await Plan.create({
      farmerId,
      fieldId,
      title,
      planType,
      status: 'processing', // Changed from 'draft' to 'processing'
      priority: priority || 'medium',
      startDate: start,
      endDate: end,
      duration: parseInt(duration),
      objectives: objectives || [],
      notes: notes || '',
      createdBy: 'farmer'
    });

    // Send immediate response with plan ID
    res.json({
      success: true,
      data: {
        id: plan._id,
        title: plan.title,
        status: 'processing',
        message: 'Plan creation initiated'
      }
    });

    // Generate AI recommendations and tasks asynchronously
    generatePlanTasksAsync(plan._id, {
      planType,
      field,
      startDate: start,
      duration: parseInt(duration),
      objectives: objectives || [],
      farmerId
    });

  } catch (err) {
    console.error('Plan creation error:', err);
    return res.status(500).json({ error: 'Failed to create plan' });
  }
};

// Separate async function for plan generation
async function generatePlanTasksAsync(planId, planData) {
  try {
    console.log(`Starting AI plan generation for plan ${planId}`);

    await generatePlanTasks(planId, planData);

    // Update plan status to active
    await Plan.findByIdAndUpdate(planId, {
      status: 'active',
      updatedAt: new Date()
    });

    console.log(`Plan ${planId} generation completed successfully`);
  } catch (aiError) {
    console.warn(`AI plan generation failed for plan ${planId}:`, aiError.message);

    try {
      // Generate basic plan as fallback
      await generateBasicPlanTasks(planId, planData.planType, planData.startDate, planData.duration);

      // Update plan status to active with note about basic generation
      const plan = await Plan.findById(planId);
      if (plan) {
        plan.status = 'active';
        plan.notes = (plan.notes || '') + '\n\nNote: Plan generated using basic templates.';
        plan.updatedAt = new Date();
        await plan.save();
      }

      console.log(`Plan ${planId} completed with basic template`);
    } catch (fallbackError) {
      console.error(`Fallback plan generation failed for ${planId}:`, fallbackError);

      // Mark plan as failed
      await Plan.findByIdAndUpdate(planId, {
        status: 'draft',
        notes: (planData.notes || '') + '\n\nError: Plan generation failed. Please try again.',
        updatedAt: new Date()
      });
    }
  }
}

// Enhanced generatePlanTasks function with better error handling
async function generatePlanTasks(planId, planData) {
  try {
    console.log(`Generating AI tasks for plan ${planId}`);

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Call Gemini service for plan generation with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timeout')), 30000)
    );

    const aiPromise = geminiService.generateFarmingPlan(planData);
    const aiResponse = await Promise.race([aiPromise, timeoutPromise]);

    // Update plan with AI-generated content
    if (aiResponse.tasks && aiResponse.tasks.length > 0) {
      plan.tasks = aiResponse.tasks.map(task => ({
        ...task,
        aiGenerated: true
      }));
      console.log(`Added ${aiResponse.tasks.length} AI-generated tasks`);
    }

    if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
      plan.aiRecommendations = aiResponse.recommendations;
      console.log(`Added ${aiResponse.recommendations.length} AI recommendations`);
    }

    if (aiResponse.resourceRequirements && aiResponse.resourceRequirements.length > 0) {
      plan.resourceRequirements = aiResponse.resourceRequirements;
      console.log(`Added ${aiResponse.resourceRequirements.length} resource requirements`);
    }

    await plan.save();
    console.log(`Plan ${planId} updated with AI content`);

  } catch (error) {
    console.error(`AI plan generation failed for ${planId}:`, error);
    throw error;
  }
}

// Add a new endpoint to check plan status
exports.getStatus = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const plan = await Plan.findOne({ _id: id, farmerId })
      .select('status tasks.length progress createdAt updatedAt');

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    return res.json({
      success: true,
      data: {
        id: plan._id,
        status: plan.status,
        taskCount: plan.tasks.length,
        progress: plan.progress,
        isReady: plan.status !== 'processing' && plan.status !== 'draft',
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      }
    });
  } catch (err) {
    console.error('Plan status check error:', err);
    return res.status(500).json({ error: 'Failed to check plan status' });
  }
};

// Update an existing plan
exports.update = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.farmerId;
    delete updateData.createdAt;
    delete updateData.tasks; // Tasks are updated separately

    const plan = await Plan.findOne({ _id: id, farmerId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // If fieldId is being updated, verify ownership
    if (updateData.fieldId) {
      const field = await Field.findOne({ _id: updateData.fieldId, farmerId });
      if (!field) {
        return res.status(404).json({ error: 'Field not found' });
      }
    }

    // If duration is being updated, recalculate end date
    if (updateData.duration && plan.startDate) {
      updateData.endDate = new Date(plan.startDate.getTime() + (parseInt(updateData.duration) * 24 * 60 * 60 * 1000));
    }

    // Update the plan
    Object.keys(updateData).forEach(key => {
      plan[key] = updateData[key];
    });

    plan.updatedAt = new Date();
    await plan.save();

    return res.json({
      success: true,
      data: {
        id: plan._id,
        message: 'Plan updated successfully'
      }
    });
  } catch (err) {
    console.error('Plan update error:', err);
    return res.status(500).json({ error: 'Failed to update plan' });
  }
};

// Delete a plan
exports.delete = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const plan = await Plan.findOneAndDelete({ _id: id, farmerId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    return res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    console.error('Plan deletion error:', err);
    return res.status(500).json({ error: 'Failed to delete plan' });
  }
};

// ==================== TASK MANAGEMENT FUNCTIONS ====================

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id, taskId } = req.params;
    const { status, notes, actualDuration } = req.body;

    if (!['pending', 'in-progress', 'completed', 'skipped'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be pending, in-progress, completed, or skipped'
      });
    }

    const plan = await Plan.findOne({ _id: id, farmerId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const task = plan.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task
    task.status = status;
    if (notes !== undefined) task.notes = notes;
    if (actualDuration) task.actualDuration = actualDuration;
    if (status === 'completed') {
      task.completedDate = new Date();
    } else {
      task.completedDate = null;
    }

    await plan.save();

    return res.json({
      success: true,
      data: {
        taskId: task._id,
        status: task.status,
        progress: plan.progress,
        message: 'Task status updated successfully'
      }
    });
  } catch (err) {
    console.error('Task update error:', err);
    return res.status(500).json({ error: 'Failed to update task' });
  }
};

// Add a new task to a plan
exports.addTask = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    const {
      title,
      description,
      type,
      priority,
      scheduledDate,
      estimatedDuration,
      instructions,
      resources
    } = req.body;

    // Validation
    if (!title || !type || !scheduledDate) {
      return res.status(400).json({
        error: 'Title, type, and scheduled date are required'
      });
    }

    const plan = await Plan.findOne({ _id: id, farmerId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Validate task type
    const validTypes = ['irrigation', 'fertilizer', 'pesticide', 'planting', 'harvesting', 'monitoring', 'maintenance'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid task type' });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority level' });
    }

    // Add new task
    const newTask = {
      title,
      description: description || '',
      type,
      priority: priority || 'medium',
      status: 'pending',
      scheduledDate: new Date(scheduledDate),
      estimatedDuration: estimatedDuration || null,
      instructions: instructions || '',
      resources: resources || [],
      aiGenerated: false
    };

    plan.tasks.push(newTask);
    await plan.save();

    const addedTask = plan.tasks[plan.tasks.length - 1];

    return res.json({
      success: true,
      data: {
        taskId: addedTask._id,
        task: {
          id: addedTask._id,
          title: addedTask.title,
          description: addedTask.description,
          type: addedTask.type,
          priority: addedTask.priority,
          status: addedTask.status,
          scheduledDate: addedTask.scheduledDate,
          estimatedDuration: addedTask.estimatedDuration,
          instructions: addedTask.instructions,
          resources: addedTask.resources,
          aiGenerated: addedTask.aiGenerated
        },
        message: 'Task added successfully'
      }
    });
  } catch (err) {
    console.error('Add task error:', err);
    return res.status(500).json({ error: 'Failed to add task' });
  }
};

// Update an existing task
exports.updateTask = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id, taskId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.aiGenerated;

    const plan = await Plan.findOne({ _id: id, farmerId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const task = plan.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate task type if provided
    if (updateData.type) {
      const validTypes = ['irrigation', 'fertilizer', 'pesticide', 'planting', 'harvesting', 'monitoring', 'maintenance'];
      if (!validTypes.includes(updateData.type)) {
        return res.status(400).json({ error: 'Invalid task type' });
      }
    }

    // Validate priority if provided
    if (updateData.priority) {
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      if (!validPriorities.includes(updateData.priority)) {
        return res.status(400).json({ error: 'Invalid priority level' });
      }
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['pending', 'in-progress', 'completed', 'skipped'];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
    }

    // Update task fields
    Object.keys(updateData).forEach(key => {
      if (key === 'scheduledDate' && updateData[key]) {
        task[key] = new Date(updateData[key]);
      } else if (updateData[key] !== undefined) {
        task[key] = updateData[key];
      }
    });

    // Handle completion date logic
    if (updateData.status === 'completed' && !task.completedDate) {
      task.completedDate = new Date();
    } else if (updateData.status && updateData.status !== 'completed') {
      task.completedDate = null;
    }

    await plan.save();

    return res.json({
      success: true,
      data: {
        taskId: task._id,
        task: {
          id: task._id,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          status: task.status,
          scheduledDate: task.scheduledDate,
          estimatedDuration: task.estimatedDuration,
          instructions: task.instructions,
          resources: task.resources,
          completedDate: task.completedDate,
          actualDuration: task.actualDuration,
          notes: task.notes,
          aiGenerated: task.aiGenerated
        },
        progress: plan.progress,
        message: 'Task updated successfully'
      }
    });
  } catch (err) {
    console.error('Update task error:', err);
    return res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete a task from a plan
exports.deleteTask = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id, taskId } = req.params;

    const plan = await Plan.findOne({ _id: id, farmerId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const task = plan.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Remove the task
    task.remove();
    await plan.save();

    return res.json({
      success: true,
      data: {
        progress: plan.progress,
        message: 'Task deleted successfully'
      }
    });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Get all tasks for a plan (separate endpoint if needed)
exports.getTasks = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    const { status, type, priority } = req.query;

    const plan = await Plan.findOne({ _id: id, farmerId });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    let tasks = plan.tasks;

    // Apply filters if provided
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    if (type) {
      tasks = tasks.filter(task => task.type === type);
    }
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      status: task.status,
      scheduledDate: task.scheduledDate,
      estimatedDuration: task.estimatedDuration,
      instructions: task.instructions,
      resources: task.resources,
      completedDate: task.completedDate,
      actualDuration: task.actualDuration,
      notes: task.notes,
      aiGenerated: task.aiGenerated
    }));

    return res.json({
      success: true,
      data: {
        planId: plan._id,
        planTitle: plan.title,
        tasks: formattedTasks,
        totalTasks: tasks.length
      }
    });
  } catch (err) {
    console.error('Get tasks error:', err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get plan statistics
exports.getStats = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const totalPlans = await Plan.countDocuments({ farmerId });
    const activePlans = await Plan.countDocuments({ farmerId, status: 'active' });
    const completedPlans = await Plan.countDocuments({ farmerId, status: 'completed' });

    // Get plans with task statistics
    const plans = await Plan.find({ farmerId });

    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let upcomingTasks = 0;

    const now = new Date();
    const nextWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    plans.forEach(plan => {
      plan.tasks.forEach(task => {
        totalTasks++;
        if (task.status === 'completed') {
          completedTasks++;
        }
        if (task.status !== 'completed' && task.status !== 'skipped' && new Date(task.scheduledDate) < now) {
          overdueTasks++;
        }
        if (task.status === 'pending' && new Date(task.scheduledDate) >= now && new Date(task.scheduledDate) <= nextWeek) {
          upcomingTasks++;
        }
      });
    });

    return res.json({
      success: true,
      data: {
        plans: {
          total: totalPlans,
          active: activePlans,
          completed: completedPlans,
          draft: totalPlans - activePlans - completedPlans
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          overdue: overdueTasks,
          upcoming: upcomingTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// ==================== HELPER FUNCTIONS ====================

// Enhanced helper function for AI plan generation
async function generatePlanTasks(planId, planData) {
  try {
    console.log(`Generating AI tasks for plan ${planId}`);

    // Call Gemini service for plan generation
    const aiResponse = await geminiService.generateFarmingPlan(planData);

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Update plan with AI-generated content
    if (aiResponse.tasks && aiResponse.tasks.length > 0) {
      plan.tasks = aiResponse.tasks.map(task => ({
        ...task,
        aiGenerated: true
      }));
      console.log(`Added ${aiResponse.tasks.length} AI-generated tasks`);
    }

    if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
      plan.aiRecommendations = aiResponse.recommendations;
      console.log(`Added ${aiResponse.recommendations.length} AI recommendations`);
    }

    if (aiResponse.resourceRequirements && aiResponse.resourceRequirements.length > 0) {
      plan.resourceRequirements = aiResponse.resourceRequirements;
      console.log(`Added ${aiResponse.resourceRequirements.length} resource requirements`);
    }

    await plan.save();
    console.log(`Plan ${planId} updated with AI content`);

  } catch (error) {
    console.error(`AI plan generation failed for ${planId}:`, error);
    throw error;
  }
}

// Fallback function for basic plan templates
async function generateBasicPlanTasks(planId, planType, startDate, duration) {
  const plan = await Plan.findById(planId);
  if (!plan) return;

  let basicTasks = [];

  switch (planType) {
    case 'complete_season':
      basicTasks = generateCompleteSeasonTasks(startDate, duration);
      break;
    case 'irrigation':
      basicTasks = generateIrrigationTasks(startDate, duration);
      break;
    case 'fertilizer':
      basicTasks = generateFertilizerTasks(startDate, duration);
      break;
    case 'pest_control':
      basicTasks = generatePestControlTasks(startDate, duration);
      break;
    case 'soil_health':
      basicTasks = generateSoilHealthTasks(startDate, duration);
      break;
    case 'harvest_prep':
      basicTasks = generateHarvestPrepTasks(startDate, duration);
      break;
    default:
      basicTasks = generateGeneralTasks(startDate, duration);
  }

  plan.tasks = basicTasks;
  await plan.save();
}

function generateCompleteSeasonTasks(startDate, duration) {
  const tasks = [];
  const start = new Date(startDate);

  // Pre-planting
  tasks.push({
    title: 'Field Preparation',
    description: 'Prepare field for planting season',
    type: 'maintenance',
    priority: 'high',
    scheduledDate: start,
    estimatedDuration: 6,
    instructions: 'Clear field, till soil, and prepare planting beds.',
    aiGenerated: false
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
    aiGenerated: false
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
      aiGenerated: false
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
      aiGenerated: false
    });
  }

  return tasks;
}

function generateIrrigationTasks(startDate, duration) {
  const tasks = [];
  const start = new Date(startDate);

  // System check
  tasks.push({
    title: 'Irrigation System Check',
    description: 'Inspect and test irrigation equipment',
    type: 'maintenance',
    priority: 'high',
    scheduledDate: start,
    estimatedDuration: 3,
    instructions: 'Check all sprinklers, pipes, and pumps for proper operation.',
    aiGenerated: false
  });

  // Weekly irrigation schedule
  for (let week = 1; week <= Math.ceil(duration / 7); week++) {
    const taskDate = new Date(start.getTime() + (week * 7 * 24 * 60 * 60 * 1000));
    tasks.push({
      title: `Week ${week} Irrigation`,
      description: 'Monitor soil moisture and irrigate as needed',
      type: 'irrigation',
      priority: 'medium',
      scheduledDate: taskDate,
      estimatedDuration: 2,
      instructions: 'Check soil moisture at 6 inches depth. Irrigate if moisture is below 50%.',
      aiGenerated: false
    });
  }

  return tasks;
}

function generateFertilizerTasks(startDate, duration) {
  const tasks = [];
  const start = new Date(startDate);

  // Initial soil test
  tasks.push({
    title: 'Soil Testing',
    description: 'Test soil for nutrient levels',
    type: 'monitoring',
    priority: 'high',
    scheduledDate: start,
    estimatedDuration: 2,
    instructions: 'Collect soil samples and test for NPK levels, pH, and organic matter.',
    aiGenerated: false
  });

  // Base application
  const baseDate = new Date(start.getTime() + (3 * 24 * 60 * 60 * 1000));
  tasks.push({
    title: 'Base Fertilizer Application',
    description: 'Apply base NPK fertilizer',
    type: 'fertilizer',
    priority: 'high',
    scheduledDate: baseDate,
    estimatedDuration: 3,
    instructions: 'Apply 200kg/ha of NPK fertilizer and incorporate into soil.',
    aiGenerated: false
  });

  // Mid-season application
  if (duration > 30) {
    const midDate = new Date(start.getTime() + (30 * 24 * 60 * 60 * 1000));
    tasks.push({
      title: 'Mid-Season Fertilizer',
      description: 'Apply nitrogen top-dressing',
      type: 'fertilizer',
      priority: 'medium',
      scheduledDate: midDate,
      estimatedDuration: 2,
      instructions: 'Apply 100kg/ha of urea as top-dressing.',
      aiGenerated: false
    });
  }

  return tasks;
}

function generatePestControlTasks(startDate, duration) {
  const tasks = [];
  const start = new Date(startDate);

  // Initial assessment
  tasks.push({
    title: 'Pest Baseline Assessment',
    description: 'Establish baseline pest and beneficial insect populations',
    type: 'monitoring',
    priority: 'high',
    scheduledDate: start,
    estimatedDuration: 2,
    instructions: 'Conduct thorough field survey for existing pest issues and beneficial insects.',
    aiGenerated: false
  });

  // Weekly monitoring
  for (let week = 1; week <= Math.ceil(duration / 7); week++) {
    const taskDate = new Date(start.getTime() + (week * 7 * 24 * 60 * 60 * 1000));
    tasks.push({
      title: `Week ${week} Pest Monitoring`,
      description: 'Scout field for pest activity',
      type: 'monitoring',
      priority: 'medium',
      scheduledDate: taskDate,
      estimatedDuration: 1,
      instructions: 'Check 10 random plants for signs of pest damage or disease.',
      aiGenerated: false
    });
  }

  return tasks;
}