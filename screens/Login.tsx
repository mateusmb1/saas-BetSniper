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
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Por favor, preencha email e senha');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccess('Conta criada! Você já pode fazer login.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Map common errors to user-friendly messages
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Tente novamente.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login.');
      } else if (err.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Faça login.');
        setIsSignUp(false);
      } else if (err.message?.includes('Password should be at least')) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(err.message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-center p-8 bg-background-dark relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
      
      <div className="flex flex-col items-center pb-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-[0_0_30px_rgba(43,238,121,0.1)] border border-primary/20">
          <span className="material-symbols-outlined text-5xl text-primary">analytics</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-white text-center uppercase">BetSniper</h1>
        <p className="mt-2 text-gray-500 text-center text-sm font-medium">Smart Data. Winning Strategies.</p>
      </div>

      <div className="space-y-6 w-full">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold text-center uppercase tracking-wider">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-500 text-xs font-bold text-center uppercase tracking-wider">
            {success}
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
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-2 block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Senha</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">lock</span>
            <input 
              type="password" 
              className="w-full bg-surface-dark border-white/5 rounded-full h-14 pl-14 pr-14 text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
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
            isSignUp ? 'Criar Conta' : 'Entrar'
          )}
        </button>

        <div className="flex justify-between px-2 items-center">
          <button 
             onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
             className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-white transition-colors"
          >
            {isSignUp ? 'Já tenho conta - Login' : 'Criar conta grátis'}
          </button>
        </div>

        {/* Demo accounts info */}
        <div className="mt-6 p-4 bg-surface-dark rounded-xl border border-white/5">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Contas de teste:</p>
          <div className="space-y-1 text-[9px] text-gray-500">
            <p>Admin: admin@betsniper.com</p>
            <p>Teste: test@betsniper.com / test123</p>
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
