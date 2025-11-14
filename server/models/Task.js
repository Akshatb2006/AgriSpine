// serer/models/Task.js - FIXED with correct enum values
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  title: { type: String, required: true },
  description: { type: String },
  // FIXED: Added missing enum values
  type: {
    type: String,
    enum: [
      'irrigation',
      'fertilizer',
      'pesticide',
      'harvest',
      'planting',      
      'monitoring',    
      'maintenance',  
      'planning'       // Added
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  scheduledDate: { type: Date },
  completedDate: { type: Date },
  aiGenerated: { type: Boolean, default: false },
  initialSetup: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
TaskSchema.index({ farmerId: 1, status: 1 });
TaskSchema.index({ farmerId: 1, fieldId: 1 });

module.exports = mongoose.model('Task', TaskSchema);