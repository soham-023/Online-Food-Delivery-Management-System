const { Notification } = require('../models');
const asyncHandler = require('../utils/asyncHandler');


exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });

  const unreadCount = await Notification.count({
    where: { userId: req.user.id, isRead: false },
  });

  res.json({ success: true, data: notifications, unreadCount });
});


exports.markAsRead = asyncHandler(async (req, res) => {
  await Notification.update({ isRead: true }, { where: { id: req.params.id } });
  res.json({ success: true });
});


exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
  res.json({ success: true });
});
