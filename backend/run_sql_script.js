import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSql() {
    const sqlFile = process.argv[2];
    if (!sqlFile) {
        console.error('Usage: node run_sql_script.js <filename.sql>');
        process.exit(1);
    }

    console.log(`🚀 Executing SQL from ${sqlFile}...`);
    
    const db = initDatabase();
    
    try {
        const sqlPath = path.join(__dirname, sqlFile);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Reading SQL file...');
        await db.query(sql);
        
        console.log('✅ SQL executed successfully!');
    } catch (error) {
        console.error('❌ Error executing SQL:', error);
    } finally {
        await db.close();
    }
}

runSql();
