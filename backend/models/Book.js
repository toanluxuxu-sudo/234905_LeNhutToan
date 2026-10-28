const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  title: {
    type: String,
    required: true
  },

  author: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  publisher: {
    type: String,
    required: true
  },

  publishYear: {
    type: Number,
    required: true
  },

  isbn: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    min: 0
  },

  description: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model(
  "Book",
  bookSchema,
  "books"
);