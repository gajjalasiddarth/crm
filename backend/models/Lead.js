const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    contact:     { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    firstName:   { type: String, trim: true },
    lastName:    { type: String, trim: true },
    email:       { type: String, lowercase: true },
    phone:       { type: String, default: '' },
    company:     { type: String, default: '' },
    status:      {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted'],
      default: 'new',
    },
    source:      { type: String, enum: ['website', 'referral', 'cold_call', 'email', 'social', 'event', 'other'], default: 'other' },
    priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    estimatedValue: { type: Number, default: 0 },
    probability:    { type: Number, min: 0, max: 100, default: 20 },
    notes:       { type: String, default: '' },
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    convertedAt: { type: Date },
    convertedDeal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    tags:        [{ type: String }],
    followUpDate: { type: Date },
  },
  { timestamps: true }
);

LeadSchema.index({ status: 1, assignedTo: 1 });

module.exports = mongoose.model('Lead', LeadSchema);
