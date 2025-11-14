// server/models/User.js (Updated with initialization fields)
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  state: { type: String },
  district: { type: String },
  village: { type: String },
  coordinates: {
    type: [Number], // [lng, lat]
    validate: arr => arr.length === 2
  }
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  farmingExperience: { type: String },
  farmSize: { type: Number },
  primaryCrops: [{ type: String }]
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, trim: true },
  language: { type: String, enum: ['hi', 'en', 'or'], default: 'en' },
  location: { type: LocationSchema },
  profile: { type: ProfileSchema },
  onboardingCompleted: { type: Boolean, default: false },

  // New initialization fields
  initializationStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  initializationJobId: { type: String },
  initializationCompletedAt: { type: Date },

  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);