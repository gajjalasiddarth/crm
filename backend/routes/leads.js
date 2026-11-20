const express = require('express');
const router = express.Router();
const { getLeads, getLead, createLead, updateLead, deleteLead, convertLead } = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getLeads).post(createLead);
router.route('/:id').get(getLead).put(updateLead).delete(authorize('admin', 'manager'), deleteLead);
router.post('/:id/convert', convertLead);

module.exports = router;
