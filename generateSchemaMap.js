const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:/Users/surai/Downloads/portfolio_db_seed_final.json', 'utf8'));
const schemaMap = {};
const KNOWN_ENUMS = ['status', 'resourceType', 'source', 'accessMode', 'type', 'visibility'];
const HARDCODED_OPTIONS = {
  'documents.type': ['transcript', 'certificate', 'id_document', 'cv', 'application_form', 'resume', 'publication'],
  'documents.source': ['imgbb', 'cloudinary', 'external'],
  'documents.accessMode': ['public', 'authenticated']
};

for (const key of Object.keys(data)) {
  const arr = Array.isArray(data[key]) ? data[key] : [data[key]];
  if (arr.length === 0) continue;
  
  const valuesSet = {};
  arr.forEach(obj => {
    for (const [field, val] of Object.entries(obj)) {
      if (!valuesSet[field]) valuesSet[field] = new Set();
      valuesSet[field].add(val);
    }
  });
  
  const obj = arr[0];
  schemaMap[key] = [];
  
  for (const [field, val] of Object.entries(obj)) {
    if (field === '_id') continue;
    let type = typeof val;
    let subFields = [];
    let options = null;
    
    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object') {
        type = 'array-of-objects';
        for (const [subField, subVal] of Object.entries(val[0])) {
          subFields.push({ name: subField, type: typeof subVal });
        }
      } else {
        type = 'array-of-strings';
      }
    } else if (val === null) {
      type = 'string';
    } else if (type === 'object') {
      type = 'nested-object';
      for (const [subField, subVal] of Object.entries(val)) {
        subFields.push({ name: subField, type: typeof subVal });
      }
    }
    
    if (type === 'string' && KNOWN_ENUMS.includes(field)) {
      type = 'enum';
      const hardcodedKey = key + '.' + field;
      if (HARDCODED_OPTIONS[hardcodedKey]) {
        options = HARDCODED_OPTIONS[hardcodedKey];
      } else {
        options = Array.from(valuesSet[field]).filter(v => typeof v === 'string');
        if (field === 'visibility' && options.length === 0) options = ['public', 'private'];
      }
    }
    
    const fieldDef = { name: field, type };
    if (subFields.length > 0) fieldDef.subFields = subFields;
    if (options) fieldDef.options = options;
    schemaMap[key].push(fieldDef);
  }
}

// Ensure __posts schema survives regeneration
schemaMap.__posts = [
  { name: 'title', type: 'string' },
  { name: 'description', type: 'string' },
  { name: 'location', type: 'string' },
  { name: 'feeling', type: 'string' },
  { name: 'attachmentImages', type: 'array-of-strings' },
  { name: 'visibility', type: 'enum', options: ['public', 'private'] }
];

fs.writeFileSync(
  'c:/Projects/Nur_Dynamic_Profile/nur_dynamic_profile_client/src/lib/schemaMap.js',
  'export const collectionSchemas = ' + JSON.stringify(schemaMap, null, 2) + ';'
);
console.log('Robust Schema map generated, __posts preserved.');
