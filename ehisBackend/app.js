const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection String - REPLACE WITH YOUR ACTUAL PASSWORD
const uri = process.env.MONGODB_URI ||"mongodb+srv://wefit365:wefit365@cluster0.h63jd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "Ehis";
const collectionName = "chongchidinhthuoc";

// Global database connection
const client = new MongoClient(uri);
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

// Root endpoint for testing
app.get('/', (req, res) => {
  res.send('API is running. Try /api/treatments to get all treatments.');
});

// Get all treatments
app.get('/api/treatments', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const treatments = await collection.find({}).toArray();
    res.json(treatments);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get treatment by ID
app.get('/api/treatments/id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    let query;
    try {
      // Try ObjectId first
      query = { _id: new ObjectId(id) };
    } catch (e) {
      // Fall back to numeric ID
      query = { ID: parseInt(id) };
    }
    
    const treatment = await collection.findOne(query);
    
    if (!treatment) {
      return res.status(404).json({ message: `Treatment with ID ${id} not found` });
    }
    
    res.json(treatment);
  } catch (error) {
    console.error('Error fetching treatment by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get treatments by crop type (COCHE, HAUQUA, XUTRI)
app.get('/api/treatments/crop/:cropType', async (req, res) => {
  try {
    const { cropType } = req.params;
    const upperCropType = cropType.toUpperCase();
    
    // Validate crop type
    if (!['COCHE', 'HAUQUA', 'XUTRI'].includes(upperCropType)) {
      return res.status(400).json({ message: 'Invalid crop type. Must be COCHE, HAUQUA, or XUTRI' });
    }
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const query = {};
    query[upperCropType] = { $exists: true, $ne: null, $ne: "" };
    
    const treatments = await collection.find(query).toArray();
    
    if (treatments.length === 0) {
      return res.status(404).json({ message: `No treatments found for ${upperCropType}` });
    }
    
    res.json(treatments);
  } catch (error) {
    console.error('Error fetching treatments by crop type:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get treatments by active ingredients
app.get('/api/treatments/ingredients', async (req, res) => {
  try {
    const { hoatchat1, hoatchat2 } = req.query;
    
    if (!hoatchat1 && !hoatchat2) {
      return res.status(400).json({ message: 'At least one active ingredient parameter is required' });
    }
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const query = {};
    
    if (hoatchat1) query.HOATCHAT1 = { $regex: hoatchat1, $options: 'i' };
    if (hoatchat2) query.HOATCHAT2 = { $regex: hoatchat2, $options: 'i' };
    
    const treatments = await collection.find(query).toArray();
    
    if (treatments.length === 0) {
      return res.status(404).json({ message: 'No treatments found with specified ingredients' });
    }
    
    res.json(treatments);
  } catch (error) {
    console.error('Error fetching treatments by ingredients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Advanced search
app.get('/api/search', async (req, res) => {
  try {
    const { cropType, hoatchat1, hoatchat2, muc, stt } = req.query;
    
    if (!cropType && !hoatchat1 && !hoatchat2 && !muc && !stt) {
      return res.status(400).json({ message: 'At least one search parameter is required' });
    }
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const query = {};
    
    if (cropType) {
      const upperCropType = cropType.toUpperCase();
      if (!['COCHE', 'HAUQUA', 'XUTRI'].includes(upperCropType)) {
        return res.status(400).json({ message: 'Invalid crop type. Must be COCHE, HAUQUA, or XUTRI' });
      }
      query[upperCropType] = { $exists: true, $ne: null, $ne: "" };
    }
    
    if (hoatchat1) query.HOATCHAT1 = { $regex: hoatchat1, $options: 'i' };
    if (hoatchat2) query.HOATCHAT2 = { $regex: hoatchat2, $options: 'i' };
    if (muc) query.MUC = parseInt(muc);
    if (stt) query.STT = parseInt(stt);
    
    const treatments = await collection.find(query).toArray();
    
    if (treatments.length === 0) {
      return res.status(404).json({ message: 'No treatments found matching the criteria' });
    }
    
    res.json(treatments);
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize and start server// Start the server
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