/**
 * Backend Server - Express + WebSocket
 * Implementa os 3 workflows do Flashscore
 */
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { WebSocketServer } from 'ws';
import { initDatabase } from './database.js';
import { EspnService } from './espnService.js'; // Mantido para ligas principais
import { FlashscoreDeepScraper } from './flashscoreDeepScraper.js'; // Novo serviço híbrido
import { TeamLogoService } from './teamLogoService.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar banco de dados e serviços
const db = initDatabase();

// 1. Serviço ESPN (Rápido, Logos, Ligas Principais)
let espnService, deepScraper;
try {
    espnService = new EspnService();
    espnService.db = db;

    // 2. Serviço Deep Flashscore (Ligas Menores, Stats Profundos)
    deepScraper = new FlashscoreDeepScraper();
    deepScraper.db = db;
} catch (error) {
    console.error('❌ FATAL ERROR initializing services:', error);
    process.exit(1);
}

console.log('✅ BACKEND HÍBRIDO INICIADO');
console.log('🏁 1. ESPN Service: Ativo (Ligas Principais + Logos)');
console.log('🕵️ 2. Deep Scraper: Ativo (Ligas Menores + Stats - Ciclo 7 dias)');

/**
 * Endpoint unificado para buscar dados
 * Tenta ESPN primeiro (rápido), se não tiver dados suficientes ou for liga menor,
 * o Deep Scraper já terá populado o banco via background job.
 */
const getUnifiedMatches = async () => {
    // Aqui poderiamos mesclar dados, mas para simplificar:
    // O banco é a fonte da verdade. Ambos serviços escrevem no banco.
    // Vamos usar o método do espnService para ler do banco pois ele já tem a lógica de 'getAllMatches' com IA
    return espnService.getAllMatches();
};

// ==================== API ENDPOINTS ====================

/**
 * GET /api/matches - Buscar todos os jogos
 */
/**
 * GET /api/matches - Buscar todos os jogos
 */
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await getUnifiedMatches();
        // Adicionar logos aos jogos
        const matchesWithLogos = TeamLogoService.addLogosToMatches(matches);
        res.json({ success: true, data: matchesWithLogos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/matches/refresh - Forçar atualização manual (ESPN - Rápido)
 */
app.post('/api/matches/refresh', async (req, res) => {
    try {
        const matches = await espnService.fetchTodayMatches();
        res.json({ success: true, data: matches, count: matches.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/matches/update-live - Forçar atualização ao vivo manual (ESPN)
 */
app.post('/api/matches/update-live', async (req, res) => {
    try {
        const updates = await espnService.updateLiveMatches();
        res.json({ success: true, data: updates, count: updates.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req, res) => {
    const matchCount = db.prepare('SELECT COUNT(*) as count FROM matches').get();
    res.json({
        status: 'ok',
        database: 'connected',
        matches: matchCount.count,
        timestamp: new Date().toISOString()
    });
});

// ==================== CRON JOBS (AUTOMAÇÃO) ====================

/**
 * WORKFLOW 1: Coleta diária de jogos (ESPN - Rápido)
 * Executa todos os dias às 7:00
 */
cron.schedule('0 7 * * *', async () => {
    console.log('\n⏰ CRON: Executando coleta diária de jogos (ESPN)...');
    await espnService.fetchTodayMatches();
    broadcastUpdate();
}, {
    timezone: "Europe/Lisbon"
});

/**
 * WORKFLOW 2: Atualização de jogos ao vivo (ESPN - Frequente)
 * Executa a cada 30 segundos
 */
cron.schedule('*/30 * * * * *', async () => {
    const updates = await espnService.updateLiveMatches();
    if (updates.length > 0) {
        broadcastUpdate();
    }
});

/**
 * WORKFLOW 3: Deep Scraper (Ligas Menores + Stats - Lento/Fundo)
 * Executa a cada 10 minutos para garantir robustez
 */
let isDeepScraping = false;
cron.schedule('*/10 * * * *', async () => {
    if (isDeepScraping) {
        console.log('⏳ Deep Scraper ainda rodando, pulando ciclo...');
        return;
    }
    isDeepScraping = true;
    try {
        await deepScraper.runCycle();
    } catch (e) {
        console.error('❌ Erro no Cron Deep Scraper:', e);
    } finally {
        isDeepScraping = false;
    }
});

console.log('✅ Cron jobs configurados:');
console.log('   - Coleta diária (ESPN): 07:00');
console.log('   - Ao Vivo (ESPN): cada 30s');
console.log('   - Deep Scraper (Flashscore): cada 10 min\n');

// ==================== WEBSOCKET ====================

const wss = new WebSocketServer({ noServer: true });

async function broadcastUpdate() {
    const matches = await getUnifiedMatches();
    const matchesWithLogos = TeamLogoService.addLogosToMatches(matches);
    const message = JSON.stringify({ type: 'matches_update', data: matchesWithLogos });

    wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
            client.send(message);
        }
    });
}

wss.on('connection', async (ws) => {
    console.log('🔌 Cliente WebSocket conectado');

    // Enviar dados iniciais com logos
    const matches = await getUnifiedMatches();
    const matchesWithLogos = TeamLogoService.addLogosToMatches(matches);
    ws.send(JSON.stringify({ type: 'initial_data', data: matchesWithLogos }));

    ws.on('close', () => {
        console.log('🔌 Cliente WebSocket desconectado');
    });
});

// ==================== START SERVER ====================

const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 BACKEND RODANDO');
    console.log('='.repeat(60));
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log('='.repeat(60) + '\n');

    // Executar coleta inicial
    console.log('🔄 Executando coleta inicial de dados (ESPN + Deep Scraper)...\n');

    // Disparar ambos em paralelo
    Promise.allSettled([
        espnService.fetchTodayMatches(),
        deepScraper.runCycle()
    ]).then(() => {
        console.log('\n✅ Coleta inicial híbrida concluída!\n');
        console.log('💡 Endpoints disponíveis:');
        console.log('   GET  /api/matches - Lista todos os jogos');
        console.log('   POST /api/matches/refresh - Atualizar jogos do dia');
        console.log('   POST /api/matches/update-live - Atualizar jogos ao vivo');
        console.log('   GET  /api/health - Status do servidor\n');
    }).catch(err => {
        console.error('❌ Error in initial fetch:', err);
    });
});

// Upgrade HTTP para WebSocket
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⏹️  Encerrando servidor...');
    db.close();
    server.close();
    process.exit(0);
});
