const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Get all users (managers+)
router.get('/', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('name');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
});

// Admin: update user role / status
router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const { role, isActive, department } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive, department }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// Admin: delete user
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
