import React, { useState } from 'react';
import { AppScreen } from '../types';

interface LandingPageProps {
  onNavigate: (screen: AppScreen) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [region, setRegion] = useState<'BR' | 'EU'>('BR');

  const prices = {
    BR: {
      symbol: 'R$',
      monthly: '29,90',
      quarterly: '79,90',
      quarterlyOld: '89,70',
      annual: '297,00'
    },
    EU: {
      symbol: '€',
      monthly: '9,99',
      quarterly: '24,90',
      quarterlyOld: '29,97',
      annual: '89,90'
    }
  };

  const currentPrice = prices[region];

  return (
    <div className="min-h-screen bg-background-dark text-white font-display overflow-x-hidden pb-24">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 glass-nav px-6 py-4 flex justify-between items-center max-w-md mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
          <span className="font-bold text-xl tracking-tighter">BetSniper</span>
        </div>
        <button 
          onClick={() => onNavigate('LOGIN')}
          className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
        >
          Entrar
        </button>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(43,238,121,0.15),transparent_50%)]"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6 animate-pulse">
            <span className="material-symbols-outlined text-sm">radar</span>
            SCANNER AO VIVO ATIVO
          </div>
          
          <h1 className="text-4xl font-bold leading-tight mb-4">
            PARE DE APOSTAR NA <span className="text-primary">SORTE</span>.
          </h1>
          <h2 className="text-xl text-gray-400 font-light mb-8">
            Mire com precisão de IA. A única ferramenta que monitora +1.000 jogos e te diz <b className="text-white">onde e quando</b> entrar.
          </h2>

          <div className="mb-10 relative group cursor-pointer" onClick={() => onNavigate('LOGIN')}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src="/assets/screens/match_detail.png" 
              alt="BetSniper App Interface" 
              className="relative rounded-xl border border-white/10 shadow-2xl mx-auto transform transition-transform group-hover:scale-[1.02]"
            />
          </div>

          <button 
            onClick={() => onNavigate('LOGIN')}
            className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(43,238,121,0.4)] hover:shadow-[0_0_30px_rgba(43,238,121,0.6)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
          >
            <span className="material-symbols-outlined">target</span>
            QUERO TESTAR AGORA
          </button>
          <p className="text-xs text-gray-500 mt-3">Acesso imediato • Sem cartão para demo</p>
        </div>
      </header>

      {/* Problem vs Solution */}
      <section className="px-6 py-12 bg-surface-darker/50">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold mb-2">A CASA SEMPRE VENCE...</h3>
          <p className="text-gray-400 text-sm">PORQUE ELES TÊM DADOS. AGORA VOCÊ TAMBÉM TEM.</p>
        </div>

        <div className="grid gap-4">
          <div className="p-5 rounded-2xl bg-red-900/10 border border-red-500/20">
            <div className="flex items-center gap-3 mb-2 text-red-400 font-bold">
              <span className="material-symbols-outlined">close</span>
              O APOSTADOR COMUM
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>❌ Aposta com o coração</li>
              <li>❌ Tenta recuperar o 'Red' no desespero</li>
              <li>❌ Analisa 1 jogo por vez na TV</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-2xl rounded-full"></div>
            <div className="flex items-center gap-3 mb-2 text-primary font-bold">
              <span className="material-symbols-outlined">check_circle</span>
              VOCÊ COM BETSNIPER
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Frieza matemática (IA)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Método validado (Backtesting)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Monitora 500 jogos simultâneos</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-6 py-12">
        <h3 className="text-2xl font-bold text-center mb-10">3 PASSOS PARA O <span className="text-primary">GREEN</span></h3>
        
        <div className="space-y-8 relative">
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-surface-darker"></div>
          
          {[
            { icon: 'satellite_alt', title: 'O Radar Monitora', desc: 'Processamos milhões de dados de ligas do mundo todo em tempo real.' },
            { icon: 'psychology', title: 'A IA Identifica', desc: 'O algoritmo filtra o ruído e encontra padrões de alta probabilidade.' },
            { icon: 'notifications_active', title: 'Você Atira', desc: 'Receba o alerta no celular. Abra sua casa de aposta e copie a entrada.' }
          ].map((item, i) => (
            <div key={i} className="relative pl-12">
              <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-surface-dark border border-primary/30 flex items-center justify-center text-primary z-10">
                <span className="material-symbols-outlined text-sm">{item.icon}</span>
              </div>
              <h4 className="font-bold text-lg mb-1">{item.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-12 bg-surface-darker">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">ESCOLHA SUA MUNIÇÃO</h3>
          
          {/* Region Toggle */}
          <div className="inline-flex bg-surface-dark p-1 rounded-full border border-white/5">
            <button 
              onClick={() => setRegion('BR')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${region === 'BR' ? 'bg-primary text-black shadow-lg' : 'text-gray-400'}`}
            >
              🇧🇷 Brasil
            </button>
            <button 
              onClick={() => setRegion('EU')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${region === 'EU' ? 'bg-primary text-black shadow-lg' : 'text-gray-400'}`}
            >
              🇪🇺 Europa
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Recommended Plan */}
          <div className="relative p-6 rounded-3xl bg-gradient-to-b from-primary/20 to-surface-dark border border-primary/50 shadow-lg transform scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Melhor Mira
            </div>
            <div className="text-center mb-6">
              <h4 className="text-lg font-bold text-white mb-1">Plano Trimestral</h4>
              <div className="text-gray-400 text-sm line-through mb-1">{currentPrice.symbol} {currentPrice.quarterlyOld}</div>
              <div className="text-4xl font-bold text-primary mb-2">
                <span className="text-2xl align-top">{currentPrice.symbol}</span>
                {currentPrice.quarterly}
              </div>
              <p className="text-xs text-gray-400">Cobrado a cada 3 meses</p>
            </div>
            <ul className="space-y-3 mb-6">
              {['Acesso Total ao Dashboard', 'Alertas Ilimitados', 'Scanner Ao Vivo', 'Backtesting Avançado'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-200">
                  <span className="material-symbols-outlined text-primary text-sm">check</span>
                  {feat}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => onNavigate('LOGIN')}
              className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-white transition-colors"
            >
              ASSINAR AGORA
            </button>
          </div>

          {/* Basic Plan */}
          <div className="p-6 rounded-3xl bg-surface-dark border border-white/5">
            <div className="text-center mb-6">
              <h4 className="text-lg font-bold text-white mb-2">Plano Mensal</h4>
              <div className="text-3xl font-bold text-white mb-2">
                <span className="text-xl align-top">{currentPrice.symbol}</span>
                {currentPrice.monthly}
              </div>
              <p className="text-xs text-gray-400">Cobrado mensalmente</p>
            </div>
            <button 
              onClick={() => onNavigate('LOGIN')}
              className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              COMEÇAR MENSAL
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t border-white/5 mt-8">
        <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
          <span className="material-symbols-outlined text-xl">precision_manufacturing</span>
          <span className="font-bold">BetSniper</span>
        </div>
        <div className="flex justify-center gap-6 text-xs text-gray-500 mb-6">
          <a href="#" className="hover:text-primary">Termos</a>
          <a href="#" className="hover:text-primary">Privacidade</a>
          <a href="#" className="hover:text-primary">Ajuda</a>
        </div>
        <p className="text-[10px] text-gray-600 leading-relaxed">
          O BetSniper é uma ferramenta de análise estatística. Não somos uma casa de apostas.
          <br />Proibido para menores de 18 anos.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
