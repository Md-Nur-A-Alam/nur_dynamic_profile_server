const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function runTests() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.DB_NAME);

  console.log("=== 1. SECURITY FIX: REJECT ADMIN EMAIL SIGN-UPS ===");
  const adminRes = await fetch('http://localhost:8000/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email: 'mdnuralam2812@gmail.com', password: 'password123', name: 'Admin Attempt' })
  });
  console.log(`Status: ${adminRes.status}`);
  console.log(`Response: ${await adminRes.text()}`);

  console.log("\n=== 2. REACTION PERSISTENCE ===");
  
  const testEmail = `reaction_test_${Date.now()}@example.com`;

  // Create test user
  const userRes = await fetch('http://localhost:8000/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email: testEmail, password: 'password123', name: 'Reaction Tester' })
  });
  
  const cookies = userRes.headers.get('set-cookie');
  const userData = await userRes.json();
  const token = userData.token;
  const userId = userData.user.id;

  // Insert a dummy post directly to DB
  const postId = new ObjectId();
  await db.collection('posts').insertOne({ _id: postId, title: 'Test Post', description: 'Test', authorId: 'admin_id' });

  // React to post (like)
  const reactRes1 = await fetch('http://localhost:8000/api/social/reactions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Origin': 'http://localhost:3000', 
      'Authorization': `Bearer ${token}`,
      'Cookie': cookies 
    },
    body: JSON.stringify({ postId: postId.toString(), type: 'like' })
  });
  console.log(`Reaction 1 (like) Status: ${reactRes1.status}`);

  // Fetch reactions from API (simulating full page reload)
  const fetchReactions1 = await fetch(`http://localhost:8000/api/social/posts/${postId.toString()}/reactions`, {
    headers: { 'Origin': 'http://localhost:3000' }
  });
  const reactions1 = await fetchReactions1.json();
  console.log(`Reactions after first like: ${JSON.stringify(reactions1)}`);


  console.log("\n=== 3. REACTION TYPE SWITCHING ===");
  
  // React to post again (love)
  const reactRes2 = await fetch('http://localhost:8000/api/social/reactions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Origin': 'http://localhost:3000', 
      'Authorization': `Bearer ${token}`,
      'Cookie': cookies 
    },
    body: JSON.stringify({ postId: postId.toString(), type: 'love' })
  });
  console.log(`Reaction 2 (love) Status: ${reactRes2.status}`);

  // Fetch reactions from API again
  const fetchReactions2 = await fetch(`http://localhost:8000/api/social/posts/${postId.toString()}/reactions`, {
    headers: { 'Origin': 'http://localhost:3000' }
  });
  const reactions2 = await fetchReactions2.json();
  console.log(`Reactions after switching to love: ${JSON.stringify(reactions2)}`);
  
  // Clean up
  await db.collection('posts').deleteOne({ _id: postId });
  await db.collection('reactions').deleteMany({ postId: postId.toString() });
  await db.collection('user').deleteOne({ _id: userId });
  await db.collection('account').deleteMany({ userId });
  await db.collection('session').deleteMany({ userId });

  await client.close();
}

runTests().catch(console.error);
