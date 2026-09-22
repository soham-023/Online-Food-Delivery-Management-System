module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('code', value ? value.toUpperCase().trim() : value);
      },
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'flat'),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
    },
    minOrder: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    maxDiscount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  }, {
    tableName: 'coupons',
    timestamps: true,
  });

  Coupon.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return Coupon;
};
