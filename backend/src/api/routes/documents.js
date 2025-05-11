const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Document } = require('../../models/document.model');
const pdfParse = require('pdf-parse');

// Налаштування multer для завантаження файлів
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Обмеження 10MB
  fileFilter: function(req, file, cb) {
    const filetypes = /pdf|doc|docx|txt/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Підтримуються лише PDF, DOC, DOCX, TXT файли!'));
  }
});

// Отримати всі документи
router.get('/', async (req, res) => {
  try {
    const documents = await Document.findAll({
      attributes: { exclude: ['content'] },
      order: [['uploadDate', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('Помилка при отриманні документів:', error);
    res.status(500).json({ message: error.message });
  }
});

// Отримати конкретний документ
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Отримати файл документа для перегляду
router.get('/file/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }

    // Шлях до файлу
    const filePath = path.join(__dirname, '../../../uploads', path.basename(document.fileName));

    // Перевіряємо, чи існує файл
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Файл не знайдено' });
    }

    // Визначаємо Content-Type на основі типу файлу
    let contentType = 'application/octet-stream'; // за замовчуванням

    switch (document.fileType.toLowerCase()) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'doc':
      case 'docx':
        contentType = 'application/msword';
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
    }

    // Установлюємо заголовки відповіді
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);

    // Відправляємо файл
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Помилка при отриманні файлу:', error);
    res.status(500).json({ message: error.message });
  }
});

// Завантажити новий документ
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не надано' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).substring(1);
    let content = '';

    // Витягнення тексту з PDF
    if (fileType === 'pdf') {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        content = pdfData.text;
      } catch (error) {
        console.error('Помилка при обробці PDF:', error);
        content = 'Не вдалося витягнути текст з PDF документа';
      }
    }
    // Для інших форматів - тимчасово просто читаємо як текст
    else if (fileType === 'txt') {
      content = fs.readFileSync(filePath, 'utf8');
    } else {
      // У реальному додатку тут буде обробка DOC/DOCX
      content = `Текст з ${fileType.toUpperCase()} буде доступний у повній версії`;
    }

    const newDocument = await Document.create({
      title: req.body.title || req.file.originalname,
      fileName: req.file.filename, // Використовуємо filename, а не originalname
      fileType: fileType,
      content: content
    });

    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Помилка при завантаженні документа:', error);
    res.status(500).json({ message: error.message });
  }
});

// Видалити документ
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }

    await document.destroy();
    res.json({ message: 'Документ видалено' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
