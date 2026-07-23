const PortfolioModels = require('../models/Portfolio');
const Joi = require('joi');

const genericValidator = Joi.object().unknown(true);

const specificValidators = {
  personalDetails: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.string().allow(null, ''),
    nationality: Joi.string().allow(null, ''),
    gender: Joi.string().allow(null, ''),
    maritalStatus: Joi.string().allow(null, ''),
    languages: Joi.array().items(Joi.string()),
    bio: Joi.string().allow(null, '')
  }).unknown(true),

  academicReferences: Joi.object({
    name: Joi.string().required(),
    title: Joi.string().allow(null, ''),
    institution: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(null, ''),
    relationship: Joi.string().allow(null, '')
  }).unknown(true),

  applications: Joi.object({
    company: Joi.string().required(),
    role: Joi.string().required(),
    status: Joi.string().valid('applied', 'interviewing', 'offered', 'rejected', 'accepted').required(),
    dateApplied: Joi.date().allow(null, ''),
    notes: Joi.string().allow(null, '')
  }).unknown(true),

  documents: Joi.object({
    title: Joi.string().required(),
    type: Joi.string().required(),
    url: Joi.string().uri().required(),
    isPrivate: Joi.boolean().default(false)
  }).unknown(true)
};

const getCollectionModel = (collectionName) => {
  return PortfolioModels[collectionName];
};

const getValidator = (collectionName) => {
  return specificValidators[collectionName] || genericValidator;
};

exports.getAll = async (req, res) => {
  const Model = getCollectionModel(req.params.collection);
  if (!Model) return res.status(404).json({ message: 'Collection not found' });
  const data = await Model.find();
  res.json(data);
};

exports.getById = async (req, res) => {
  const Model = getCollectionModel(req.params.collection);
  if (!Model) return res.status(404).json({ message: 'Collection not found' });
  const data = await Model.findById(req.params.id);
  res.json(data);
};

exports.create = async (req, res) => {
  const Model = getCollectionModel(req.params.collection);
  if (!Model) return res.status(404).json({ message: 'Collection not found' });
  
  const validator = getValidator(req.params.collection);
  const { error } = validator.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const newData = new Model(req.body);
  await newData.save();
  res.status(201).json(newData);
};

exports.update = async (req, res) => {
  const Model = getCollectionModel(req.params.collection);
  if (!Model) return res.status(404).json({ message: 'Collection not found' });
  
  const validator = getValidator(req.params.collection);
  const { error } = validator.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const updatedData = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedData);
};

exports.delete = async (req, res) => {
  const Model = getCollectionModel(req.params.collection);
  if (!Model) return res.status(404).json({ message: 'Collection not found' });
  
  await Model.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
