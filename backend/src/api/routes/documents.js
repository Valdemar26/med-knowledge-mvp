const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../../models/document.model');
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
    const documents = await Document.find().select('-content').sort({ uploadDate: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Отримати конкретний документ
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }
    res.json(document);
  } catch (error) {
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
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
    }
    // Для інших форматів - тимчасово просто читаємо як текст
    else if (fileType === 'txt') {
      content = fs.readFileSync(filePath, 'utf8');
    } else {
      // У реальному додатку тут буде обробка DOC/DOCX
      content = `Текст з ${fileType.toUpperCase()} буде доступний у повній версії`;
    }

    const newDocument = new Document({
      title: req.body.title || req.file.originalname,
      fileName: req.file.originalname,
      fileType: fileType,
      content: content
    });

    const savedDocument = await newDocument.save();
    res.status(201).json(savedDocument);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Видалити документ
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Документ не знайдено' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Документ видалено' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
