/**
 * Script para popular o banco com dados realistas de exemplo
 * Permite testar o sistema enquanto aguardamos Puppeteer ou validamos acesso real
 */
import fs from 'fs';

const now = new Date();

// Função auxiliar para gerar horários
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Dados realistas de jogos
const mockMatches = [
    // JOGOS AO VIVO
    {
        match_id: 'QPmK8P5Z',
        league: 'Premier League',
        homeTeam: 'Manchester City',
        awayTeam: 'Liverpool',
        time: formatTime(addMinutes(now, -45)),
        status: 'LIVE',
        score: '2 - 1',
        minute: 67,
        odd: 1.75,
        aiConfidence: 78,
        media_gols: 3.2,
        forca_casa: 92,
        forca_fora: 88
    },
    {
        match_id: 'fl9K2M3X',
        league: 'La Liga',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        time: formatTime(addMinutes(now, -30)),
        status: 'LIVE',
        score: '1 - 1',
        minute: 52,
        odd: 2.10,
        aiConfidence: 72,
        media_gols: 3.5,
        forca_casa: 90,
        forca_fora: 91
    },
    {
        match_id: 'xL3P9Q2B',
        league: 'Serie A',
        homeTeam: 'Juventus',
        awayTeam: 'Inter Milan',
        time: formatTime(addMinutes(now, -20)),
        status: 'LIVE',
        score: '0 - 0',
        minute: 38,
        odd: 1.95,
        aiConfidence: 65,
        media_gols: 2.3,
        forca_casa: 82,
        forca_fora: 84
    },

    // JOGOS AGENDADOS
    {
        match_id: 'vN7R4T1K',
        league: 'Bundesliga',
        homeTeam: 'Bayern Munich',
        awayTeam: 'Borussia Dortmund',
        time: formatTime(addMinutes(now, 30)),
        status: 'SCHEDULED',
        score: null,
        minute: null,
        odd: 1.65,
        aiConfidence: 82,
        media_gols: 3.8,
        forca_casa: 94,
        forca_fora: 87
    },
    {
        match_id: 'pK5M8Q2Y',
        league: 'Ligue 1',
        homeTeam: 'Paris SG',
        awayTeam: 'Marseille',
        time: formatTime(addMinutes(now, 60)),
        status: 'SCHEDULED',
        score: null,
        minute: null,
        odd: 1.55,
        aiConfidence: 85,
        media_gols: 3.0,
        forca_casa: 93,
        forca_fora: 76
    },
    {
        match_id: 'bW9N2P7X',
        league: 'Premier League',
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        time: formatTime(addMinutes(now, 120)),
        status: 'SCHEDULED',
        score: null,
        minute: null,
        odd: 1.85,
        aiConfidence: 74,
        media_gols: 2.7,
        forca_casa: 86,
        forca_fora: 83
    },
    {
        match_id: 'qR4T6M9Y',
        league: 'Liga Portugal',
        homeTeam: 'Benfica',
        awayTeam: 'FC Porto',
        time: formatTime(addMinutes(now, 180)),
        status: 'SCHEDULED',
        score: null,
        minute: null,
        odd: 2.05,
        aiConfidence: 68,
        media_gols: 2.8,
        forca_casa: 84,
        forca_fora: 85
    },
    {
        match_id: 'mL8Q3N5K',
        league: 'Liga Portugal',
        homeTeam: 'Sporting CP',
        awayTeam: 'Braga',
        time: formatTime(addMinutes(now, 240)),
        status: 'SCHEDULED',
        score: null,
        minute: null,
        odd: 1.70,
        aiConfidence: 76,
        media_gols: 2.9,
        forca_casa: 88,
        forca_fora: 78
    },

    // JOGOS FINALIZADOS
    {
        match_id: 'xT2M9P5Y',
        league: 'Premier League',
        homeTeam: 'Tottenham',
        awayTeam: 'Aston Villa',
        time: formatTime(addMinutes(now, -180)),
        status: 'FINISHED',
        score: '3 - 2',
        minute: 90,
        odd: 1.90,
        aiConfidence: 70,
        media_gols: 3.1,
        forca_casa: 81,
        forca_fora: 75
    },
    {
        match_id: 'vP5Q8N2T',
        league: 'Serie A',
        homeTeam: 'AC Milan',
        awayTeam: 'Napoli',
        time: formatTime(addMinutes(now, -200)),
        status: 'FINISHED',
        score: '1 - 1',
        minute: 90,
        odd: 2.00,
        aiConfidence: 66,
        media_gols: 2.4,
        forca_casa: 80,
        forca_fora: 82
    }
];

// Estrutura do banco
const database = {
    matches: mockMatches.map((match, index) => ({
        id: index + 1,
        ...match,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }))
};

// Salvar no arquivo
fs.writeFileSync('futebol-db.json', JSON.stringify(database, null, 2));

console.log('✅ Banco de dados populado com sucesso!');
console.log(`📊 Total de jogos: ${database.matches.length}`);
console.log(`   - Ao vivo: ${database.matches.filter(m => m.status === 'LIVE').length}`);
console.log(`   - Agendados: ${database.matches.filter(m => m.status === 'SCHEDULED').length}`);
console.log(`   - Finalizados: ${database.matches.filter(m => m.status === 'FINISHED').length}`);
console.log('\n💡 Agora você pode testar a API e o frontend com dados realistas!');
