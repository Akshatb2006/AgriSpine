const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Field = require('../models/Field')
const initializationController = require('./initializationController');

const JWT_SECRET = process.env.JWT_SECRET ;
const JWT_EXPIRES_IN = '1d';

exports.signup = async (req, res) => {
  try {
    const { name, email, phoneNumber, language, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      phoneNumber,
      language: ['hi', 'en', 'or'].includes(language) ? language : 'en'
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        language: user.language
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to signup' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        language: user.language
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to login' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const newToken = jwt.sign({ sub: decoded.sub, email: decoded.email}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.json({ success: true, token: newToken });
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
};


exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { location, fields, farmingExperience, farmSize, primaryCrops } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          location,
          'profile.farmingExperience': farmingExperience,
          'profile.farmSize': farmSize,
          'profile.primaryCrops': primaryCrops,
          onboardingCompleted: true
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
//Register the fields
    if (fields && fields.length > 0) {
      const fieldPromises = fields.map(field => {
        return Field.create({
          farmerId: userId,
          name: field.name,
          area: field.area,
          soilType: field.soilType,
          irrigationSystem: field.irrigationType,
          currentCrop: {
            type: field.cropType
          }
        });
      });

      await Promise.all(fieldPromises);
    }

    return res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (err) {
    console.error('Onboarding completion error:', err);
    return res.status(500).json({ error: 'Failed to complete onboarding' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phoneNumber, location, profile } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (location) updateData.location = location;
    if (profile) updateData.profile = profile;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        profile: user.profile,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const fields = await Field.find({ farmerId: userId });
    const totalArea = fields.reduce((sum, field) => sum + field.area, 0);

    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        profile: user.profile,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
        totalFields: fields.length,
        totalArea: Math.round(totalArea * 100) / 100
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.initializeFarm = initializationController.initializeFarm;
exports.getInitializationStatus = initializationController.getInitializationStatus;