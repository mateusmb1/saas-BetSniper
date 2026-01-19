
import React from 'react';
import { Match } from '../types';

interface MatchDetailProps {
  match: Match | null;
  onBack: () => void;
}

const MatchDetail: React.FC<MatchDetailProps> = ({ match, onBack }) => {
  if (!match) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 backdrop-blur-md bg-background-dark/80">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-base font-bold">Detalhe da Partida</h1>
        <button className="size-10 flex items-center justify-center rounded-full bg-white/10">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
      </header>

      <div className="flex flex-col items-center px-4 pt-4 pb-6">
        <div className="mb-6 flex items-center gap-2 rounded-full bg-surface-dark px-3 py-1 border border-white/5">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{match.league}</span>
        </div>

        <div className="flex items-center justify-around py-8 mb-6 border-b border-white/10">
          <div className="text-center space-y-3">
            {match.homeLogo ? (
              <img src={match.homeLogo} alt={match.homeTeam} className="h-20 w-20 mx-auto rounded-full border border-white/5 object-cover bg-white/10" />
            ) : (
              <div className="h-20 w-20 mx-auto rounded-full bg-surface-dark border border-white/5 text-2xl font-bold flex items-center justify-center">
                {match.homeTeam.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="font-bold text-lg text-white">{match.homeTeam}</div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-black text-white mb-2">{match.score || "VS"}</div>
            {match.status === 'LIVE' && <div className="text-green-400 text-sm font-semibold">{match.minute}' - AO VIVO</div>}
            {match.status === 'SCHEDULED' && <div className="text-text-secondary text-sm">{match.time}</div>}
          </div>

          <div className="text-center space-y-3">
            {match.awayLogo ? (
              <img src={match.awayLogo} alt={match.awayTeam} className="h-20 w-20 mx-auto rounded-full border border-white/5 object-cover bg-white/10" />
            ) : (
              <div className="h-20 w-20 mx-auto rounded-full bg-surface-dark border border-white/5 text-2xl font-bold flex items-center justify-center">
                {match.awayTeam.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="font-bold text-lg text-white">{match.awayTeam}</div>
          </div>
        </div>
      </div>

      <section className="px-4 py-2 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
          <h3 className="text-lg font-bold">Análise IA</h3>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-dark to-surface-darker p-5 border border-white/5">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-medium text-text-secondary">Mercado Recomendado</p>
              <span className="material-symbols-outlined text-primary text-xl">verified</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{match.aiPick || 'Over 2.5 Gols'}</h2>
                <p className="mt-1 text-[10px] text-text-secondary">Alta probabilidade de gols combinados</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-primary">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span className="text-lg font-bold">{match.odd || 1.85}</span>
                </div>
                <span className="text-[10px] text-text-secondary">Odd Atual</span>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase">
                <span className="text-text-secondary">Confiança do Modelo</span>
                <span className="text-primary">{match.aiConfidence || 87}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(43,238,121,0.5)] transition-all duration-1000"
                  style={{ width: `${match.aiConfidence || 87}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-2xl bg-surface-dark p-3 border border-white/5">
            <span className="text-xl font-bold text-white">72%</span>
            <span className="text-[10px] font-medium text-text-secondary text-center uppercase tracking-tight">Prob. Real</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-surface-dark p-3 border border-white/5">
            <span className="text-xl font-bold text-primary">+12%</span>
            <span className="text-[10px] font-medium text-text-secondary text-center uppercase tracking-tight">EV Index</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-surface-dark p-3 border border-white/5">
            <span className="text-xl font-bold text-white">8.5</span>
            <span className="text-[10px] font-medium text-text-secondary text-center uppercase tracking-tight">IA Score</span>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 pb-32 space-y-6">
        <h3 className="text-lg font-bold">Dados do Jogo</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          <button className="rounded-full bg-white text-black px-5 py-2 text-sm font-bold">Geral</button>
          <button className="rounded-full bg-surface-dark px-5 py-2 text-sm font-medium text-text-secondary">H2H</button>
          <button className="rounded-full bg-surface-dark px-5 py-2 text-sm font-medium text-text-secondary">Classificação</button>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-dark p-4 border border-white/5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-bold">Média de Gols</h4>
              <span className="text-xs text-text-secondary">Últimos 5 jogos</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">2.1</span>
                <span className="text-[10px] font-medium text-text-secondary uppercase">Arsenal</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">1.4</span>
                <span className="text-[10px] font-medium text-text-secondary uppercase">Chelsea</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase mb-2">Força Ofensiva</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 text-[10px] font-bold text-text-secondary">ARS</span>
                  <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '85%' }} />
                  </div>
                  <span className="w-6 text-[10px] font-bold text-primary">85</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 text-[10px] font-bold text-text-secondary">CHE</span>
                  <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500" style={{ width: '62%' }} />
                  </div>
                  <span className="w-6 text-[10px] font-bold text-gray-500">62</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 z-50 w-full max-w-md bg-background-dark/80 backdrop-blur-xl p-4 pb-8 border-t border-white/5">
        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-background-dark font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
          <span>Apostar Agora</span>
          <span className="material-symbols-outlined">open_in_new</span>
        </button>
      </div>
    </div>
  );
};

export default MatchDetail;
