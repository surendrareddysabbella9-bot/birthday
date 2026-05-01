const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Render Postgres connections
    }
});

// Initialize database table
async function initDb() {
    if (!process.env.DATABASE_URL) {
        console.warn("DATABASE_URL is not set. Database operations will fail.");
        return;
    }
    
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedbacks (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                liked_about_me TEXT,
                dislike_about_me TEXT,
                birthday_message TEXT,
                fun_answer_1 VARCHAR(255),
                fun_answer_2 VARCHAR(255),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database table initialized successfully.");
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
}
initDb();

// API endpoint to submit feedback
app.post('/api/submitFeedback', async (req, res) => {
    try {
        const payload = req.body;
        
        const query = `
            INSERT INTO feedbacks (name, liked_about_me, dislike_about_me, birthday_message, fun_answer_1, fun_answer_2)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        `;
        const values = [
            payload.name || '',
            payload.liked_about_me || '',
            payload.dislike_about_me || '',
            payload.birthday_message || '',
            payload.fun_answer_1 || '',
            payload.fun_answer_2 || ''
        ];

        const result = await pool.query(query, values);
        res.status(200).json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error("Submit Feedback Error:", error);
        res.status(500).json({ error: 'Failed to insert feedback', details: error.message });
    }
});

// API endpoint to get feedbacks
app.get('/api/getFeedbacks', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM feedbacks ORDER BY timestamp DESC;`);
        res.status(200).json({ documents: result.rows });
    } catch (error) {
        console.error("Get Feedbacks Error:", error);
        res.status(500).json({ error: 'Failed to fetch feedbacks', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
