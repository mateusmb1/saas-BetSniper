/**
 * Atualizar banco com logos reais de times
 */

const https = require('https');

const SUPABASE_URL = 'https://nnbvmbjqlmuwlovlqgzh.supabase.co';
const SERVICE_KEY = 'sb_secret_q1PweAuWb9b27iEp0zG3JA_yjM4AuQl';

// Mapeamento de logos de times (API pública do football-data.org ou similares)
const TEAM_LOGOS = {
    'Arsenal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png',
    'Liverpool': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png',
    'Man City': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png',
    'Chelsea': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png',
    'Man United': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png',
    'Tottenham': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Tottenham_Hotspur_crest.svg/1200px-Tottenham_Hotspur_crest.svg.png',
    'Aston Villa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Aston_Villa_FC_crest.svg/1200px-Aston_Villa_FC_crest.svg.png',
    'Newcastle': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png',
    'West Ham': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/West_Ham_United_FC_crest.svg/1200px-West_Ham_United_FC_crest.svg.png',
    'Brighton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Brighton_%26_Hove_Albion_crest.svg/1200px-Brighton_%26_Hove_Albion_crest.svg.png',
    'Barcelona': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png',
    'Real Madrid': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
    'Atlético Madrid': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Club_Athletico_Madrid_logo.svg/1200px-Club_Athletico_Madrid_logo.svg.png',
    'Sevilla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Sevilla_FC_logo.svg/1200px-Sevilla_FC_logo.svg.png',
    'Real Sociedad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Real_Sociedad_logo.svg/1200px-Real_Sociedad_logo.svg.png',
    'Athletic Bilbao': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Athletic_Club_%28logo%29.svg/1200px-Athletic_Club_%28logo%29.svg.png',
    'Juventus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_icon_black.svg/1200px-Juventus_FC_icon_black.svg.png',
    'Inter': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Inter_Milan_logo_2014.svg/1200px-Inter_Milan_logo_2014.svg.png',
    'AC Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png',
    'Napoli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/SSC_Napoli_logo.svg/1200px-SSC_Napoli_logo.svg.png',
    'Roma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/AS_Roma_Logo_2023.svg/1200px-AS_Roma_Logo_2023.svg.png',
    'Lazio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/SS_Lazio_wallpaper_2022.svg/1200px-SS_Lazio_wallpaper_2022.svg.png',
    'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
    'Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png',
    'RB Leipzig': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/RB_Leipzig_2014_logo.svg/1200px-RB_Leipzig_2014_logo.svg.png',
    'Leverkusen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Bayer_04_Leverkusen_logo.svg/1200px-Bayer_04_Leverkusen_logo.svg.png',
    'Eintracht Frankfurt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Eintracht_Frankfurt_logo.svg/1200px-Eintracht_Frankfurt_logo.svg.png',
    "Borussia M'gladbach": 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Borussia_M%C3%B6nchengladbach_logo.svg/1200px-Borussia_M%C3%B6nchengladbach_logo.svg.png',
    'PSG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Paris_Saint-Germain_logo.svg/1200px-Paris_Saint-Germain_logo.svg.png',
    'Monaco': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/AS_Monaco_FC.svg/1200px-AS_Monaco_FC.svg.png',
    'Lyon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Olympique_Lyonnais_logo.svg/1200px-Olympique_Lyonnais_logo.svg.png',
    'Marseille': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Olympique_Marseille_logo.svg/1200px-Olympique_Marseille_logo.svg.png',
    'Lille': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lille_Olympique_Sporting_Club_%281%29.svg/1200px-Lille_Olympique_Sporting_Club_%281%29.svg.png',
    'Nice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/OGC_Nice_logo.svg/1200px-OGC_Nice_logo.svg.png',
    'Flamengo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Campeonato_Brasileiro_Série_A_2023.svg/1200px-Campeonato_Brasileiro_Série_A_2023.svg.png',
    'Palmeiras': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/1200px-Palmeiras_logo.svg.png',
    'Corinthians': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sport_Club_Corinthians_Paulista_2015.svg/1200px-Sport_Club_Corinthians_Paulista_2015.svg.png',
    'Santos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Santos_logo.svg/1200px-Santos_logo.svg.png',
    'São Paulo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Sao_Paulo_Futebol_Clube_Logo.png/1200px-Sao_Paulo_Futebol_Clube_Logo.png',
    'Botafogo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Botafogo_de_Futebol_e_Regatas_logo.svg/1200px-Botafogo_de_Futebol_e_Regatas_logo.svg.png',
    'Fluminense': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Fluminense_FC_logo.svg/1200px-Fluminense_FC_logo.svg.png',
    'Vasco': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/CR_Vasco_da_Gama_logo.svg/1200px-CR_Vasco_da_Gama_logo.svg.png',
    'Cruzeiro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Cruzeiro_Esporte_Clube_%28logo%29.svg/1200px-Cruzeiro_Esporte_Clube_%28logo%29.svg.png',
    'River Plate': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/River_Plate_logo.svg/1200px-River_Plate_logo.svg.png',
    'Boca Juniors': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Boca_Juniors_logo.svg/1200px-Boca_Juniors_logo.svg.png'
};

async function updateTeamLogos() {
    console.log('🔄 Atualizando logos dos times...\n');

    // Buscar todos os jogos
    const data = await makeRequest('/rest/v1/matches?select=id,home_team,away_team', 'GET');
    
    if (!data || data.length === 0) {
        console.log('❌ Nenhum jogo encontrado');
        return;
    }

    console.log(`📊 Encontrados ${data.length} jogos para atualizar logos\n`);

    let updated = 0;
    let notFound = [];

    for (const match of data) {
        const updates = {};
        
        if (match.home_team && TEAM_LOGOS[match.home_team]) {
            updates.home_logo = TEAM_LOGOS[match.home_team];
        }
        
        if (match.away_team && TEAM_LOGOS[match.away_team]) {
            updates.away_logo = TEAM_LOGOS[match.away_team];
        }

        if (Object.keys(updates).length > 0) {
            await makeRequest(`/rest/v1/matches?id=eq.${match.id}`, 'PATCH', updates);
            updated++;
            console.log(`✅ ${match.home_team} vs ${match.away_team}`);
        } else {
            if (!notFound.includes(match.home_team)) notFound.push(match.home_team);
            if (!notFound.includes(match.away_team)) notFound.push(match.away_team);
        }
    }

    console.log(`\n📈 Total atualizado: ${updated} jogos`);
    if (notFound.length > 0) {
        console.log(`⚠️ Times sem logo: ${notFound.join(', ')}`);
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
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    resolve({ success: true });
                }
            });
        });

        req.on('error', reject);

        if (body && (method === 'POST' || method === 'PATCH')) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

updateTeamLogos().catch(console.error);
