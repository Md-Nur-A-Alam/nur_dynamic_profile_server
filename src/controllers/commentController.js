const Comment = require('../models/Comment');
const Joi = require('joi');

const commentValidator = Joi.object({
  postId: Joi.string().required(),
  text: Joi.string().required()
});

exports.create = async (req, res) => {
  const { error } = commentValidator.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const comment = new Comment({
    ...req.body,
    userId: req.user.id
  });
  await comment.save();
  res.status(201).json(comment);
};

exports.delete = async (req, res) => {
  // Admin can delete any comment, user can delete their own
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  if (req.user.role !== 'admin' && comment.userId !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  await comment.deleteOne();
  res.status(204).end();
};

exports.getByPost = async (req, res) => {
  const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
  res.json(comments);
};
