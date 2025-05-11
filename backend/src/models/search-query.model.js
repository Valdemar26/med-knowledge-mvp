const mongoose = require('mongoose');

const SearchQuerySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  results: [{
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    },
    relevanceScore: {
      type: Number,
      required: true
    },
    matchedText: {
      type: String
    }
  }]
});

module.exports = mongoose.model('SearchQuery', SearchQuerySchema);
