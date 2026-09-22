module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    itemsPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    taxPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    deliveryCharge: {
      type: DataTypes.FLOAT,
      defaultValue: 40,
    },
    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    couponCode: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    paymentMethod: {
      type: DataTypes.ENUM('razorpay', 'cod'),
      defaultValue: 'cod',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpayPaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpaySignature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
      defaultValue: 'placed',
    },
    deliveryLocation: {
      type: DataTypes.JSONB,
      defaultValue: { lat: 0, lng: 0 },
    },
    estimatedDelivery: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isScheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    indexes: [
      { fields: ['userId', 'createdAt'] },
      { fields: ['restaurantId', 'createdAt'] },
      { fields: ['status'] },
      { fields: ['paymentStatus'] },
      { fields: ['razorpayOrderId'] },
    ],
  });

  Order.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return Order;
};
