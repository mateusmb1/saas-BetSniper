/**
 * Database simples usando JSON
 * (Substitui SQLite para evitar problemas de compilação)
 */
import fs from 'fs';
import path from 'path';

const DB_FILE = 'futebol-db.json';

export function initDatabase() {
    // Criar arquivo se não existir
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ matches: [] }, null, 2));
    }

    const db = {
        data: JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')),

        save() {
            fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
        },

        prepare(query) {
            // Simulação simplificada de queries SQL
            return {
                run: (...params) => {
                    if (query.includes('INSERT')) {
                        // Ordem correta baseada no SQL do EspnService:
                        // match_id, league, homeTeam, awayTeam, time, status, score, minute, homeLogo, awayLogo, created_at, updated_at
                        const [matchId, league, homeTeam, awayTeam, time, status, score, minute, homeLogo, awayLogo, createdAt, updatedAt] = params;

                        // Verificar se já existe
                        const exists = db.data.matches.some(m => m.match_id === matchId);
                        if (!exists) {
                            db.data.matches.push({
                                id: db.data.matches.length + 1,
                                match_id: matchId,
                                league,
                                homeTeam,
                                awayTeam,
                                homeLogo,
                                awayLogo,
                                time,
                                status,
                                score: null,
                                minute: null,
                                odd: 1.5 + Math.random(),
                                aiConfidence: 60 + Math.floor(Math.random() * 30),
                                media_gols: 1.5 + Math.random() * 2,
                                forca_casa: 40 + Math.floor(Math.random() * 40),
                                forca_fora: 40 + Math.floor(Math.random() * 40),
                                created_at: createdAt,
                                updated_at: createdAt
                            });
                            db.save();
                            return { changes: 1 };
                        }
                        return { changes: 0 };
                    }

                    if (query.includes('UPDATE')) {
                        const [score, minute, status, updatedAt, matchId] = params;
                        const match = db.data.matches.find(m => m.match_id === matchId);
                        if (match) {
                            match.score = score;
                            match.minute = minute;
                            match.status = status;
                            match.updated_at = updatedAt;
                            db.save();
                            return { changes: 1 };
                        }
                        return { changes: 0 };
                    }

                    return { changes: 0 };
                },

                all: () => {
                    // Sempre recarregar dados do arquivo antes de consultar
                    db.data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

                    if (query.includes('WHERE status')) {
                        return db.data.matches.filter(m =>
                            m.status === 'LIVE' || m.status === 'SCHEDULED'
                        );
                    }

                    // Ordenar: LIVE > SCHEDULED > FINISHED
                    const statusOrder = { 'LIVE': 1, 'SCHEDULED': 2, 'FINISHED': 3 };
                    const sorted = [...db.data.matches].sort((a, b) => {
                        const statusDiff = (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
                        if (statusDiff !== 0) return statusDiff;
                        return (a.time || '').localeCompare(b.time || '');
                    });

                    return sorted;
                },

                get: () => {
                    if (query.includes('COUNT')) {
                        return { count: db.data.matches.length };
                    }
                    return null;
                }
            };
        },

        exec(sql) {
            // Não precisa criar tabelas no JSON
            console.log('✅ Banco de dados JSON inicializado');
        },

        close() {
            this.save();
            console.log('💾 Banco de dados salvo');
        }
    };

    console.log(`✅ Banco de dados inicializado (${db.data.matches.length} jogos)`);

    // Criar tabela de stats se não existir
    db.prepare(`
        CREATE TABLE IF NOT EXISTS match_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id TEXT,
            period TEXT,
            category TEXT,
            home_value REAL,
            away_value REAL,
            captured_at TEXT
        )
    `).run();

    // Adicionar helper para stats
    db.insertStat = (matchId, period, category, homeValue, awayValue) => {
        db.data.match_stats = db.data.match_stats || [];
        db.data.match_stats.push({
            id: db.data.match_stats.length + 1,
            match_id: matchId,
            period,
            category,
            home_value: homeValue,
            away_value: awayValue,
            captured_at: new Date().toISOString()
        });
        db.save();
    };

    return db;
}
