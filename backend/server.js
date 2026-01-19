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
import geoip from 'geoip-lite';                              // ← NOVO
import { UserService } from './userService.js';                    // ← NOVO
import { GeminiService } from './geminiService.js';

const db = initDatabase();
const matchService = new MatchService();
const userService = new UserService();
const geminiService = new GeminiService();

// ========================================================
// FUNÇÃO AUXILIAR: Calcular score local
// ========================================================
/**
 * Calcula score de confiança local (sem IA externa)
 * Considere: forma, força, status, momento
 * @param {Object} match - Dados do jogo
 * @returns {number} Score de confiança (0-100)
 */
function calculateLocalScore(match) {
  let score = 50; // Score base

  // FATOR 1: Média de gols (peso: 30%)
  if (match.media_gols) {
    if (match.media_gols > 3) {
      score += 20; // Muito ofensivo
    } else if (match.media_gols > 2.5) {
      score += 15; // Ofensivo
    } else if (match.media_gols > 2) {
      score += 10; // Moderadamente ofensivo
    } else if (match.media_gols < 1.5) {
      score -= 12; // Pouco ofensivo
    } else if (match.media_gols < 1) {
      score -= 20; // Muito defensivo
    }
  }

  // FATOR 2: Força relativa casa/fora (peso: 25%)
  if (match.forca_casa && match.forca_fora) {
    const forceDiff = match.forca_casa - match.forca_fora;
    
    if (forceDiff > 20) {
      score += 15; // Mandante muito superior
    } else if (forceDiff > 10) {
      score += 10; // Mandante superior
    } else if (forceDiff < -10) {
      score -= 10; // Visitante muito superior
    } else if (forceDiff < -20) {
      score -= 15; // Visitante muito superior
    }
    // Mandante com leve vantagem de casa
    score += 5;
  }

  // FATOR 3: Status do jogo (peso: 20%)
  if (match.status === 'LIVE') {
    if (match.minute) {
      // Jogos ao vivo são mais confiáveis conforme avançam
      if (match.minute > 75) {
        score += 12; // Últimos minutos
      } else if (match.minute > 60) {
        score += 10; // Segundo tempo avançado
      } else if (match.minute > 30) {
        score += 7; // Primeiro tempo avançado
      } else {
        score += 3; // Início do jogo
      }
    }
  } else if (match.status === 'FINISHED') {
    score -= 10; // Jogo encerrado não é mais útil para apostas
  } else if (match.status === 'SCHEDULED') {
    score += 2; // Jogo agendado tem valor
  }

  // FATOR 4: Momento/tempo até o jogo (peso: 15%)
  const now = new Date();
  const matchDate = match.date ? new Date(match.date) : now;
  const hoursBefore = (matchDate - now) / (1000 * 60 * 60);
  
  if (hoursBefore > 0) {
    if (hoursBefore < 6) {
      score += 8; // Jogo muito em breve
    } else if (hoursBefore < 24) {
      score += 5; // Jogo em breve
    }
  }

  // FATOR 5: IA Score existente (peso: 10%)
  if (match.score_ia) {
    score += Math.min(10, match.score_ia * 0.2);
  }

  // NORMALIZAR PARA 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  return score;
}

// ========================================================
// FUNÇÃO: Determina o mercado recomendado
// ========================================================
/**
 * Determina o mercado recomendado baseado no score de confiança
 * @param {number} score - Score de confiança (0-100)
 * @param {Object} match - Dados do jogo
 * @returns {string} Mercado recomendado
 */
function getRecommendedMarket(score, match) {
  if (score >= 85) {
    // Muito alta confiança
    if (match.media_gols && match.media_gols > 2.5) {
      return 'Over 2.5 Gols';
    }
    return 'Vitória Mandante';
  } else if (score >= 70) {
    // Alta confiança
    if (match.media_gols && match.media_gols > 2) {
      return 'Over 2 Gols';
    }
    return 'Vitória Mandante';
  } else if (score >= 55) {
    // Confiança média-alta
    return 'Double Chance (Mandante/Empate)';
  } else if (score >= 40) {
    // Confiança média
    return 'Empate com proteção';
  } else if (score >= 25) {
    // Confiança média-baixa
    return 'Pass';
  } else {
    // Baixa confiança
    return 'Não recomendar';
  }
}

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// ========================================================
// ENDPOINT UNIFICADO PARA BUSCAR DADOS
// ========================================================

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
 * Endpoint unificado para buscar dados de jogos com IA
 */
const getUnifiedMatches = async () => {
    try {
        const matches = await matchService.getUnifiedMatches();
        console.log(`🔍 DEBUG: Buscando jogos... Encontrados: ${matches.length}`);
        
        // Enriquecer com cálculo de IA local
        const matchesWithAI = matches.map(match => {
            if (matchService && matchService.calculateAI) {
                return matchService.calculateAI(match);
            }
            return match;
        });

        return matchesWithAI;
    } catch (error) {
        console.error('Erro ao buscar jogos:', error);
        return [];
    }
};

// ========================================================
// ENDPOINT: Análise Detalhada de Jogo
// ========================================================
app.get('/api/matches/:id/analysis', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Buscar jogo no banco
    const matchResult = await db.query(
      'SELECT * FROM matches WHERE id = $1',
      [id]
    );
    
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Match not found' });
    }
    
    const match = matchResult.rows[0];
    
    // 2. Calcular score local
    const localScore = calculateLocalScore(match);
    
    // 3. Análise Gemini (não bloquear se falhar)
    let geminiResult = null;
    try {
      geminiResult = await geminiService.analyzeMatch(match);
    } catch (geminiError) {
      console.warn('⚠️ Gemini API falhou, usando apenas cálculo local:', geminiError.message);
      geminiResult = {
        predicted_outcome: 'UNKNOWN',
        confidence_score: 50,
        recommended_market: localScore > 70 ? 'ALTA' : 'MÉDIA',
        key_factors: [],
        reasoning: 'Análise IA indisponível - usando cálculo local'
      };
    }
    
    // 4. Combinação híbrida (70% local + 30% Gemini)
    const hybridScore = Math.round(
      (localScore * 0.7) + (geminiResult.confidence_score * 0.3)
    );
    
    // 5. Atualizar banco de dados
    await db.query(
      `UPDATE matches 
       SET local_score = $1, 
           gemini_analysis = $2, 
           hybrid_score = $3, 
           analyzed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4`,
      [localScore, JSON.stringify(geminiResult), hybridScore, id]
    );
    
    // 6. Retornar resultado completo
    res.json({
      success: true,
      data: {
        match: {
          ...match,
          localScore,
          hybridScore
        },
        local_score: localScore,
        gemini_analysis: geminiResult,
        hybrid_score: hybridScore,
        recommendation: hybridScore > 80 ? 'ALTA' : 
                       hybridScore > 60 ? 'MÉDIA' : 'BAIXA',
        explanation: `Confiança combinada: Local (${localScore}) × 0.7 + Gemini (${geminiResult.confidence_score}) × 0.3 = ${hybridScore}`
      }
    });
  } catch (error) {
    console.error('❌ Erro na análise:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========================================================
// ENDPOINTS JÁ EXISTENTES
// ========================================================

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
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await getUnifiedMatches();
        const matchesWithLogos = await TeamLogoService.addLogosToMatches(matches);
        res.json({ success: true, data: matchesWithLogos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================================
// CRON JOBS (AUTOMAÇÃO)
// ========================================================

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
cron.schedule('*/30 * * * *', async () => {
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

// ========================================================
// WEBSOCKET
// ========================================================

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

// ========================================================
// START SERVER
// ========================================================

const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 BACKEND RODANDO');
    console.log('='.repeat(60));
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log('='.repeat(60) + '\n');

    // Executar coleta inicial
    console.log('🔄 Executando coleta inicial de dados (ESPN + Deep Scraper)...\n');

    (async () => {
        try {
            await Promise.allSettled([
                espnService.fetchTodayMatches(),
                deepScraper.runCycle()
            ]);
            console.log('\n✅ Coleta inicial híbrida concluída!\n');
            console.log('💡 Endpoints disponíveis:');
            console.log('   GET  /api/matches - Lista todos os jogos');
            console.log('   GET  /api/matches/:id/analysis - Análise detalhada de jogo');
            console.log('   POST /api/matches/refresh - Atualizar jogos do dia');
            console.log('   POST /api/matches/update-live - Atualizar jogos ao vivo');
            console.log('   GET  /api/user/config - Região e preços');
            console.log('   GET  /api/health - Status do servidor\n');
        } catch (err) {
            console.error('❌ Error in initial fetch:', err);
        }
    })();
});

// ========================================================
// UPGRADE HTTP PARA WEBSOCKET
// ========================================================

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// ========================================================
// GRACEFUL SHUTDOWN
// ========================================================

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⏹️  Encerrando servidor...');
    db.close();
    server.close();
    process.exit(0);
});
