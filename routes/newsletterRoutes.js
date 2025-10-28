const express = require('express');
const { protect, admin } = require('../middlewares/auth');
const {
  subscribe,
  unsubscribe,
  getSubscribers
} = require('../controllers/newsletterController');

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/subscribers', protect, admin, getSubscribers);

module.exports = router;
