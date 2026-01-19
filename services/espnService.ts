/**
 * ESPN API Service - Dados Reais de Futebol
 * Fonte: site.api.espn.com
 */

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

export const espnService = {
    /**
     * Buscar TODOS os jogos de futebol de HOJE (todas as ligas)
     */
    async getTodayMatches(): Promise<any[]> {
        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
            
            const response = await fetch(
                `${ESPN_API_BASE}/all/scoreboard?dates=${dateStr}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`ESPN API error: ${response.status}`);
            }

            const data = await response.json();
            
            return this.normalizeMatches(data.events || []);
        } catch (error) {
            console.error('❌ Erro ao buscar jogos da ESPN:', error);
            return [];
        }
    },

    /**
     * Buscar jogos de uma liga específica
     */
    async getLeagueMatches(league: string, date?: string): Promise<any[]> {
        try {
            const dateStr = date || new Date().toISOString().split('T')[0].replace(/-/g, '');
            
            const response = await fetch(
                `${ESPN_API_BASE}/${league}/scoreboard?dates=${dateStr}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`ESPN API error: ${response.status}`);
            }

            const data = await response.json();
            
            return this.normalizeMatches(data.events || []);
        } catch (error) {
            console.error('❌ Erro ao buscar jogos da liga:', error);
            return [];
        }
    },

    /**
     * Buscar jogos da semana (intervalo de datas)
     */
    async getWeekMatches(fromDate: string, toDate: string): Promise<any[]> {
        try {
            const fromStr = fromDate.replace(/-/g, '');
            const toStr = toDate.replace(/-/g, '');
            
            const response = await fetch(
                `${ESPN_API_BASE}/all/scoreboard?dates=${fromStr}-${toStr}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`ESPN API error: ${response.status}`);
            }

            const data = await response.json();
            
            return this.normalizeMatches(data.events || []);
        } catch (error) {
            console.error('❌ Erro ao buscar jogos da semana:', error);
            return [];
        }
    },

    /**
     * Normalizar dados da ESPN para o formato do sistema
     */
    normalizeMatches(events: any[]): any[] {
        return events.map(event => {
            const competition = event.competitions?.[0];
            const home = competition?.competitors?.find(c => c.homeAway === 'home');
            const away = competition?.competitors?.find(c => c.homeAway === 'away');
            const status = competition?.status;

            // Extrair league do event
            const league = event.league?.name || 'Unknown League';
            const leagueLogo = event.league?.logo || null;

            // Mapear status
            let gameStatus = 'SCHEDULED';
            let isLive = false;
            let minute = null;
            let score = null;

            if (status) {
                if (status.type === 'STATUS_IN_PROGRESS' || status.type === 'STATUS_IN_PROGRESS_PERIOD') {
                    gameStatus = 'LIVE';
                    isLive = true;
                    minute = this.extractMinute(status.displayClock);
                    score = `${home?.score || 0}-${away?.score || 0}`;
                } else if (status.type === 'STATUS_FINAL' || status.type === 'STATUS_END_PERIOD') {
                    gameStatus = 'FINISHED';
                    score = `${home?.score || 0}-${away?.score || 0}`;
                } else if (status.type === 'STATUS_DELAYED' || status.type === 'STATUS_SUSPENDED') {
                    gameStatus = 'LIVE';
                    isLive = true;
                }
            }

            // Gerar ID único
            const externalId = event.id || `${league}-${home?.team?.id}-${away?.team?.id}-${event.date}`;

            // Time do jogo
            const gameTime = event.date ? new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00';
            const gameDate = event.date ? event.date.split('T')[0] : new Date().toISOString().split('T')[0];

            return {
                external_id: externalId,
                league: league,
                league_logo: leagueLogo,
                home_team: home?.team?.name || 'TBD',
                home_team_id: home?.team?.id,
                home_logo: this.getTeamLogoUrl(home?.team?.name),
                away_team: away?.team?.name || 'TBD',
                away_team_id: away?.team?.id,
                away_logo: this.getTeamLogoUrl(away?.team?.name),
                date: gameDate,
                time: gameTime,
                status: gameStatus,
                is_live: isLive,
                home_score: home?.score || 0,
                away_score: away?.score || 0,
                minute: minute,
                display_clock: status?.displayClock,
                sport: 'football',
                country: this.getLeagueCountry(league)
            };
        });
    },

    /**
     * Extrair minuto do displayClock (ex: "45'+2" ou "12:34")
     */
    extractMinute(displayClock: string): number {
        if (!displayClock) return null;
        
        // Formato: "45'+2" ou "73:15"
        const match = displayClock.match(/^(\d+)/);
        return match ? parseInt(match[1]) : null;
    },

    /**
     * Obter logo do time via Clearbit
     */
    getTeamLogoUrl(teamName: string): string {
        if (!teamName) return null;
        
        // Mapeamento de times brasileiros e europeus
        const teamLogos: Record<string, string> = {
            'Flamengo': 'https://logo.clearbit.com/flamengo.com.br',
            'Palmeiras': 'https://logo.clearbit.com/palmeiras.com.br',
            'Corinthians': 'https://logo.clearbit.com/corinthians.com.br',
            'Santos': 'https://logo.clearbit.com/santosfc.com.br',
            'São Paulo': 'https://logo.clearbit.com.saopaulofc.net',
            'Botafogo': 'https://logo.clearbit.com/botafogo.com.br',
            'Fluminense': 'https://logo.clearbit.com/fluminense.com.br',
            'Vasco': 'https://logo.clearbit.com/vasco.com.br',
            'Cruzeiro': 'https://logo.clearbit.com/cruzeiro.com.br',
            'Internacional': 'https://logo.clearbit.com/internacional.com.br',
            'Grêmio': 'https://logo.clearbit.com/gremio.net.br',
            'Athletic Bilbao': 'https://logo.clearbit.com/athletic-club.eus',
            'Alavés': 'https://logo.clearbit.com/deportivoalaves.com',
            'Almería': 'https://logo.clearbit.com.usalmeria.com',
            'Osasuna': 'https://logo.clearbit.com/osasuna.es',
            'Cádiz': 'https://logo.clearbit.com/cadizcf.com',
            'Girona': 'https://logo.clearbit.com/gironafc.cat',
            'Valencia': 'https://logo.clearbit.com/valenciacf.com',
            'Villarreal': 'https://logo.clearbit.com/villarrealcf.es',
            'Real Betis': 'https://logo.clearbit.comrealbetisbalompie.es',
            'Sevilla': 'https://logo.clearbit.com/sevillafc.es',
            'Barcelona': 'https://logo.clearbit.com/fcbarcelona.com',
            'Real Madrid': 'https://logo.clearbit.com/realmadrid.com',
            'Atlético Madrid': 'https://logo.clearbit.com/atleticomadrid.com',
            'Arsenal': 'https://logo.clearbit.com/arsenal.com',
            'Aston Villa': 'https://logo.clearbit.com/avfc.co.uk',
            'Bournemouth': 'https://logo.clearbit.com/afcbournemouth.co.uk',
            'Brentford': 'https://logo.clearbit.com/brentfordfc.com',
            'Brighton': 'https://logo.clearbit.com/brightonandhovealbion.com',
            'Chelsea': 'https://logo.clearbit.com/chelseafc.com',
            'Crystal Palace': 'https://logo.clearbit.com/cpfc.co.uk',
            'Everton': 'https://logo.clearbit.com/evertonfc.com',
            'Fulham': 'https://logo.clearbit.com/fulhamfc.com',
            'Liverpool': 'https://logo.clearbit.com/liverpoolfc.com',
            'Luton': 'https://logo.clearbit.com/lutontown.co.uk',
            'Man City': 'https://logo.clearbit.com/mancity.com',
            'Man United': 'https://logo.clearbit.com/manutd.com',
            'Newcastle': 'https://logo.clearbit.com/nufc.co.uk',
            'Nottingham': 'https://logo.clearbit.com/nottinghamforest.co.uk',
            'Tottenham': 'https://logo.clearbit.com/tottenhamhotspur.com',
            'West Ham': 'https://logo.clearbit.com/whufc.com',
            'Wolves': 'https://logo.clearbit.com/wolves.co.uk',
            'Bayern Munich': 'https://logo.clearbit.com/fcbayern.de',
            'Dortmund': 'https://logo.clearbit.com/bvb.de',
            'RB Leipzig': 'https://logo.clearbit.com/rbleipzig.com',
            'Leverkusen': 'https://logo.clearbit.com/bayer04.de',
            'M\'gladbach': 'https://logo.clearbit.com/borussia.de',
            'Eintracht Frankfurt': 'https://logo.clearbit.com/eintrachtfrankfurt.de',
            'PSG': 'https://logo.clearbit.com/psg.fr',
            'Monaco': 'https://logo.clearbit.com/asmonaco.com',
            'Lyon': 'https://logo.clearbit.com/ol.fr',
            'Marseille': 'https://logo.clearbit.com/om.fr',
            'Nice': 'https://logo.clearbit.com/ogcnice.com',
            'Lille': 'https://logo.clearbit.com/losc.fr',
            'Juventus': 'https://logo.clearbit.com/juventus.com',
            'Inter': 'https://logo.clearbit.com/inter.it',
            'AC Milan': 'https://logo.clearbit.com/acmilan.com',
            'Napoli': 'https://logo.clearbit.com/sscnapoli.it',
            'Roma': 'https://logo.clearbit.com/asroma.it',
            'Lazio': 'https://logo.clearbit.com/sslazio.it',
            'Fiorentina': 'https://logo.clearbit.com/acffiorentina.it',
            'Atalanta': 'https://logo.clearbit.com/atalanta.it',
            'River Plate': 'https://logo.clearbit.com/riverplate.com',
            'Boca Juniors': 'https://logo.clearbit.com/bocajuniors.com'
        };

        return teamLogos[teamName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&color=fff`;
    },

    /**
     * Obter país da liga
     */
    getLeagueCountry(league: string): string {
        const leagueCountries: Record<string, string> = {
            'Premier League': 'England',
            'La Liga': 'Spain',
            'Serie A': 'Italy',
            'Bundesliga': 'Germany',
            'Ligue 1': 'France',
            'Primeira Liga': 'Portugal',
            'Eredivisie': 'Netherlands',
            'Champions League': 'Europe',
            'Europa League': 'Europe',
            'Copa Libertadores': 'South America',
            'Copa Sudamericana': 'South America',
            'Brasileirão': 'Brazil',
            'Campeonato Brasileiro': 'Brazil'
        };

        return leagueCountries[league] || 'International';
    }
};
