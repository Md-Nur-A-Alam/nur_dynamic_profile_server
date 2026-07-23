const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: String, required: true }, // Better Auth user id
  text: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
