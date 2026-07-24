const PortfolioModels = require('../models/Portfolio');
const Joi = require('joi');

const genericValidator = Joi.object().unknown(true);

const specificValidators = {
  personalDetails: Joi.object({
    fullNameBangla: Joi.string().allow(null, ''),
    dateOfBirth: Joi.string().allow(null, ''),
    placeOfBirth: Joi.string().allow(null, ''),
    critical_credential: Joi.array().items(Joi.object({
      birthRegistrationNumber: Joi.string().allow(null, ''),
      nationalId: Joi.string().allow(null, ''),
      passportNumber: Joi.string().allow(null, ''),
      visibility: Joi.string().valid('public', 'private').default('private')
    })),
    nationality: Joi.string().allow(null, ''),
    religion: Joi.string().allow(null, ''),
    bloodGroup: Joi.string().allow(null, ''),
    maritalStatus: Joi.string().allow(null, ''),
    homeDistrict: Joi.string().allow(null, ''),
    visibility: Joi.string().valid('public', 'private').default('public')
  }),

  academicReferences: Joi.object({
    name: Joi.string().required(),
    designation: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    priority: Joi.number().allow(null),
    visibility: Joi.string().valid('public', 'private').default('public')
  }),

  applications: Joi.object({
    institution: Joi.string().required(),
    postAppliedFor: Joi.string().required(),
    jobCircularRef: Joi.string().allow(null, ''),
    circularDate: Joi.string().allow(null, ''),
    declarationDate: Joi.string().allow(null, ''),
    visibility: Joi.string().valid('public', 'private').default('public')
  }),

  documents: Joi.object({
    title: Joi.string().required(),
    type: Joi.string().allow(null, ''),
    url: Joi.string().uri().required(),
    source: Joi.string().allow(null, ''),
    publicId: Joi.string().allow(null, ''),
    resourceType: Joi.string().allow(null, ''),
    folder: Joi.string().allow(null, ''),
    accessMode: Joi.string().allow(null, ''),
    issuedBy: Joi.string().allow(null, ''),
    issuedDate: Joi.string().allow(null, ''),
    visibility: Joi.string().valid('public', 'private').default('public')
  })
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
