/**
 * Criar usuário admin no Supabase via API
 * Execute: node create-admin.cjs
 */

const https = require('https');

const SUPABASE_URL = 'https://nnbvmbjqlmuwlovlqgzh.supabase.co';
const SERVICE_KEY = 'sb_secret_q1PweAuWb9b27iEp0zG3JA_yjM4AuQl';

const adminEmail = 'admin@betsniper.com';
const adminPassword = 'BetSniper2024!@#';

const data = JSON.stringify({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
        role: 'admin',
        name: 'Administrador BetSniper'
    }
});

const options = {
    hostname: 'nnbvmbjqlmuwlovlqgzh.supabase.co',
    path: '/auth/v1/admin/users',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🔄 Criando usuário admin no Supabase...\n');

const req = https.request(options, (res) => {
    let body = '';
    
    res.on('data', (chunk) => {
        body += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(body);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log('✅ USUÁRIO ADMIN CRIADO COM SUCESSO!');
                console.log('\n📧 Email:', result.email || adminEmail);
                console.log('🔑 ID:', result.id);
                console.log('\n═══════════════════════════════════════');
                console.log('CREDENCIAIS DE ACESSO AO SISTEMA:');
                console.log('═══════════════════════════════════════');
                console.log('Email:  admin@betsniper.com');
                console.log('Senha:  BetSniper2024!@#');
                console.log('═══════════════════════════════════════\n');
            } else {
                if (body.includes('already_exists') || body.includes('already exists')) {
                    console.log('⚠️  O usuário admin já existe!');
                    console.log('\n═══════════════════════════════════════');
                    console.log('CREDENCIAIS DE ACESSO AO SISTEMA:');
                    console.log('═══════════════════════════════════════');
                    console.log('Email:  admin@betsniper.com');
                    console.log('Senha:  BetSniper2024!@#');
                    console.log('═══════════════════════════════════════\n');
                } else {
                    console.log('❌ Erro:', body);
                }
            }
        } catch (e) {
            console.log('❌ Erro ao processar resposta:', body);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Erro de conexão:', error.message);
});

req.write(data);
req.end();
