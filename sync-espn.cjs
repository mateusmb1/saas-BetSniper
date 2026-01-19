/**
 * Buscar dados REAIS da ESPN e atualizar Supabase
 */

const https = require('https');

const SUPABASE_URL = 'https://nnbvmbjqlmuwlovlqgzh.supabase.co';
const SERVICE_KEY = 'sb_secret_q1PweAuWb9b27iEp0zG3JA_yjM4AuQl';

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

// Mapeamento de logos ( Clearbit API)
const TEAM_LOGOS = {
    'Flamengo': 'https://logo.clearbit.com/flamengo.com.br',
    'Palmeiras': 'https://logo.clearbit.com/palmeiras.com.br',
    'Corinthians': 'https://logo.clearbit.com/corinthians.com.br',
    'Santos': 'https://logo.clearbit.com/santosfc.com.br',
    'Botafogo': 'https://logo.clearbit.com/botafogo.com.br',
    'Fluminense': 'https://logo.clearbit.com/fluminense.com.br',
    'Vasco': 'https://logo.clearbit.com/vasco.com.br',
    'Cruzeiro': 'https://logo.clearbit.com/cruzeiro.com.br',
    'Athletic Bilbao': 'https://logo.clearbit.com/athletic-club.eus',
    'Sevilla': 'https://logo.clearbit.com/sevillafc.es',
    'Barcelona': 'https://logo.clearbit.com/fcbarcelona.com',
    'Real Madrid': 'https://logo.clearbit.com/realmadrid.com',
    'Atlético Madrid': 'https://logo.clearbit.com/atleticomadrid.com',
    'Arsenal': 'https://logo.clearbit.com/arsenal.com',
    'Chelsea': 'https://logo.clearbit.com/chelseafc.com',
    'Liverpool': 'https://logo.clearbit.com/liverpoolfc.com',
    'Man City': 'https://logo.clearbit.com/mancity.com',
    'Man United': 'https://logo.clearbit.com/manutd.com',
    'Newcastle': 'https://logo.clearbit.com/nufc.co.uk',
    'Tottenham': 'https://logo.clearbit.com/tottenhamhotspur.com',
    'West Ham': 'https://logo.clearbit.com/whufc.com',
    'Brighton': 'https://logo.clearbit.com/brightonandhovealbion.com',
    'Bayern Munich': 'https://logo.clearbit.com/fcbayern.de',
    'Dortmund': 'https://logo.clearbit.com/bvb.de',
    'RB Leipzig': 'https://logo.clearbit.com/rbleipzig.com',
    'Leverkusen': 'https://logo.clearbit.com/bayer04.de',
    'PSG': 'https://logo.clearbit.com/psg.fr',
    'Monaco': 'https://logo.clearbit.com/asmonaco.com',
    'Lyon': 'https://logo.clearbit.com/ol.fr',
    'Marseille': 'https://logo.clearbit.com/om.fr',
    'Juventus': 'https://logo.clearbit.com/juventus.com',
    'Inter': 'https://logo.clearbit.com/inter.it',
    'AC Milan': 'https://logo.clearbit.com/acmilan.com',
    'Napoli': 'https://logo.clearbit.com/sscnapoli.it',
    'Roma': 'https://logo.clearbit.com/asroma.it',
    'Lazio': 'https://logo.clearbit.com/sslazio.it',
    'River Plate': 'https://logo.clearbit.com/riverplate.com',
    'Boca Juniors': 'https://logo.clearbit.com/bocajuniors.com'
};

async function fetchFromESPN(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function getTeamLogo(teamName) {
    if (!teamName) return null;
    return TEAM_LOGOS[teamName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&color=fff`;
}

function normalizeMatches(events) {
    return events.map(event => {
        const competition = event.competitions?.[0];
        const home = competition?.competitors?.find(c => c.homeAway === 'home');
        const away = competition?.competitors?.find(c => c.homeAway === 'away');
        const status = competition?.status;
        const league = event.league?.name || 'Unknown';

        let gameStatus = 'scheduled';
        let isLive = false;
        let minute = null;

        if (status) {
            if (status.type === 'STATUS_IN_PROGRESS') {
                gameStatus = 'live';
                isLive = true;
                const match = status.displayClock?.match(/^(\d+)/);
                minute = match ? parseInt(match[1]) : null;
            } else if (status.type === 'STATUS_FINAL') {
                gameStatus = 'finished';
            }
        }

        const gameDate = event.date ? event.date.split('T')[0] : new Date().toISOString().split('T')[0];
        const gameTime = event.date ? new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00';

        return {
            external_id: event.id || `${league}-${home?.team?.id}-${away?.team?.id}`,
            league: league,
            league_logo: event.league?.logo || null,
            home_team: home?.team?.name || 'TBD',
            home_logo: getTeamLogo(home?.team?.name),
            away_team: away?.team?.name || 'TBD',
            away_logo: getTeamLogo(away?.team?.name),
            date: gameDate,
            time: gameTime,
            status: gameStatus,
            is_live: isLive,
            home_score: home?.score || 0,
            away_score: away?.score || 0,
            minute: minute,
            display_clock: status?.displayClock,
            sport: 'football',
            country: getLeagueCountry(league)
        };
    });
}

function getLeagueCountry(league) {
    const countries = {
        'Premier League': 'England',
        'La Liga': 'Spain',
        'Serie A': 'Italy',
        'Bundesliga': 'Germany',
        'Ligue 1': 'France',
        'Primeira Liga': 'Portugal',
        'Brasileirão': 'Brazil',
        'Copa Libertadores': 'South America',
        'Champions League': 'Europe'
    };
    return countries[league] || 'International';
}

async function syncMatchesFromESPN() {
    console.log('🔄 Sincronizando jogos REAIS da ESPN...\n');

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const matches = [];

    try {
        console.log('📡 Buscando jogos da ESPN...');
        
        // Tentar todas as ligas principais
        const leagues = ['all', 'eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1', 'bra.1'];
        
        for (const league of leagues) {
            try {
                const data = await fetchFromESPN(`${ESPN_API_BASE}/${league}/scoreboard?dates=${today}`);
                const leagueMatches = normalizeMatches(data.events || []);
                matches.push(...leagueMatches);
                if (leagueMatches.length > 0) {
                    console.log(`  ${league}: ${leagueMatches.length} jogos`);
                }
            } catch (e) {
                console.log(`  ${league}: Erro - ${e.message}`);
            }
        }

        console.log(`\n🎯 Total de jogos encontrados: ${matches.length}`);

        if (matches.length === 0) {
            console.log('⚠️ Nenhum jogo hoje, buscando amanhã...');
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0].replace(/-/g, '');
            const data = await fetchFromESPN(`${ESPN_API_BASE}/all/scoreboard?dates=${tomorrow}`);
            const tomorrowMatches = normalizeMatches(data.events || []);
            matches.push(...tomorrowMatches);
            console.log(`📊 Jogos de amanhã: ${tomorrowMatches.length}`);
        }

        // Limpar banco e inserir dados reais
        console.log('\n🗑️  Limpando banco...');
        await makeRequest('/rest/v1/matches', 'DELETE');

        console.log('💾 Salvando jogos reais...\n');
        
        for (const match of matches) {
            await makeRequest('/rest/v1/matches', 'POST', match);
            const liveBadge = match.is_live ? '🔴 AO VIVO' : '';
            console.log(`✅ ${match.home_team} vs ${match.away_team} (${match.league}) ${liveBadge}`);
        }

        console.log(`\n✅ Sincronização concluída! ${matches.length} jogos reais.`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

async function makeRequest(endpoint, method, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'nnbvmbjqlmuwlovlqgzh.supabase.co',
            path: endpoint,
            method: method,
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'apikey': SERVICE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (method === 'GET' && data) {
                    try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
                } else { resolve({ success: true }); }
            });
        });

        req.on('error', reject);
        if (body && (method === 'POST' || method === 'PATCH' || method === 'DELETE')) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

syncMatchesFromESPN();
