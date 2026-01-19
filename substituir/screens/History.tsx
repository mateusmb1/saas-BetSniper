
import React, { useState, useMemo } from 'react';
import { BetHistoryItem } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface HistoryProps {
  historyItems: BetHistoryItem[];
}

const History: React.FC<HistoryProps> = ({ historyItems }) => {
  const [period, setPeriod] = useState<'7D' | '30D' | 'ALL'>('30D');

  // Dados de gráfico dinâmicos baseados no período (Mock dinâmico)
  const chartData = useMemo(() => {
    const data7d = [
      { v: 3500 }, { v: 3800 }, { v: 3600 }, { v: 4100 }, { v: 3900 }, { v: 4050 }, { v: 4250 }
    ];
    const data30d = [
      { v: 2000 }, { v: 2400 }, { v: 2100 }, { v: 3100 }, { v: 3500 }, { v: 3200 }, { v: 4250 }
    ];
    if (period === '7D') return data7d;
    return data30d;
  }, [period]);

  const stats = useMemo(() => {
    if (period === '7D') return { profit: 750, winRate: 68, roi: 18.2 };
    return { profit: 4250, winRate: 62, roi: 12.4 };
  }, [period]);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-32">
      <header className="flex items-center justify-between p-4 pt-8 sticky top-0 z-20 bg-background-dark/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight">Sua Performance</h2>
          <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black tracking-widest uppercase">
            LIVE
          </div>
        </div>
        <button className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-white/80">filter_list</span>
        </button>
      </header>

      <div className="px-4 py-2">
        <div className="flex h-11 w-full items-center justify-center rounded-full bg-surface-dark p-1">
          <button 
            onClick={() => setPeriod('7D')}
            className={`flex-1 rounded-full h-full text-xs font-bold transition-all ${period === '7D' ? 'bg-background-dark text-primary shadow-sm' : 'text-white/40'}`}
          >
            7 Dias
          </button>
          <button 
            onClick={() => setPeriod('30D')}
            className={`flex-1 rounded-full h-full text-xs font-bold transition-all ${period === '30D' ? 'bg-background-dark text-primary shadow-sm' : 'text-white/40'}`}
          >
            30 Dias
          </button>
          <button 
            onClick={() => setPeriod('ALL')}
            className={`flex-1 rounded-full h-full text-xs font-bold transition-all ${period === 'ALL' ? 'bg-background-dark text-primary shadow-sm' : 'text-white/40'}`}
          >
            Tudo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar px-4 py-4">
        <div className="flex gap-3 min-w-max">
          <div className="w-[140px] rounded-2xl p-4 bg-surface-dark border border-white/5">
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">Lucro</p>
            <p className="text-white text-xl font-bold">+R${stats.profit}</p>
            <p className="text-primary text-[10px] font-bold mt-1">↑ 5.2%</p>
          </div>
          <div className="w-[140px] rounded-2xl p-4 bg-surface-dark border border-white/5">
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">Win Rate</p>
            <p className="text-white text-xl font-bold">{stats.winRate}%</p>
            <p className="text-primary text-[10px] font-bold mt-1">↑ 1.5%</p>
          </div>
          <div className="w-[140px] rounded-2xl p-4 bg-surface-dark border border-white/5">
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">ROI</p>
            <p className="text-white text-xl font-bold">{stats.roi}%</p>
            <p className="text-primary text-[10px] font-bold mt-1">↑ 0.8%</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="rounded-3xl bg-surface-dark p-6 border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Tendência de Banca</p>
              <h3 className="text-white text-3xl font-black">R$ 4.250,00</h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black border border-primary/20">+15%</div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2bee79" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2bee79" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke="#2bee79" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={4}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-4 text-[9px] text-white/20 font-black uppercase tracking-widest">
            <span>Início Período</span>
            <span>Agora</span>
          </div>
        </div>
      </div>

      <div className="px-6 pt-10 pb-4">
        <h3 className="text-white font-bold text-lg">Últimas Operações</h3>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {historyItems.map((item) => (
          <div key={item.id} className="bg-surface-dark/60 p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-xl bg-background-dark flex items-center justify-center ${item.result === 'WIN' ? 'text-primary' : 'text-red-400'}`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-0.5">{item.date}</p>
                  <p className="text-white font-bold text-sm">{item.match}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-black ${item.result === 'WIN' ? 'text-primary' : 'text-red-400'}`}>
                  {item.result === 'WIN' ? '+' : ''}R$ {Math.abs(item.amount).toFixed(2)}
                </p>
                <p className="text-[10px] text-white/30 font-bold uppercase">{item.result}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] pt-1 border-t border-white/5">
              <span className="text-gray-500 font-medium uppercase tracking-widest">{item.market}</span>
              <span className="text-white/60 font-mono">Odds <b className="text-white">{item.odds.toFixed(2)}</b></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
