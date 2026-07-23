const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: String,
  feeling: String, // emoji or string
  attachmentImages: [String],
  authorId: { type: String, required: true }, // admin user id
  visibility: { type: String, enum: ['public', 'private'], default: 'public' }
}, { timestamps: true });

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
