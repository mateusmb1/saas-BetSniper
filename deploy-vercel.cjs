/**
 * Deploy Script para BetSniper no Vercel
 * Execute: node deploy-vercel.cjs
 * 
 * Para fazer deploy, você precisa:
 * 1. Fazer login no Vercel: vercel login
 * 2. Gerar token: https://vercel.com/account/tokens
 * 3. Ou conectar pelo link: https://vercel.com/new/github
 */

const { spawn } = require('child_process');

const commands = [
    {
        name: 'Verificando status do Git...',
        cmd: 'git',
        args: ['status']
    },
    {
        name: 'Verificando último commit...',
        cmd: 'git',
        args: ['log', '-1', '--oneline']
    }
];

async function runCommand(cmd, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(cmd, args, { stdio: 'inherit' });
        process.on('close', (code) => resolve(code));
        process.on('error', reject);
    });
}

async function deploy() {
    console.log('🚀 BETSNIPER - DEPLOY NO VERCEL');
    console.log('='.repeat(50));

    // Verificar se há mudanças não commitadas
    console.log('\n📋 Verificando status do repositório...\n');
    
    try {
        await runCommand('git', ['status']);
        
        console.log('\n📝 INSTRUÇÕES PARA DEPLOY:');
        console.log('═'.repeat(50));
        console.log('');
        console.log('OPÇÃO 1 - Deploy Automático (requer token):');
        console.log('1. Acesse: https://vercel.com/account/tokens');
        console.log('2. Crie um token com nome "BetSniper"');
        console.log('3. Execute: vercel --token=SEU_TOKEN --yes');
        console.log('');
        console.log('OPÇÃO 2 - Deploy Manual (recomendado):');
        console.log('1. Acesse: https://vercel.com/new/github');
        console.log('2. Conecte: github.com/mateusmb1/saas-BetSniper');
        console.log('3. Configure as variáveis de ambiente:');
        console.log('   - VITE_SUPABASE_URL=https://nnbvmbjqlmuwlovlqgzh.supabase.co');
        console.log('   - VITE_SUPABASE_ANON_KEY=sb_publishable_E01-WuLl9XuKe16iHMlPLA_tkEbH5kd');
        console.log('4. Clique em Deploy!');
        console.log('');
        console.log('═'.repeat(50));
        
        console.log('\n✅ REPOSITÓRIO PRONTO PARA DEPLOY!');
        console.log('📁 https://github.com/mateusmb1/saas-BetSniper');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

deploy();
