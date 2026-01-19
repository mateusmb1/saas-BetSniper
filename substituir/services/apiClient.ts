/**
 * API Client - Integração com Backend
 */

const API_BASE_URL = 'http://localhost:3001/api';

export const apiClient = {
    /**
     * Buscar todos os jogos
     */
    async getMatches() {
        const response = await fetch(`${API_BASE_URL}/matches`);
        const data = await response.json();
        return data.success ? data.data : [];
    },

    /**
     * Forçar atualização de jogos do dia
     */
    async refreshMatches() {
        const response = await fetch(`${API_BASE_URL}/matches/refresh`, {
            method: 'POST'
        });
        const data = await response.json();
        return data.success ? data.data : [];
    },

    /**
     * Forçar atualização de jogos ao vivo
     */
    async updateLive() {
        const response = await fetch(`${API_BASE_URL}/matches/update-live`, {
            method: 'POST'
        });
        const data = await response.json();
        return data.success ? data.data : [];
    },

    /**
     * Conectar WebSocket para atualizações em tempo real
     */
    connectWebSocket(onUpdate: (data: any[]) => void) {
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const baseDelay = 1000;
        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout | null = null;
        let isIntentionallyClosed = false;

        const connect = () => {
            if (isIntentionallyClosed) return;

            try {
                ws = new WebSocket('ws://localhost:3001');

                ws.onopen = () => {
                    console.log('🔌 WebSocket conectado');
                    reconnectAttempts = 0; // Reset on successful connection
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === 'matches_update' || message.type === 'initial_data') {
                            onUpdate(message.data);
                        }
                    } catch (error) {
                        console.error('❌ Erro ao parsear mensagem WebSocket:', error);
                    }
                };

                ws.onerror = (error) => {
                    console.error('❌ Erro WebSocket:', error);
                };

                ws.onclose = (event) => {
                    console.log('🔌 WebSocket desconectado');
                    ws = null;

                    // Only reconnect if not intentionally closed and under retry limit
                    if (!isIntentionallyClosed && reconnectAttempts < maxReconnectAttempts) {
                        const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts), 30000);
                        reconnectAttempts++;

                        console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${reconnectAttempts}/${maxReconnectAttempts})`);

                        reconnectTimeout = setTimeout(() => {
                            connect();
                        }, delay);
                    } else if (reconnectAttempts >= maxReconnectAttempts) {
                        console.error('❌ Máximo de tentativas de reconexão atingido');
                    }
                };
            } catch (error) {
                console.error('❌ Erro ao criar WebSocket:', error);
            }
        };

        connect();

        // Return object with close method to cleanup
        return {
            close: () => {
                isIntentionallyClosed = true;
                if (reconnectTimeout) {
                    clearTimeout(reconnectTimeout);
                }
                if (ws) {
                    ws.close();
                }
            }
        };
    }
};
