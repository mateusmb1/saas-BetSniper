/**
 * Gemini AI Service - Google Generative AI para Análise de Jogos
 * Integração com API Gemini 2.5 Pro
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configurar modelo
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    maxOutputTokens: 1024,
  }
});

export class GeminiService {
  /**
   * Analisa um jogo de futebol usando Gemini AI
   * @param {Object} match - Dados do jogo
   * @returns {Promise<Object>} Resultado da análise em formato JSON
   */
  async analyzeMatch(match) {
    const prompt = `Analise este jogo de futebol como especialista em apostas esportivas:

📊 DADOS DO JOGO:
Liga: ${match.league}
Mandante: ${match.home_team}
Visitante: ${match.away_team}
Data: ${match.date}
Média de Gols: ${match.media_gols || 'N/A'}
Fator Casa/Fora: ${match.forca_casa}/${match.forca_fora || 'N/A'}
Status: ${match.status}

🎯 CONSIDERE OS SEGUINTES FATORES:
1. Média de gols recentes dos times
2. Fator casa/fora (mandante tem vantagem de ~60%)
3. Forma recente dos times (últimos 5 jogos)
4. Ranking das equipes
5. Histórico H2H (head-to-head) se disponível
6. Lesões/suspensões (se houver dados)

📋 RETORNE APENAS um JSON válido com esta estrutura EXATA:
{
  "predicted_outcome": "HOME|DRAW|AWAY",
  "confidence_score": 0-100,
  "recommended_market": "ex: Over 2.5 Goals",
  "key_factors": ["fator1", "fator2", "fator3"],
  "reasoning": "explicação curta (2-3 frases)"
}

⚠️ IMPORTANTE: NÃO retorne texto fora do JSON. Apenas o JSON.`;

    try {
      // Gerar conteúdo
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Limpar JSON de marcadores de código (```json ... ```)
      const cleanJson = text.replace(/```json\n?|\n?```/g, '');
      
      // Fazer parse do JSON
      const analysisResult = JSON.parse(cleanJson);
      
      console.log('✅ Análise Gemini bem-sucedida:', analysisResult);
      return analysisResult;
      
    } catch (error) {
      console.error('❌ Erro na análise Gemini:', error);
      
      // Retornar resultado fallback em caso de erro
      return {
        predicted_outcome: 'UNKNOWN',
        confidence_score: 50,
        recommended_market: match.media_gols && match.media_gols > 2.5 ? 'Over 2.5' : 'Home Win',
        key_factors: [],
        reasoning: 'Análise IA indisponível devido a erro na API'
      };
    }
  }

  /**
   * Analisa múltiplos jogos em batch (para cron jobs)
   * @param {Array} matches - Lista de jogos
   * @returns {Promise<Array>} Lista de análises
   */
  async analyzeBatch(matches) {
    const results = [];
    
    for (const match of matches) {
      const analysis = await this.analyzeMatch(match);
      results.push(analysis);
      
      // Delay para não exceder rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }
}
