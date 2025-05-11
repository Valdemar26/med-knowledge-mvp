const express = require('express');
const router = express.Router();
const { Document } = require('../../models/document.model');
const { Op } = require('sequelize');
const openai = require('../../config/openai');

// Пошук документів
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Потрібно ввести запит' });
    }

    // Отримуємо всі документи
    const documents = await Document.findAll();

    // Масив для зберігання результатів
    const results = [];

    // Для кожного документа виконуємо пошук і оцінку релевантності
    for (const doc of documents) {
      try {
        // Використовуємо OpenAI для пошуку в тексті документа
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Ви експерт з пошуку інформації в медичних документах. Ваше завдання - знайти релевантні фрагменти тексту, що відповідають на запит."
            },
            {
              role: "user",
              content: `Документ: ${doc.title}\n\nЗміст документа: ${doc.content.substring(0, 4000)}\n\nЗапит користувача: ${query}\n\nЗнайдіть найбільш релевантний фрагмент тексту (не більше 200 слів), що відповідає на запит. Визначте релевантність результату у відсотках від 0 до 100. Поверніть результат у форматі JSON: { "relevance": число, "text": "знайдений фрагмент", "exists": true/false }`
            }
          ],
          temperature: 0,
          response_format: { type: "json_object" }
        });

        // Парсимо результат
        const result = JSON.parse(completion.choices[0].message.content);

        // Якщо знайдено релевантний фрагмент
        if (result.exists && result.relevance > 30) {
          results.push({
            document: {
              id: doc.id,
              title: doc.title,
              fileName: doc.fileName,
              fileType: doc.fileType,
              uploadDate: doc.uploadDate
            },
            relevance: result.relevance,
            text: result.text
          });
        }
      } catch (error) {
        console.error(`Помилка при обробці документа ${doc.id}:`, error);
        // Продовжуємо з наступним документом
      }
    }

    // Сортуємо результати за релевантністю
    results.sort((a, b) => b.relevance - a.relevance);

    // Повертаємо лише top-5 результатів
    res.json(results.slice(0, 5));
  } catch (error) {
    console.error('Помилка при пошуку:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
