module.exports = (sequelize, DataTypes) => {
  const WishlistRestaurant = sequelize.define('WishlistRestaurant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    wishlistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'wishlist_restaurants',
    timestamps: false,
  });

  return WishlistRestaurant;
};
