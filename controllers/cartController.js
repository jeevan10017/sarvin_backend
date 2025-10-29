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

    // Filter out items with deleted products and deduplicate
    const validItemsMap = new Map();
    
    user.cart.items.forEach(item => {
      if (!item.productId) return;
      
      const productId = item.productId._id.toString();
      
      if (validItemsMap.has(productId)) {
        // Merge duplicate
        validItemsMap.get(productId).quantity += item.quantity;
      } else {
        validItemsMap.set(productId, {
          _id: item._id,
          productId: item.productId,
          quantity: item.quantity,
          addedAt: item.addedAt
        });
      }
    });

    const validItems = Array.from(validItemsMap.values());

    // If we removed any items or deduplicated, save the cleaned cart
    if (validItems.length !== user.cart.items.length) {
      user.cart.items = validItems.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        addedAt: item.addedAt
      }));
      await user.save();
    }

    let subtotal = 0;
    let totalQuantity = 0;
    
    const cartItems = validItems.map(item => {
      const product = item.productId;
      const price = product.discountPrice || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      totalQuantity += item.quantity;

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
      itemCount: totalQuantity, 
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

const syncCart = async (req, res) => {
    try {
        const { items } = req.body;

        // If no items to sync, just return the current cart
        if (!Array.isArray(items) || items.length === 0) {
            return getCart(req, res);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all products in one query
        const productIds = items.map(item => item.productId);
        const products = await Product.find({ '_id': { $in: productIds } });
        
        if (products.length === 0) {
            console.warn('No valid products found for sync');
            return getCart(req, res);
        }

        const productsMap = new Map(products.map(p => [p._id.toString(), p]));

        // Create a map of current cart items for efficient lookup
        const currentCartMap = new Map();
        user.cart.items.forEach((item, index) => {
            currentCartMap.set(item.productId.toString(), { item, index });
        });

        // Process each item from guest cart
        for (const guestItem of items) {
            const productIdStr = guestItem.productId.toString();
            const product = productsMap.get(productIdStr);

            if (!product) {
                console.warn(`Product ${productIdStr} not found. Skipping.`);
                continue;
            }

            const existingCartItem = currentCartMap.get(productIdStr);

            if (existingCartItem) {
                // Item exists - merge quantities
                const newQuantity = Math.min(
                    existingCartItem.item.quantity + guestItem.quantity,
                    product.stock
                );
                
                user.cart.items[existingCartItem.index].quantity = newQuantity;
                
            } else {
                // Item doesn't exist - add it
                const quantityToAdd = Math.min(guestItem.quantity, product.stock);
                
                if (quantityToAdd > 0) {
                    user.cart.items.push({
                        productId: guestItem.productId,
                        quantity: quantityToAdd,
                        addedAt: new Date()
                    });
                }
            }
        }

        // Deduplicate any remaining duplicates (safety check)
        const deduplicatedItems = [];
        const seenProducts = new Set();

        for (const item of user.cart.items) {
            const productIdStr = item.productId.toString();
            
            if (!seenProducts.has(productIdStr)) {
                seenProducts.add(productIdStr);
                deduplicatedItems.push(item);
            } else {
                // Merge duplicate
                const existingItem = deduplicatedItems.find(
                    i => i.productId.toString() === productIdStr
                );
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                }
            }
        }

        user.cart.items = deduplicatedItems;
        user.cart.updatedAt = Date.now();
        
        await user.save();

        // Return the updated cart
        return getCart(req, res);

    } catch (error) {
        console.error('Sync cart error:', error);
        res.status(500).json({ 
            message: 'Failed to sync cart', 
            error: error.message 
        });
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