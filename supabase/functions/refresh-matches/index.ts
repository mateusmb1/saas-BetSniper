import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface Match {
    id?: string;
    external_id: string;
    league: string;
    home_team: string;
    away_team: string;
    date: string;
    time: string;
    status: string;
    home_odds?: number;
    draw_odds?: number;
    away_odds?: number;
    prediction?: string;
    confidence_score?: number;
    analysis?: string;
}

serve(async (req: Request) => {
    try {
        const { matchIds } = await req.json();

        // Buscar jogos do banco
        let query = supabase.from("matches").select("*");

        if (matchIds && matchIds.length > 0) {
            query = query.in("id", matchIds);
        } else {
            // Jogos de hoje e amanhã
            const today = new Date().toISOString().split("T")[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
            query = query.or(`date.eq.${today},date.eq.${tomorrow}`);
        }

        const { data: matches, error } = await query;

        if (error) {
            throw new Error(`Erro ao buscar jogos: ${error.message}`);
        }

        // Atualizarodds e status de jogos ao vivo
        const updatedMatches: Match[] = [];

        for (const match of matches || []) {
            try {
                // Simular atualização de odds (em produção, chamar APIs externas)
                const updatedMatch = await updateMatchOdds(match);
                updatedMatches.push(updatedMatch);
            } catch (e) {
                console.error(`Erro ao atualizar jogo ${match.id}:`, e);
                updatedMatches.push(match);
            }
        }

        // Salvar atualizações no banco
        const { error: updateError } = await supabase
            .from("matches")
            .upsert(updatedMatches.map(m => ({
                ...m,
                updated_at: new Date().toISOString()
            })));

        if (updateError) {
            throw new Error(`Erro ao salvar atualizações: ${updateError.message}`);
        }

        return new Response(
            JSON.stringify({
                success: true,
                matches: updatedMatches,
                count: updatedMatches.length
            }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});

async function updateMatchOdds(match: any): Promise<Match> {
    // Em produção, aqui você chamaria APIs como ESPN, Flashscore, etc.
    // Por enquanto, vamos simular com valores aleatórios

    const homeWinProb = 0.45 + Math.random() * 0.1;
    const drawProb = 0.25 + Math.random() * 0.1;
    const awayWinProb = 0.30 + Math.random() * 0.1;

    const homeOdds = Number((1 / homeWinProb).toFixed(2));
    const drawOdds = Number((1 / drawProb).toFixed(2));
    const awayOdds = Number((1 / awayWinProb).toFixed(2));

    // Gerar previsão baseada em odds
    let prediction = "Over 2.5";
    let confidence = 60 + Math.floor(Math.random() * 25);

    if (homeOdds < awayOdds && homeOdds < drawOdds) {
        prediction = match.home_team;
    } else if (awayOdds < homeOdds && awayOdds < drawOdds) {
        prediction = match.away_team;
    } else {
        prediction = "Draw";
    }

    return {
        id: match.id,
        external_id: match.external_id,
        league: match.league,
        home_team: match.home_team,
        away_team: match.away_team,
        date: match.date,
        time: match.time,
        status: match.status,
        home_odds: homeOdds,
        draw_odds: drawOdds,
        away_odds: awayOdds,
        prediction,
        confidence_score: confidence,
        analysis: `Análise gerada automaticamente. Casa: ${homeOdds}, Empate: ${drawOdds}, Fora: ${awayOdds}`
    };
}
