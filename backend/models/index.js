const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  define: {
    timestamps: true,
    underscored: false,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Import model definitions
const User = require('./User')(sequelize, DataTypes);
const Address = require('./Address')(sequelize, DataTypes);
const Restaurant = require('./Restaurant')(sequelize, DataTypes);
const MenuItem = require('./MenuItem')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const OrderItem = require('./OrderItem')(sequelize, DataTypes);
const OrderStatusHistory = require('./OrderStatusHistory')(sequelize, DataTypes);
const Cart = require('./Cart')(sequelize, DataTypes);
const CartItem = require('./CartItem')(sequelize, DataTypes);
const Review = require('./Review')(sequelize, DataTypes);
const Coupon = require('./Coupon')(sequelize, DataTypes);
const Notification = require('./Notification')(sequelize, DataTypes);
const Wishlist = require('./Wishlist')(sequelize, DataTypes);
const WishlistItem = require('./WishlistItem')(sequelize, DataTypes);
const WishlistRestaurant = require('./WishlistRestaurant')(sequelize, DataTypes);

// ===== ASSOCIATIONS =====

// User <-> Address (one-to-many)
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Restaurant (one-to-many, owner)
User.hasMany(Restaurant, { foreignKey: 'ownerId', as: 'ownedRestaurants' });
Restaurant.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Restaurant <-> MenuItem (one-to-many)
Restaurant.hasMany(MenuItem, { foreignKey: 'restaurantId', as: 'menuItems', onDelete: 'CASCADE' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// User <-> Order (one-to-many)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Restaurant <-> Order (one-to-many)
Restaurant.hasMany(Order, { foreignKey: 'restaurantId', as: 'orders' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Order <-> OrderItem (one-to-many)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// OrderItem <-> MenuItem
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

// Order <-> OrderStatusHistory (one-to-many)
Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory', onDelete: 'CASCADE' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User <-> Cart (one-to-one)
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Cart <-> CartItem (one-to-many)
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// CartItem <-> MenuItem
CartItem.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

// CartItem <-> Restaurant
CartItem.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// User <-> Review (one-to-many)
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// MenuItem <-> Review (one-to-many)
MenuItem.hasMany(Review, { foreignKey: 'menuItemId', as: 'reviews' });
Review.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

// Restaurant <-> Review (one-to-many)
Restaurant.hasMany(Review, { foreignKey: 'restaurantId', as: 'reviews' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Order <-> Review
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User <-> Notification (one-to-many)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Wishlist (one-to-one)
User.hasOne(Wishlist, { foreignKey: 'userId', as: 'wishlist', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Wishlist <-> MenuItem (many-to-many via WishlistItem)
Wishlist.belongsToMany(MenuItem, { through: WishlistItem, foreignKey: 'wishlistId', otherKey: 'menuItemId', as: 'items' });
MenuItem.belongsToMany(Wishlist, { through: WishlistItem, foreignKey: 'menuItemId', otherKey: 'wishlistId', as: 'wishlists' });

// Wishlist <-> Restaurant (many-to-many via WishlistRestaurant)
Wishlist.belongsToMany(Restaurant, { through: WishlistRestaurant, foreignKey: 'wishlistId', otherKey: 'restaurantId', as: 'restaurants' });
Restaurant.belongsToMany(Wishlist, { through: WishlistRestaurant, foreignKey: 'restaurantId', otherKey: 'wishlistId', as: 'wishlists' });

// Export
module.exports = {
  sequelize,
  Sequelize,
  User,
  Address,
  Restaurant,
  MenuItem,
  Order,
  OrderItem,
  OrderStatusHistory,
  Cart,
  CartItem,
  Review,
  Coupon,
  Notification,
  Wishlist,
  WishlistItem,
  WishlistRestaurant,
};
