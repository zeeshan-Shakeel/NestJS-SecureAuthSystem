import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import pg from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private pool: pg.Pool;
    private readonly logger = new Logger(DatabaseService.name);

    constructor() {
        this.pool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    async onModuleInit() {
        try {
            await this.pool.query('SELECT 1');
            this.logger.log('✅ Database connected successfully');
        } catch (error) {
            this.logger.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.pool.end();
        this.logger.log('🔌 Database disconnected');
    }

    async query(text: string, params?: any[]) {
        return this.pool.query(text, params);
    }
}
