import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async onApplicationShutdown(signal?: string) {
    console.log(`Application shutting down (${signal}), closing Redis connection.`);
    await this.redisClient.quit();
  }

  async set(key: string, value: any, ttlInSeconds?: number): Promise<'OK'> {
    const serializedValue = JSON.stringify(value);
    if (ttlInSeconds) {
      return this.redisClient.set(key, serializedValue, 'EX', ttlInSeconds);
    }
    return this.redisClient.set(key, serializedValue);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error('Failed to parse JSON from Redis', e);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}
