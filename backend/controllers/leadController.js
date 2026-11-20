const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');

exports.getLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, priority, assignedTo, sortBy = 'createdAt', order = 'desc' } = req.query;
    const query = {};
    if (req.user.role === 'sales_rep') query.assignedTo = req.user.id;
    if (search) query.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { email:   { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
    if (status)     query.status = status;
    if (priority)   query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
      Lead.find(query).populate('assignedTo', 'name email avatar').populate('contact', 'firstName lastName email').sort({ [sortBy]: order === 'asc' ? 1 : -1 }).skip(skip).limit(+limit),
      Lead.countDocuments(query),
    ]);

    res.json({ success: true, count: leads.length, total, pages: Math.ceil(total / limit), data: leads });
  } catch (err) { next(err); }
};

exports.getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email avatar').populate('contact').populate('createdBy', 'name');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

exports.createLead = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    if (!req.body.assignedTo) req.body.assignedTo = req.user.id;
    const lead = await Lead.create(req.body);
    await Activity.create({ type: 'created', description: `Lead "${lead.title}" created`, relatedTo: { model: 'Lead', document: lead._id }, performedBy: req.user.id });
    res.status(201).json({ success: true, data: lead });
  } catch (err) { next(err); }
};

exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedTo', 'name email avatar');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    await Activity.create({ type: 'updated', description: `Lead "${lead.title}" updated`, relatedTo: { model: 'Lead', document: lead._id }, performedBy: req.user.id });
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) { next(err); }
};

// @route POST /api/leads/:id/convert
exports.convertLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    if (lead.status === 'converted') return res.status(400).json({ success: false, message: 'Already converted' });

    // Create contact from lead
    const contact = await Contact.create({
      firstName: lead.firstName || lead.title.split(' ')[0],
      lastName:  lead.lastName  || lead.title.split(' ')[1] || '',
      email:     lead.email,
      phone:     lead.phone,
      company:   lead.company,
      status:    'prospect',
      assignedTo: lead.assignedTo,
      createdBy:  req.user.id,
    });

    // Create deal
    const deal = await Deal.create({
      title:    req.body.dealTitle || `Deal from ${lead.title}`,
      contact:  contact._id,
      lead:     lead._id,
      value:    req.body.dealValue || lead.estimatedValue,
      stage:    'qualification',
      probability: lead.probability,
      expectedCloseDate: req.body.expectedCloseDate,
      assignedTo: lead.assignedTo,
      createdBy:  req.user.id,
    });

    lead.status = 'converted';
    lead.convertedAt = Date.now();
    lead.convertedDeal = deal._id;
    await lead.save();

    await Activity.create({ type: 'converted', description: `Lead "${lead.title}" converted to deal`, relatedTo: { model: 'Lead', document: lead._id }, performedBy: req.user.id });

    res.json({ success: true, data: { lead, contact, deal } });
  } catch (err) { next(err); }
};
