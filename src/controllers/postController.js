const Post = require('../models/Post');
const Joi = require('joi');

const postValidator = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().allow('', null),
  feeling: Joi.string().allow('', null),
  attachmentImages: Joi.array().items(Joi.string()),
  visibility: Joi.string().valid('public', 'private')
});

exports.getAll = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
};

exports.getById = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
};

exports.create = async (req, res) => {
  const { error } = postValidator.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const post = new Post({ ...req.body, authorId: req.user.id });
  await post.save();
  res.status(201).json(post);
};

exports.update = async (req, res) => {
  const { error } = postValidator.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
};

exports.delete = async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.status(204).end();
};
