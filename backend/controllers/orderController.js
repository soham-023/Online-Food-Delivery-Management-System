const { Order, OrderItem, OrderStatusHistory, Cart, CartItem, Restaurant, Notification, Coupon, User } = require('../models');
const { sendEmail, orderConfirmationEmail, orderStatusEmail } = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { Sequelize: { Op } } = require('sequelize');

const GST_RATE = parseFloat(process.env.GST_RATE || '0.05');
const MAX_LIMIT = 50;


exports.placeOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod, couponCode, discount, scheduledFor, isScheduled } = req.body;

  const cart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [{ model: CartItem, as: 'items' }]
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const restaurant = await Restaurant.findByPk(cart.items[0].restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const itemsPrice = cart.totalPrice;
  const taxPrice = Math.round(itemsPrice * GST_RATE);
  const deliveryCharge = restaurant.deliveryCharge || 40;
  const discountAmount = discount || 0;
  const totalPrice = itemsPrice + taxPrice + deliveryCharge - discountAmount;

  // Validate scheduled time if provided
  let validScheduledFor = null;
  if (isScheduled && scheduledFor) {
    const scheduledDate = new Date(scheduledFor);
    const minScheduleTime = new Date(Date.now() + 60 * 60 * 1000); // At least 1 hour from now
    if (scheduledDate < minScheduleTime) {
      throw new ApiError(400, 'Scheduled time must be at least 1 hour from now');
    }
    validScheduledFor = scheduledDate;
  }

  const order = await Order.create({
    userId: req.user.id,
    restaurantId: restaurant.id,
    deliveryAddress,
    itemsPrice,
    taxPrice,
    deliveryCharge,
    discount: discountAmount,
    totalPrice,
    couponCode: couponCode || '',
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    status: 'placed',
    estimatedDelivery: restaurant.deliveryTime,
    isScheduled: !!isScheduled,
    scheduledFor: validScheduledFor,
  });

  for (const item of cart.items) {
    await OrderItem.create({
      orderId: order.id,
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    });
  }

  await OrderStatusHistory.create({
    orderId: order.id,
    status: 'placed',
    note: 'Order placed by customer',
  });

  await Cart.destroy({ where: { id: cart.id } });

  const scheduledMsg = order.isScheduled && order.scheduledFor
    ? ` Scheduled for ${new Date(order.scheduledFor).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`
    : '';

  await Notification.create({
    userId: req.user.id,
    title: order.isScheduled ? 'Order Scheduled' : 'Order Placed',
    message: `Your order #${order.id.slice(-8).toUpperCase()} has been placed!${scheduledMsg}`,
    type: 'order',
    link: `/order-tracking.html?id=${order.id}`,
  });

  const fullOrder = await Order.findByPk(order.id, {
    include: [{ model: OrderItem, as: 'items' }]
  });

  sendEmail({
    to: req.user.email,
    subject: `Order Confirmed - #${order.id.slice(-8).toUpperCase()}`,
    html: orderConfirmationEmail(fullOrder),
  });

  res.status(201).json({ success: true, data: fullOrder });
});


exports.getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, scheduled } = req.query;
  const cappedLimit = Math.min(Number(limit) || 10, MAX_LIMIT);
  const offset = (page - 1) * cappedLimit;
  
  const where = { userId: req.user.id };
  if (status) where.status = status;
  if (scheduled === 'true') where.isScheduled = true;
  if (scheduled === 'false') where.isScheduled = false;

  const { count, rows } = await Order.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: cappedLimit,
    offset,
    include: [
      { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image'] },
      { model: OrderItem, as: 'items' }
    ]
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page: Number(page), limit: cappedLimit, total: count, pages: Math.ceil(count / cappedLimit) },
  });
});


exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'phone', 'address'] },
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      { model: OrderItem, as: 'items' },
      { model: OrderStatusHistory, as: 'statusHistory' }
    ]
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const isOrderOwner = order.userId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  const isRestaurantOwner = req.user.role === 'restaurant';

  if (!isOrderOwner && !isAdmin) {
    if (isRestaurantOwner) {
      const restaurant = await Restaurant.findByPk(order.restaurantId);
      if (!restaurant || restaurant.ownerId !== req.user.id) {
        throw new ApiError(403, 'Not authorized to view this order');
      }
    } else {
      throw new ApiError(403, 'Not authorized');
    }
  }

  res.json({ success: true, data: order });
});


exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findByPk(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  await order.update({ status });
  
  await OrderStatusHistory.create({
    orderId: order.id,
    status,
    note: note || '',
  });

  if (status === 'delivered') {
    await order.update({ deliveredAt: new Date() });
    if (order.paymentMethod === 'cod') {
      await order.update({ paymentStatus: 'paid' });
    }
  }

  if (status === 'cancelled') {
    if (order.paymentStatus === 'paid' && order.paymentMethod === 'razorpay') {
      await order.update({ paymentStatus: 'refunded' });
    }
    if (order.couponCode) {
      await Coupon.decrement('usedCount', { where: { code: order.couponCode } });
    }
  }

  await Notification.create({
    userId: order.userId,
    title: 'Order Status Updated',
    message: `Order #${order.id.slice(-8).toUpperCase()} is now ${status.replace(/_/g, ' ')}`,
    type: 'order',
    link: `/order-tracking.html?id=${order.id}`,
  });

  const orderUser = await User.findByPk(order.userId);
  if (orderUser) {
    sendEmail({
      to: orderUser.email,
      subject: `Order Update - ${status.replace(/_/g, ' ').toUpperCase()}`,
      html: orderStatusEmail(order, status),
    });
  }

  const currentStatusHistory = await OrderStatusHistory.findAll({ where: { orderId: order.id }, order: [['timestamp', 'ASC']] });

  const io = req.app.get('io');
  if (io) {
    io.to(`order_${order.id}`).emit('orderStatusUpdate', {
      orderId: order.id,
      status: order.status,
      statusHistory: currentStatusHistory,
    });
  }

  res.json({ success: true, data: order });
});


exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const cappedLimit = Math.min(Number(limit) || 20, MAX_LIMIT);
  const offset = (page - 1) * cappedLimit;
  
  const where = {};
  if (status) where.status = status;

  if (req.user.role === 'restaurant') {
    const ownedRestaurants = await Restaurant.findAll({ where: { ownerId: req.user.id }, attributes: ['id'] });
    const restaurantIds = ownedRestaurants.map((r) => r.id);
    where.restaurantId = { [Op.in]: restaurantIds };
  }

  const { count, rows } = await Order.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: cappedLimit,
    offset,
    include: [
      { model: Restaurant, as: 'restaurant', attributes: ['name'] },
      { model: User, as: 'user', attributes: ['name', 'email'] },
      { model: OrderItem, as: 'items' }
    ]
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page: Number(page), limit: cappedLimit, total: count, pages: Math.ceil(count / cappedLimit) },
  });
});


exports.reorder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: 'items' }]
  });
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized to reorder this order');
  }

  await Cart.destroy({ where: { userId: req.user.id } });

  const cart = await Cart.create({
    userId: req.user.id,
    totalPrice: 0,
  });

  for (const item of order.items) {
    await CartItem.create({
      cartId: cart.id,
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      restaurantId: order.restaurantId,
    });
  }

  await cart.recalculateTotal();

  const fullCart = await Cart.findByPk(cart.id, {
    include: [{ model: CartItem, as: 'items' }]
  });

  res.json({ success: true, data: fullCart, message: 'Items added to cart' });
});
