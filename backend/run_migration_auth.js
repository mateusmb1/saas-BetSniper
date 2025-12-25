import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    console.log('🚀 Iniciando migração de Auth e Planos...');
    
    const db = initDatabase();
    
    try {
        const sqlPath = path.join(__dirname, 'migration_auth_plans.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Lendo arquivo SQL...');
        
        // Supabase/Postgres suporta executar script inteiro se separado corretamente.
        // Vamos tentar executar bloco a bloco ou tudo de uma vez.
        // Como o pg driver pode reclamar de múltiplos comandos se não configurado,
        // vamos tentar executar tudo.
        
        await db.query(sql);
        
        console.log('✅ Migração executada com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
    }
    
    // Encerrar processo (necessário pois o pool pode manter aberto)
    process.exit(0);
}

runMigration();
