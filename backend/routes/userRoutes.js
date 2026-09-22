const express = require('express');
const router = express.Router();
const { updateProfile, updatePassword, addAddress, updateAddress, deleteAddress, updateAvatar } = require('../controllers/userController');
const protect = require('../middleware/auth');
const { validate, updateProfileRules, updatePasswordRules, addressRules } = require('../middleware/validate');
const { upload, uploadToCloudinary } = require('../middleware/upload');

router.use(protect);

router.put('/profile', updateProfileRules, validate, updateProfile);
router.put('/password', updatePasswordRules, validate, updatePassword);
router.put('/avatar', upload.single('avatar'), uploadToCloudinary('avatars'), updateAvatar);
router.post('/address', addressRules, validate, addAddress);
router.put('/address/:addressId', addressRules, validate, updateAddress);
router.delete('/address/:addressId', deleteAddress);

module.exports = router;
