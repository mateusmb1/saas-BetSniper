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
                const saved = this.saveMatches(matches);
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
            // Buscar jogos LIVE do banco
            const liveMatches = this.db.prepare(`
        SELECT id, match_id FROM matches 
        WHERE status = 'LIVE'
      `).all();

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
     * Salvar jogos no banco
     */
    saveMatches(matches) {
        if (!this.db) return 0;

        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO matches (
        match_id, league, homeTeam, awayTeam, time, status, score, minute, 
        homeLogo, awayLogo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        let saved = 0;
        for (const match of matches) {
            const result = stmt.run(
                match.id,
                match.league,
                match.homeTeam,
                match.awayTeam,
                match.time,
                match.status,
                match.score,
                match.minute,
                match.homeLogo,
                match.awayLogo,
                new Date().toISOString(),
                new Date().toISOString()
            );
            if (result.changes > 0) saved++;
        }

        return saved;
    }

    /**
     * Atualizar jogo
     */
    updateMatch(matchId, details) {
        if (!this.db) return;

        const stmt = this.db.prepare(`
      UPDATE matches 
      SET score = ?, minute = ?, status = ?, updated_at = ?
      WHERE match_id = ?
    `);

        stmt.run(
            details.score,
            details.minute,
            details.status,
            details.updated_at,
            matchId
        );
    }

    /**
     * Buscar todos os jogos com análise IA
     */
    getAllMatches() {
        if (!this.db) return [];

        const matches = this.db.prepare(`
      SELECT * FROM matches 
      ORDER BY 
        CASE status 
          WHEN 'LIVE' THEN 1 
          WHEN 'SCHEDULED' THEN 2 
          ELSE 3 
        END,
        time ASC
    `).all();

        return matches.map(match => this.calculateAI(match));
    }
}
