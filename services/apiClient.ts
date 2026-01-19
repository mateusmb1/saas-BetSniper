/**
 * API Client - BetSniper com Supabase Realtime + ESPN Data
 */

import { supabase } from './supabase';
import { espnService } from './espnService';

const API_MODE = import.meta.env.VITE_API_MODE || 'supabase';

export const apiClient = {
    /**
     * Buscar todos os jogos do Supabase (dados REAIS da ESPN)
     */
    async getMatches() {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .order('date', { ascending: true })
                .order('time', { ascending: true });

            if (error) {
                console.error('❌ Erro ao buscar jogos:', error);
                return [];
            }

            // Mapear campos do banco para o formato esperado pela UI
            return (data || []).map(match => ({
                id: match.id,
                sport: match.sport || 'football',
                league: match.league,
                homeTeam: match.home_team,
                homeLogo: match.home_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.home_team)}&background=random&color=fff`,
                awayTeam: match.away_team,
                awayLogo: match.away_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.away_team)}&background=random&color=fff`,
                time: match.time,
                status: this.mapStatus(match.status),
                score: match.home_score > 0 || match.away_score > 0 ? `${match.home_score}-${match.away_score}` : undefined,
                minute: match.minute || (match.is_live ? 1 : undefined),
                minuteDisplay: match.is_live && match.display_clock ? match.display_clock : (match.is_live ? "LIVE" : undefined),
                aiPick: match.prediction,
                aiConfidence: match.confidence_score,
                odd: match.home_odds,
                prediction: match.prediction,
                confidence_score: match.confidence_score,
                analysis: match.analysis,
                is_live: match.is_live,
                // Campos extras
                home_score: match.home_score,
                away_score: match.away_score,
                home_odds: match.home_odds,
                draw_odds: match.draw_odds,
                away_odds: match.away_odds,
                external_id: match.external_id,
                country: match.country,
                date: match.date,
                league_logo: match.league_logo,
                display_clock: match.display_clock
            }));
        } catch (error) {
            console.error('❌ Exceção ao buscar jogos:', error);
            return [];
        }
    },

    /**
     * Mapear status do banco para UI
     */
    mapStatus(status: string): 'LIVE' | 'SCHEDULED' | 'FINISHED' {
        const statusMap: Record<string, 'LIVE' | 'SCHEDULED' | 'FINISHED'> = {
            'live': 'LIVE',
            'LIVE': 'LIVE',
            'scheduled': 'SCHEDULED',
            'SCHEDULED': 'SCHEDULED',
            'finished': 'FINISHED',
            'FINISHED': 'FINISHED',
            'FT': 'FINISHED',
            'AET': 'FINISHED'
        };
        return statusMap[status] || 'SCHEDULED';
    },

    /**
     * Forçar atualização de jogos
     */
    async refreshMatches() {
        try {
            const { data, error } = await supabase
                .functions.invoke('refresh-matches', {
                    method: 'POST'
                });

            if (error) {
                console.error('❌ Erro ao atualizar jogos:', error);
                return [];
            }

            return data?.matches || [];
        } catch (error) {
            console.error('❌ Exceção ao atualizar jogos:', error);
            return [];
        }
    },

    /**
     * Buscar histórico de apostas
     */
    async getHistory(userId: string) {
        try {
            const { data, error } = await supabase
                .from('bet_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erro ao buscar histórico:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('❌ Exceção ao buscar histórico:', error);
            return [];
        }
    },

    /**
     * Buscar notificações
     */
    async getNotifications(userId: string) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erro ao buscar notificações:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('❌ Exceção ao buscar notificações:', error);
            return [];
        }
    },

    /**
     * Conectar Supabase Realtime para atualizações em tempo real
     */
    connectRealtime(onUpdate: (matches: any[]) => void) {
        if (API_MODE === 'mock') {
            return { unsubscribe: () => {} };
        }

        const channel = supabase
            .channel('matches_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'matches'
                },
                (payload) => {
                    console.log('📡 Mudança detectada:', payload.eventType);
                    // Recarregar dados
                    this.getMatches().then(onUpdate);
                }
            )
            .subscribe();

        return {
            unsubscribe: () => {
                supabase.removeChannel(channel);
            }
        };
    },

    /**
     * WebSocket Simulation para compatibilidade
     */
    connectWebSocket(onUpdate: (data: any[]) => void) {
        return this.connectRealtime(onUpdate);
    }
};
