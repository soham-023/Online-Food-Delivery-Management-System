const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant } = require('../controllers/restaurantController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { upload, uploadToCloudinary } = require('../middleware/upload');

router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.post('/', protect, roleGuard('admin', 'restaurant'), upload.single('image'), uploadToCloudinary('restaurants'), createRestaurant);
router.put('/:id', protect, roleGuard('admin', 'restaurant'), upload.single('image'), uploadToCloudinary('restaurants'), updateRestaurant);
router.delete('/:id', protect, roleGuard('admin'), deleteRestaurant);

module.exports = router;
