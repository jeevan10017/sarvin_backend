const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const razorpay = require('../config/razorpay');
const mongoose = require('mongoose');
const crypto = require('crypto');
const emailService = require('../emailService/EmailService');

// @desc    Create Razorpay order
// @route   POST /api/orders/create-razorpay-order
const createRazorpayOrder = async (req, res) => {
  try {
    console.log('=== Creating Razorpay Order ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user._id);

    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      console.log('Invalid amount:', amount);
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Ensure amount is in paise (integer)
    const amountInPaise = Math.round(amount);
    console.log('Amount in paise:', amountInPaise);

    // Check if Razorpay is properly configured
    if (!razorpay) {
      console.error('Razorpay instance not found');
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    // Check environment variables
    // console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing');
    // console.log('Razorpay Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing');

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing');
      return res.status(500).json({ message: 'Payment gateway credentials not configured' });
    }

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        timestamp: new Date().toISOString()
      }
    };

    console.log('Creating Razorpay order with options:', orderOptions);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create(orderOptions);
    
    console.log('Razorpay order created successfully:', razorpayOrder.id);

    res.status(200).json({
      success: true,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status
      }
    });
  } catch (error) {
    console.error('=== Razorpay Order Creation Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // More specific error handling
    if (error.statusCode) {
      console.error('Razorpay API Error:', error.statusCode, error.error);
      return res.status(error.statusCode).json({ 
        message: 'Razorpay API Error', 
        error: error.error?.description || error.message,
        code: error.error?.code
      });
    }

    res.status(500).json({ 
      message: 'Failed to create Razorpay order', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Verify payment and create order
// @route   POST /api/orders/verify-payment
const verifyPayment = async (req, res) => {
  try {
    console.log('=== Verifying Payment ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      items,
      shippingAddress,
      total,
      paymentMethod,
      paymentDetails
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    if (!paymentDetails) {
      return res.status(400).json({ message: 'Payment details are required' });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = paymentDetails;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Incomplete payment details' });
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature verification failed');
      return res.status(400).json({ message: 'Payment verification failed - Invalid signature' });
    }

    console.log('Signature verified successfully');

    // Validate and calculate total
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `Invalid product ID: ${item.product}` });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const price = product.discountPrice || product.price;
      calculatedTotal += price * item.quantity;

      validatedItems.push({
        product: item.product,
        quantity: item.quantity,
        price
      });
    }

   
     const shipping = 0;
     const tax = 0; 
    const finalTotal = calculatedTotal;   

    console.log('Total calculation:', {
      subtotal: calculatedTotal,
      shipping,
      tax,
      finalTotal,
      providedTotal: total
    });

    if (Math.abs(finalTotal - total) > 1) {
      return res.status(400).json({ 
        message: 'Total amount mismatch',
        calculated: finalTotal,
        provided: total
      });
    }

    // Generate orderId manually as fallback
    const orderId = await Order.generateOrderId();
    console.log('Generated orderId:', orderId);

    // Create order with manual orderId
const order = new Order({
  orderId: orderId, 
  user: req.user._id,
  items: validatedItems,
  total: finalTotal,
  shippingAddress,
  paymentMethod,
  paymentStatus: 'completed',
  paymentId: razorpay_payment_id,
  orderStatus: 'processing',
  statusHistory: [{
    status: 'processing',
    timestamp: new Date(),
    updatedBy: req.user._id
  }]
});

    const createdOrder = await order.save();
    console.log('Order created with ID:', createdOrder.orderId);

    // Update product stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    console.log('Product stock updated');

    // Populate order for response
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate('user', 'name email')
      .populate('items.product', 'name image price slug');

    console.log('Order verification completed successfully');

    // Send emails
    try {
      console.log('=== Sending Order Emails ===');
      await emailService.sendOrderConfirmationEmail(populatedOrder, req.user);
      console.log('Order confirmation email sent to customer');
      await emailService.sendOrderNotificationToAdmin(populatedOrder, req.user);
      console.log('Order notification email sent to admin');
    } catch (emailError) {
      console.error('Error sending order emails:', emailError);
    }

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('=== Payment Verification Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Payment verification failed', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  try {
    console.log('=== Creating Order (Legacy) ===');
    
    let total = 0;
    const products = [];

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `Invalid product ID: ${item.product}` });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const price = product.discountPrice || product.price;
      total += price * item.quantity;

      products.push({
        product: item.product,
        quantity: item.quantity,
        price
      });
    }

    // Create Razorpay Order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: total * 100, // Razorpay uses paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });
    } catch (err) {
      console.error('Razorpay order creation failed:', err);
      return res.status(500).json({ message: 'Razorpay order creation failed', error: err.message });
    }

    const order = new Order({
      user: req.user._id,
      items: products,
      total,
      shippingAddress,
      paymentMethod,
      paymentId: razorpayOrder.id
    });

    const createdOrder = await order.save();
    console.log('Order created with ID:', createdOrder.orderId);

    res.status(201).json({
      order: createdOrder,
      razorpayOrder
    });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ message: 'Order creation failed', error: err.message });
  }
};

// @desc    Get order by ID (now supports both orderId and _id)
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    
   let order;
if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
  order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name image price slug');
}
if (!order) {
  order = await Order.findOne({ orderId: req.params.id })
    .populate('user', 'name email')
    .populate('items.product', 'name image price slug');
}

if (!order) {
  return res.status(404).json({ message: 'Order not found' });
}

res.json(order);
} catch (error) {
  console.error('Get order by ID error:', error);
  res.status(500).json({ message: 'Server error', error: error.message });
}
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image');
    
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
const updateOrderToPaid = async (req, res) => {
  try {
    let order;
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      order = await Order.findById(req.params.id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(req.body.paymentId);
    
    if (payment.status === 'captured' && 
        payment.order_id === order.paymentId && 
        payment.amount === order.total * 100) {
      
      // Update product stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        product.stock -= item.quantity;
        await product.save();
      }
      
      order.paymentStatus = 'completed';
      order.paymentId = req.body.paymentId;
      const updatedOrder = await order.save();
      
      res.json(updatedOrder);
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Update order to paid error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // --- Build the query object dynamically ---
    const query = {};

    // Handle status filtering
    if (req.query.status && req.query.status !== 'all') {
      query.orderStatus = req.query.status;
    }

    // Handle search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');

      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const userIds = matchingUsers.map(user => user._id);

      query.$or = [
        { orderId: searchRegex },
        { 'shippingAddress.fullName': searchRegex },
        { user: { $in: userIds } }, 
      ];
    }
    // --- End of query building ---

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
         .populate('items.product', 'name image slug') 
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({
      orders,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id
const updateOrderStatus = async (req, res) => {
  try {
    let order;
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      order = await Order.findById(req.params.id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.lastUpdatedBy = req.user._id;
    order.orderStatus = req.body.status;
    
    const updatedOrder = await order.save();
    
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('statusHistory.updatedBy', 'name email')
      .populate('user', 'name email')
      .populate('items.product', 'name image price slug'); 
    
    res.json(populatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderToPaid,
  getOrders,
  updateOrderStatus
};