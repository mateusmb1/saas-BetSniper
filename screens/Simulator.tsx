
import React, { useState, useEffect } from 'react';

interface SimulatorProps {
  initialData?: { odd: number, prob: number } | null;
}

const Simulator: React.FC<SimulatorProps> = ({ initialData }) => {
  const [bankroll, setBankroll] = useState('1000,00');
  const [odd, setOdd] = useState('1.90');
  const [stake, setStake] = useState(5);
  const [prob, setProb] = useState(56);

  useEffect(() => {
    if (initialData) {
      setOdd(initialData.odd.toString());
      setProb(initialData.prob);
    }
  }, [initialData]);

  // Lógica de cálculo reativa
  const numericOdd = parseFloat(odd.replace(',', '.')) || 0;
  const numericBankroll = parseFloat(bankroll.replace('.', '').replace(',', '.')) || 0;
  const stakeAmount = numericBankroll * (stake / 100);
  
  // EV = (Odd * Prob_Decimal) - 1
  const ev = numericOdd > 0 ? (numericOdd * (prob / 100) - 1) * 100 : 0;
  
  // Lucro Médio Esperado por operação
  const lucro = numericOdd > 1 ? (stakeAmount * (numericOdd - 1) * (prob/100)) - (stakeAmount * (1 - prob/100)) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-32">
      <header className="flex items-center justify-between p-6 sticky top-0 z-20 bg-background-dark/90 backdrop-blur-md">
        <span className="material-symbols-outlined text-2xl text-primary">calculate</span>
        <h1 className="text-xl font-bold tracking-tight">Simulador IA</h1>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined">restart_alt</span>
        </button>
      </header>

      <main className="px-6 flex flex-col gap-6 pt-4">
        <div className="bg-surface-dark rounded-2xl p-6 border border-white/5 shadow-xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Sua Banca</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
              <input 
                type="text" 
                value={bankroll}
                onChange={(e) => setBankroll(e.target.value)}
                className="w-full bg-background-dark/50 border-white/10 rounded-full h-14 pl-12 pr-5 text-white font-bold outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Odd</label>
               <input 
                 type="text" 
                 value={odd}
                 onChange={(e) => setOdd(e.target.value)}
                 className="w-full bg-background-dark/50 border-white/10 rounded-full h-12 px-4 text-center text-white font-bold outline-none focus:border-primary"
               />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Unidades (%)</label>
               <div className="h-12 bg-background-dark/50 border border-white/10 rounded-full flex items-center justify-center text-primary font-bold">
                 {stake}%
               </div>
             </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Stake de Risco</label>
            </div>
            <input 
              type="range" min="1" max="50" value={stake}
              onChange={(e) => setStake(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Probabilidade IA</label>
              <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <span className="text-primary font-bold text-sm">{prob}%</span>
              </div>
            </div>
            <input 
              type="range" min="0" max="100" value={prob}
              onChange={(e) => setProb(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 px-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <h3 className="text-lg font-bold">Análise de Valor</h3>
          </div>

          <div className="bg-gradient-to-br from-surface-dark to-surface-darker rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
            <div className={`absolute -right-10 -top-10 w-32 h-32 ${ev > 0 ? 'bg-primary/10' : 'bg-red-500/10'} rounded-full blur-3xl`} />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Expected Value (EV)</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold tracking-tight ${ev > 0 ? 'text-primary' : 'text-red-400'}`}>
                      {ev > 0 ? '+' : ''}{ev.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className={`p-2 rounded-xl border border-white/5 ${ev > 0 ? 'text-primary' : 'text-red-400'}`}>
                  <span className="material-symbols-outlined text-2xl">
                    {ev > 0 ? 'trending_up' : 'trending_down'}
                  </span>
                </div>
              </div>
              
              <div className="h-px bg-white/10" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Lucro Médio</span>
                  <span className={`text-xl font-bold ${lucro > 0 ? 'text-white' : 'text-red-400'}`}>
                    R$ {lucro.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status Aposta</span>
                  <span className={`text-xl font-bold ${ev > 5 ? 'text-primary' : ev > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {ev > 5 ? 'Excelente' : ev > 0 ? 'Neutro' : 'Evite'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-primary font-mono">Vencer ({prob}%)</span>
                  <span className="text-red-400 font-mono">Perder ({100-prob}%)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 flex overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${prob}%` }} />
                  <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${100-prob}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Simulator;
