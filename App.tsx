
import React, { useState, useEffect } from 'react';
import { AppScreen, Match, Notification, BetHistoryItem } from './types';
import { MOCK_MATCHES, MOCK_NOTIFICATIONS, MOCK_HISTORY } from './constants';
import { apiClient } from './services/apiClient';
import { supabase } from './services/supabase';
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

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('ONBOARDING');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [history, setHistory] = useState<BetHistoryItem[]>(MOCK_HISTORY);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [simulatorInitialData, setSimulatorInitialData] = useState<{ odd: number, prob: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🚀 BetSniper App iniciada');

  // Auth state change listener
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

  // Load matches with fallback
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const data = await apiClient.getMatches();
        
        if (data && data.length > 0) {
          setMatches(data);
          console.log('✅ Dados carregados do Supabase:', data.length, 'jogos');
        } else {
          console.log('⚠️ Nenhum dado do Supabase, usando MOCK');
          setMatches(MOCK_MATCHES);
        }
      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err);
        setError('Erro de conexão. Usando dados offline.');
        setMatches(MOCK_MATCHES);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Check localStorage for previous auth
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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          backgroundColor: '#102217', 
          color: 'white' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>BetSniper</div>
          <div style={{ fontSize: '14px', color: '#2bee79' }}>Carregando dados...</div>
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
      case 'ONBOARDING': 
        return <Onboarding onComplete={() => { 
          localStorage.setItem('hasSeenOnboarding', 'true'); 
          setCurrentScreen('LOGIN'); 
        }} />;
      case 'LOGIN': 
        return <Login onLogin={() => { 
          setIsAuthenticated(true); 
          localStorage.setItem('isAuth', 'true'); 
          setCurrentScreen('DASHBOARD'); 
        }} />;
      case 'DASHBOARD': 
        return <Dashboard {...props} />;
      case 'MATCH_DETAIL': 
        return <MatchDetail match={selectedMatch} onBack={() => handleNavigate('DASHBOARD')} />;
      case 'HISTORY': 
        return <History historyItems={history} />;
      case 'SIMULATOR': 
        return <Simulator initialData={simulatorInitialData} />;
      case 'RANKING': 
        return <Ranking matches={matches} onSimulate={(data) => handleNavigate('SIMULATOR', data)} />;
      case 'NOTIFICATIONS': 
        return <Notifications 
          notifications={notifications} 
          onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))} 
          onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))} 
          onBack={() => handleNavigate('DASHBOARD')} 
        />;
      case 'PROFILE': 
        return <Profile 
          onBack={() => handleNavigate('DASHBOARD')} 
          onLogout={() => { 
            setIsAuthenticated(false); 
            localStorage.removeItem('isAuth'); 
            setCurrentScreen('LOGIN'); 
          }} 
        />;
      default: 
        return <Dashboard {...props} />;
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
