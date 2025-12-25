
import React from 'react';
import { MOCK_USER } from '../constants';

interface ProfileProps {
  onBack: () => void;
  onLogout: () => void;
  onUpgrade?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack, onLogout, onUpgrade }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background-dark pb-32">
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 pt-8 bg-background-dark/95 backdrop-blur-md">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Configurações</h1>
        <div className="size-10" />
      </header>

      <main className="flex flex-col items-center py-6 px-4">
        <div className="relative group mb-4">
          <div 
            className="w-32 h-32 rounded-full bg-cover bg-center border-4 border-surface-dark shadow-2xl"
            style={{ backgroundImage: `url("${MOCK_USER.avatar}")` }}
          />
          <button className="absolute bottom-1 right-1 bg-primary text-background-dark size-8 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
        </div>
        
        <h2 className="text-2xl font-bold text-white">{MOCK_USER.name}</h2>
        <p className="text-gray-400 text-sm mt-1">Membro desde {MOCK_USER.joinYear}</p>
        
        <div className="mt-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base">verified</span>
          <span className="text-primary text-[10px] font-bold uppercase tracking-widest">{MOCK_USER.plan} PLAN</span>
        </div>

        <div className="w-full mt-10 space-y-8">
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg px-1">Informações Pessoais</h3>
            <div className="space-y-4">
               <div className="space-y-2">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest ml-1">Nome Completo</p>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">person</span>
                    <input disabled className="w-full bg-surface-dark border-white/5 rounded-2xl h-14 pl-12 pr-4 text-white font-medium" value={MOCK_USER.name} />
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest ml-1">Email</p>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">mail</span>
                    <input disabled className="w-full bg-surface-dark border-white/5 rounded-2xl h-14 pl-12 pr-4 text-white font-medium" value={MOCK_USER.email} />
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg px-1">Plano & Assinatura</h3>
            <div className="bg-gradient-to-br from-surface-dark to-surface-darker p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 size-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Seu Plano</p>
                   <h4 className="text-2xl font-bold text-white">Elite Pro</h4>
                 </div>
                 <div className="bg-primary text-background-dark text-[10px] font-black px-3 py-1 rounded-full uppercase">Ativo</div>
              </div>
              <button 
                onClick={onUpgrade}
                className="w-full bg-background-dark/50 border border-white/10 text-white h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-background-dark/80 transition-all"
              >
                Gerenciar Assinatura
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg px-1">Preferências</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-surface-dark rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <span className="material-symbols-outlined">notifications</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Notificações Push</p>
                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">Alertas de apostas</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                  <div className="absolute right-1 top-1 size-4 bg-background-dark rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-dark rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <span className="material-symbols-outlined">percent</span>
                  </div>
                  <p className="text-white font-bold text-sm">Formato de Odds</p>
                </div>
                <span className="text-primary font-bold text-xs">Decimal (2.50)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
             <button className="w-full bg-primary text-background-dark font-bold h-14 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-all">
               Salvar Alterações
             </button>
             <button onClick={onLogout} className="w-full text-red-400/80 font-bold py-3 text-sm hover:text-red-400 transition-colors">
               Sair da Conta
             </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
