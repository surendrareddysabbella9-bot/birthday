import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;

        // Create table if it doesn't exist (runs silently if it does)
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

        await sql`
            INSERT INTO feedbacks (name, liked_about_me, dislike_about_me, birthday_message, fun_answer_1, fun_answer_2)
            VALUES (${payload.name}, ${payload.liked_about_me}, ${payload.dislike_about_me}, ${payload.birthday_message}, ${payload.fun_answer_1}, ${payload.fun_answer_2});
        `;

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to insert feedback' });
    }
}
