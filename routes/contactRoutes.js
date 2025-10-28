const express = require('express');
const { protect, admin } = require('../middlewares/auth');
const {
  submitContactForm,
  getAllSubmissions,
  updateSubmissionStatus,
  updateSubmission,
  deleteSubmission
} = require('../controllers/contactController');

const router = express.Router();

router.post('/submit', submitContactForm);
router.get('/submissions', protect, admin, getAllSubmissions);
router.patch('/:id/status', protect, admin, updateSubmissionStatus);
router.put('/:id', protect, admin, updateSubmission);
router.delete('/:id', protect, admin, deleteSubmission);

module.exports = router;
