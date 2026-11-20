const express = require('express');
const router = express.Router();
const { getContacts, getContact, createContact, updateContact, deleteContact, getContactActivities } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getContacts).post(createContact);
router.route('/:id').get(getContact).put(updateContact).delete(authorize('admin', 'manager'), deleteContact);
router.get('/:id/activities', getContactActivities);

module.exports = router;
