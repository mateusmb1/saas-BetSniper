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

import { LogoScraper } from './logoScraper.js';

import { MatchService } from './matchService.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar banco de dados e serviços
const db = initDatabase();
const matchService = new MatchService();

// 1. Serviço ESPN (Rápido, Logos, Ligas Principais)
let espnService, deepScraper, logoScraper;
try {
    espnService = new EspnService();
    espnService.db = db;

    // 2. Serviço Deep Flashscore (Ligas Menores + Stats Profundos)
    deepScraper = new FlashscoreDeepScraper();
    deepScraper.db = db;

    // 3. Serviço Logos (Scraper)
    logoScraper = new LogoScraper();
    logoScraper.db = db; // Reusa conexão se possível ou cria nova
} catch (error) {
    console.error('❌ FATAL ERROR initializing services:', error);
    process.exit(1);
}

console.log('✅ BACKEND HÍBRIDO INICIADO');
console.log('🏁 1. ESPN Service: Ativo (Ligas Principais + Logos)');
console.log('🕵️ 2. Deep Scraper: Ativo (Ligas Menores + Stats - Ciclo 7 dias)');
console.log('🖼️ 3. Logo Scraper: Disponível sob demanda');

/**
 * Endpoint unificado para buscar dados
 * Usa MatchService para lógica robusta de status e ordenação
 */
const getUnifiedMatches = async () => {
    try {
        const matches = await matchService.getUnifiedMatches();
        console.log(`🔍 DEBUG: Buscando jogos... Encontrados: ${matches.length}`);
        
        // Enriquecer com AI
        return matches.map(match => {
            if (espnService && espnService.calculateAI) {
                return espnService.calculateAI(match);
            }
            return match;
        });
    } catch (error) {
        console.error('Erro ao buscar jogos:', error);
        return [];
    }
};

// ==================== API ENDPOINTS ====================

/**
 * Helper: Detect Region from IP
 */
function detectRegion(ip) {
    // Tratamento para IPs locais (desenvolvimento)
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        // Default para desenvolvimento: Retorna BR para testar (ou EU se preferir)
        return { region: 'BR', currency: 'BRL' }; 
    }

    const geo = geoip.lookup(ip);
    
    if (geo && geo.country === 'BR') {
        return { region: 'BR', currency: 'BRL' };
    }
    
    // Padrão Europa (Portugal/Espanha e resto do mundo)
    return { region: 'EU', currency: 'EUR' };
}

/**
 * GET /api/user/config - Retorna configuração de região/preço
 * Lógica:
 * 1. Se user_id for fornecido, verifica no banco (Travamento de Região).
 * 2. Se não tiver região gravada, detecta via IP e GRAVA ETERNAMENTE.
 * 3. Se não tiver user_id, apenas retorna detecção via IP.
 */
app.get('/api/user/config', async (req, res) => {
    const user_id = req.query.user_id;
    // Captura IP real (considerando proxies)
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (typeof ip === 'string' && ip.includes(',')) {
        ip = ip.split(',')[0].trim(); // Pega o primeiro IP se houver lista
    }

    const detected = detectRegion(ip);

    if (user_id) {
        try {
            // Verificar perfil existente
            const result = await db.query('SELECT region, currency FROM profiles WHERE id = $1', [user_id]);
            
            if (result.rows.length > 0) {
                let profile = result.rows[0];
                
                // FIRST BIND: Se o usuário existe mas não tem região (ex: acabou de criar conta), grava agora.
                if (!profile.region) {
                    console.log(`🔒 Travando região do usuário ${user_id} em: ${detected.region}`);
                    await db.query(
                        'UPDATE profiles SET region = $1, currency = $2 WHERE id = $3', 
                        [detected.region, detected.currency, user_id]
                    );
                    profile = { region: detected.region, currency: detected.currency };
                }
                
                return res.json({ 
                    region: profile.region, 
                    currency: profile.currency, 
                    locked: true,
                    source: 'database'
                });
            }
        } catch (error) {
            console.error('❌ Erro ao buscar user config:', error);
            // Em caso de erro, falha seguro para detecção de IP
        }
    }

    // Usuário anônimo ou erro de banco
    res.json({ 
        region: detected.region, 
        currency: detected.currency, 
        locked: false,
        source: 'ip_detection'
    });
});

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
        const matchesWithLogos = await TeamLogoService.addLogosToMatches(matches);
        res.json({ success: true, data: matchesWithLogos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/logos/scrape - Forçar atualização de logos
 */
app.post('/api/logos/scrape', async (req, res) => {
    try {
        // Run in background to not block response
        logoScraper.runScraper().catch(e => console.error('Erro no scraper de logos:', e));
        res.json({ success: true, message: 'Logo Scraper iniciado em background' });
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
app.get('/api/health', async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) as count FROM matches');
        res.json({
            status: 'ok',
            database: 'connected',
            matches: parseInt(result.rows[0].count),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
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
    const matchesWithLogos = await TeamLogoService.addLogosToMatches(matches);
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
    const matchesWithLogos = await TeamLogoService.addLogosToMatches(matches);
    ws.send(JSON.stringify({ type: 'initial_data', data: matchesWithLogos }));

    ws.on('close', () => {
        console.log('🔌 Cliente WebSocket desconectado');
    });
});

import { spawn } from 'child_process';
import path from 'path';

// ... (existing imports)

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

    // START SPORTDB SCRAPER IF KEY IS PRESENT
    if (process.env.SPORTDB_API_KEY) {
        console.log('🚀 Iniciando SportDB Scraper (Python Process)...');
        const pythonProcess = spawn('python', ['python_scraper/sportdb_scraper.py'], {
            cwd: process.cwd(),
            stdio: 'inherit' // Pipe output to parent process
        });
        
        pythonProcess.on('error', (err) => {
            console.error('❌ Falha ao iniciar SportDB Scraper:', err);
        });
        
        // Ensure python process is killed when node exits
        process.on('exit', () => pythonProcess.kill());
    } else {
        console.log('⚠️  SPORTDB_API_KEY não encontrada. O scraper SportDB não será iniciado automaticamente.');
    }

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
