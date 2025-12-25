/**
 * FlashscoreService - Implementação dos 3 Workflows
 * 
 * WORKFLOW 1: Coleta de jogos do dia (diário às 7h)
 * WORKFLOW 2: Atualização ao vivo (a cada 30s)
 * WORKFLOW 3: Análise IA e scoring
 */

export class FlashscoreService {
    constructor(database) {
        this.db = database;
        this.baseUrl = 'https://d.flashscore.com/x/feed';
        this.headers = {
            'X-Fsign': 'SW9D1eZo',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Referer': 'https://www.flashscore.pt/'
        };
    }

    /**
     * Parser do formato proprietário do Flashscore
     * Formato: ¬AA÷matchId¬AE÷homeTeam¬...
     */
    parseFlashscoreData(rawText) {
        // Remove caracteres especiais de ofuscação
        const cleaned = rawText
            .replace(/¬/g, '\n')
            .replace(/÷/g, ':')
            .replace(/~/g, ',');

        const matches = [];
        const lines = cleaned.split('\n');
        let currentMatch = {};

        lines.forEach(line => {
            const key = line.substring(0, 2);
            const value = line.substring(3).trim();

            switch (key) {
                case 'AA': // Match ID
                    if (currentMatch.id) matches.push({ ...currentMatch });
                    currentMatch = { id: value };
                    break;
                case 'AE': // Team name
                    if (!currentMatch.homeTeam) {
                        currentMatch.homeTeam = value;
                    } else {
                        currentMatch.awayTeam = value;
                    }
                    break;
                case 'AD': // Time
                    currentMatch.time = value;
                    break;
                case 'AG': // Score
                    currentMatch.score = value;
                    break;
                case 'ZA': // League
                    currentMatch.league = value;
                    break;
                case 'AC': // Status code
                    currentMatch.statusCode = value;
                    break;
            }
        });

        if (currentMatch.id) matches.push(currentMatch);
        return matches;
    }

    /**
     * WORKFLOW 1: Buscar jogos do dia
     * Executado diariamente às 7h via cron
     */
    async fetchDailyMatches() {
        console.log('\n🔄 [WORKFLOW 1] Buscando jogos do dia...');

        try {
            const response = await fetch(`${this.baseUrl}/f_1_0_pt_1`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const rawData = await response.text();
            const matches = this.parseFlashscoreData(rawData);

            console.log(`✅ Encontrados ${matches.length} jogos`);

            // Salvar no banco de dados
            const saved = this.saveMatches(matches);
            console.log(`💾 Salvos ${saved} jogos novos no banco`);

            return matches;

        } catch (error) {
            console.error('❌ Erro ao buscar jogos:', error.message);
            return [];
        }
    }

    /**
     * WORKFLOW 2: Atualizar jogos ao vivo
     * Executado a cada 30s via cron
     */
    async updateLiveMatches() {
        console.log('\n🔄 [WORKFLOW 2] Atualizando jogos ao vivo...');

        try {
            // Buscar jogos em andamento do banco
            const liveMatches = this.db.prepare(`
        SELECT id, match_id FROM matches 
        WHERE status = 'LIVE' OR status = 'SCHEDULED'
      `).all();

            if (liveMatches.length === 0) {
                console.log('ℹ️  Nenhum jogo ao vivo no momento');
                return [];
            }

            console.log(`📊 Atualizando ${liveMatches.length} jogos...`);

            const updates = [];
            for (const match of liveMatches) {
                const details = await this.fetchMatchDetails(match.match_id);
                if (details) {
                    this.updateMatch(match.match_id, details);
                    updates.push(details);
                }
                // Delay entre requests para evitar rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log(`✅ Atualizados ${updates.length} jogos`);
            return updates;

        } catch (error) {
            console.error('❌ Erro ao atualizar jogos:', error.message);
            return [];
        }
    }

    /**
     * Buscar detalhes de um jogo específico
     */
    async fetchMatchDetails(matchId) {
        try {
            const response = await fetch(`${this.baseUrl}/df_st_1_${matchId}`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) return null;

            const rawData = await response.text();

            // Extrair placar e minuto
            const scoreMatch = rawData.match(/AG÷([0-9]+[\s\-]+[0-9]+)/);
            const minuteMatch = rawData.match(/TM÷([0-9]+)/);

            return {
                score: scoreMatch ? scoreMatch[1] : null,
                minute: minuteMatch ? parseInt(minuteMatch[1]) : null,
                status: minuteMatch ? 'LIVE' : 'SCHEDULED',
                updated_at: new Date().toISOString()
            };

        } catch (error) {
            console.error(`Erro ao buscar detalhes do jogo ${matchId}:`, error.message);
            return null;
        }
    }

    /**
     * WORKFLOW 3: Calcular análise IA e score
     * Aplicado aos jogos para gerar recomendações
     */
    calculateAI(match) {
        let aiPick = 'Nenhum';
        let riskLevel = 'medio';

        // Lógica de mercado (baseada no Workflow 3 do N8N)
        const mediaGols = match.media_gols || 2.0;
        const forcaCasa = match.forca_casa || 50;
        const forcaFora = match.forca_fora || 50;

        if (mediaGols > 2.5) {
            aiPick = 'Over 0.5 HT';
            riskLevel = 'baixo';
        } else if (forcaCasa > forcaFora) {
            aiPick = 'Dupla Chance Casa';
            riskLevel = 'medio';
        } else {
            aiPick = 'Ambas Marcam';
            riskLevel = 'medio';
        }

        // Cálculo de Score e Value Index
        const prob = (match.aiConfidence || 70) / 100;
        const odd = match.odd || 1.50;
        const implied = 1 / odd;
        const value = prob - implied;
        const score = Math.round((prob * 70) + (value * 100));

        return {
            aiPick,
            riskLevel,
            score,
            valueIndex: value,
            probability: prob
        };
    }

    /**
     * Salvar jogos no banco de dados
     */
    saveMatches(matches) {
        const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO matches (
        match_id, league, homeTeam, awayTeam, time, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        let saved = 0;
        for (const match of matches) {
            const result = stmt.run(
                match.id,
                match.league || 'Unknown',
                match.homeTeam || '',
                match.awayTeam || '',
                match.time || '',
                match.statusCode === '1' ? 'LIVE' : 'SCHEDULED',
                new Date().toISOString()
            );
            if (result.changes > 0) saved++;
        }

        return saved;
    }

    /**
     * Atualizar dados de um jogo
     */
    updateMatch(matchId, details) {
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
     * Buscar todos os jogos do banco com análise IA
     */
    getAllMatches() {
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

        // Aplicar análise IA a cada jogo
        return matches.map(match => ({
            ...match,
            ...this.calculateAI(match)
        }));
    }
}
