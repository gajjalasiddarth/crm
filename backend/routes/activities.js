const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = {};
    if (type) query.type = type;
    if (req.user.role === 'sales_rep') query.performedBy = req.user.id;
    const [activities, total] = await Promise.all([
      Activity.find(query).populate('performedBy', 'name avatar').sort('-createdAt').skip((page - 1) * +limit).limit(+limit),
      Activity.countDocuments(query),
    ]);
    res.json({ success: true, count: activities.length, total, data: activities });
  } catch (err) { next(err); }
});

module.exports = router;
