/**
 * Serviço de Logos de Times
 * Busca logos de times usando API gratuita
 */

const LOGO_CACHE = new Map();

export class TeamLogoService {
    /**
     * Buscar logo de um time
     * Usa primeira letra do nome como fallback
     */
    static getTeamLogo(teamName) {
        if (!teamName) return null;

        // Cache
        if (LOGO_CACHE.has(teamName)) {
            return LOGO_CACHE.get(teamName);
        }

        // Mapeamento de times conhecidos para logos
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

        // Buscar no mapa
        let logo = logoMap[teamName];

        // Se não encontrar, tentar match parcial
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

        // Fallback: usar iniciais
        if (!logo) {
            const initials = teamName
                .split(' ')
                .map(word => word[0])
                .join('')
                .substring(0, 3)
                .toUpperCase();

            // Cores aleatórias mas consistentes baseadas no nome
            const colors = ['1abc9c', '3498db', 'e74c3c', 'f39c12', '9b59b6', '34495e'];
            const colorIndex = teamName.length % colors.length;

            logo = `https://ui-avatars.com/api/?name=${initials}&background=${colors[colorIndex]}&color=fff&size=96`;
        }

        LOGO_CACHE.set(teamName, logo);
        return logo;
    }

    /**
     * Adicionar logos a uma lista de jogos
     */
    static addLogosToMatches(matches) {
        return matches.map(match => ({
            ...match,
            homeLogo: this.getTeamLogo(match.homeTeam),
            awayLogo: this.getTeamLogo(match.awayTeam)
        }));
    }
}
