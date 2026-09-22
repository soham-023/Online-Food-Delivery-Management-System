const { User, Order, Restaurant, Sequelize } = require('../models');
const { Op, fn, col } = Sequelize;
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const MAX_LIMIT = 50;


exports.getDashboardStats = asyncHandler(async (req, res) => {
  const isRestaurantOwner = req.user.role === 'restaurant';

  let restaurantFilter = {};
  if (isRestaurantOwner) {
    const ownedRestaurants = await Restaurant.findAll({ where: { ownerId: req.user.id }, attributes: ['id'] });
    const restaurantIds = ownedRestaurants.map((r) => r.id);
    restaurantFilter = { restaurantId: { [Op.in]: restaurantIds } };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalUsers,
    totalRestaurants,
    totalOrders,
    revenueResult,
    ordersByStatus,
    recentOrders,
    monthlyRevenue,
    todayOrders,
    todayRevenueResult,
  ] = await Promise.all([
    isRestaurantOwner ? Promise.resolve(0) : User.count({ where: { role: 'customer' } }),
    isRestaurantOwner ? Restaurant.count({ where: { ownerId: req.user.id } }) : Restaurant.count(),
    Order.count({ where: restaurantFilter }),
    Order.findOne({
      attributes: [[fn('SUM', col('totalPrice')), 'totalRevenue']],
      where: { paymentStatus: 'paid', ...restaurantFilter },
      raw: true,
    }),
    Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      where: restaurantFilter,
      group: ['status'],
      raw: true,
    }),
    Order.findAll({
      where: restaurantFilter,
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: Restaurant, as: 'restaurant', attributes: ['name'] }
      ]
    }),
    Order.findAll({
      attributes: [
        [fn('to_char', col('Order.createdAt'), 'YYYY-MM'), 'month'],
        [fn('SUM', col('totalPrice')), 'revenue'],
        [fn('COUNT', col('Order.id')), 'orders']
      ],
      where: { paymentStatus: 'paid', createdAt: { [Op.gte]: sixMonthsAgo }, ...restaurantFilter },
      group: [fn('to_char', col('Order.createdAt'), 'YYYY-MM')],
      order: [[fn('to_char', col('Order.createdAt'), 'YYYY-MM'), 'ASC']],
      raw: true,
    }),
    Order.count({ where: { createdAt: { [Op.gte]: today }, ...restaurantFilter } }),
    Order.findOne({
      attributes: [[fn('SUM', col('totalPrice')), 'revenue']],
      where: { paymentStatus: 'paid', createdAt: { [Op.gte]: today }, ...restaurantFilter },
      raw: true,
    }),
  ]);

  const totalRevenue = revenueResult?.totalRevenue ? Number(revenueResult.totalRevenue) : 0;
  const todayRevenue = todayRevenueResult?.revenue ? Number(todayRevenueResult.revenue) : 0;

  const formattedOrdersByStatus = ordersByStatus.map(x => ({ _id: x.status, count: Number(x.count) }));
  const formattedMonthlyRevenue = monthlyRevenue.map(x => ({ _id: x.month, revenue: Number(x.revenue), orders: Number(x.orders) }));

  res.json({
    success: true,
    data: {
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      ordersByStatus: formattedOrdersByStatus,
      recentOrders,
      monthlyRevenue: formattedMonthlyRevenue,
    },
  });
});


exports.getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const cappedLimit = Math.min(Number(limit) || 20, MAX_LIMIT);
  const offset = (page - 1) * cappedLimit;
  
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (role) where.role = role;

  const { count, rows } = await User.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: cappedLimit,
    offset,
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page: Number(page), limit: cappedLimit, total: count, pages: Math.ceil(count / cappedLimit) },
  });
});


exports.toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(400, 'Cannot block an admin');
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    success: true,
    message: user.isBlocked ? 'User blocked' : 'User unblocked',
    data: { _id: user.id, isBlocked: user.isBlocked },
  });
});
