const mongoose = require('mongoose');

const collectionNames = [
  'profile', 'personalDetails', 'addresses', 'family', 'headlineStats',
  'education', 'skills', 'experience', 'employmentCompensation', 'training',
  'publications', 'researchProfiles', 'onlineProfiles', 'competitiveAchievements',
  'honoursAndAwards', 'leadershipRoles', 'committeeParticipation', 'languages',
  'contact', 'academicReferences', 'applications', 'images', 'documents', 'siteMeta',
  'currentWork'
];

const PortfolioModels = {};

// Create dynamic schemas for mostly flexible seed data collections
collectionNames.forEach((col) => {
  const schema = new mongoose.Schema({
    // Using Mixed allows flexible document structures which matches the seed data's diverse shapes.
    // We can tighten these later if needed, but this fulfills the generic CRUD requirement.
  }, { strict: false, timestamps: true, collection: col });
  
  PortfolioModels[col] = mongoose.models[col] || mongoose.model(col, schema);
});

// Specific schema for 'projects' as requested in FR-16 (needs challenges, futureImprovements)
const projectSchema = new mongoose.Schema({
  name: String,
  image: String,
  techStack: [String],
  description: String,
  liveLink: String,
  githubLink: String,
  challenges: [String],
  futureImprovements: { type: String, default: null },
}, { strict: false, timestamps: true, collection: 'projects' });

PortfolioModels.projects = mongoose.models.projects || mongoose.model('projects', projectSchema);

module.exports = PortfolioModels;
