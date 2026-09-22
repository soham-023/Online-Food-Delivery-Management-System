const express = require('express');
const router = express.Router();
const { getWishlist, toggleItem, toggleRestaurant } = require('../controllers/wishlistController');
const protect = require('../middleware/auth');

router.use(protect);

router.get('/', getWishlist);
router.post('/item/:itemId', toggleItem);
router.post('/restaurant/:restaurantId', toggleRestaurant);

module.exports = router;
