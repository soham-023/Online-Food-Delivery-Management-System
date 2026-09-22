const { Cart, CartItem, MenuItem, Restaurant } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');


exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [{
      model: CartItem,
      as: 'items',
      include: [{ model: MenuItem, as: 'menuItem', attributes: ['id', 'name', 'price', 'image', 'isAvailable'] }]
    }]
  });

  if (!cart) {
    cart = { items: [], totalPrice: 0 };
  }

  res.json({ success: true, data: cart });
});


exports.addToCart = asyncHandler(async (req, res) => {
  const { menuItemId, quantity = 1 } = req.body;

  const menuItem = await MenuItem.findByPk(menuItemId);
  if (!menuItem) {
    throw new ApiError(404, 'Menu item not found');
  }
  if (!menuItem.isAvailable) {
    throw new ApiError(400, 'Item is not available');
  }

  let cart = await Cart.findOne({ where: { userId: req.user.id } });

  if (!cart) {
    cart = await Cart.create({ userId: req.user.id, totalPrice: 0 });
  }

  const existingItemsCount = await CartItem.count({ where: { cartId: cart.id } });
  
  if (existingItemsCount > 0) {
    const firstItem = await CartItem.findOne({ where: { cartId: cart.id } });
    if (firstItem.restaurantId !== menuItem.restaurantId) {
      throw new ApiError(400, 'You can only order from one restaurant at a time. Clear your cart first.');
    }
  }

  const existingItem = await CartItem.findOne({
    where: { cartId: cart.id, menuItemId }
  });

  if (existingItem) {
    existingItem.quantity += quantity;
    await existingItem.save();
  } else {
    await CartItem.create({
      cartId: cart.id,
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      quantity,
      restaurantId: menuItem.restaurantId,
    });
  }

  await cart.recalculateTotal();

  const updatedCart = await Cart.findByPk(cart.id, {
    include: [{ model: CartItem, as: 'items' }]
  });

  res.json({ success: true, data: updatedCart });
});


exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ where: { userId: req.user.id } });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } });
  if (!item) {
    throw new ApiError(404, 'Item not in cart');
  }

  if (quantity <= 0) {
    await item.destroy();
  } else {
    item.quantity = quantity;
    await item.save();
  }

  await cart.recalculateTotal();

  const updatedCart = await Cart.findByPk(cart.id, {
    include: [{ model: CartItem, as: 'items' }]
  });

  res.json({ success: true, data: updatedCart });
});


exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  await CartItem.destroy({ where: { id: req.params.itemId, cartId: cart.id } });
  
  await cart.recalculateTotal();

  const updatedCart = await Cart.findByPk(cart.id, {
    include: [{ model: CartItem, as: 'items' }]
  });

  res.json({ success: true, data: updatedCart });
});


exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.destroy({ where: { userId: req.user.id } });
  res.json({ success: true, message: 'Cart cleared' });
});
