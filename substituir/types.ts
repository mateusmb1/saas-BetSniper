
export type AppScreen = 
  | 'ONBOARDING' 
  | 'LOGIN' 
  | 'DASHBOARD' 
  | 'MATCH_DETAIL' 
  | 'HISTORY' 
  | 'SIMULATOR' 
  | 'RANKING' 
  | 'NOTIFICATIONS' 
  | 'PROFILE';

export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  time: string;
  status: 'LIVE' | 'SCHEDULED' | 'FINISHED';
  score?: string;
  minute?: number; // Agora numérico para facilitar cálculos do updater
  minuteDisplay?: string; // Para exibição (ex: "34' 1T")
  aiPick?: string;
  aiConfidence?: number; // Probabilidade (0 a 100)
  odd?: number;
  
  // Novos campos baseados nos Workflows n8n
  media_gols?: number;
  forca_casa?: number;
  forca_fora?: number;
  score_ia?: number; // Resultado da fórmula do Workflow 3
}

export interface BetHistoryItem {
  id: string;
  date: string;
  match: string;
  sport: string;
  market: string;
  result: 'WIN' | 'LOSS';
  amount: number;
  ev: number;
  odds: number;
  icon: string;
}

export interface Notification {
  id: string;
  type: 'WIN' | 'AI' | 'LIVE' | 'ALERT';
  title: string;
  content: string;
  time: string;
  unread: boolean;
  dateLabel: 'HOJE' | 'ONTEM';
}

export interface User {
  name: string;
  email: string;
  plan: 'FREE' | 'PRO' | 'ELITE';
  avatar: string;
  joinYear: number;
}
