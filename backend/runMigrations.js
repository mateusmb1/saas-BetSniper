import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔗 Conectando ao banco de dados...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const migrations = [
  'migration.sql',
  'migration_fix_admin.sql',
  'migration_analysis.sql',
  'migration_onesignal.sql',
];

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('🚀 Iniciando migrações do banco de dados...\n');

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Arquivo não encontrado: ${migrationFile}`);
        continue;
      }

      console.log(`📄 Executando: ${migrationFile}`);
      
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      
      try {
        await client.query(sql);
        console.log(`✅ ${migrationFile} executado com sucesso\n`);
      } catch (error) {
        if (error.code === '42P07' || error.code === '42701') {
          console.log(`⚠️  ${migrationFile} já executado ou objetos já existem\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('✨ Todas as migrações foram executadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante as migrações:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
