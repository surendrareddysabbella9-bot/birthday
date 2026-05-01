import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("birthday_db");
        const collection = db.collection("feedbacks");

        const payload = req.body;
        // Ensure timestamp is added server-side just in case
        if (!payload.timestamp) {
            payload.timestamp = new Date().toISOString();
        }

        const result = await collection.insertOne(payload);
        res.status(200).json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to insert feedback' });
    }
}
