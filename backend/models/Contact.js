const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, required: true, lowercase: true },
    phone:      { type: String, default: '' },
    company:    { type: String, default: '' },
    jobTitle:   { type: String, default: '' },
    status:     { type: String, enum: ['active', 'inactive', 'prospect', 'customer', 'churned'], default: 'prospect' },
    source:     { type: String, enum: ['website', 'referral', 'cold_call', 'email', 'social', 'event', 'other'], default: 'other' },
    address: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      country: { type: String, default: '' },
      zip:     { type: String, default: '' },
    },
    tags:       [{ type: String }],
    notes:      { type: String, default: '' },
    avatar:     { type: String, default: '' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    socialLinks: {
      linkedin:  { type: String, default: '' },
      twitter:   { type: String, default: '' },
      facebook:  { type: String, default: '' },
    },
  },
  { timestamps: true }
);

ContactSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

ContactSchema.index({ email: 1 });
ContactSchema.index({ company: 1 });
ContactSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Contact', ContactSchema);
