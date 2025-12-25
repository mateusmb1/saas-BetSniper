/**
 * ESPN API Service - Alternativa superior ao Flashscore
 * - JSON estruturado (sem parsing complexo)
 * - Logos incluídos
 * - 10x mais rápido que Puppeteer
 * - Múltiplas ligas em 1 request
 */
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

export class EspnService {
    constructor() {
        this.db = null; // Será definido pelo server.js
    }

    /**
     * Jogos de fallback com horários de HOJE
     */
    getFallbackMatches() {
        const now = new Date();
        const formatTime = (offsetMinutes) => {
            const d = new Date(now.getTime() + offsetMinutes * 60000);
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        };

        console.log('📦 Gerando jogos de exemplo para desenvolvimento...');

        const fallback = [
            {
                id: 'dev_live_1',
                league: 'Premier League',
                homeTeam: 'Manchester City',
                awayTeam: 'Liverpool',
                homeLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
                awayLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png',
                score: '2 - 1',
                homeScore: 2,
                awayScore: 1,
                status: 'LIVE',
                minute: 67,
                time: formatTime(-30),
                statusCode: '1'
            },
            {
                id: 'dev_scheduled_1',
                league: 'La Liga',
                homeTeam: 'Real Madrid',
                awayTeam: 'Barcelona',
                homeLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
                awayLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
                score: null,
                homeScore: 0,
                awayScore: 0,
                status: 'SCHEDULED',
                minute: null,
                time: formatTime(90),
                statusCode: '0'
            },
            {
                id: 'dev_live_2',
                league: 'Bundesliga',
                homeTeam: 'Bayern Munich',
                awayTeam: 'Borussia Dortmund',
                homeLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
                awayLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
                score: '1 - 1',
                homeScore: 1,
                awayScore: 1,
                status: 'LIVE',
                minute: 34,
                time: formatTime(-15),
                statusCode: '1'
            },
            {
                id: 'dev_scheduled_2',
                league: 'Serie A',
                homeTeam: 'Juventus',
                awayTeam: 'AC Milan',
                homeLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
                awayLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
                score: null,
                homeScore: 0,
                awayScore: 0,
                status: 'SCHEDULED',
                minute: null,
                time: formatTime(120),
                statusCode: '0'
            },
            {
                id: 'dev_finished_1',
                league: 'Premier League',
                homeTeam: 'Arsenal',
                awayTeam: 'Chelsea',
                homeLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
                awayLogo: 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png',
                score: '2 - 0',
                homeScore: 2,
                awayScore: 0,
                status: 'FINISHED',
                minute: null,
                time: formatTime(-180),
                statusCode: '0'
            }
        ];

        if (this.db) {
            this.saveMatches(fallback);
        }

        return fallback;
    }

    /**
     * Buscar todos os jogos de futebol do dia
     * Inclui: Premier League, La Liga, Serie A, Champions, etc.
     */
    async fetchTodayMatches() {
        console.log('\n🔄 [ESPN API] Buscando jogos de futebol...');

        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // Tentar hoje primeiro
            let dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
            let url = `${ESPN_BASE_URL}/all/scoreboard?dates=${dateStr}`;
            console.log(`📡 Tentando hoje: ${url}`);

            let response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`ESPN API retornou ${response.status}`);
            }

            let data = await response.json();

            // Se não há jogos hoje, buscar de ontem
            if (!data.events || data.events.length === 0) {
                console.log('ℹ️  Sem jogos hoje. Buscando jogos de ontem...');
                dateStr = yesterday.toISOString().split('T')[0].replace(/-/g, '');
                url = `${ESPN_BASE_URL}/all/scoreboard?dates=${dateStr}`;
                console.log(`📡 URL ontem: ${url}`);

                response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`ESPN API retornou ${response.status}`);
                }

                data = await response.json();
            }

            if (!data.events || data.events.length === 0) {
                console.log('⚠️  Nenhum jogo encontrado (ESPN). Retornando lista vazia.');
                // console.log('⚠️  Nenhum jogo encontrado. Usando dados de exemplo...');
                // return this.getFallbackMatches();
                return [];
            }

            const matches = data.events.map(event => {
                const competition = event.competitions[0];
                const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
                const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

                // Determinar status
                let status = 'SCHEDULED';
                if (event.status.type.name === 'STATUS_IN_PROGRESS') {
                    status = 'LIVE';
                } else if (event.status.type.name === 'STATUS_FINAL') {
                    status = 'FINISHED';
                }

                // Extrair minuto se ao vivo
                let minute = null;
                if (status === 'LIVE' && event.status.displayClock) {
                    // displayClock pode ser "67:15" ou "45'+2"
                    const match = event.status.displayClock.match(/(\d+)/);
                    minute = match ? parseInt(match[1]) : null;
                }

                // Formatar horário
                const gameDate = new Date(event.date);
                const time = gameDate.toLocaleTimeString('pt-PT', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                return {
                    id: event.id,
                    league: event.league?.name || event.league?.abbreviation || 'Soccer',
                    homeTeam: homeTeam.team.displayName || homeTeam.team.name,
                    awayTeam: awayTeam.team.displayName || awayTeam.team.name,
                    homeLogo: homeTeam.team.logo || null,
                    awayLogo: awayTeam.team.logo || null,
                    score: status !== 'SCHEDULED' ? `${homeTeam.score} - ${awayTeam.score}` : null,
                    homeScore: homeTeam.score,
                    awayScore: awayTeam.score,
                    status,
                    minute,
                    time,
                    statusCode: status === 'LIVE' ? '1' : '0'
                };
            });

            console.log(`✅ ${matches.length} jogos encontrados via ESPN API`);

            // Salvar no banco
            if (this.db) {
                const saved = await this.saveMatches(matches);
                console.log(`💾 Salvos ${saved} jogos no banco`);
            }

            return matches;

        } catch (error) {
            console.error('❌ Erro ao buscar da ESPN:', error.message);
            return [];
        }
    }

    /**
     * Buscar detalhes de um jogo específico
     * Inclui: estatísticas, lineups, comentários
     */
    async fetchMatchDetails(eventId) {
        try {
            const url = `${ESPN_BASE_URL}/all/summary?event=${eventId}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`ESPN API retornou ${response.status}`);
            }

            const data = await response.json();

            return {
                boxscore: data.boxscore,
                lineups: data.lineups,
                commentary: data.commentary,
                stats: data.statistics
            };

        } catch (error) {
            console.error(`❌ Erro ao buscar detalhes ${eventId}:`, error.message);
            return null;
        }
    }

    /**
     * WORKFLOW 2: Atualizar jogos ao vivo
     */
    async updateLiveMatches() {
        console.log('\n🔄 [WORKFLOW 2] Atualizando jogos ao vivo...');

        if (!this.db) {
            console.log('⚠️  Banco de dados não configurado');
            return [];
        }

        try {
            // Buscar jogos LIVE do banco (Postgres)
            const result = await this.db.query(`
                SELECT id, id as match_id FROM matches 
                WHERE status = 'LIVE'
            `);
            const liveMatches = result.rows;

            if (liveMatches.length === 0) {
                console.log('ℹ️  Nenhum jogo ao vivo no momento');
                return [];
            }

            console.log(`📊 Atualizando ${liveMatches.length} jogos ao vivo...`);

            // Re-fetch do scoreboard para pegar atualizações
            const todayMatches = await this.fetchTodayMatches();

            // Atualizar cada jogo ao vivo
            const updates = [];
            for (const dbMatch of liveMatches) {
                const freshData = todayMatches.find(m => m.id === dbMatch.match_id);

                if (freshData) {
                    this.updateMatch(dbMatch.match_id, {
                        score: freshData.score,
                        minute: freshData.minute,
                        status: freshData.status,
                        updated_at: new Date().toISOString()
                    });
                    updates.push(freshData);
                }
            }

            console.log(`✅ Atualizados ${updates.length} jogos`);
            return updates;

        } catch (error) {
            console.error('❌ Erro ao atualizar jogos:', error.message);
            return [];
        }
    }

    /**
     * Calcular análise IA (Workflow 3)
     */
    calculateAI(match) {
        let aiPick = 'Ambas Marcam';
        let riskLevel = 'medio';

        const mediaGols = match.media_gols || 2.0;
        const forcaCasa = match.forca_casa || 50;
        const forcaFora = match.forca_fora || 50;

        if (mediaGols > 2.5) {
            aiPick = 'Over 0.5 HT';
            riskLevel = 'baixo';
        } else if (forcaCasa > forcaFora) {
            aiPick = 'Dupla Chance Casa';
            riskLevel = 'medio';
        }

        const prob = (match.aiConfidence || 70) / 100;
        const odd = match.odd || 1.50;
        const implied = 1 / odd;
        const value = prob - implied;
        const score = Math.round((prob * 70) + (value * 100));

        return {
            ...match,
            aiPick,
            riskLevel,
            score_ia: score,
            valueIndex: value,
            probability: prob
        };
    }

    /**
     * Salvar jogos no banco (Versão Postgres Async)
     */
    async saveMatches(matches) {
        if (!this.db) return 0;

        // Query Postgres com UPSERT
        const query = `
            INSERT INTO matches (
                id, league, home_team, away_team, 
                home_score, away_score, status, is_live, 
                match_url, home_logo, away_logo, minute, 
                created_at, updated_at, date
            ) VALUES (
                $1, $2, $3, $4, 
                $5, $6, $7, $8, 
                $9, $10, $11, $12, 
                NOW(), NOW(), CURRENT_DATE
            )
            ON CONFLICT (id) DO UPDATE SET
                home_score = EXCLUDED.home_score,
                away_score = EXCLUDED.away_score,
                status = EXCLUDED.status,
                minute = EXCLUDED.minute,
                is_live = EXCLUDED.is_live,
                updated_at = NOW();
        `;

        let saved = 0;
        for (const match of matches) {
            try {
                const homeScore = match.score ? parseInt(match.homeScore) : null;
                const awayScore = match.score ? parseInt(match.awayScore) : null;
                const isLive = match.status === 'LIVE';

                await this.db.query(query, [
                    match.id,
                    match.league,
                    match.homeTeam,
                    match.awayTeam,
                    homeScore,
                    awayScore,
                    match.status,
                    isLive,
                    '', // match_url vazio por enquanto no ESPN
                    match.homeLogo,
                    match.awayLogo,
                    match.minute
                ]);
                saved++;
            } catch (err) {
                console.error(`❌ Erro ao salvar jogo ${match.id}:`, err.message);
            }
        }

        return saved;
    }

    /**
     * Atualizar jogo
     */
    async updateMatch(matchId, details) {
        if (!this.db) return;

        try {
            await this.db.query(`
                UPDATE matches 
                SET score = $1, minute = $2, status = $3, updated_at = $4
                WHERE id = $5
            `, [
                details.score,
                details.minute,
                details.status,
                details.updated_at,
                matchId
            ]);
        } catch (e) {
            console.error('❌ Erro update match:', e.message);
        }
    }

    /**
     * Buscar todos os jogos com análise IA
     */
    async getAllMatches() {
        if (!this.db) return [];

        try {
            const result = await this.db.query(`
                SELECT * FROM matches 
                ORDER BY 
                    CASE status 
                    WHEN 'LIVE' THEN 1 
                    WHEN 'SCHEDULED' THEN 2 
                    ELSE 3 
                    END,
                    date ASC
            `);
            
            const matches = result.rows;
            return matches.map(match => this.calculateAI(match));
        } catch (error) {
            console.error('❌ Erro ao buscar todos os jogos:', error);
            return [];
        }
    }
}
