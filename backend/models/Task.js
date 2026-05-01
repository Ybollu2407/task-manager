const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  status: { type: String, default: 'pending' },
  assignedTo: String,
  deadline: Date
});

module.exports = mongoose.model('Task', taskSchema);