/**
 * Atualizar logos usando API do football-data.org ou similar que funciona
 */

const https = require('https');

const SUPABASE_URL = 'https://nnbvmbjqlmuwlovlqgzh.supabase.co';
const SERVICE_KEY = 'sb_secret_q1PweAuWb9b27iEp0zG3JA_yjM4AuQl';

// Logos do logo.clearbit.com (funciona melhor)
const TEAM_LOGOS = {
    'Flamengo': 'https://logo.clearbit.com/flamengo.com.br',
    'Palmeiras': 'https://logo.clearbit.com/palmeiras.com.br',
    'River Plate': 'https://logo.clearbit.com/riverplate.com',
    'Boca Juniors': 'https://logo.clearbit.com/bocajuniors.com',
    'Juventus': 'https://logo.clearbit.com/juventus.com',
    'AC Milan': 'https://logo.clearbit.com/acmilan.com',
    'PSG': 'https://logo.clearbit.com/psg.fr',
    'Monaco': 'https://logo.clearbit.com/asmonaco.com',
    'Man United': 'https://logo.clearbit.com/manutd.com',
    'Tottenham': 'https://logo.clearbit.com/tottenhamhotspur.com',
    'Atlético Madrid': 'https://logo.clearbit.com/atleticomadrid.com',
    'Sevilla': 'https://logo.clearbit.com/sevillafc.es',
    'Corinthians': 'https://logo.clearbit.com/corinthians.com.br',
    'Santos': 'https://logo.clearbit.com/santosfc.com.br',
    'Barcelona': 'https://logo.clearbit.com/fcbarcelona.com',
    'Real Madrid': 'https://logo.clearbit.com/realmadrid.com',
    'Arsenal': 'https://logo.clearbit.com/arsenal.com',
    'Liverpool': 'https://logo.clearbit.com/liverpoolfc.com',
    'Man City': 'https://logo.clearbit.com/mancity.com',
    'Chelsea': 'https://logo.clearbit.com/chelseafc.com',
    'Bayern Munich': 'https://logo.clearbit.com/fcbayern.de',
    'Dortmund': 'https://logo.clearbit.com/bvb.de',
    'Inter': 'https://logo.clearbit.com/inter.it',
    'Napoli': 'https://logo.clearbit.com/sscnapoli.it',
    'Roma': 'https://logo.clearbit.com/asroma.it',
    'Lazio': 'https://logo.clearbit.com/sslazio.it',
    'RB Leipzig': 'https://logo.clearbit.com/rbleipzig.com',
    'Leverkusen': 'https://logo.clearbit.com/bayer04.de',
    'Lyon': 'https://logo.clearbit.com/ol.fr',
    'Marseille': 'https://logo.clearbit.com/om.fr',
    'Lille': 'https://logo.clearbit.com/losc.fr',
    'Nice': 'https://logo.clearbit.com/ogcnice.com',
    'Eintracht Frankfurt': 'https://logo.clearbit.com/eintrachtfrankfurt.de',
    "Borussia M'gladbach": 'https://logo.clearbit.com/borussia.de',
    'West Ham': 'https://logo.clearbit.com/whufc.com',
    'Brighton': 'https://logo.clearbit.com/brightonandhovealbion.com',
    'Aston Villa': 'https://logo.clearbit.com/avfc.co.uk',
    'Newcastle': 'https://logo.clearbit.com/nufc.co.uk',
    'Real Sociedad': 'https://logo.clearbit.com/realsociedad.eus',
    'Athletic Bilbao': 'https://logo.clearbit.com/athletic-club.eus'
};

async function updateLogos() {
    console.log('🔄 Atualizando logos...\n');

    // Buscar todos os jogos
    const data = await makeRequest('/rest/v1/matches?select=id,home_team,away_team', 'GET');
    
    if (!data || data.length === 0) {
        console.log('❌ Nenhum jogo encontrado');
        return;
    }

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

updateLogos().catch(console.error);
