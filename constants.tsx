
import { Match, BetHistoryItem, Notification, User } from './types';

export const MOCK_USER: User = {
  name: 'Carlos Silva',
  email: 'carlos.silva@email.com',
  plan: 'ELITE',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeZvar1_0vkvKduL9d_ytJs6EPvRtvAhkV1CbYvkMi-Y66OXwYBbN-YFtwjGl65Dij3VRu1NoDw02_tKroaVN2Bge3hzUsuOPfetB2kbKyB_j7tuN99_mey95ESVH8n8h5s3TQUSk0AHsgJoHbBdWZlDKNj5yeIYm9TlLY7JjOzT6Z3WfAAPWRhSrCNLW5SdFv51vmZnzQOC_CnQPRm3M0qBuGJMYhn06pNKsiUMlY1IpUzFmFbBCkn6SdV_D5eyHxLRvZmg3KemjF',
  joinYear: 2023
};

// Geramos jogos com horários baseados no momento atual para garantir que o "Ao Vivo" funcione no teste
const now = new Date();
const formatTime = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

export const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    sport: 'football',
    league: 'Premier League',
    homeTeam: 'Arsenal',
    homeLogo: 'AR',
    awayTeam: 'Chelsea',
    awayLogo: 'CH',
    time: formatTime(new Date(now.getTime() - 30 * 60000)), // Começou há 30 min
    status: 'LIVE',
    score: '1 - 0',
    minute: 34,
    minuteDisplay: "34' 1T",
    odd: 1.85,
    aiConfidence: 75,
    media_gols: 2.8,
    forca_casa: 85,
    forca_fora: 60
  },
  {
    id: '2',
    sport: 'football',
    league: 'La Liga',
    homeTeam: 'Real Madrid',
    homeLogo: 'RM',
    awayTeam: 'Barcelona',
    awayLogo: 'FCB',
    time: formatTime(new Date(now.getTime() + 5 * 60000)), // Começa em 5 min
    status: 'SCHEDULED',
    odd: 2.10,
    aiConfidence: 62,
    media_gols: 3.2,
    forca_casa: 92,
    forca_fora: 88
  },
  {
    id: '3',
    sport: 'football',
    league: 'Bundesliga',
    homeTeam: 'Bayern',
    homeLogo: 'BM',
    awayTeam: 'Dortmund',
    awayLogo: 'BVB',
    time: formatTime(new Date(now.getTime() - 120 * 60000)), // Acabou faz tempo
    status: 'FINISHED',
    score: '3 - 1',
    minute: 90,
    minuteDisplay: "Finalizado",
    odd: 1.55,
    aiConfidence: 80,
    media_gols: 4.0,
    forca_casa: 95,
    forca_fora: 70
  },
  {
    id: '4',
    sport: 'basketball',
    league: 'NBA',
    homeTeam: 'Lakers',
    homeLogo: 'LAL',
    awayTeam: 'Warriors',
    awayLogo: 'GSW',
    time: formatTime(new Date(now.getTime() - 10 * 60000)), // Ao vivo
    status: 'LIVE',
    score: '85 - 82',
    minute: 3,
    minuteDisplay: 'Q3',
    odd: 1.90,
    aiConfidence: 65,
    media_gols: 220,
    forca_casa: 80,
    forca_fora: 82
  },
  {
    id: '5',
    sport: 'tennis',
    league: 'Wimbledon',
    homeTeam: 'Alcaraz',
    homeLogo: 'AL',
    awayTeam: 'Djokovic',
    awayLogo: 'DJ',
    time: formatTime(new Date(now.getTime() + 60 * 60000)),
    status: 'SCHEDULED',
    odd: 1.80,
    aiConfidence: 50,
    media_gols: 0,
    forca_casa: 90,
    forca_fora: 90
  }
];

export const MOCK_HISTORY: BetHistoryItem[] = [
  {
    id: 'h1',
    date: 'Today, 19:30',
    match: 'Lakers vs. Bulls',
    sport: 'NBA',
    market: 'Moneyline (Lakers)',
    result: 'WIN',
    amount: 450.00,
    ev: 5.2,
    odds: 1.95,
    icon: 'sports_basketball'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'WIN',
    title: 'Green! Arsenal venceu',
    content: 'Sua aposta múltipla foi bem sucedida. Lucro total: R$ 450,00',
    time: '14:30',
    unread: true,
    dateLabel: 'HOJE'
  }
];
