import { DataSource, DataSourceOptions } from 'typeorm';
import { createLogger } from '@erp/utils';

const logger = createLogger('DatabaseConfig');

export const createDatabaseConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'erp_user',
  password: process.env.DB_PASSWORD || 'erp_password',
  database: process.env.DB_NAME || 'erp_db',
  schema: process.env.DB_SCHEMA || 'crm',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  synchronize: process.env.NODE_ENV === 'development',
  migrationsRun: process.env.NODE_ENV !== 'development',
  entities: [__dirname + '/../models/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
  subscribers: [__dirname + '/../subscribers/**/*{.ts,.js}'],
  cache: {
    type: 'redis',
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '1', 10),
    },
    duration: 30000, // 30 seconds default cache
  },
  poolSize: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

export class DatabaseService {
  private static instance: DatabaseService;
  private dataSource: DataSource;

  private constructor() {
    const config = createDatabaseConfig();
    this.dataSource = new DataSource(config);
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        logger.info('Database connection established successfully');
      }
    } catch (error) {
      logger.error('Failed to connect to database', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        logger.info('Database connection closed');
      }
    } catch (error) {
      logger.error('Error closing database connection', { error });
      throw error;
    }
  }

  getDataSource(): DataSource {
    if (!this.dataSource.isInitialized) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.dataSource;
  }

  async runMigrations(): Promise<void> {
    try {
      await this.dataSource.runMigrations();
      logger.info('Database migrations completed successfully');
    } catch (error) {
      logger.error('Failed to run database migrations', { error });
      throw error;
    }
  }

  async revertMigrations(): Promise<void> {
    try {
      await this.dataSource.undoLastMigration();
      logger.info('Last database migration reverted successfully');
    } catch (error) {
      logger.error('Failed to revert database migration', { error });
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      if (!this.dataSource.isInitialized) {
        return false;
      }
      
      const result = await this.dataSource.query('SELECT 1 as connected');
      return result.length > 0 && result[0].connected === 1;
    } catch (error) {
      logger.error('Database connection check failed', { error });
      return false;
    }
  }
}
