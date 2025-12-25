import { initDatabase } from './database.js';

const db = initDatabase();

async function seedLiveMatches() {
    console.log('🌱 Seeding live matches for demo...');

    const matches = [
        // 🏀 BASKETBALL (NBA)
        {
            id: 'nba_live_1',
            sport: 'basketball',
            league: 'NBA',
            home_team: 'Los Angeles Lakers',
            away_team: 'Golden State Warriors',
            home_score: 88,
            away_score: 92,
            status: 'LIVE',
            date: new Date().toISOString(),
            is_live: true,
            raw: { minute: '34' }
        },
        {
            id: 'nba_live_2',
            sport: 'basketball',
            league: 'NBA',
            home_team: 'Boston Celtics',
            away_team: 'Miami Heat',
            home_score: 54,
            away_score: 48,
            status: 'LIVE',
            date: new Date().toISOString(),
            is_live: true,
            raw: { minute: '22' }
        },
        // 🎾 TENNIS
        {
            id: 'tennis_live_1',
            sport: 'tennis',
            league: 'ATP Miami Open',
            home_team: 'Carlos Alcaraz',
            away_team: 'Jannik Sinner',
            home_score: 1, // Sets
            away_score: 1, // Sets
            status: 'LIVE',
            date: new Date().toISOString(),
            is_live: true,
            raw: { score: '6-4 4-6 2-1' }
        },
        // ⚽ FOOTBALL
        {
            id: 'football_live_1',
            sport: 'football',
            league: 'Brasileirão Série A',
            home_team: 'Flamengo',
            away_team: 'Palmeiras',
            home_score: 1,
            away_score: 1,
            status: 'LIVE',
            date: new Date().toISOString(),
            is_live: true,
            raw: { minute: '65' }
        }
    ];

    try {
        for (const m of matches) {
            await db.query(`
                INSERT INTO matches (id, sport, league, home_team, away_team, home_score, away_score, status, date, is_live, raw, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    home_score = EXCLUDED.home_score,
                    away_score = EXCLUDED.away_score,
                    status = EXCLUDED.status,
                    updated_at = NOW()
            `, [m.id, m.sport, m.league, m.home_team, m.away_team, m.home_score, m.away_score, m.status, m.date, m.is_live, m.raw]);
        }
        console.log('✅ Inseridos 4 jogos de teste (NBA, Tênis, Futebol)');
    } catch (err) {
        console.error('❌ Erro no seed:', err);
    } finally {
        await db.close();
    }
}

seedLiveMatches();
