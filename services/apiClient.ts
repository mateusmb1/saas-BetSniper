/**
 * API Client - BetSniper com Supabase Realtime
 */

import { supabase } from './supabase';

const API_MODE = import.meta.env.VITE_API_MODE || 'supabase';

export const apiClient = {
    /**
     * Buscar todos os jogos do Supabase
     */
    async getMatches() {
        if (API_MODE === 'mock') {
            return [];
        }

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

            return data || [];
        } catch (error) {
            console.error('❌ Exceção ao buscar jogos:', error);
            return [];
        }
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
