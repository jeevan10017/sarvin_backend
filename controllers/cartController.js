const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's cart with populated product data
// @route   GET /api/cart
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.items.productId',
      populate: [
        { path: 'type', select: 'name' }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validItems = user.cart.items.filter(item => item.productId);

    if (validItems.length !== user.cart.items.length) {
      user.cart.items = validItems;
      await user.save();
    }

    let subtotal = 0;
    const cartItems = validItems.map(item => {
      const product = item.productId;
      const price = product.discountPrice || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      return {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          price: product.price,
          discountPrice: product.discountPrice,
          type: product.type?.name || '',
          productCollection: product.productCollection || '', 
          stock: product.stock
        },
        quantity: item.quantity,
        itemTotal,
        addedAt: item.addedAt
      };
    });

    res.json({
      items: cartItems,
      subtotal,
      itemCount: cartItems.length,
      updatedAt: user.cart.updatedAt
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    if (quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    const product = await Product.findById(productId).populate('type');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingItem = user.cart.items.find(
      item => item.productId.toString() === productId
    );
    const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (totalQuantity > product.stock) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${totalQuantity}`,
        availableStock: product.stock,
        currentInCart: existingItem ? existingItem.quantity : 0
      });
    }

    await user.addToCart(productId, quantity);

    const updatedUser = await User.findById(req.user._id).populate({
      path: 'cart.items.productId',
      populate: [
        { path: 'type', select: 'name' }
      ]
    });

    const addedItem = updatedUser.cart.items.find(
      item => item.productId._id.toString() === productId
    );

    const cleanProductObject = {
      _id: addedItem.productId._id,
      name: addedItem.productId.name,
      slug: addedItem.productId.slug, 
      image: addedItem.productId.image,
      price: addedItem.productId.price,
      discountPrice: addedItem.productId.discountPrice,
      type: addedItem.productId.type?.name || '',
      productCollection: addedItem.productId.productCollection || '',
      stock: addedItem.productId.stock
    };

    const cartSummary = updatedUser.cart.items.reduce((acc, item) => {
      const price = item.productId.discountPrice || item.productId.price;
      acc.subtotal += price * item.quantity;
      acc.itemCount += item.quantity;
      return acc;
    }, { subtotal: 0, itemCount: 0 });
    
    // Correctly calculate total items in cart
    const totalItemCount = updatedUser.cart.items.reduce((total, item) => total + item.quantity, 0);


    res.status(201).json({
      message: 'Item added to cart successfully',
      item: {
        _id: addedItem._id,
        // Use the clean object here
        product: cleanProductObject, 
        quantity: addedItem.quantity,
        addedAt: addedItem.addedAt
      },
      cartSummary: {
        subtotal: cartSummary.subtotal,
        itemCount: totalItemCount, 
        totalItems: updatedUser.cart.items.length
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Check if product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.stock}`,
        availableStock: product.stock
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.updateCartQuantity(productId, quantity);

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemExists = user.cart.items.find(
      item => item.productId.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await user.removeFromCart(productId);

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.clearCart();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Sync cart (for when user logs in from different device)
// @route   POST /api/cart/sync
const syncCart = async (req, res) => {
  try {
    const { items } = req.body; // Array of {productId, quantity}

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate all products exist and have sufficient stock
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({ 
          message: 'Invalid item format. Each item must have productId and positive integer quantity' 
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ 
          message: `Product not found: ${item.productId}` 
        });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          productId: item.productId,
          availableStock: product.stock
        });
      }
    }

    // Clear current cart and add new items
    await user.clearCart();
    
    for (const item of items) {
      await user.addToCart(item.productId, item.quantity);
    }

    res.json({ message: 'Cart synced successfully' });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};