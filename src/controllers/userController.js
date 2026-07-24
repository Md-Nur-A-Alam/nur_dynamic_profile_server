const { MongoClient, ObjectId } = require('mongodb');

let db;
const getDb = async () => {
  if (db) return db;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME);
  return db;
};

exports.getProfile = async (req, res) => {
  try {
    const database = await getDb();
    const user = await database.collection('user').findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, occupation, profileImage } = req.body;
    const database = await getDb();
    
    const updateData = {};
    if (name) updateData.name = name;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (profileImage !== undefined) updateData.image = profileImage; // Keep image sync with profileImage

    const result = await database.collection('user').findOneAndUpdate(
      { _id: new ObjectId(req.user.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    res.json({ message: 'Profile updated successfully', user: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
