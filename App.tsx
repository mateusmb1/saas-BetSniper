import React, { useState, useEffect } from 'react';
import { AppScreen, Match, Notification, BetHistoryItem } from './types';
import { MOCK_MATCHES, MOCK_NOTIFICATIONS, MOCK_HISTORY } from './constants';
import { apiClient } from './services/apiClient';
import { supabase } from './services/supabase';
import Onboarding from './screens/Onboarding';
import LandingPage from './screens/LandingPage';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import MatchDetail from './screens/MatchDetail';
import History from './screens/History';
import Simulator from './screens/Simulator';
import Ranking from './screens/Ranking';
import Notifications from './screens/Notifications';
import Profile from './screens/Profile';
import BottomNav from './components/BottomNav';
import Plans from './screens/Plans';

// ========================================
// CONFIGURAÇÃO DE PRODUÇÃO (VERCEL)
// ========================================

// Verifica se estamos em produção (Vercel)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Em produção, NÃO usa backend local (não existe em Vercel)
// Usa apenas dados MOCK por enquanto (ou mude para false se tiver backend separado)
const USE_BACKEND = false && !isProduction;

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('LANDING');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [history, setHistory] = useState<BetHistoryItem[]>(MOCK_HISTORY);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [simulatorInitialData, setSimulatorInitialData] = useState<{ odd: number, prob: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🚀 App iniciada', { isProduction, USE_BACKEND });

  // Check auth on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setCurrentScreen('DASHBOARD');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserId(session?.user.id || null);
      if (!session) setCurrentScreen('LOGIN');
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar dados (MOCK ou backend)
  useEffect(() => {
    if (USE_BACKEND && userId) {
      loadMatchesFromBackend();
      loadUserData(userId);
    } else {
      // Em produção, usa dados MOCK diretamente
      setMatches(MOCK_MATCHES);
      setIsLoading(false);
    }
  }, [userId, USE_BACKEND]);

  const loadUserData = async (uid: string) => {
    try {
      const [historyData, notificationsData] = await Promise.all([
        apiClient.getHistory(uid),
        apiClient.getNotifications(uid)
      ]);

      if (historyData && historyData.length > 0) setHistory(historyData);
      if (notificationsData && notificationsData.length > 0) setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadMatchesFromBackend = async () => {
    try {
      console.log('🔄 Carregando jogos do backend...');
      const data = await apiClient.getMatches();
      console.log('✅ Jogos carregados:', data.length);
      if (data.length > 0) {
        setMatches(data);
      } else {
        setMatches(data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar jogos:', error);
      setMatches(MOCK_MATCHES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (screen: AppScreen, data?: any) => {
    if (screen === 'MATCH_DETAIL' && data) setSelectedMatch(data);
    if (screen === 'SIMULATOR' && data) setSimulatorInitialData(data);
    else if (screen === 'SIMULATOR' && !data) setSimulatorInitialData(null);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#102217', color: 'white' }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄 Carregando...</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              {isProduction ? 'BetSniper - Análise Esportiva' : 'Conectando ao backend...'}
            </div>
          </div>
        </div>
      );
    }

    const props = {
      matches,
      unreadCount: notifications.filter(n => n.unread).length,
      onSelectMatch: (m: Match) => handleNavigate('MATCH_DETAIL', m),
      onOpenNotifications: () => handleNavigate('NOTIFICATIONS')
    };

    switch (currentScreen) {
      case 'LANDING': return <LandingPage onNavigate={(screen) => handleNavigate(screen)} />;
      case 'ONBOARDING': return <Onboarding onComplete={() => { localStorage.setItem('hasSeenOnboarding', 'true'); setCurrentScreen('LOGIN'); }} />;
      case 'LOGIN': return <Login onLogin={() => { setIsAuthenticated(true); localStorage.setItem('isAuth', 'true'); setCurrentScreen('DASHBOARD'); }} />;
      case 'DASHBOARD': return <Dashboard {...props} />;
      case 'MATCH_DETAIL': return <MatchDetail match={selectedMatch} onBack={() => handleNavigate('DASHBOARD')} />;
      case 'HISTORY': return <History historyItems={history} />;
      case 'SIMULATOR': return <Simulator initialData={simulatorInitialData} />;
      case 'RANKING': return <Ranking matches={matches} onSimulate={(data) => handleNavigate('SIMULATOR', data)} />;
      case 'NOTIFICATIONS': return <Notifications notifications={notifications} onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))} onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))} onBack={() => handleNavigate('DASHBOARD')} />;
      case 'PROFILE': return <Profile onBack={() => handleNavigate('DASHBOARD')} onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('isAuth'); setCurrentScreen('LOGIN'); }} onUpgrade={() => handleNavigate('PLANS')} />;
      case 'PLANS': return <Plans onBack={() => handleNavigate('PROFILE')} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark max-w-md mx-auto relative overflow-x-hidden">
      <div className="flex-1 pb-20">
        {renderScreen()}
      </div>
      {isAuthenticated && !['ONBOARDING', 'LOGIN', 'NOTIFICATIONS', 'MATCH_DETAIL'].includes(currentScreen) && (
        <BottomNav activeScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export default App;
