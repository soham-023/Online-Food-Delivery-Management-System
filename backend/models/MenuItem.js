module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('MenuItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Item name is required' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Price must be a positive number' },
      },
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    category: {
      type: DataTypes.ENUM(
        'starters', 'main-course', 'desserts', 'beverages', 'snacks',
        'biryani', 'pizza', 'burger', 'chinese', 'south-indian', 'north-indian', 'other'
      ),
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isVeg: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
  }, {
    tableName: 'menu_items',
    timestamps: true,
  });

  MenuItem.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return MenuItem;
};
