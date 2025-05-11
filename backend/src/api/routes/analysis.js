const express = require('express');
const router = express.Router();
const { Document } = require('../../models/document.model');
const openai = require('../../config/openai');

// Отримати резюме документа
router.get('/summary/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }

    // Перевіряємо, чи є вже збережене резюме
    if (document.summary && document.summary.length > 10) {
      return res.json({ summary: document.summary });
    }

    // Генеруємо нове резюме за допомогою OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ви експерт з аналізу медичних документів. Ваше завдання - створити стислий огляд документа з виділенням ключових пунктів."
        },
        {
          role: "user",
          content: `Створіть структуроване резюме наступного медичного документа. Виділіть основні положення, визначення, вимоги та рекомендації:\n\nНазва: ${document.title}\n\nЗміст:\n${document.content.substring(0, 6000)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const summary = completion.choices[0].message.content;

    // Зберігаємо резюме в базі даних
    document.summary = summary;
    await document.save();

    res.json({ summary });
  } catch (error) {
    console.error('Помилка при генерації резюме:', error);
    res.status(500).json({ message: error.message });
  }
});

// Аналіз ключових тез документа
router.get('/key-points/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }

    // Генеруємо ключові тези за допомогою OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ви експерт з аналізу медичних документів. Ваше завдання - виділити ключові тези та рекомендації."
        },
        {
          role: "user",
          content: `Проаналізуйте цей медичний документ і виділіть 5-7 ключових тез, зобов'язань або рекомендацій. Структуруйте відповідь у форматі JSON з полями: "keyPoints" (масив об'єктів з полями "title" і "description") і "categories" (масив категорій документа).\n\nНазва: ${document.title}\n\nЗміст:\n${document.content.substring(0, 6000)}`
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    res.json(analysis);
  } catch (error) {
    console.error('Помилка при аналізі документа:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
