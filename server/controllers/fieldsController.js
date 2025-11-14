// server/controllers/fieldsController.js (Updated)
const Field = require('../models/Field');

exports.getAll = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const fields = await Field.find({ farmerId }).sort({ createdAt: -1 });
    
    // Format fields for frontend
    const formattedFields = fields.map(field => ({
      id: field._id,
      name: field.name,
      crop: field.currentCrop?.type || 'Unknown',
      area: field.area,
      soilType: field.soilType,
      coordinates: field.coordinates,
      irrigationType: field.irrigationSystem,
      createdAt: field.createdAt
    }));

    return res.json({ success: true, data: formattedFields });
  } catch (err) {
    console.error('Fields fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch fields' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const id = req.params.id;
    const field = await Field.findOne({ _id: id, farmerId });
    if (!field) return res.status(404).json({ error: 'Field not found' });
    
    const formattedField = {
      id: field._id,
      name: field.name,
      crop: field.currentCrop?.type || 'Unknown',
      area: field.area,
      soilType: field.soilType,
      coordinates: field.coordinates,
      irrigationType: field.irrigationSystem,
      soilData: field.soilData,
      createdAt: field.createdAt
    };

    return res.json({ success: true, data: formattedField });
  } catch (err) {
    console.error('Field detail error:', err);
    return res.status(500).json({ error: 'Failed to fetch field details' });
  }
};

exports.create = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { name, area, soilType, coordinates, cropType, irrigationType } = req.body;

    if (!name || !area || !coordinates) {
      return res.status(400).json({ error: 'Name, area, and coordinates are required' });
    }

    const field = await Field.create({
      farmerId,
      name,
      area,
      soilType,
      coordinates,
      irrigationSystem: irrigationType,
      currentCrop: {
        type: cropType
      }
    });

    return res.json({ success: true, data: field });
  } catch (err) {
    console.error('Field creation error:', err);
    return res.status(500).json({ error: 'Failed to create field' });
  }
};

exports.update = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    const field = await Field.findOneAndUpdate(
      { _id: id, farmerId },
      { $set: updateData },
      { new: true }
    );

    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }

    return res.json({ success: true, data: field });
  } catch (err) {
    console.error('Field update error:', err);
    return res.status(500).json({ error: 'Failed to update field' });
  }
};

exports.delete = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const field = await Field.findOneAndDelete({ _id: id, farmerId });

    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }

    return res.json({ success: true, message: 'Field deleted successfully' });
  } catch (err) {
    console.error('Field deletion error:', err);
    return res.status(500).json({ error: 'Failed to delete field' });
  }
};