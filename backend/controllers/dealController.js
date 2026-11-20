const Deal = require('../models/Deal');
const Activity = require('../models/Activity');

// @route GET /api/deals
exports.getDeals = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, search, stage,
      assignedTo, sortBy = 'createdAt', order = 'desc'
    } = req.query;

    const query = {};
    if (req.user.role === 'sales_rep') query.assignedTo = req.user._id;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (stage)      query.stage = stage;
    if (assignedTo) query.assignedTo = assignedTo;

    const [deals, total] = await Promise.all([
      Deal.find(query)
        .populate('contact', 'firstName lastName email company')
        .populate('assignedTo', 'name email avatar')
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .skip((page - 1) * +limit).limit(+limit),
      Deal.countDocuments(query),
    ]);

    res.json({ success: true, count: deals.length, total, pages: Math.ceil(total / limit), data: deals });
  } catch (err) { next(err); }
};

// @route GET /api/deals/:id
exports.getDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('contact', 'firstName lastName email phone company')
      .populate('assignedTo', 'name email avatar')
      .populate('lead', 'title');

    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, data: deal });
  } catch (err) { next(err); }
};

// @route POST /api/deals
exports.createDeal = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    if (!req.body.assignedTo) req.body.assignedTo = req.user.id;

    if (req.body.stage === 'closed_won' || req.body.stage === 'closed_lost') {
      if (!req.body.actualCloseDate) req.body.actualCloseDate = new Date();
    }

    const deal = await Deal.create(req.body);

    await Activity.create({
      type: 'created',
      description: `Deal "${deal.title}" created — $${deal.value.toLocaleString()}`,
      relatedTo: { model: 'Deal', document: deal._id },
      performedBy: req.user.id
    });

    res.status(201).json({ success: true, data: deal });
  } catch (err) { next(err); }
};

// @route PUT /api/deals/:id
exports.updateDeal = async (req, res, next) => {
  try {
    const old = await Deal.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Deal not found' });

    // Auto set actualCloseDate when moved to closed_won or closed_lost
    if (
      (req.body.stage === 'closed_won' || req.body.stage === 'closed_lost') &&
      old.stage !== req.body.stage
    ) {
      if (!req.body.actualCloseDate) req.body.actualCloseDate = new Date();
    }

    // Clear actualCloseDate if deal is reopened
    if (
      req.body.stage &&
      req.body.stage !== 'closed_won' &&
      req.body.stage !== 'closed_lost' &&
      (old.stage === 'closed_won' || old.stage === 'closed_lost')
    ) {
      req.body.actualCloseDate = null;
    }

    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('contact', 'firstName lastName email')
      .populate('assignedTo', 'name email avatar');

    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

    const stageChanged = old.stage !== deal.stage;
    const desc = stageChanged
      ? `Deal "${deal.title}" moved from ${old.stage.replace(/_/g, ' ')} to ${deal.stage.replace(/_/g, ' ')}`
      : `Deal "${deal.title}" updated`;

    await Activity.create({
      type: stageChanged ? 'status_changed' : 'updated',
      description: desc,
      relatedTo: { model: 'Deal', document: deal._id },
      performedBy: req.user.id
    });

    res.json({ success: true, data: deal });
  } catch (err) { next(err); }
};

// @route DELETE /api/deals/:id
exports.deleteDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });

    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (err) { next(err); }
};

// @route GET /api/deals/pipeline
exports.getPipeline = async (req, res, next) => {
  try {
    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    const query = {};
    if (req.user.role === 'sales_rep') query.assignedTo = req.user._id;

    const pipeline = await Deal.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
          deals: {
            $push: {
              _id: '$_id', title: '$title',
              value: '$value', probability: '$probability'
            }
          }
        }
      }
    ]);

    const result = {};
    stages.forEach(s => { result[s] = { count: 0, totalValue: 0, deals: [] }; });
    pipeline.forEach(p => { result[p._id] = { count: p.count, totalValue: p.totalValue, deals: p.deals }; });

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};
