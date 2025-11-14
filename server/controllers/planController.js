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

