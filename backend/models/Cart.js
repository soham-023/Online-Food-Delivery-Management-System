module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    
  }, 
    {
    tableName: 'carts',
    timestamps: true,
  });

  // Helper to recalculate total price from cart items  
  Cart.prototype.recalculateTotal = async function () {
    const { CartItem } = require('./index');
    const items = await CartItem.findAll({ where: { cartId: this.id } });
    this.totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await this.save();
  };
  

  Cart.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };
  

  return Cart;
};
