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
