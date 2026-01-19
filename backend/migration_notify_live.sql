-- =======================================================
-- MIGRAÇÃO: TRIGGER PARA NOTIFICAR JOGOS AO VIVO
-- =======================================================

-- Função para notificar via Edge Function quando jogo entra ao vivo
CREATE OR REPLACE FUNCTION notify_match_live()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status mudou para LIVE e antes não era LIVE
  IF (TG_OP = 'UPDATE' AND OLD.status != 'LIVE' AND NEW.status = 'LIVE') THEN
    -- Chamar Edge Function via HTTP POST
    PERFORM http_post(
      'https://nnbvmbjqlmuwlovlqgzh.supabase.co/functions/v1/send-push',
      json_build_object(
        'userId', 'system',
        'title', '🔥 Jogo ao vivo!',
        'message', NEW.home_team || 'Mandante' || ' vs ' || NEW.away_team || 'Visitante',
        'data', json_build_object(
          'matchId', NEW.id,
          'league', NEW.league,
          'homeTeam', NEW.home_team,
          'awayTeam', NEW.away_team
        )
      )::text
    );
    
    RAISE NOTICE 'Jogo ao vivo notificado: % vs %', NEW.home_team, NEW.away_team;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_notify_match_live ON matches;
CREATE TRIGGER trigger_notify_match_live
AFTER UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION notify_match_live();
