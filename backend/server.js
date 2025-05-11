const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/database');
const documentRoutes = require('./src/api/routes/documents');
const searchRoutes = require('./src/api/routes/search');

// Завантаження змінних середовища
dotenv.config();

// Ініціалізація Express
const app = express();
const PORT = process.env.PORT || 5000;

// Підключення до бази даних
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статичні файли для збережених документів
app.use('/uploads', express.static('uploads'));

// Маршрути API
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);

// Базовий маршрут
app.get('/', (req, res) => {
  res.send('MedKnowledge API працює');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
