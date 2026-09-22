const { sequelize } = require('../models');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected');

    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');
  } catch (error) {
    console.error(`❌ PostgreSQL Error: ${error.message}`);
    process.exit(1);
  }
};



module.exports = connectDB;
