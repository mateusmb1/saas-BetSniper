import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
    try {
        // Buscar jogos ao vivo
        const { data: liveMatches, error } = await supabase
            .from("matches")
            .select("*")
            .eq("is_live", true);

        if (error) {
            throw new Error(`Erro ao buscar jogos ao vivo: ${error.message}`);
        }

        const updatedMatches: any[] = [];

        for (const match of liveMatches || []) {
            try {
                // Simular atualização de placar
                const homeScore = match.home_score + Math.floor(Math.random() * 2);
                const awayScore = match.away_score + Math.floor(Math.random() * 2);

                updatedMatches.push({
                    ...match,
                    home_score: homeScore,
                    away_score: awayScore,
                    updated_at: new Date().toISOString()
                });
            } catch (e) {
                console.error(`Erro ao atualizar jogo ${match.id}:`, e);
                updatedMatches.push(match);
            }
        }

        if (updatedMatches.length > 0) {
            const { error: updateError } = await supabase
                .from("matches")
                .upsert(updatedMatches);

            if (updateError) {
                throw new Error(`Erro ao salvar atualizações: ${updateError.message}`);
            }
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
