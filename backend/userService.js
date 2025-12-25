import { initDatabase } from './database.js';

export class UserService {
    constructor() {
        this.db = initDatabase();
    }

    async getUserHistory(userId) {
        if (!userId) return [];
        
        const query = `
            SELECT 
                id,
                to_char(date, 'DD/MM HH24:MI') as date,
                home_team || ' vs ' || away_team as match,
                sport,
                market,
                result,
                amount,
                ev,
                odds,
                CASE 
                    WHEN sport = 'football' THEN 'sports_soccer'
                    WHEN sport = 'basketball' THEN 'sports_basketball'
                    WHEN sport = 'tennis' THEN 'sports_tennis'
                    ELSE 'sports_esports'
                END as icon
            FROM user_bets
            WHERE user_id = $1
            ORDER BY date DESC
        `;

        try {
            const result = await this.db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching user history:', error);
            return [];
        }
    }

    async getUserNotifications(userId) {
        if (!userId) return [];

        const query = `
            SELECT 
                id,
                type,
                title,
                content,
                to_char(created_at, 'HH24:MI') as time,
                unread,
                CASE 
                    WHEN created_at >= CURRENT_DATE THEN 'HOJE'
                    ELSE 'ONTEM'
                END as "dateLabel"
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 20
        `;

        try {
            const result = await this.db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            return [];
        }
    }

    async markNotificationAsRead(notificationId, userId) {
        try {
            await this.db.query(
                'UPDATE notifications SET unread = false WHERE id = $1 AND user_id = $2',
                [notificationId, userId]
            );
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }
    
    async markAllNotificationsAsRead(userId) {
        try {
            await this.db.query(
                'UPDATE notifications SET unread = false WHERE user_id = $1',
                [userId]
            );
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }
}
