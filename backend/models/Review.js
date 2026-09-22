module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    menuItemId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'menuItemId'],
        where: { menuItemId: { [require('sequelize').Op.ne]: null } },
        name: 'unique_user_menu_item_review',
      },
      {
        unique: true,
        fields: ['userId', 'restaurantId'],
        where: { restaurantId: { [require('sequelize').Op.ne]: null } },
        name: 'unique_user_restaurant_review',
      },
    ],
  });

  Review.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return Review;
};
