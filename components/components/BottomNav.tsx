
import React from 'react';
import { AppScreen } from '../types';

interface BottomNavProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const navItems: { screen: AppScreen; label: string; icon: string }[] = [
    { screen: 'DASHBOARD', label: 'Início', icon: 'space_dashboard' },
    { screen: 'RANKING', label: 'Ranking', icon: 'leaderboard' },
    { screen: 'HISTORY', label: 'Histórico', icon: 'history' },
    { screen: 'SIMULATOR', label: 'Simulador', icon: 'calculate' },
    { screen: 'PROFILE', label: 'Perfil', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1a14]/90 backdrop-blur-xl border-t border-white/5 pb-8 pt-3 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-w-md mx-auto">
      <ul className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <li key={item.screen}>
              <button
                onClick={() => onNavigate(item.screen)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-primary/70'
                }`}
              >
                <span 
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                    {item.icon}
                </span>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-60 font-medium'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
