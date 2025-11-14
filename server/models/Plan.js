const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['irrigation', 'fertilizer', 'pesticide', 'planting', 'harvesting', 'monitoring', 'maintenance'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'skipped'], 
    default: 'pending' 
  },
  scheduledDate: { type: Date, required: true },
  estimatedDuration: { type: Number }, 
  resources: [{
    type: { type: String }, 
    name: { type: String },
    quantity: { type: Number },
    unit: { type: String }
  }],
  instructions: { type: String },
  completedDate: { type: Date },
  actualDuration: { type: Number },
  notes: { type: String },
  aiGenerated: { type: Boolean, default: false }
}, { _id: true });

const PlanSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  title: { type: String, required: true },
  planType: { 
    type: String, 
    enum: ['complete_season', 'irrigation', 'fertilizer', 'pest_control', 'soil_health', 'harvest_prep'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'processing', 'active', 'paused', 'completed', 'cancelled'], 
    default: 'draft' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number, required: true }, 
  
  objectives: [{ type: String }],
  expectedOutcomes: [{
    metric: { type: String }, 
    target: { type: Number },
    unit: { type: String }
  }],
  
  tasks: [TaskSchema],
  
  aiRecommendations: [{
    category: { type: String },
    recommendation: { type: String },
    reasoning: { type: String },
    confidence: { type: Number, min: 0, max: 100 },
    priority: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  
  resourceRequirements: [{
    type: { type: String }, 
    name: { type: String },
    totalQuantity: { type: Number },
    unit: { type: String },
    estimatedCost: { type: Number },
    timing: { type: String } 
  }],
  
  progress: {
    completedTasks: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  weatherFactors: [{
    factor: { type: String }, 
    impact: { type: String },
    mitigation: { type: String }
  }],
  
  notes: { type: String },
  customizations: { type: Object }, 
  
  createdBy: { type: String, enum: ['farmer', 'ai', 'expert'], default: 'farmer' },
  template: { type: Boolean, default: false },
  shared: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.tasks && this.tasks.length > 0) {
    const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
    const totalTasks = this.tasks.length;
    
    this.progress.completedTasks = completedTasks;
    this.progress.totalTasks = totalTasks;
    this.progress.percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    this.progress.lastUpdated = Date.now();
  }
  
  next();
});

PlanSchema.methods.addTask = function(taskData) {
  this.tasks.push(taskData);
  return this.save();
};

PlanSchema.methods.updateTaskStatus = function(taskId, status) {
  const task = this.tasks.id(taskId);
  if (task) {
    task.status = status;
    if (status === 'completed') {
      task.completedDate = new Date();
    }
    return this.save();
  }
  return null;
};

PlanSchema.methods.getOverdueTasks = function() {
  const now = new Date();
  return this.tasks.filter(task => 
    task.status !== 'completed' && 
    task.status !== 'skipped' && 
    new Date(task.scheduledDate) < now
  );
};

PlanSchema.methods.getUpcomingTasks = function(days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.tasks.filter(task => 
    task.status === 'pending' && 
    new Date(task.scheduledDate) >= now && 
    new Date(task.scheduledDate) <= futureDate
  );
};

module.exports = mongoose.model('Plan', PlanSchema);