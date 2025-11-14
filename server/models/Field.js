const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  area: { type: Number, required: true },
  soilType: { type: String },
  currentCrop: {
    type: {
      type: String
    },
    variety: String,
    plantedDate: Date,
    expectedHarvestDate: Date
  },
  irrigationSystem: String,
  soilData: {
    pH: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    organicMatter: Number,
    lastUpdated: Date
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


FieldSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Field', FieldSchema);