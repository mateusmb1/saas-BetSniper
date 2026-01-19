
import React, { useState, useEffect } from 'react';
import { AppScreen, Match, Notification, BetHistoryItem } from './types';
import { MOCK_MATCHES, MOCK_NOTIFICATIONS, MOCK_HISTORY } from './constants';
import { apiClient } from './services/apiClient';
import Onboarding from './screens/Onboarding';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import MatchDetail from './screens/MatchDetail';
import History from './screens/History';
import Simulator from './screens/Simulator';
import Ranking from './screens/Ranking';
import Notifications from './screens/Notifications';
import Profile from './screens/Profile';
import BottomNav from './components/BottomNav';

// Configuração: true = usar backend real, false = usar dados MOCK
const USE_BACKEND = true;

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('ONBOARDING');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [history] = useState<BetHistoryItem[]>(MOCK_HISTORY);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [simulatorInitialData, setSimulatorInitialData] = useState<{ odd: number, prob: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do backend ou MOCK
  useEffect(() => {
    if (USE_BACKEND) {
      // Carregar dados iniciais do backend
      loadMatchesFromBackend();

      // Conectar WebSocket para atualizações em tempo real
      const ws = apiClient.connectWebSocket((updatedMatches) => {
        console.log('📡 Dados atualizados via WebSocket:', updatedMatches.length, 'jogos');
        setMatches(updatedMatches);
      });

      return () => ws.close();
    } else {
      // Usar dados MOCK
      setMatches(MOCK_MATCHES);
      setIsLoading(false);
    }
  }, []);

  const loadMatchesFromBackend = async () => {
    try {
      console.log('🔄 Carregando jogos do backend...');
      const data = await apiClient.getMatches();
      console.log('✅ Jogos carregados:', data.length);
      setMatches(data);
    } catch (error) {
      console.error('❌ Erro ao carregar jogos:', error);
      // Fallback para MOCK se falhar
      setMatches(MOCK_MATCHES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    const auth = localStorage.getItem('isAuth');
    if (auth === 'true') setIsAuthenticated(true);
    if (hasSeen && !isAuthenticated) setCurrentScreen(auth === 'true' ? 'DASHBOARD' : 'LOGIN');
  }, [isAuthenticated]);

  const handleNavigate = (screen: AppScreen, data?: any) => {
    if (screen === 'MATCH_DETAIL' && data) setSelectedMatch(data);
    if (screen === 'SIMULATOR' && data) setSimulatorInitialData(data);
    else if (screen === 'SIMULATOR' && !data) setSimulatorInitialData(null);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
          <div>
            <div>🔄 Carregando...</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              {USE_BACKEND ? 'Conectando ao backend...' : 'Carregando dados...'}
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
      case 'ONBOARDING': return <Onboarding onComplete={() => { localStorage.setItem('hasSeenOnboarding', 'true'); setCurrentScreen('LOGIN'); }} />;
      case 'LOGIN': return <Login onLogin={() => { setIsAuthenticated(true); localStorage.setItem('isAuth', 'true'); setCurrentScreen('DASHBOARD'); }} />;
      case 'DASHBOARD': return <Dashboard {...props} />;
      case 'MATCH_DETAIL': return <MatchDetail match={selectedMatch} onBack={() => handleNavigate('DASHBOARD')} />;
      case 'HISTORY': return <History historyItems={history} />;
      case 'SIMULATOR': return <Simulator initialData={simulatorInitialData} />;
      case 'RANKING': return <Ranking matches={matches} onSimulate={(data) => handleNavigate('SIMULATOR', data)} />;
      case 'NOTIFICATIONS': return <Notifications notifications={notifications} onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))} onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))} onBack={() => handleNavigate('DASHBOARD')} />;
      case 'PROFILE': return <Profile onBack={() => handleNavigate('DASHBOARD')} onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('isAuth'); setCurrentScreen('LOGIN'); }} />;
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
