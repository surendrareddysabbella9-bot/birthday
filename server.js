require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI is not set!");
}

let client;
let clientPromise;

if (uri) {
    client = new MongoClient(uri);
    clientPromise = client.connect().catch(err => console.error('MongoDB Connection Error:', err));
}

// API endpoint to submit feedback
app.post('/api/submitFeedback', async (req, res) => {
    try {
        if (!clientPromise) throw new Error("Database not connected");
        await clientPromise;
        
        const db = client.db("birthday_db");
        const collection = db.collection("feedbacks");

        const payload = req.body;
        if (!payload.timestamp) {
            payload.timestamp = new Date().toISOString();
        }

        const result = await collection.insertOne(payload);
        res.status(200).json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error("Submit Feedback Error:", error);
        res.status(500).json({ error: 'Failed to insert feedback', details: error.message });
    }
});

// API endpoint to get feedbacks
app.get('/api/getFeedbacks', async (req, res) => {
    try {
        if (!clientPromise) throw new Error("Database not connected");
        await clientPromise;
        
        const db = client.db("birthday_db");
        const collection = db.collection("feedbacks");

        const documents = await collection.find({}).sort({ timestamp: -1 }).toArray();
        res.status(200).json({ documents });
    } catch (error) {
        console.error("Get Feedbacks Error:", error);
        res.status(500).json({ error: 'Failed to fetch feedbacks', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
