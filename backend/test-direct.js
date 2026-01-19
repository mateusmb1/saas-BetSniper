/**
 * Teste direto do endpoint Flashscore
 * Para verificar se conseguimos acessar os dados
 */

async function testFlashscoreAccess() {
    console.log('🧪 Testando acesso ao Flashscore...\n');

    const url = 'https://d.flashscore.com/x/feed/f_1_0_pt_1';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Fsign': 'SW9D1eZo',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Referer': 'https://www.flashscore.pt/'
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}\n`);

        const text = await response.text();
        console.log(`Tamanho da resposta: ${text.length} caracteres`);
        console.log(`Primeiros 500 caracteres:\n${text.substring(0, 500)}\n`);

        if (text.length > 0 && text.includes('¬')) {
            console.log('✅ Dados do Flashscore recebidos com sucesso!');
        } else if (text.length === 0) {
            console.log('⚠️  Resposta vazia - possível bloqueio');
        } else {
            console.log('⚠️  Formato inesperado - pode ser página de erro');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('\n💡 Possíveis causas:');
        console.error('   - CORS bloqueado pelo Flashscore');
        console.error('   - Firewall ou antivírus bloqueando requests');
        console.error('   - Flashscore detectou que não é um browser');
        console.error('\n🔧 Solução: Usar Puppeteer (browser headless)');
    }
}

testFlashscoreAccess();
