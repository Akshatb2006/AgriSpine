// server/controllers/dashboardController.js (Updated with real database integration)
const User = require('../models/User');
const Field = require('../models/Field');
const Alert = require('../models/Alert');
const Task = require('../models/Task');
const Plan = require('../models/Plan');
const Prediction = require('../models/Prediction');

exports.getOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all fields for this farmer
    const fields = await Field.find({ farmerId: userId }).lean();
    
    // Calculate total area and active fields
    const totalArea = fields.reduce((sum, field) => sum + field.area, 0);
    const activeFields = fields.length;

    // Get crop status from fields
    const cropStatus = fields
      .filter(field => field.currentCrop && field.currentCrop.type)
      .map(field => ({
        fieldId: field._id,
        crop: field.currentCrop.type,
        status: field.currentCrop.plantedDate ? 'Growing' : 'Planning',
        forecast: `Estimated: ${Math.round(field.area * 3500)} kg`, // Simple estimation
        area: field.area,
        soilType: field.soilType
      }));

    // Generate simple yield summary (you can enhance this with real historical data)
    const yieldSummary = {
      data: [
        { period: 'Jan', value: Math.round(totalArea * 200) },
        { period: 'Feb', value: Math.round(totalArea * 350) },
        { period: 'Mar', value: Math.round(totalArea * 500) },
        { period: 'Apr', value: Math.round(totalArea * 750) },
        { period: 'May', value: Math.round(totalArea * 900) }
      ],
      growth: totalArea > 10 ? '+12% YOY' : '+8% YOY'
    };

    // Transform fields data for frontend
    const fieldsData = fields.map((field, index) => ({
      id: field._id,
      name: field.name,
      crop: field.currentCrop?.type || 'Not planted',
      area: field.area,
      status: field.currentCrop?.plantedDate ? 'normal' : 'planning',
      yield: `${Math.round(field.area * 3500)} kg estimated`,
      moisture: '65%', // This would come from sensors in real implementation
      soilType: field.soilType,
      irrigationSystem: field.irrigationSystem,
      // Assign colors for visualization
      color: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
      position: {
        top: `${20 + (index % 3) * 25}%`,
        left: `${20 + (index % 4) * 20}%`
      }
    }));

    const dashboardData = {
      welcome: {
        farmerName: user.name,
        currentTime: new Date().toLocaleTimeString(),
        currentDate: new Date().toLocaleDateString()
      },
      fields: fieldsData,
      cropStatus,
      yieldSummary,
      totalArea: Math.round(totalArea * 100) / 100, // Round to 2 decimal places
      activeFields,
      user: {
        name: user.name,
        location: user.location,
        farmingExperience: user.profile?.farmingExperience,
        primaryCrops: user.profile?.primaryCrops
      }
    };

    return res.json({ success: true, data: dashboardData });
  } catch (err) {
    console.error('Dashboard overview error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get real alerts from database
    const alerts = await Alert.find({ 
      farmerId: userId, 
      isRead: false 
    })
    .populate('fieldId', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Transform alerts for frontend
    const transformedAlerts = alerts
      .filter(alert => alert.severity === 'high' || alert.severity === 'critical')
      .map(alert => ({
        id: alert._id,
        type: alert.type,
        title: `${alert.severity.toUpperCase()}: ${alert.fieldId?.name || 'Farm'}`,
        description: alert.description,
        field: alert.fieldId?.name,
        time: getRelativeTime(alert.createdAt),
        severity: alert.severity,
        recommendations: alert.recommendations
      }));

    // Get medium/low priority alerts as insights
    const insights = alerts
      .filter(alert => alert.severity === 'medium' || alert.severity === 'low')
      .map(alert => ({
        id: alert._id,
        type: alert.type,
        title: `${alert.severity.toUpperCase()}: ${alert.type}`,
        description: alert.description,
        field: alert.fieldId?.name,
        recommendation: alert.recommendations?.[0] || 'Monitor situation',
        severity: alert.severity
      }));

    return res.json({ 
      success: true, 
      data: { 
        alerts: transformedAlerts, 
        insights: insights.slice(0, 3) // Limit insights
      } 
    });
  } catch (err) {
    console.error('Dashboard alerts error:', err);
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

exports.getRecentTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get tasks from standalone tasks and plan tasks
    const standaloneTasks = await Task.find({ 
      farmerId: userId,
      status: { $in: ['pending', 'in-progress'] }
    })
    .populate('fieldId', 'name')
    .sort({ scheduledDate: 1 })
    .limit(5)
    .lean();

    // Get tasks from active plans
    const activePlans = await Plan.find({
      farmerId: userId,
      status: 'active'
    })
    .populate('fieldId', 'name')
    .lean();

    const planTasks = [];
    activePlans.forEach(plan => {
      const upcomingTasks = plan.tasks
        .filter(task => task.status === 'pending')
        .slice(0, 3) // Get first 3 pending tasks per plan
        .map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          status: task.status,
          dueDate: formatDueDate(task.scheduledDate),
          fieldId: plan.fieldId?._id,
          fieldName: plan.fieldId?.name,
          planId: plan._id,
          planTitle: plan.title,
          source: 'plan'
        }));
      planTasks.push(...upcomingTasks);
    });

    // Transform standalone tasks
    const transformedTasks = standaloneTasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      status: task.status,
      dueDate: formatDueDate(task.scheduledDate),
      fieldId: task.fieldId?._id,
      fieldName: task.fieldId?.name,
      source: 'standalone'
    }));

    // Combine and sort tasks
    const allTasks = [...transformedTasks, ...planTasks]
      .sort((a, b) => {
        // Sort by priority first, then by due date
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 1;
        const bPriority = priorityOrder[b.priority] || 1;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return new Date(a.dueDate) - new Date(b.dueDate);
      })
      .slice(0, 8); // Limit to 8 tasks

    return res.json({ success: true, data: allTasks });
  } catch (err) {
    console.error('Dashboard tasks error:', err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get field-specific dashboard data
exports.getFieldOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fieldId } = req.params;
    
    // Get specific field
    const field = await Field.findOne({ _id: fieldId, farmerId: userId }).lean();
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }

    // Get field-specific alerts
    const fieldAlerts = await Alert.find({ 
      farmerId: userId, 
      fieldId: fieldId,
      isRead: false 
    }).sort({ createdAt: -1 }).lean();

    // Get field-specific tasks
    const fieldTasks = await Task.find({ 
      farmerId: userId,
      fieldId: fieldId,
      status: { $in: ['pending', 'in-progress'] }
    }).sort({ scheduledDate: 1 }).lean();

    // Get field predictions
    const fieldPredictions = await Prediction.find({
      farmerId: userId,
      fieldId: fieldId
    }).sort({ createdAt: -1 }).limit(3).lean();

    // Get active plans for this field
    const fieldPlans = await Plan.find({
      farmerId: userId,
      fieldId: fieldId,
      status: 'active'
    }).lean();

    const fieldData = {
      field: {
        id: field._id,
        name: field.name,
        area: field.area,
        soilType: field.soilType,
        irrigationSystem: field.irrigationSystem,
        currentCrop: field.currentCrop,
        soilData: field.soilData
      },
      alerts: fieldAlerts.length,
      tasks: fieldTasks.length,
      predictions: fieldPredictions.length,
      activePlans: fieldPlans.length,
      recentPredictions: fieldPredictions.map(pred => ({
        id: pred._id,
        type: pred.predictionType,
        confidence: pred.confidence,
        createdAt: pred.createdAt
      }))
    };

    return res.json({ success: true, data: fieldData });
  } catch (err) {
    console.error('Field overview error:', err);
    return res.status(500).json({ error: 'Failed to fetch field data' });
  }
};

// Helper functions
function getRelativeTime(date) {
  const now = new Date();
  const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return new Date(date).toLocaleDateString();
}

function formatDueDate(date) {
  if (!date) return 'No due date';
  
  const now = new Date();
  const dueDate = new Date(date);
  const diffInDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) return 'Overdue';
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays < 7) return `${diffInDays} days`;
  
  return dueDate.toLocaleDateString();
}