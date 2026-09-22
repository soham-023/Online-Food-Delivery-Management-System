const { Wishlist, WishlistItem, WishlistRestaurant, MenuItem, Restaurant } = require('../models');
const asyncHandler = require('../utils/asyncHandler');


exports.getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({
    where: { userId: req.user.id },
    include: [
      { model: MenuItem, as: 'items', attributes: ['id', 'name', 'price', 'image', 'rating', 'restaurantId'] },
      { model: Restaurant, as: 'restaurants', attributes: ['id', 'name', 'image', 'rating', 'cuisine', 'deliveryTime'] }
    ]
  });

  if (!wishlist) {
    wishlist = { items: [], restaurants: [] };
  }

  res.json({ success: true, data: wishlist });
});


exports.toggleItem = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ where: { userId: req.user.id } });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId: req.user.id });
  }

  const itemId = req.params.itemId;
  
  const existing = await WishlistItem.findOne({
    where: { wishlistId: wishlist.id, menuItemId: itemId }
  });

  let added = false;
  if (existing) {
    await existing.destroy();
  } else {
    await WishlistItem.create({ wishlistId: wishlist.id, menuItemId: itemId });
    added = true;
  }

  const updatedWishlist = await Wishlist.findByPk(wishlist.id, {
    include: [
      { model: MenuItem, as: 'items' },
      { model: Restaurant, as: 'restaurants' }
    ]
  });

  res.json({ success: true, data: updatedWishlist, added });
});


exports.toggleRestaurant = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ where: { userId: req.user.id } });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId: req.user.id });
  }

  const restaurantId = req.params.restaurantId;
  
  const existing = await WishlistRestaurant.findOne({
    where: { wishlistId: wishlist.id, restaurantId }
  });

  let added = false;
  if (existing) {
    await existing.destroy();
  } else {
    await WishlistRestaurant.create({ wishlistId: wishlist.id, restaurantId });
    added = true;
  }

  const updatedWishlist = await Wishlist.findByPk(wishlist.id, {
    include: [
      { model: MenuItem, as: 'items' },
      { model: Restaurant, as: 'restaurants' }
    ]
  });

  res.json({ success: true, data: updatedWishlist, added });
});
