const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection URI
const uri = process.env.MONGODB_URI || 'mongodb+srv://wefit365:<db_password>@cluster0.h63jd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Database and Collection names
const dbName = 'wefit365';
const collectionName = 'user';

// Create a MongoDB client
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB Atlas');
    return client.db(dbName);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// User Schema based on the provided example
/*
  User Schema Example:
  {
    _id: ObjectId('67c5ba32b894cffd36db85ba'),
    name: "Nguyen Hoang Nhat", 
    email: "nhatlapress@gmail.com",
    gender: "male",
    age: "27",
    level: "0",
    weight: "65",
    height: "165",
    exercise_completed: "0",
    calories_burned: "0",
    point: "0",
    token: "0",
    wallet: "0x6AADC4C00997f1A6A1234c2DDC4F74581111514C"
  }
*/

// API Routes for users
app.get('/users', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Support basic filtering by query parameters
    const query = {};
    
    // Add filters if provided in query parameters
    const allowedFilters = ['name', 'email', 'gender', 'level'];
    allowedFilters.forEach(param => {
      if (req.query[param]) {
        query[param] = req.query[param];
      }
    });
    
    const users = await collection.find(query).toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Try to find by ObjectId first
    let user;
    try {
      user = await collection.findOne({ _id: new ObjectId(req.params.id) });
    } catch (err) {
      // If not a valid ObjectId, try finding by email
      user = await collection.findOne({ email: req.params.id });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Extract user data from request
    const { name, email, gender, age, weight, height, wallet } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user with same email already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Create new user with default values for some fields
    const newUser = {
      name: name || "",
      email,
      gender: gender || "other",
      age: age || "0",
      level: "0",
      weight: weight || "0",
      height: height || "0",
      exercise_completed: "0",
      calories_burned: "0",
      point: "0",
      token: "0",
      wallet: wallet || "0x0"
    };
    
    const result = await collection.insertOne(newUser);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: result.insertedId,
        ...newUser
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Get user ID (could be ObjectId or email)
    const userId = req.params.id;
    
    // Find the user first to confirm they exist
    let query;
    try {
      query = { _id: new ObjectId(userId) };
    } catch (err) {
      query = { email: userId };
    }
    
    const existingUser = await collection.findOne(query);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Extract fields to update
    // Only allow certain fields to be updated
    const updates = {};
    const allowedUpdates = [
      'name', 'email', 'gender', 'age', 'level', 
      'weight', 'height', 'exercise_completed', 
      'calories_burned', 'point', 'token', 'wallet'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    // If no valid updates were provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    // Update the user
    const result = await collection.updateOne(
      query,
      { $set: updates }
    );
    
    res.status(200).json({
      message: 'User updated successfully',
      modifiedCount: result.modifiedCount,
      updatedFields: updates
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const userId = req.params.id;
    let query;
    
    try {
      // Try to delete by ObjectId
      query = { _id: new ObjectId(userId) };
    } catch (err) {
      // If not a valid ObjectId, try deleting by email
      query = { email: userId };
    }
    
    const result = await collection.deleteOne(query);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'User deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Start the server
let db;
app.listen(port, async () => {
  db = await connectToMongoDB();
  console.log(`Server running on http://localhost:${port}`);
});

// Handle application shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});