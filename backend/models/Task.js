const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status:      { type: String, enum: ['todo', 'in_progress', 'completed', 'cancelled'], default: 'todo' },
    priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    dueDate:     { type: Date },
    completedAt: { type: Date },
    type:        { type: String, enum: ['call', 'email', 'meeting', 'follow_up', 'demo', 'other'], default: 'other' },
    relatedTo: {
      model:    { type: String, enum: ['Contact', 'Lead', 'Deal'] },
      document: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedTo.model' },
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reminder:   { type: Date },
    tags:       [{ type: String }],
  },
  { timestamps: true }
);

TaskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model('Task', TaskSchema);
