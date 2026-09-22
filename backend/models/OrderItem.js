module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    menuItemId: {
      type: DataTypes.UUID,
      allowNull: true,
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
    },
  }, {
    tableName: 'order_items',
    timestamps: false,
  });

  OrderItem.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    // Maintain backward compatibility: menuItem field
    if (values.menuItemId) {
      values.menuItem = values.menuItemId;
    }
    return values;
  };

  return OrderItem;
};
