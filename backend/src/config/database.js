const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite підключено успішно');
    return sequelize;
  } catch (error) {
    console.error('Помилка підключення до SQLite:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };
