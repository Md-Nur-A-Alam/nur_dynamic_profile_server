const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: String, required: true }, // Better Auth user id
  type: { type: String, required: true, enum: ['like', 'love', 'haha', 'sad', 'angry', 'wow'] }
}, { timestamps: true });

// Prevent duplicate reactions by same user on same post
reactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.models.Reaction || mongoose.model('Reaction', reactionSchema);
