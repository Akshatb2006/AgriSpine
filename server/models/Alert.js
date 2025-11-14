const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  type: { type: String, enum: ['pest', 'disease', 'irrigation', 'weather'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  actionRequired: { type: Boolean, default: false },
  recommendations: [{ type: String }],
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

module.exports = mongoose.model('Alert', AlertSchema);


