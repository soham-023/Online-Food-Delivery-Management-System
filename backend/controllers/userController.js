const { User, Address } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { getImageUrl } = require('../middleware/upload');


exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const user = await User.findByPk(req.user.id);

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    user: { _id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar },
  });
});


exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.scope('withPassword').findByPk(req.user.id);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});


exports.addAddress = asyncHandler(async (req, res) => {
  const { label, street, city, state, pincode, phone, isDefault } = req.body;

  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
  }

  const addressesCount = await Address.count({ where: { userId: req.user.id } });
  
  await Address.create({
    userId: req.user.id,
    label,
    street,
    city,
    state,
    pincode,
    phone,
    isDefault: isDefault || addressesCount === 0
  });

  const addresses = await Address.findAll({ where: { userId: req.user.id } });

  res.status(201).json({ success: true, addresses });
});


exports.updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    where: { id: req.params.addressId, userId: req.user.id }
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const { label, street, city, state, pincode, phone, isDefault } = req.body;
  
  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
  }

  await address.update({ label, street, city, state, pincode, phone, isDefault });

  const addresses = await Address.findAll({ where: { userId: req.user.id } });

  res.json({ success: true, addresses });
});


exports.deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    where: { id: req.params.addressId, userId: req.user.id }
  });
  
  if (address) {
    await address.destroy();
  }

  const addresses = await Address.findAll({ where: { userId: req.user.id } });
  
  res.json({ success: true, addresses });
});


exports.updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image');
  }

  const imageUrl = getImageUrl(req);
  const user = await User.findByPk(req.user.id);
  
  user.avatar = imageUrl;
  await user.save();

  res.json({
    success: true,
    message: 'Avatar updated successfully',
    user: { _id: user.id, name: user.name, email: user.email, avatar: user.avatar },
  });
});
