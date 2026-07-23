const Reaction = require('../models/Reaction');
const Joi = require('joi');

const reactionValidator = Joi.object({
  postId: Joi.string().required(),
  type: Joi.string().valid('like', 'love', 'haha', 'sad', 'angry', 'wow').required()
});

exports.createOrUpdate = async (req, res) => {
  const { error } = reactionValidator.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { postId, type } = req.body;
  const userId = req.user.id;

  try {
    const reaction = await Reaction.findOneAndUpdate(
      { postId, userId },
      { type },
      { new: true, upsert: true }
    );
    res.status(200).json(reaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  await Reaction.findOneAndDelete({ postId: req.params.postId, userId: req.user.id });
  res.status(204).end();
};

exports.getByPost = async (req, res) => {
  const reactions = await Reaction.find({ postId: req.params.postId });
  res.json(reactions);
};
