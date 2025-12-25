import { initDatabase } from './database.js';

export class MatchService {
    constructor() {
        this.db = initDatabase();
    }

    /**
     * Unified match fetching with robust status handling
     * Priority: LIVE > SCHEDULED > FINISHED
     */
    async getUnifiedMatches() {
        // Query to get matches with correct ordering and status priority
        // We use a window of 1 day to show relevant games (today and yesterday for context)
        const query = `
            SELECT 
                id, league, home_team as "homeTeam", away_team as "awayTeam", 
                home_score as "homeScore", away_score as "awayScore",
                status, is_live, match_url, home_logo as "homeLogo", away_logo as "awayLogo",
                minute, TO_CHAR(date, 'HH24:MI') as time, date
            FROM matches 
            WHERE date >= CURRENT_DATE - INTERVAL '1 day' 
            ORDER BY 
                CASE 
                    WHEN status = 'LIVE' THEN 1 
                    WHEN status = 'FINISHED' THEN 3
                    WHEN status = 'SCHEDULED' THEN 2 
                    ELSE 4 
                END ASC,
                date DESC,
                time ASC
            LIMIT 100
        `;
        
        try {
            const result = await this.db.query(query);
            
            // Post-processing for status consistency
            return result.rows.map(match => {
                // Ensure score format
                const homeScore = match.homeScore !== null ? match.homeScore : 0;
                const awayScore = match.awayScore !== null ? match.awayScore : 0;
                match.score = `${homeScore} - ${awayScore}`;

                // Status normalization
                if (match.status === 'LIVE') {
                    // Logic to detect "fake live" if needed (e.g., last update > 10 min ago)
                    // For now, trust the DB status updated by scrapers
                    match.statusCode = '1';
                } else if (match.status === 'FINISHED' || match.status === 'FT') {
                    match.statusCode = '0';
                    match.minute = 'Encerrado';
                    match.status = 'FINISHED'; // Normalize status string
                } else {
                    match.statusCode = '0';
                    // Ensure scheduled games don't have scores like 0-0 if they haven't started
                    if (match.status === 'SCHEDULED' && match.homeScore === null) {
                        match.score = 'VS';
                    }
                }

                return match;
            });
        } catch (error) {
            console.error('Error fetching unified matches:', error);
            return [];
        }
    }
}
