const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export const apiClient = {
    async getMatches() {
        const response = await fetch(`${API_BASE_URL}/matches`);
        const data = await response.json();
        return data.success ? data.data : [];
    },

    async refreshMatches() {
        const response = await fetch(`${API_BASE_URL}/matches/refresh`, {
            method: 'POST'
        });
        const data = await response.json();
        return data.success ? data.data : [];
    },

    async updateLive() {
        const response = await fetch(`${API_BASE_URL}/matches/update-live`, {
            method: 'POST'
        });
        const data = await response.json();
        return data.success ? data.data : [];
    },

    async getUserConfig(userId?: string) {
        const url = userId 
            ? `${API_BASE_URL}/user/config?user_id=${userId}`
            : `${API_BASE_URL}/user/config`;
            
        const response = await fetch(url);
        return await response.json();
    },

    async getHistory(userId: string) {
        const response = await fetch(`${API_BASE_URL}/user/history?user_id=${userId}`);
        const data = await response.json();
        return data.success ? data.data : [];
    },

    async getNotifications(userId: string) {
        const response = await fetch(`${API_BASE_URL}/user/notifications?user_id=${userId}`);
        const data = await response.json();
        return data.success ? data.data : [];
    },

    async markNotificationRead(userId: string, notificationId?: string, all: boolean = false) {
        await fetch(`${API_BASE_URL}/user/notifications/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, notification_id: notificationId, all })
        });
    },

    connectWebSocket(onUpdate: (data: any[]) => void, onDisconnected?: () => void) {
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const baseDelay = 1000;
        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout | null = null;
        let isIntentionallyClosed = false;

        const connect = () => {
            if (isIntentionallyClosed) return;

            try {
                ws = new WebSocket(WS_URL);

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

                    if (onDisconnected) {
                        onDisconnected();
                    }

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

        return {
            close: () => {
                isIntentionallyClosed = true;
                if (reconnectTimeout) {
                    clearTimeout(reconnectTimeout);
                }
                if (ws) {
                    ws.close();
                }
            },
            manualReconnect: () => {
                console.log('🔄 Reconexão manual iniciada');
                isIntentionallyClosed = false;
                reconnectAttempts = 0;
                
                if (ws) {
                    ws.close();
                }
                
                connect();
            }
        };
    }
}
