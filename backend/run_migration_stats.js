import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    console.log('🚀 Iniciando migração de Stats...');
    
    const db = initDatabase();
    
    try {
        const sqlPath = path.join(__dirname, 'migration_stats.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Lendo arquivo SQL...');
        await db.query(sql);
        
        console.log('✅ Migração de Stats executada com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
    } finally {
        await db.close();
    }
}

runMigration();
