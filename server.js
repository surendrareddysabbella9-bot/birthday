const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

const dataFile = path.join(__dirname, 'feedbacks.json');

// Ensure the JSON file exists
async function initDb() {
    try {
        await fs.access(dataFile);
    } catch {
        await fs.writeFile(dataFile, JSON.stringify([]));
    }
}
initDb();

// API endpoint to submit feedback
app.post('/api/submitFeedback', async (req, res) => {
    try {
        const payload = req.body;
        if (!payload.timestamp) {
            payload.timestamp = new Date().toISOString();
        }

        // Read current data
        const fileContent = await fs.readFile(dataFile, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Add new feedback
        data.push(payload);
        
        // Save back to file
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2));

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Submit Feedback Error:", error);
        res.status(500).json({ error: 'Failed to insert feedback', details: error.message });
    }
});

// API endpoint to get feedbacks
app.get('/api/getFeedbacks', async (req, res) => {
    try {
        const fileContent = await fs.readFile(dataFile, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Sort descending by timestamp
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json({ documents: data });
    } catch (error) {
        console.error("Get Feedbacks Error:", error);
        res.status(500).json({ error: 'Failed to fetch feedbacks', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
