const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: { type: String, required: true },
  phoneNumber: { 
    type: String, 
    required: false,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please add a valid phone number']
  },
  address: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  pincode: { 
    type: String, 
    required: false,
    match: [/^[0-9]{5,6}$/, 'Please add a valid pincode']
  },
  cart: {
    items: [cartItemSchema],
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user',index: true  },
  
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  
  // Password reset fields
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.cart && this.cart.items && this.cart.items.length > 0) {
    this.cart.updatedAt = Date.now();
  }
  next();
});

// Method to add item to cart
userSchema.methods.addToCart = function(productId, quantity = 1) {
  const existingItemIndex = this.cart.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );

  if (existingItemIndex >= 0) {
    this.cart.items[existingItemIndex].quantity += quantity;
  } else {
    this.cart.items.push({ productId, quantity });
  }

  this.cart.updatedAt = Date.now();
  return this.save();
};

// Method to remove item from cart
userSchema.methods.removeFromCart = function(productId) {
  this.cart.items = this.cart.items.filter(
    item => item.productId.toString() !== productId.toString()
  );
  this.cart.updatedAt = Date.now();
  return this.save();
};

// Method to update item quantity in cart
userSchema.methods.updateCartQuantity = function(productId, quantity) {
  const item = this.cart.items.find(
    item => item.productId.toString() === productId.toString()
  );
  
  if (item) {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    item.quantity = quantity;
    this.cart.updatedAt = Date.now();
    return this.save();
  }
  
  throw new Error('Item not found in cart');
};

// Method to clear cart
userSchema.methods.clearCart = function() {
  this.cart.items = [];
  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.getPopulatedCart = async function() {
  await this.populate('cart.items.productId');
  return this.cart;
};

module.exports = mongoose.model('User', userSchema);