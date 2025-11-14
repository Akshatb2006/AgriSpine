const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  predictionType: { type: String, enum: ['yield', 'disease', 'pest'], required: true },
  inputData: { type: Object },
  aiResponse: { type: Object },
  prediction: { type: Object }, // For compatibility with frontend
  predictedYield: { type: Number },
  confidence: { type: Number },
  factors: { type: Object }, // Can be { positive: [String], negative: [String] } or array of strings
  recommendations: [{
    category: { type: String },
    action: { type: String },
    priority: { type: String },
    timing: { type: String },
    expectedImpact: { type: String },
    icon: { type: String }
  }],
  weatherData: { type: Object },
  processingTime: { type: Number },
  error: { type: String },
  errorDetails: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' }
});

module.exports = mongoose.model('Prediction', PredictionSchema);


