
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simula delay de rede para autenticação
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen justify-center p-8 bg-background-dark relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
      
      <div className="flex flex-col items-center pb-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-[0_0_30px_rgba(43,238,121,0.1)] border border-primary/20">
          <span className="material-symbols-outlined text-5xl text-primary">analytics</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-white text-center uppercase">SaaS Bet</h1>
        <p className="mt-2 text-gray-500 text-center text-sm font-medium">Smart Data. Winning Strategies.</p>
      </div>

      <div className="space-y-6 w-full">
        <div className="space-y-2">
          <label className="ml-2 block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Email de Acesso</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">mail</span>
            <input 
              type="email" 
              className="w-full bg-surface-dark border-white/5 rounded-full h-14 pl-14 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium"
              placeholder="seu@email.com"
              defaultValue="ricardo@betanalytics.ai"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-2 block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Chave Secreta</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">lock</span>
            <input 
              type="password" 
              className="w-full bg-surface-dark border-white/5 rounded-full h-14 pl-14 pr-14 text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium"
              placeholder="••••••••"
              defaultValue="password123"
            />
            <button className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">visibility</span>
            </button>
          </div>
        </div>

        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary text-background-dark font-black h-16 rounded-full shadow-xl shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center uppercase tracking-widest text-sm"
        >
          {loading ? (
            <div className="h-6 w-6 border-4 border-background-dark border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Entrar na Plataforma'
          )}
        </button>

        <div className="flex justify-between px-2">
          <button className="text-[10px] font-bold text-gray-500 uppercase hover:text-white transition-colors">Esqueci a senha</button>
          <button className="text-[10px] font-bold text-primary uppercase tracking-widest">Criar conta grátis</button>
        </div>
      </div>

      <div className="mt-20 flex flex-col items-center gap-4">
        <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-[0.1em] leading-relaxed">
          Apostas esportivas envolvem risco.<br/>
          Jogue com responsabilidade. 18+
        </p>
      </div>
    </div>
  );
};

export default Login;
