
import { Match, BetHistoryItem, Notification, User } from './types';

export const MOCK_USER: User = {
  name: 'Usuário',
  email: 'user@betsniper.com',
  plan: 'FREE',
  avatar: 'https://ui-avatars.com/api/?name=User&background=2bee79&color=102217',
  joinYear: 2026
};

// EMPTY - Using Supabase data only
export const MOCK_MATCHES: Match[] = [];

export const MOCK_HISTORY: BetHistoryItem[] = [];

export const MOCK_NOTIFICATIONS: Notification[] = [];
