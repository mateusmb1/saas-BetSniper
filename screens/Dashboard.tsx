
import React, { useState } from 'react';
import { MOCK_USER } from '../constants';
import { Match } from '../types';

interface DashboardProps {
  matches: Match[];
  unreadCount: number;
  onSelectMatch: (match: Match) => void;
  onOpenNotifications: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ matches, unreadCount, onSelectMatch, onOpenNotifications }) => {
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'LEAGUE'>('ALL');

  // Status maps
  const statusColorMap: Record<string, string> = {
    'LIVE': 'text-green-400',
    'SCHEDULED': 'text-gray-400',
    'FINISHED': 'text-gray-600'
  };

  const statusLabelMap: Record<string, string> = {
    'LIVE': 'Ao Vivo',
    'SCHEDULED': 'Agendado',
    'FINISHED': 'Encerrado'
  };

  const filteredMatches = matches.filter(m => {
    if (filter === 'LIVE') return m.status === 'LIVE';
    if (filter === 'LEAGUE') return m.league === 'Premier League';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-5 pt-8">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-gray-400 text-sm font-medium">Flashscore IA Connect</h2>
          <h1 className="text-white text-2xl font-bold tracking-tight mt-1">Dashboard</h1>
        </div>
        <button onClick={onOpenNotifications} className="relative transition-transform active:scale-90">
          <div className="h-10 w-10 rounded-full border-2 border-primary shadow-[0_0_10px_rgba(43,238,121,0.3)] overflow-hidden">
            <img src={MOCK_USER.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-background-dark flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">{unreadCount}</span>
            </div>
          )}
        </button>
      </header>

      <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('ALL')}
            className={`flex h-10 shrink-0 items-center justify-center px-6 rounded-full font-bold text-sm transition-all ${filter === 'ALL' ? 'bg-primary text-background-dark' : 'bg-surface-dark text-gray-400'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('LIVE')}
            className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 font-bold text-sm transition-all ${filter === 'LIVE' ? 'bg-primary text-background-dark' : 'bg-surface-dark text-gray-400'}`}
          >
            <span className="material-symbols-outlined text-[18px]">live_tv</span>
            Ao Vivo
          </button>
          <button
            onClick={() => setFilter('LEAGUE')}
            className={`flex h-10 shrink-0 items-center justify-center px-6 rounded-full font-bold text-sm transition-all ${filter === 'LEAGUE' ? 'bg-primary text-background-dark' : 'bg-surface-dark text-gray-400'}`}
          >
            Premier League
          </button>
        </div>
      </div>

      <section className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
            <span className="material-symbols-outlined text-4xl opacity-20">sports_soccer</span>
            <p className="text-sm font-bold uppercase tracking-widest opacity-40">Nenhum jogo {filter === 'LIVE' ? 'ao vivo' : 'encontrado'}</p>
          </div>
        ) : filteredMatches.map((match) => (
          <article
            key={match.id}
            onClick={() => onSelectMatch(match)}
            className="group relative flex flex-col w-full rounded-[2rem] bg-surface-dark border border-white/5 overflow-hidden active:scale-[0.98] transition-all cursor-pointer shadow-xl"
          >
            <div className="flex items-center justify-between p-5 pb-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">{match.league}</span>
              {match.status === 'LIVE' ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-red-500 uppercase">{match.minuteDisplay}</span>
                </div>
              ) : (
                <span className={`text-[10px] font-black uppercase ${match.status === 'FINISHED' ? 'text-gray-600' : 'text-gray-400'}`}>
                  {match.status === 'FINISHED' ? 'Encerrado' : match.time}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex flex-col items-center gap-3 w-1/3">
                {match.homeLogo ? (
                  <img src={match.homeLogo} alt={match.homeTeam} className="size-14 rounded-full border border-white/5 object-cover bg-white/5" />
                ) : (
                  <div className="size-14 rounded-full bg-white/5 flex items-center justify-center font-black text-xl text-white/80 border border-white/5">
                    {match.homeTeam.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-gray-300 text-center leading-tight">{match.homeTeam}</span>
              </div>

              <div className="flex flex-col items-center justify-center w-1/3">
                <span className="text-3xl font-black tracking-tighter text-white">
                  {match.status === 'SCHEDULED' ? 'VS' : match.score}
                </span>
                {match.status === 'LIVE' && match.minute && (
                  <span className="text-xs text-green-400 mt-1">{match.minute}'</span>
                )}
              </div>

              <div className="flex flex-col items-center gap-3 w-1/3">
                {match.awayLogo ? (
                  <img src={match.awayLogo} alt={match.awayTeam} className="size-14 rounded-full border border-white/5 object-cover bg-white/5" />
                ) : (
                  <div className="size-14 rounded-full bg-white/5 flex items-center justify-center font-black text-xl text-white/80 border border-white/5">
                    {match.awayTeam.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-gray-300 text-center leading-tight">{match.awayTeam}</span>
              </div>
            </div>

            {/* IA Insight Section - Adjusted to match the Red Box design */}
            {match.aiPick && (
              <div className="mx-4 mb-4 p-4 bg-[#121E18] rounded-2xl flex items-center justify-between border border-primary/10 shadow-inner">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px] fill-current">bolt</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">IA Insight</span>
                  </div>
                  <p className="text-xs font-bold text-gray-200">
                    {match.aiPick} • <span className="text-primary/80">Score {match.score_ia}</span>
                  </p>
                </div>
                <button
                  className="h-8 px-4 rounded-full bg-primary text-background-dark text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-90 transition-all shadow-[0_4px_10px_rgba(43,238,121,0.2)]"
                >
                  Analisar
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
