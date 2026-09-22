const { Order, OrderItem, MenuItem, Restaurant, Sequelize } = require('../models');
const { Op, fn, col, literal } = Sequelize;
const asyncHandler = require('../utils/asyncHandler');

const MAX_RECOMMENDATIONS = 12;

/**
 * Smart Food Recommendation Engine
 * 
 * Strategy:
 * 1. Analyze user's past orders to find preferred categories
 * 2. Factor in time-of-day for contextual suggestions
 * 3. Suggest top-rated items from preferred categories
 * 4. Add "Try Something New" items from unexplored categories
 * 5. Fallback to top-rated items for new users
 */
exports.getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // ── Step 1: Get user's order history ──
  const userOrders = await Order.findAll({
    where: { userId },
    attributes: ['id', 'restaurantId', 'createdAt'],
    include: [{
      model: OrderItem,
      as: 'items',
      attributes: ['menuItemId', 'name', 'quantity'],
    }],
    order: [['createdAt', 'DESC']],
    limit: 50, // Look at last 50 orders
  });

  // ── Step 2: Determine time-based category preferences ──
  const hour = new Date().getHours();
  let timeBasedCategories = [];
  if (hour >= 6 && hour < 11) {
    timeBasedCategories = ['snacks', 'beverages', 'south-indian']; // Breakfast
  } else if (hour >= 11 && hour < 15) {
    timeBasedCategories = ['main-course', 'biryani', 'north-indian', 'chinese']; // Lunch
  } else if (hour >= 15 && hour < 18) {
    timeBasedCategories = ['snacks', 'beverages', 'desserts']; // Snack time
  } else {
    timeBasedCategories = ['main-course', 'biryani', 'pizza', 'burger', 'chinese', 'north-indian']; // Dinner
  }

  // ── Step 3: Analyze past orders for preferences ──
  const orderedMenuItemIds = [];
  const orderedRestaurantIds = new Set();

  userOrders.forEach(order => {
    orderedRestaurantIds.add(order.restaurantId);
    order.items.forEach(item => {
      orderedMenuItemIds.push(item.menuItemId);
    });
  });

  // Get categories the user has ordered from
  let preferredCategories = [];
  if (orderedMenuItemIds.length > 0) {
    const pastItems = await MenuItem.findAll({
      where: { id: { [Op.in]: [...new Set(orderedMenuItemIds)] } },
      attributes: ['category'],
    });

    // Count category frequency
    const categoryCount = {};
    pastItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    // Sort by frequency
    preferredCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  }

  // ── Step 4: Build recommendations ──
  const recommendations = { forYou: [], tryNew: [], trending: [] };

  if (preferredCategories.length > 0) {
    // "For You" — top-rated items from preferred categories + time-based
    const combinedCategories = [...new Set([...preferredCategories.slice(0, 3), ...timeBasedCategories])];

    const forYouItems = await MenuItem.findAll({
      where: {
        isAvailable: true,
        category: { [Op.in]: combinedCategories },
        id: { [Op.notIn]: orderedMenuItemIds.length > 0 ? orderedMenuItemIds : ['00000000-0000-0000-0000-000000000000'] },
      },
      order: [['rating', 'DESC'], ['numReviews', 'DESC']],
      limit: 6,
      include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'rating', 'deliveryTime'] }],
    });

    recommendations.forYou = forYouItems;

    // "Try Something New" — items from categories the user hasn't ordered
    const allCategories = ['starters', 'main-course', 'desserts', 'beverages', 'snacks', 'biryani', 'pizza', 'burger', 'chinese', 'south-indian', 'north-indian', 'other'];
    const unexploredCategories = allCategories.filter(c => !preferredCategories.includes(c));

    if (unexploredCategories.length > 0) {
      const tryNewItems = await MenuItem.findAll({
        where: {
          isAvailable: true,
          category: { [Op.in]: unexploredCategories },
          rating: { [Op.gte]: 3.5 },
        },
        order: [['rating', 'DESC']],
        limit: 4,
        include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'rating', 'deliveryTime'] }],
      });

      recommendations.tryNew = tryNewItems;
    }
  }

  // "Trending" — most ordered items (works for all users including new ones)
  const trendingItems = await MenuItem.findAll({
    where: {
      isAvailable: true,
      rating: { [Op.gte]: 3.0 },
      ...(timeBasedCategories.length > 0 ? { category: { [Op.in]: timeBasedCategories } } : {}),
    },
    order: [['numReviews', 'DESC'], ['rating', 'DESC']],
    limit: 6,
    include: [{ model: Restaurant, as: 'restaurant', attributes: ['id', 'name', 'image', 'rating', 'deliveryTime'] }],
  });

  recommendations.trending = trendingItems;

  // ── Step 5: Build metadata ──
  const isNewUser = userOrders.length === 0;
  const timeLabel = hour >= 6 && hour < 11 ? 'breakfast' :
                    hour >= 11 && hour < 15 ? 'lunch' :
                    hour >= 15 && hour < 18 ? 'snack' : 'dinner';

  res.json({
    success: true,
    data: recommendations,
    meta: {
      isNewUser,
      timeLabel,
      preferredCategories: preferredCategories.slice(0, 3),
      totalOrders: userOrders.length,
    },
  });
});
