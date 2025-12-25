import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        console.log('BODY:', JSON.stringify(json, null, 2));
        if (json.database === 'connected') {
            console.log('✅ Validação Técnica: Backend e Banco de Dados ONLINE');
            process.exit(0);
        } else {
            console.error('❌ Validação Técnica: Falha na conexão com Banco');
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ Validação Técnica: Resposta inválida', data);
        process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Validação Técnica: Erro na requisição - ${e.message}`);
  process.exit(1);
});

req.end();
