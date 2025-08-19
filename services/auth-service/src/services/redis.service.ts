import Redis from 'ioredis';
import { createLogger } from '@erp/utils';
import { config } from '../config';

export class RedisService {
  private client: Redis;
  private logger = createLogger('RedisService');

  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.logger.info('Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error', { error });
    });

    this.client.on('ready', () => {
      this.logger.info('Redis ready for operations');
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.info('Redis service initialized');
    } catch (error) {
      this.logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.logger.info('Redis disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from Redis', { error });
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error('Failed to set value in Redis', { key, error });
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Failed to get value from Redis', { key, error });
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error('Failed to delete key from Redis', { key, error });
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Failed to check key existence in Redis', { key, error });
      throw error;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.expire(key, ttlSeconds);
    } catch (error) {
      this.logger.error('Failed to set expiration for key in Redis', { key, ttlSeconds, error });
      throw error;
    }
  }

  async setHash(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.hset(key, field, serializedValue);
    } catch (error) {
      this.logger.error('Failed to set hash field in Redis', { key, field, error });
      throw error;
    }
  }

  async getHash<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hget(key, field);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Failed to get hash field from Redis', { key, field, error });
      throw error;
    }
  }

  async getAllHash<T>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.client.hgetall(key);
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value) as T;
      }
      
      return result;
    } catch (error) {
      this.logger.error('Failed to get all hash fields from Redis', { key, error });
      throw error;
    }
  }

  async deleteHash(key: string, field: string): Promise<void> {
    try {
      await this.client.hdel(key, field);
    } catch (error) {
      this.logger.error('Failed to delete hash field from Redis', { key, field, error });
      throw error;
    }
  }

  async getKeys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error('Failed to get keys from Redis', { pattern, error });
      throw error;
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.client.flushall();
      this.logger.info('Redis cache flushed');
    } catch (error) {
      this.logger.error('Failed to flush Redis cache', { error });
      throw error;
    }
  }

  // Session management methods
  async setSession(sessionId: string, sessionData: any, ttlSeconds: number = 3600): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.set(sessionKey, sessionData, ttlSeconds);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    const sessionKey = `session:${sessionId}`;
    return this.get<T>(sessionKey);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.delete(sessionKey);
  }

  async extendSession(sessionId: string, ttlSeconds: number = 3600): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.expire(sessionKey, ttlSeconds);
  }

  // Token blacklist methods
  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    const tokenKey = `blacklist:${token}`;
    await this.set(tokenKey, true, ttlSeconds);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenKey = `blacklist:${token}`;
    return this.exists(tokenKey);
  }
}
