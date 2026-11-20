const express = require('express');
const router = express.Router();
const { getDeals, getDeal, createDeal, updateDeal, deleteDeal, getPipeline } = require('../controllers/dealController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/pipeline', getPipeline);
router.route('/').get(getDeals).post(createDeal);
router.route('/:id').get(getDeal).put(updateDeal).delete(authorize('admin', 'manager'), deleteDeal);

module.exports = router;
