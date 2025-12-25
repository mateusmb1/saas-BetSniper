
import React, { useMemo } from 'react';
import { Match } from '../types';

interface RankingProps {
  matches: Match[];
  onSimulate: (data: { odd: number, prob: number }) => void;
}

const Ranking: React.FC<RankingProps> = ({ matches, onSimulate }) => {
  // Ordena os jogos pelo Score IA (Workflow 3 do n8n)
  const rankedMatches = useMemo(() => {
    return [...matches].sort((a, b) => (b.score_ia || 0) - (a.score_ia || 0));
  }, [matches]);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/90 backdrop-blur-md px-4 pt-12 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-background-dark font-black shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none uppercase tracking-tighter">Ranking IA</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Cálculo n8n Ativo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {rankedMatches.map((m, idx) => (
          <div key={m.id} className="relative w-full rounded-3xl bg-surface-dark border border-white/5 p-5 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-background-dark font-black text-xs px-4 py-1.5 rounded-bl-2xl">
              #{idx + 1}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {m.homeLogo ? (
                  <img src={m.homeLogo} alt={m.homeTeam} className="size-8 rounded-full border border-primary/20 object-cover bg-white/5" />
                ) : (
                  <div className="size-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-primary text-xs border border-primary/20">
                    {m.homeTeam.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase">{m.league}</p>
                  <h3 className="text-sm font-black text-white">{m.homeTeam} vs {m.awayTeam}</h3>
                </div>
                {m.awayLogo ? (
                  <img src={m.awayLogo} alt={m.awayTeam} className="size-8 rounded-full border border-primary/20 object-cover bg-white/5" />
                ) : (
                  <div className="size-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-primary text-xs border border-primary/20">
                    {m.awayTeam.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="bg-background-dark/50 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Melhor Entrada: {m.aiPick}</span>
                  <span className="text-lg font-black text-white">@ {m.odd?.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-2 rounded-xl flex flex-col items-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase">Confiança</span>
                    <span className="text-white font-black">{m.aiConfidence}%</span>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-xl flex flex-col items-center border border-primary/20">
                    <span className="text-[9px] text-primary font-bold uppercase">IA Score</span>
                    <span className="text-primary font-black text-lg">{m.score_ia}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSimulate({ odd: m.odd || 0, prob: m.aiConfidence || 0 })}
                className="w-full h-12 bg-primary text-background-dark font-black text-sm rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">calculate</span>
                SIMULAR VALUE BET
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Ranking;
