const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Спочатку завантажуємо змінні середовища
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log("Змінні середовища:", {
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "Встановлено" : "Не встановлено"
});

// Перевірка наявності необхідних змінних
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY missed!");
  process.exit(1);
}

const cors = require('cors');
const { connectDB } = require('./src/config/database');
const { initModel } = require('./src/models/document.model');
const documentRoutes = require('./src/api/routes/documents');
const searchRoutes = require('./src/api/routes/search');
const analysisRoutes = require('./src/api/routes/analysis');

// Ініціалізація Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статичні файли для збережених документів
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршрути API
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analysis', analysisRoutes);

// Базовий маршрут
app.get('/', (req, res) => {
  res.send('MedKnowledge API працює');
});

// Основна функція запуску
const startServer = async () => {
  try {
    // Підключення до бази даних
    await connectDB();
    await initModel();

    // Запуск сервера після підключення до бази даних
    app.listen(PORT, () => {
      console.log(`Сервер запущено на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Помилка запуску сервера:', error);
    process.exit(1);
  }
};

// Запускаємо сервер
startServer();
