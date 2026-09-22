const { MenuItem, Restaurant, Sequelize } = require('../models');
const { Op } = Sequelize;
const asyncHandler = require('../utils/asyncHandler');
const { getImageUrl } = require('../middleware/upload');
const ApiError = require('../utils/apiError');

const MAX_LIMIT = 50;


exports.getMenuItems = asyncHandler(async (req, res) => {
  const { category, search, sort, isVeg, page = 1, limit = 20 } = req.query;
  const cappedLimit = Math.min(Number(limit) || 20, MAX_LIMIT);
  const offset = (page - 1) * cappedLimit;
  
  const where = { restaurantId: req.params.restaurantId, isAvailable: true };

  if (category) where.category = category;
  if (isVeg) where.isVeg = isVeg === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  let order = [['createdAt', 'DESC']];
  if (sort === 'price_low') order = [['price', 'ASC']];
  else if (sort === 'price_high') order = [['price', 'DESC']];
  else if (sort === 'rating') order = [['rating', 'DESC']];
  else if (sort === 'name') order = [['name', 'ASC']];

  const { count, rows } = await MenuItem.findAndCountAll({
    where,
    order,
    limit: cappedLimit,
    offset,
    include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] }]
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page: Number(page), limit: cappedLimit, total: count, pages: Math.ceil(count / cappedLimit) },
  });
});


exports.getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByPk(req.params.id, {
    include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'rating', 'deliveryTime'] }]
  });
  if (!item) {
    throw new ApiError(404, 'Menu item not found');
  }
  res.json({ success: true, data: item });
});


exports.searchMenuItems = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, rating, isVeg, sort, page = 1, limit = 20 } = req.query;
  const cappedLimit = Math.min(Number(limit) || 20, MAX_LIMIT);
  const offset = (page - 1) * cappedLimit;
  
  const where = { isAvailable: true };

  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } },
    ];
  }
  if (category) where.category = category;
  if (isVeg) where.isVeg = isVeg === 'true';
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = Number(minPrice);
    if (maxPrice) where.price[Op.lte] = Number(maxPrice);
  }
  if (rating) where.rating = { [Op.gte]: Number(rating) };

  let order = [['createdAt', 'DESC']];
  if (sort === 'price_low') order = [['price', 'ASC']];
  else if (sort === 'price_high') order = [['price', 'DESC']];
  else if (sort === 'rating') order = [['rating', 'DESC']];

  const { count, rows } = await MenuItem.findAndCountAll({
    where,
    order,
    limit: cappedLimit,
    offset,
    include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'rating', 'deliveryTime'] }]
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page: Number(page), limit: cappedLimit, total: count, pages: Math.ceil(count / cappedLimit) },
  });
});


exports.createMenuItem = asyncHandler(async (req, res) => {
  const imageUrl = getImageUrl(req);
  if (imageUrl) req.body.image = imageUrl;
  const item = await MenuItem.create(req.body);
  res.status(201).json({ success: true, data: item });
});


exports.updateMenuItem = asyncHandler(async (req, res) => {
  const imageUrl = getImageUrl(req);
  if (imageUrl) req.body.image = imageUrl;
  
  const item = await MenuItem.findByPk(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found');
  }
  
  await item.update(req.body);
  
  res.json({ success: true, data: item });
});


exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByPk(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found');
  }
  await item.destroy();
  res.json({ success: true, message: 'Menu item deleted' });
});
