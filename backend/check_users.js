import { initDatabase } from './database.js';

const db = initDatabase();

async function listUsers() {
    try {
        const res = await db.query('SELECT * FROM profiles');
        console.log('Users found:', res.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
    } finally {
        await db.close();
    }
}

listUsers();
