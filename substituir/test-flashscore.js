/**
 * Teste Prático: Validação dos Endpoints Flashscore
 * 
 * Este script testa se conseguimos acessar os endpoints XHR do Flashscore
 * e parsear os dados conforme documentado em "✅ Análise Completa Endpoints XHR do.txt"
 */

// Função para parsear o formato proprietário do Flashscore
function parseFlashscoreData(rawText) {
  console.log('\n📊 Parseando dados do Flashscore...\n');
  
  // Remove caracteres especiais de ofuscação
  const cleaned = rawText
    .replace(/¬/g, '\n')  // Separador de campo
    .replace(/÷/g, ':')   // Separador chave-valor
    .replace(/~/g, ',');  // Separador de lista
  
  console.log('Dados limpos (primeiros 500 caracteres):');
  console.log(cleaned.substring(0, 500) + '...\n');
  
  // Extrair informações básicas de jogos
  const matches = [];
  const lines = cleaned.split('\n');
  
  let currentMatch = {};
  lines.forEach(line => {
    if (line.startsWith('AA:')) {
      // Novo jogo - salvar anterior se existir
      if (currentMatch.id) matches.push({...currentMatch});
      currentMatch = { id: line.substring(3).trim() };
    } else if (line.startsWith('AE:')) {
      if (!currentMatch.homeTeam) {
        currentMatch.homeTeam = line.substring(3).trim();
      } else {
        currentMatch.awayTeam = line.substring(3).trim();
      }
    } else if (line.startsWith('AD:')) {
      currentMatch.time = line.substring(3).trim();
    } else if (line.startsWith('AG:')) {
      currentMatch.score = line.substring(3).trim();
    }
  });
  
  if (currentMatch.id) matches.push(currentMatch);
  
  return matches;
}

// Teste 1: Feed principal de jogos (Workflow 1)
async function testMainFeed() {
  console.log('=' .repeat(60));
  console.log('🧪 TESTE 1: Feed Principal de Jogos do Dia');
  console.log('=' .repeat(60));
  console.log('Endpoint: https://d.flashscore.com/x/feed/f_1_0_pt_1\n');
  
  try {
    const response = await fetch('https://d.flashscore.com/x/feed/f_1_0_pt_1', {
      method: 'GET',
      headers: {
        'X-Fsign': 'SW9D1eZo',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.flashscore.pt/'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Erro HTTP: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const rawData = await response.text();
    console.log(`✅ Resposta recebida: ${rawData.length} caracteres`);
    console.log(`\nDados brutos (primeiros 200 caracteres):`);
    console.log(rawData.substring(0, 200) + '...\n');
    
    // Parsear dados
    const matches = parseFlashscoreData(rawData);
    console.log(`\n🎯 Jogos encontrados: ${matches.length}\n`);
    
    // Mostrar primeiros 3 jogos
    matches.slice(0, 3).forEach((match, idx) => {
      console.log(`${idx + 1}. ${match.homeTeam || '???'} vs ${match.awayTeam || '???'}`);
      console.log(`   ID: ${match.id}`);
      console.log(`   Horário: ${match.time || 'N/A'}`);
      console.log(`   Placar: ${match.score || 'Não iniciado'}\n`);
    });
    
    return matches;
    
  } catch (error) {
    console.log(`❌ Erro ao buscar dados: ${error.message}`);
    if (error.cause) console.log(`   Causa: ${error.cause}`);
    return null;
  }
}

// Teste 2: Detalhes de um jogo específico (Workflow 2)
async function testMatchDetails(matchId) {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTE 2: Detalhes de Jogo Específico');
  console.log('='.repeat(60));
  console.log(`Match ID: ${matchId}`);
  console.log(`Endpoint: https://d.flashscore.com/x/feed/df_st_1_${matchId}\n`);
  
  try {
    const response = await fetch(`https://d.flashscore.com/x/feed/df_st_1_${matchId}`, {
      method: 'GET',
      headers: {
        'X-Fsign': 'SW9D1eZo',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.flashscore.pt/'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Erro HTTP: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const rawData = await response.text();
    console.log(`✅ Resposta recebida: ${rawData.length} caracteres`);
    
    // Buscar placar e minuto
    const scoreMatch = rawData.match(/AG÷([0-9]+[\s\-]+[0-9]+)/);
    const minuteMatch = rawData.match(/TM÷([0-9]+)/);
    
    console.log('\n📋 Informações extraídas:');
    console.log(`   Placar: ${scoreMatch ? scoreMatch[1] : 'N/A'}`);
    console.log(`   Minuto: ${minuteMatch ? minuteMatch[1] + "'" : 'N/A'}`);
    
    return { score: scoreMatch?.[1], minute: minuteMatch?.[1] };
    
  } catch (error) {
    console.log(`❌ Erro ao buscar detalhes: ${error.message}`);
    return null;
  }
}

// Executar testes
async function runAllTests() {
  console.log('\n');
  console.log('🚀 INICIANDO VALIDAÇÃO DE INTEGRAÇÃO FLASHSCORE');
  console.log('='.repeat(60));
  console.log('Data/Hora:', new Date().toLocaleString('pt-PT'));
  console.log('='.repeat(60) + '\n');
  
  // Teste 1
  const matches = await testMainFeed();
  
  // Teste 2 - usar primeiro match encontrado
  if (matches && matches.length > 0 && matches[0].id) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay entre requests
    await testMatchDetails(matches[0].id);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ VALIDAÇÃO CONCLUÍDA');
  console.log('='.repeat(60));
  console.log('\n📝 CONCLUSÕES:');
  console.log('   - Se viu dados reais acima: ✅ API está acessível');
  console.log('   - Se viu erros 403/401: ❌ Headers ou X-Fsign incorretos');
  console.log('   - Se viu erro de rede: ⚠️  Possível bloqueio CORS ou firewall\n');
  console.log('💡 PRÓXIMOS PASSOS:');
  console.log('   1. Se funcionou: implementar backend com esses endpoints');
  console.log('   2. Se falhou: investigar alternativas (proxy, Puppeteer, etc.)\n');
}

// Executar
runAllTests().catch(console.error);
