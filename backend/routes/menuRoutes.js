const express = require('express');
const router = express.Router();
const { getMenuItems, getMenuItem, searchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { upload, uploadToCloudinary } = require('../middleware/upload');

router.get('/search', searchMenuItems);
router.get('/restaurant/:restaurantId', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, roleGuard('admin', 'restaurant'), upload.single('image'), uploadToCloudinary('menu-items'), createMenuItem);
router.put('/:id', protect, roleGuard('admin', 'restaurant'), upload.single('image'), uploadToCloudinary('menu-items'), updateMenuItem);
router.delete('/:id', protect, roleGuard('admin', 'restaurant'), deleteMenuItem);

module.exports = router;
