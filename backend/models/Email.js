const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema(
  {
    subject:   { type: String, required: true },
    body:      { type: String, required: true },
    from:      { type: String, required: true },
    to:        [{ type: String, required: true }],
    cc:        [{ type: String }],
    bcc:       [{ type: String }],
    status:    { type: String, enum: ['draft', 'sent', 'failed', 'scheduled'], default: 'draft' },
    direction: { type: String, enum: ['inbound', 'outbound'], default: 'outbound' },
    scheduledAt: { type: Date },
    sentAt:    { type: Date },
    opens:     { type: Number, default: 0 },
    clicks:    { type: Number, default: 0 },
    relatedTo: {
      model:    { type: String, enum: ['Contact', 'Lead', 'Deal'] },
      document: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedTo.model' },
    },
    attachments: [{ filename: String, path: String, size: Number }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    template:  { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Email', EmailSchema);
