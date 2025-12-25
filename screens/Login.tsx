import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Cadastro realizado! Verifique seu email para confirmar.');
        setIsSignUp(false); // Volta para login
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold text-center uppercase tracking-wider">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="ml-2 block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Email de Acesso</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">mail</span>
            <input 
              type="email" 
              className="w-full bg-surface-dark border-white/5 rounded-full h-14 pl-14 pr-4 text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-primary text-background-dark font-black h-16 rounded-full shadow-xl shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center uppercase tracking-widest text-sm"
        >
          {loading ? (
            <div className="h-6 w-6 border-4 border-background-dark border-t-transparent rounded-full animate-spin"></div>
          ) : (
            isSignUp ? 'Criar Conta Grátis' : 'Entrar na Plataforma'
          )}
        </button>

        <div className="flex justify-between px-2 items-center">
          <button 
             onClick={() => setIsSignUp(!isSignUp)}
             className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-white transition-colors"
          >
            {isSignUp ? 'Já tenho conta' : 'Criar conta grátis'}
          </button>
          {!isSignUp && (
            <button className="text-[10px] font-bold text-gray-500 uppercase hover:text-white transition-colors">Esqueci a senha</button>
          )}
        </div>

        {/* Social Login Mock */}
        <div className="mt-8 border-t border-white/5 pt-8">
          <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4">Ou continue com</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-surface-dark border border-white/5 hover:bg-white/5 transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              <span className="text-xs font-bold text-gray-300">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-surface-dark border border-white/5 hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-white text-xl">apple</span>
              <span className="text-xs font-bold text-gray-300">Apple</span>
            </button>
          </div>
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
