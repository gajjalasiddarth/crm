const Contact = require('../models/Contact');
const Activity = require('../models/Activity');

// @route GET /api/contacts
exports.getContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, source, assignedTo, sortBy = 'createdAt', order = 'desc' } = req.query;
    const query = {};
    if (req.user.role === 'sales_rep') query.assignedTo = req.user.id;
    if (search) query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
      { company:   { $regex: search, $options: 'i' } },
    ];
    if (status)     query.status = status;
    if (source)     query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [contacts, total] = await Promise.all([
      Contact.find(query).populate('assignedTo', 'name email avatar').populate('createdBy', 'name').sort(sort).skip(skip).limit(+limit),
      Contact.countDocuments(query),
    ]);

    res.json({ success: true, count: contacts.length, total, pages: Math.ceil(total / limit), data: contacts });
  } catch (err) { next(err); }
};

// @route GET /api/contacts/:id
exports.getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('assignedTo', 'name email avatar').populate('createdBy', 'name');
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (err) { next(err); }
};

// @route POST /api/contacts
exports.createContact = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    if (!req.body.assignedTo) req.body.assignedTo = req.user.id;
    const contact = await Contact.create(req.body);
    await Activity.create({ type: 'created', description: `Contact ${contact.firstName} ${contact.lastName} created`, relatedTo: { model: 'Contact', document: contact._id }, performedBy: req.user.id });
    res.status(201).json({ success: true, data: contact });
  } catch (err) { next(err); }
};

// @route PUT /api/contacts/:id
exports.updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedTo', 'name email avatar');
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    await Activity.create({ type: 'updated', description: `Contact ${contact.firstName} ${contact.lastName} updated`, relatedTo: { model: 'Contact', document: contact._id }, performedBy: req.user.id });
    res.json({ success: true, data: contact });
  } catch (err) { next(err); }
};

// @route DELETE /api/contacts/:id
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) { next(err); }
};

// @route GET /api/contacts/:id/activities
exports.getContactActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ 'relatedTo.document': req.params.id }).populate('performedBy', 'name avatar').sort('-createdAt').limit(50);
    res.json({ success: true, data: activities });
  } catch (err) { next(err); }
};
