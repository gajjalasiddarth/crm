const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    contact:  { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    lead:     { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    stage:    {
      type: String,
      enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
      default: 'prospecting',
    },
    value:       { type: Number, required: true, min: 0 },
    currency:    { type: String, default: 'USD' },
    probability: { type: Number, min: 0, max: 100, default: 20 },
    expectedCloseDate: { type: Date },
    actualCloseDate:   { type: Date },
    lostReason:  { type: String, default: '' },
    description: { type: String, default: '' },
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        name:     String,
        quantity: { type: Number, default: 1 },
        price:    { type: Number, default: 0 },
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

DealSchema.virtual('weightedValue').get(function () {
  return (this.value * this.probability) / 100;
});

DealSchema.index({ stage: 1, assignedTo: 1 });

module.exports = mongoose.model('Deal', DealSchema);
