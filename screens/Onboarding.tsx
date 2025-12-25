
import React, { useState } from 'react';

interface Step {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: string;
}

const STEPS: Step[] = [
  {
    title: 'Apostas',
    subtitle: 'Inteligentes',
    description: 'Sua central de dados para apostas esportivas. Potencialize seus ganhos com informações precisas.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWo8zTCQrTSb9-xBEM2h0Cv6Um9g3Yge9ZYdy5XqnrTwgZk0tawwEQGC_D3Iqb--v58gJ5APfKf4gC8a-s9_fGq1KvUC_IhsfxstNcRnb-pOg1TOmuPMJRgU6O274JygaAakMyWeTxfxA2qKFqZTvsGjhj4lg1B2tUsjC6ijzREYNELXdA9URnVwCNFyozbA0xRL8zEzIfkQ_bfTGDLogbOaxdUs0evE3KE9zGVvlSu6nPNqXgTGW7jqyOkcCTGObnu-G--sg8Mj1s',
    icon: 'psychology'
  },
  {
    title: 'Domine os',
    subtitle: 'Jogos do Dia',
    description: 'Visualize todas as partidas de hoje, acompanhe o status ao vivo e receba sugestões exclusivas.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_lVSI-BWifdot1di4jnLhlnZZlph8K-yLhsUfWkKu5zwRjnHtERODUH-3bkq2E9aoZfcm0zc_HC-BRLblxOdGId0xHYteMbJjgO7C-8vfjJyrIy0EXwtVtKwC5sshzCmw7V2pEe3_u4KfINoGezikwM4BlNRmdYfHRYAD2Y43d7asodpXOEzQGeVKw4bTMWGQFiezGjwdVAETCkgCp1gEPgpTReIwaBDPJ1x0LiJBbbAjb9bFg5_tQXohvFBwUMFagycmAScSJxj4',
    icon: 'dashboard'
  },
  {
    title: 'Aposte com',
    subtitle: 'Confiança',
    description: 'Nossa IA analisa milhares de dados para criar um ranking diário das apostas mais seguras.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWo8zTCQrTSb9-xBEM2h0Cv6Um9g3Yge9ZYdy5XqnrTwgZk0tawwEQGC_D3Iqb--v58gJ5APfKf4gC8a-s9_fGq1KvUC_IhsfxstNcRnb-pOg1TOmuPMJRgU6O274JygaAakMyWeTxfxA2qKFqZTvsGjhj4lg1B2tUsjC6ijzREYNELXdA9URnVwCNFyozbA0xRL8zEzIfkQ_bfTGDLogbOaxdUs0evE3KE9zGVvlSu6nPNqXgTGW7jqyOkcCTGObnu-G--sg8Mj1s',
    icon: 'auto_awesome'
  },
  {
    title: 'Teste antes de',
    subtitle: 'Apostar',
    description: 'Use nosso simulador para validar suas estratégias sem arriscar seu capital real.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_lVSI-BWifdot1di4jnLhlnZZlph8K-yLhsUfWkKu5zwRjnHtERODUH-3bkq2E9aoZfcm0zc_HC-BRLblxOdGId0xHYteMbJjgO7C-8vfjJyrIy0EXwtVtKwC5sshzCmw7V2pEe3_u4KfINoGezikwM4BlNRmdYfHRYAD2Y43d7asodpXOEzQGeVKw4bTMWGQFiezGjwdVAETCkgCp1gEPgpTReIwaBDPJ1x0LiJBbbAjb9bFg5_tQXohvFBwUMFagycmAScSJxj4',
    icon: 'calculate'
  }
];

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      onComplete();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const handleSkip = () => onComplete();
  const handleBack = () => setCurrentStep(s => Math.max(0, s - 1));

  const step = STEPS[currentStep];

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden bg-background-dark text-white">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-20%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[80px] -z-10"></div>

      <header className="flex justify-end p-6 pt-12">
        <button onClick={handleSkip} className="text-gray-500 font-medium hover:text-primary transition-colors">Pular</button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-full max-w-sm aspect-[4/3] bg-surface-dark/50 rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 mb-8">
          <div className="absolute inset-0 bg-center bg-cover opacity-80" style={{ backgroundImage: `url("${step.image}")` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-4xl text-primary">{step.icon}</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold leading-tight mb-4 tracking-tight">
          {step.title} <span className="text-primary">{step.subtitle}</span>
        </h1>
        <p className="text-gray-400 text-base leading-relaxed max-w-[280px]">
          {step.description}
        </p>
      </main>

      <footer className="p-8 w-full flex flex-col gap-6">
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-gray-700'}`}></div>
          ))}
        </div>

        <div className="flex gap-4">
          {currentStep > 0 && (
            <button onClick={handleBack} className="bg-white/5 border border-white/10 text-white font-bold h-14 px-8 rounded-xl hover:bg-white/10 transition-all active:scale-95">
              Voltar
            </button>
          )}
          <button onClick={handleNext} className="flex-1 bg-primary text-background-dark font-bold h-14 rounded-xl shadow-[0_0_20px_rgba(43,238,121,0.2)] hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2">
            {currentStep === STEPS.length - 1 ? 'Começar Agora' : 'Próximo'}
            <span className="material-symbols-outlined font-bold">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
