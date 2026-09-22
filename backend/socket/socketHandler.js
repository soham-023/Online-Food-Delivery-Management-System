const jwt = require('jsonwebtoken');
const { User } = require('../models');

const setupSocket = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (user) {
          socket.user = user;
        }
      }
      next();
    } catch (error) {
      next(); // Allow connection even without auth (for public tracking)
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}${socket.user ? ` (User: ${socket.user.name})` : ''}`);

    // Join order room for tracking
    socket.on('joinOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`📦 Socket ${socket.id} joined order room: order_${orderId}`);
    });

    // Leave order room
    socket.on('leaveOrder', (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`📦 Socket ${socket.id} left order room: order_${orderId}`);
    });

    // Delivery location update (from delivery person / admin simulation)
    // SECURITY: Only admin or restaurant roles can update delivery location
    socket.on('updateDeliveryLocation', async (data) => {
      if (!socket.user || !['admin', 'restaurant'].includes(socket.user.role)) {
        return socket.emit('error', { message: 'Unauthorized: Only admin or restaurant can update delivery location' });
      }

      const { orderId, lat, lng } = data;
      try {
        const { Order } = require('../models');
        await Order.update({ deliveryLocation: { lat, lng } }, { where: { id: orderId } });

        // Broadcast to all in order room
        io.to(`order_${orderId}`).emit('locationUpdate', {
          orderId,
          lat,
          lng,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Location update error:', error.message);
      }
    });

    // Admin/Restaurant updates order status
    // SECURITY: Only admin or restaurant roles can update order status
    socket.on('updateStatus', async (data) => {
      if (!socket.user || !['admin', 'restaurant'].includes(socket.user.role)) {
        return socket.emit('error', { message: 'Unauthorized: Only admin or restaurant can update order status' });
      }

      const { orderId, status, note } = data;
      try {
        const { Order, OrderStatusHistory } = require('../models');
        const order = await Order.findByPk(orderId);
        if (order) {
          order.status = status;
          if (status === 'delivered') {
            order.deliveredAt = new Date();
          }
          await order.save();
          
          await OrderStatusHistory.create({
            orderId,
            status,
            note: note || '',
          });

          const currentStatusHistory = await OrderStatusHistory.findAll({
            where: { orderId },
            order: [['timestamp', 'ASC']]
          });

          io.to(`order_${orderId}`).emit('orderStatusUpdate', {
            orderId,
            status,
            statusHistory: currentStatusHistory,
          });
        }
      } catch (error) {
        console.error('Status update error:', error.message);
      }
    });

    // Notification to specific user
    socket.on('joinUserRoom', () => {
      if (socket.user) {
        socket.join(`user_${socket.user.id}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
