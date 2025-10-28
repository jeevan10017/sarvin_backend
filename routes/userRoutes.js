const express = require('express');
const router = express.Router();
const { getUsers, getDashboardStats,getUserOrders } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/auth');

router.get('/', protect, admin, getUsers);
router.route('/:userId/orders').get(protect, admin, getUserOrders);
router.get('/dashboard', protect, admin, getDashboardStats);

module.exports = router;