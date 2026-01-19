/**
 * Sistema de Atualização em Tempo Real - BetSniper
 * Mantém os dados sempre atualizados via Supabase Realtime
 */

import { createClient } from '@supabase/supabase-js';
import { realMatchService } from './realMatchService.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nnbvmbjqlmuwlovlqgzh.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_q1PweAuWb9b27iEp0zG3JA_yjM4AuQl';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

let isRunning = true;
let updateInterval = null;

console.log('🔄 BETSNIPER REALTIME UPDATER INICIADO');
console.log('='.repeat(50));

async function startRealtimeUpdater() {
    console.log('📡 Conectando ao Supabase Realtime...');

    // 1. Inscrever-se em mudanças na tabela matches
    const channel = supabase
        .channel('realtime-updates')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'matches'
            },
            (payload) => {
                console.log('📨 Mudança detectada:', payload.eventType, payload.new?.league || '');
            }
        )
        .subscribe((status) => {
            console.log(`📡 Realtime status: ${status}`);
        });

    // 2. Atualizar dados a cada 5 minutos
    updateInterval = setInterval(async () => {
        if (!isRunning) return;
        
        console.log('\n🔄 Verificando atualizações...');
        await updateAllMatches();
    }, 5 * 60 * 1000); // 5 minutos

    // 3. Atualizar ao vivo a cada 30 segundos (para jogos ao vivo)
    setInterval(async () => {
        if (!isRunning) return;
        await updateLiveScores();
    }, 30 * 1000); // 30 segundos

    console.log('✅ Sistema de atualizações realtime ativo!');
    console.log('   - Updates gerais: a cada 5 minutos');
    console.log('   - Placar ao vivo: a cada 30 segundos\n');
}

async function updateAllMatches() {
    try {
        // Buscar novos jogos
        const newMatches = await realMatchService.getTodayMatches();
        
        // Buscar jogos existentes
        const { data: existingMatches } = await supabase
            .from('matches')
            .select('external_id');

        const existingIds = new Set(existingMatches?.map(m => m.external_id));

        // Filtrar apenas jogos novos
        const gamesToInsert = newMatches.filter(m => !existingIds.has(m.external_id));

        if (gamesToInsert.length > 0) {
            const { error } = await supabase
                .from('matches')
                .insert(gamesToInsert);

            if (error) {
                console.error('❌ Erro ao inserir jogos:', error.message);
            } else {
                console.log(`✅ ${gamesToInsert.length} novos jogos inseridos!`);
            }
        } else {
            console.log('ℹ️  Nenhum jogo novo encontrado.');
        }

        // Atualizar odds e análises
        await updateOddsAndAnalysis(newMatches);

    } catch (error) {
        console.error('❌ Erro na atualização:', error.message);
    }
}

async function updateOddsAndAnalysis(matches: any[]) {
    try {
        for (const match of matches.slice(0, 10)) { // Atualizar 10 jogos por vez
            const { error } = await supabase
                .from('matches')
                .update({
                    analysis: match.analysis,
                    prediction: match.prediction,
                    confidence_score: match.confidence_score,
                    home_odds: match.home_odds,
                    draw_odds: match.draw_odds,
                    away_odds: match.away_odds
                })
                .eq('external_id', match.external_id);

            if (error) {
                console.error(`❌ Erro ao atualizar ${match.external_id}:`, error.message);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar odds:', error.message);
    }
}

async function updateLiveScores() {
    try {
        // Buscar jogos ao vivo
        const { data: liveMatches } = await supabase
            .from('matches')
            .select('*')
            .eq('is_live', true);

        if (!liveMatches || liveMatches.length === 0) return;

        console.log(`⚽ Atualizando ${liveMatches.length} jogos ao vivo...`);

        for (const match of liveMatches) {
            // Simular atualização de placar
            const homeScore = match.home_score + (Math.random() > 0.7 ? 1 : 0);
            const awayScore = match.away_score + (Math.random() > 0.8 ? 1 : 0);

            await supabase
                .from('matches')
                .update({
                    home_score: homeScore,
                    away_score: awayScore,
                    status: homeScore !== match.home_score || awayScore !== match.away_score ? 'live' : 'scheduled'
                })
                .eq('id', match.id);
        }

    } catch (error) {
        console.error('❌ Erro ao atualizar placares:', error.message);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⏹️  Encerrando realtime updater...');
    isRunning = false;
    if (updateInterval) clearInterval(updateInterval);
    supabase.removeAllChannels();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n⏹️  Encerrando realtime updater...');
    isRunning = false;
    if (updateInterval) clearInterval(updateInterval);
    supabase.removeAllChannels();
    process.exit(0);
});

// Iniciar
startRealtimeUpdater().catch(console.error);
