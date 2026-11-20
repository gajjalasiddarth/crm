const express = require('express');
const router = express.Router();
const { getEmails, getEmail, createDraft, sendEmail, composeAndSend, deleteEmail } = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getEmails).post(composeAndSend);
router.post('/draft', createDraft);
router.route('/:id').get(getEmail).delete(deleteEmail);
router.post('/:id/send', sendEmail);

module.exports = router;
