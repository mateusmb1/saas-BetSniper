/**
 * Serviço de Logos de Times
 * Busca logos de times usando API gratuita
 */

import { initDatabase } from './database.js';

const LOGO_CACHE = new Map();
const db = initDatabase();

export class TeamLogoService {
    /**
     * Buscar logo de um time
     * Prioridade:
     * 1. Cache em memória
     * 2. Banco de Dados (Scraped)
     * 3. Mapa Estático (Fallback VIP)
     * 4. Gerador de Iniciais (Fallback final)
     */
    static async getTeamLogo(teamName) {
        if (!teamName) return null;

        // 1. Cache
        if (LOGO_CACHE.has(teamName)) {
            return LOGO_CACHE.get(teamName);
        }

        let logo = null;

        // 2. Banco de Dados
        try {
            // Busca exata ou LIKE
            const result = await db.query(`
                SELECT logo_url FROM team_logos 
                WHERE team_name ILIKE $1 
                LIMIT 1
            `, [teamName]);

            if (result.rows.length > 0) {
                logo = result.rows[0].logo_url;
                LOGO_CACHE.set(teamName, logo);
                return logo;
            }
        } catch (e) {
            console.warn(`⚠️ Erro ao buscar logo no DB para ${teamName}:`, e.message);
        }

        // 3. Mapeamento Estático (Fallback)
        const logoMap = {
            // Premier League
            'Manchester City': 'https://img.icons8.com/color/96/manchester-city-fc.png',
            'Liverpool': 'https://img.icons8.com/color/96/liverpool-fc.png',
            'Arsenal': 'https://img.icons8.com/color/96/arsenal-fc.png',
            'Chelsea': 'https://img.icons8.com/color/96/chelsea-fc.png',
            'Tottenham': 'https://img.icons8.com/color/96/tottenham-hotspur.png',
            'Manchester United': 'https://img.icons8.com/color/96/manchester-united.png',
            'Aston Villa': 'https://ui-avatars.com/api/?name=AV&background=670E36&color=fff&size=96',

            // La Liga
            'Real Madrid': 'https://img.icons8.com/color/96/real-madrid.png',
            'Barcelona': 'https://img.icons8.com/color/96/fc-barcelona.png',
            'Atletico Madrid': 'https://img.icons8.com/color/96/atletico-madrid.png',

            // Serie A
            'Juventus': 'https://img.icons8.com/color/96/juventus.png',
            'Inter Milan': 'https://img.icons8.com/color/96/inter-milan.png',
            'AC Milan': 'https://img.icons8.com/color/96/ac-milan.png',
            'Napoli': 'https://ui-avatars.com/api/?name=NAP&background=0067B3&color=fff&size=96',

            // Bundesliga
            'Bayern Munich': 'https://img.icons8.com/color/96/fc-bayern-munchen.png',
            'Borussia Dortmund': 'https://img.icons8.com/color/96/borussia-dortmund.png',

            // Ligue 1  
            'Paris SG': 'https://img.icons8.com/color/96/psg.png',
            'Marseille': 'https://ui-avatars.com/api/?name=OM&background=2FAEE0&color=fff&size=96',

            // Liga Portugal
            'Benfica': 'https://ui-avatars.com/api/?name=SLB&background=E30613&color=fff&size=96',
            'FC Porto': 'https://ui-avatars.com/api/?name=FCP&background=004BA9&color=fff&size=96',
            'Sporting CP': 'https://ui-avatars.com/api/?name=SCP&background=00593D&color=fff&size=96',
            'Braga': 'https://ui-avatars.com/api/?name=BRG&background=8B0000&color=fff&size=96'
        };

        logo = logoMap[teamName];

        // Match parcial no mapa estático
        if (!logo) {
            const keys = Object.keys(logoMap);
            const match = keys.find(key =>
                key.toLowerCase().includes(teamName.toLowerCase()) ||
                teamName.toLowerCase().includes(key.toLowerCase())
            );
            if (match) {
                logo = logoMap[match];
            }
        }

        // 4. Fallback: usar iniciais
        if (!logo) {
            const initials = teamName
                .split(' ')
                .map(word => word[0])
                .join('')
                .substring(0, 3)
                .toUpperCase();

            // Cores aleatórias mas consistentes
            const colors = ['1abc9c', '3498db', 'e74c3c', 'f39c12', '9b59b6', '34495e'];
            const colorIndex = teamName.length % colors.length;

            logo = `https://ui-avatars.com/api/?name=${initials}&background=${colors[colorIndex]}&color=fff&size=96`;
        }

        LOGO_CACHE.set(teamName, logo);
        return logo;
    }

    /**
     * Adicionar logos a uma lista de jogos (Async)
     */
    static async addLogosToMatches(matches) {
        return Promise.all(matches.map(async match => ({
            ...match,
            // Preserva o logo existente se houver, senão busca no serviço
            homeLogo: match.homeLogo || await this.getTeamLogo(match.homeTeam),
            awayLogo: match.awayLogo || await this.getTeamLogo(match.awayTeam)
        })));
    }
}
