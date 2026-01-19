
import React from 'react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onBack: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkRead, onMarkAllRead, onBack }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 pt-8 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Notificações</h1>
        <button 
          onClick={onMarkAllRead}
          className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-primary"
        >
          <span className="material-symbols-outlined">done_all</span>
        </button>
      </header>

      <main className="flex-1 p-4 space-y-6 pt-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
             <span className="material-symbols-outlined text-5xl mb-3">notifications_off</span>
             <p className="font-medium">Tudo limpo por aqui!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => onMarkRead(n.id)}
                className={`relative group p-4 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer ${n.unread ? 'bg-surface-dark border-primary/20 shadow-lg shadow-primary/5' : 'bg-surface-dark/40 border-white/5 opacity-70'}`}
              >
                {n.unread && <div className="absolute top-4 right-4 size-2 bg-primary rounded-full shadow-[0_0_8px_#2bee79]" />}
                <div className="flex gap-4">
                  <div className={`size-12 shrink-0 flex items-center justify-center rounded-full ${n.type === 'WIN' ? 'bg-primary/20 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: n.unread ? "'FILL' 1" : "'FILL' 0" }}>
                      {n.type === 'WIN' ? 'check_circle' : 'smart_toy'}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <p className={`font-bold text-base leading-tight ${n.unread ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                      <span className="text-gray-600 text-[10px] font-bold ml-2 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className={`text-sm leading-normal ${n.unread ? 'text-gray-300' : 'text-gray-500'}`}>{n.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="p-4 text-center">
         <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
           As notificações são limpas automaticamente após 7 dias
         </p>
      </footer>
    </div>
  );
};

export default Notifications;
