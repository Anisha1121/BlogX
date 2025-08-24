const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // HTML from React Quill
  image: { type: String }, // Cloudinary URL
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  category: { type: String },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
