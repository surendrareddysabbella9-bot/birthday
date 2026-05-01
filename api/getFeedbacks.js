import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Ensure table exists before querying to avoid errors on empty database
        await sql`CREATE TABLE IF NOT EXISTS feedbacks (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            liked_about_me TEXT,
            dislike_about_me TEXT,
            birthday_message TEXT,
            fun_answer_1 VARCHAR(255),
            fun_answer_2 VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;

        const { rows } = await sql`SELECT * FROM feedbacks ORDER BY timestamp DESC;`;
        
        // Postgres returns dates as objects, convert to standard ISO strings for the frontend
        const documents = rows.map(row => ({
            ...row,
            timestamp: new Date(row.timestamp).toISOString()
        }));

        res.status(200).json({ documents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
}
