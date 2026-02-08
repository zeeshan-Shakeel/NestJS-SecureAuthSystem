import 'dotenv/config';
import fs from 'fs';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    try {
        const sql = fs.readFileSync('src/database/schema.sql', 'utf8');
        await pool.query(sql);
        console.log('✅ Schema created successfully');
    } catch (error) {
        console.error('❌ Error creating schema:', error);
    } finally {
        await pool.end();
    }
}

main();
