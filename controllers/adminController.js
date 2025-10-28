const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Get the start and end of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      processingOrders,
      deliveredOrders,
      totalRevenueResult,
      monthlyRevenueResult, // New calculation for monthly revenue
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments({ orderStatus: 'processing' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      // FIX: Calculate revenue only for orders within the current month
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email') 
        .populate('items.product', 'name'),
    ]);
    
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0; // Get monthly revenue

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      processingOrders,
      deliveredOrders,
      totalRevenue,
      monthlyRevenue, // Send monthly revenue in the response
      recentOrders,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'user' };
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders for a specific user (Admin)
// @route   GET /api/admin/users/:userId/orders
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const [orders, totalOrders, totalSpentResult] = await Promise.all([
      Order.find({ user: userId })
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    
      Order.countDocuments({ user: userId }),
      Order.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    const lifetimeTotalSpent = totalSpentResult[0]?.total || 0;

    res.json({
      orders,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      lifetimeTotalSpent, 
    });

  } catch (error) {
    console.error(`Error fetching orders for user ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getDashboardStats,
  getUsers,
  getUserOrders
};