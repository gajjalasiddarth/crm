const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'called', 'emailed', 'met', 'note_added', 'status_changed', 'assigned', 'converted'],
      required: true,
    },
    description: { type: String, required: true },
    relatedTo: {
      model:    { type: String, enum: ['Contact', 'Lead', 'Deal', 'Task', 'Email'] },
      document: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedTo.model' },
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metadata:    { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

ActivitySchema.index({ 'relatedTo.document': 1, createdAt: -1 });
ActivitySchema.index({ performedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
