import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { MOCK_USER } from '../constants';

interface ProfileProps {
  onBack: () => void;
  onLogout: () => void;
  onUpgrade?: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  plano: 'free' | 'pro' | 'elite';
  region: string;
  currency: string;
  created_at: string;
  onesignal_id?: string;
}

const Profile: React.FC<ProfileProps> = ({ onBack, onLogout, onUpgrade }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Erro ao buscar perfil:', error);
          } else if (profile) {
            setUserProfile(profile);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  const displayUser = userProfile || MOCK_USER;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-gray-400 hover:text-white transition-colors"
        >
          ← Voltar
        </button>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold">
                {displayUser.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{displayUser.email}</h2>
            <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
              displayUser.plano === 'elite' ? 'bg-purple-600 text-purple-100' :
              displayUser.plano === 'pro' ? 'bg-blue-600 text-blue-100' :
              'bg-gray-600 text-gray-100'
            }`}>
              {displayUser.plano.toUpperCase()}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Região</div>
              <div className="text-lg font-medium">{displayUser.region}</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Moeda</div>
              <div className="text-lg font-medium">{displayUser.currency}</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400">Membro desde</div>
              <div className="text-lg font-medium">
                {new Date(displayUser.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>

            {displayUser.plano === 'free' && onUpgrade && (
              <button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                ⬆️ Fazer Upgrade
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
