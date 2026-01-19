/**
 * Supabase Edge Function: Enviar Notificação Push
 * Envia notificações via OneSignal
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.28.0';

// Configurações
const ONE_SIGNAL_APP_ID = Deno.env.get('ONE_SIGNAL_APP_ID')!;
const ONE_SIGNAL_API_KEY = Deno.env.get('ONE_SIGNAL_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

interface PushRequest {
  userId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  // Apenas método POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { userId, title, message, data }: PushRequest = await req.json();
    
    // Criar cliente Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Buscar OneSignal ID do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onesignal_id')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile?.onesignal_id) {
      console.error('❌ Usuário não tem OneSignal ID:', userId);
      return new Response(
        JSON.stringify({ success: false, error: 'User not subscribed to push' }),
        { status: 400 }
      );
    }
    
    console.log(`📱 Enviando push para OneSignal ID: ${profile.onesignal_id}`);
    console.log(`📰 Título: ${title}`);
    console.log(`💬 Mensagem: ${message}`);
    
    // Enviar via OneSignal API
    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(ONE_SIGNAL_API_KEY + ':')}`
      },
      body: JSON.stringify({
        app_id: ONE_SIGNAL_APP_ID,
        include_player_ids: [profile.onesignal_id],
        headings: { en: title },
        contents: { en: message },
        data: data || {},
        chrome_web_image: `${SUPABASE_URL.replace('https://', 'https://')}/icon-192.png`
      })
    });
    
    if (!oneSignalResponse.ok) {
      const errorText = await oneSignalResponse.text();
      console.error('❌ Erro OneSignal:', errorText);
      throw new Error(`OneSignal error: ${errorText}`);
    }
    
    const result = await oneSignalResponse.json();
    console.log('✅ Push enviado:', result);
    
    return new Response(
      JSON.stringify({ success: true, notificationId: result.id }),
      { status: 200 }
    );
    
  } catch (error) {
    console.error('❌ Erro ao enviar push:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
});
