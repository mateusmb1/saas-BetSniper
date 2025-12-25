import { initDatabase } from './database.js';

const db = initDatabase();

async function checkMatches() {
    try {
        const res = await db.query(`
            SELECT sport, count(*) as count 
            FROM matches 
            GROUP BY sport
        `);
        console.log('📊 Matches summary by sport:', res.rows);

        const recent = await db.query(`
            SELECT id, sport, home_team, away_team, status, date 
            FROM matches 
            ORDER BY date DESC 
            LIMIT 5
        `);
        console.log('🕒 Recent 5 matches:', recent.rows);

    } catch (err) {
        console.error('Error checking matches:', err);
    } finally {
        await db.close();
    }
}

checkMatches();
