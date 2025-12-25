import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { supabase } from '../services/supabase';

interface PlansProps {
  onBack: () => void;
}

interface PlanConfig {
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
  color: string;
}

const Plans: React.FC<PlansProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('EU');
  const [currency, setCurrency] = useState('EUR');

  useEffect(() => {
    async function loadConfig() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const config = await apiClient.getUserConfig(user?.id);
        setRegion(config.region);
        setCurrency(config.currency);
      } catch (e) {
        console.error('Erro ao carregar config de planos:', e);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const getPlans = (): PlanConfig[] => {
    if (currency === 'BRL') {
      return [
        {
          name: 'Free',
          price: 'R$ 0',
          period: 'sempre',
          features: ['3 sugestões/dia', 'Estatísticas básicas', 'Com anúncios'],
          color: 'gray'
        },
        {
          name: 'Pro',
          price: 'R$ 29,90',
          period: 'mês',
          features: ['Sugestões Ilimitadas', 'Simulador de Odds', 'Sem anúncios', 'Suporte Email'],
          recommended: true,
          color: 'primary'
        },
        {
          name: 'Elite',
          price: 'R$ 59,90',
          period: 'mês',
          features: ['Tudo do Pro', 'IA Avançada (Deep)', 'Alertas Telegram', 'Suporte WhatsApp'],
          color: 'purple'
        }
      ];
    } else {
      // Europe / Global
      return [
        {
          name: 'Free',
          price: '€ 0',
          period: 'forever',
          features: ['3 tips/day', 'Basic stats', 'Ads supported'],
          color: 'gray'
        },
        {
          name: 'Pro',
          price: '€ 9,90',
          period: 'month',
          features: ['Unlimited Tips', 'Odds Simulator', 'No Ads', 'Email Support'],
          recommended: true,
          color: 'primary'
        },
        {
          name: 'Elite',
          price: '€ 19,90',
          period: 'month',
          features: ['All Pro features', 'Deep AI Analysis', 'Telegram Alerts', 'Priority Support'],
          color: 'purple'
        }
      ];
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center bg-background-dark text-white">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">Carregando ofertas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-dark p-6 pb-24">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-dark border border-white/5 text-gray-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="ml-4">
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">Planos & Preços</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Região detectada: {region}</p>
        </div>
      </div>

      <div className="space-y-6">
        {getPlans().map((plan, index) => (
          <div 
            key={index} 
            className={`relative p-6 rounded-3xl border ${plan.recommended ? 'border-primary bg-primary/5' : 'border-white/5 bg-surface-dark'} transition-all hover:scale-[1.02]`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-lg shadow-primary/20">
                Mais Popular
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-lg font-black uppercase tracking-tight ${plan.color === 'purple' ? 'text-purple-400' : (plan.recommended ? 'text-primary' : 'text-white')}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline mt-1">
                  <span className="text-3xl font-black text-white tracking-tighter">{plan.price}</span>
                  <span className="ml-1 text-xs font-bold text-gray-500 uppercase">/{plan.period}</span>
                </div>
              </div>
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${plan.recommended ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'}`}>
                <span className="material-symbols-outlined">{plan.name === 'Elite' ? 'diamond' : (plan.name === 'Pro' ? 'verified' : 'person')}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-sm font-medium text-gray-300">
                  <span className={`material-symbols-outlined text-[16px] mr-2 ${plan.recommended ? 'text-primary' : 'text-gray-500'}`}>check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
              plan.recommended 
                ? 'bg-primary text-background-dark hover:bg-primary/90 shadow-lg shadow-primary/10' 
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}>
              {plan.price.includes('0') ? 'Começar Grátis' : 'Assinar Agora'}
            </button>
          </div>
        ))}
      </div>
      
      <p className="mt-6 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
        Pagamento processado de forma segura.<br/>
        Cancele a qualquer momento.
      </p>
    </div>
  );
};

export default Plans;
