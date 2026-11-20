const express = require('express');
const router = express.Router();
const { getDashboard, getRevenueReport, getTeamReport, getActivityReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/revenue', getRevenueReport);
router.get('/team', authorize('admin', 'manager'), getTeamReport);
router.get('/activities', getActivityReport);

module.exports = router;
