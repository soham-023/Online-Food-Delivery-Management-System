module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    menuItemId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'cart_items',
    timestamps: false,
  });

  CartItem.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    // Backward compatibility
    if (values.menuItemId) {
      values.menuItem = values.menuItemId;
    }
    if (values.restaurantId) {
      values.restaurant = values.restaurantId;
    }
    return values;
  };

  return CartItem;
};
