const Task = require('../models/Task');

exports.getAll = async (req, res) => {
  try {
    const farmerId = req.user.id;
    let tasks = await Task.find({ farmerId }).sort({ createdAt: -1 });
    if (tasks.length === 0) {
      tasks = await Task.insertMany([
        { farmerId, title: 'Apply Variable-Rate Fertilizer to Field 2', description: 'Apply nitrogen-rich fertilizer', type: 'fertilizer', priority: 'high', status: 'pending' },
        { farmerId, title: 'Review Field 3 Fertilizer Plan', description: 'Adjust plan', type: 'planning', priority: 'medium', status: 'pending' },
        { farmerId, title: 'Schedule Drone Scan for Field 1', description: 'Aerial monitoring', type: 'monitoring', priority: 'low', status: 'pending' }
      ]);
    }
    return res.json({ success: true, data: tasks });
  } catch (err) {
    console.error('Tasks fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

exports.create = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { title, description, type, priority, fieldId, dueDate } = req.body;
    if (!title || !type || !fieldId) {
      return res.status(400).json({ error: 'Title, type, and field ID are required' });
    }
    const task = await Task.create({ farmerId, fieldId, title, description: description || '', type, priority: priority || 'medium', status: 'pending', scheduledDate: dueDate || new Date() });
    return res.json({ success: true, data: task });
  } catch (err) {
    console.error('Task creation error:', err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, in-progress, or completed' });
    }
    const updated = await Task.findOneAndUpdate({ _id: id, farmerId }, { $set: { status } }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Task update error:', err);
    return res.status(500).json({ error: 'Failed to update task' });
  }
};


