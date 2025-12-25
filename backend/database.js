import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração da conexão com Supabase/Postgres
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necessário para Supabase
    }
});

export function initDatabase() {
    // Testar conexão
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('❌ Erro ao conectar no Supabase:', err.stack);
        }
        client.query('SELECT NOW()', (err, result) => {
            release();
            if (err) {
                return console.error('❌ Erro ao executar query de teste', err.stack);
            }
            console.log('✅ Conectado ao Supabase/Postgres com sucesso:', result.rows[0]);
        });
    });

    return {
        // Wrapper para queries async
        async query(text, params) {
            return await pool.query(text, params);
        },

        // Helper para fechar conexão
        async close() {
            await pool.end();
        }
    };
}
