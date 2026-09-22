module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Restaurant name is required' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    cuisine: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    address: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: { min: 0, max: 5 },
    },
    numReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    deliveryTime: {
      type: DataTypes.STRING,
      defaultValue: '30-45 min',
    },
    deliveryCharge: {
      type: DataTypes.FLOAT,
      defaultValue: 40,
    },
    minOrder: {
      type: DataTypes.FLOAT,
      defaultValue: 100,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    openingHours: {
      type: DataTypes.JSONB,
      defaultValue: { open: '09:00', close: '23:00' },
    },
  }, {
    tableName: 'restaurants',
    timestamps: true,
  });

  Restaurant.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return Restaurant;
};
