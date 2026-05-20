import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService) => {
    const host = configService.get<string>('redis.host');
    const port = configService.get<number>('redis.port');
    const password = configService.get<string>('redis.password');
    const db = configService.get<number>('redis.db');
    const keyPrefix = configService.get<string>('redis.keyPrefix');

    const client = new Redis({
      host,
      port,
      password,
      db,
      keyPrefix,
      retryStrategy: (times: number) => {
        // Exponential backoff with a max of 5 seconds
        const delay = Math.min(times * 50, 5000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    client.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    client.on('connect', () => {
      console.log('Successfully connected to Redis');
    });

    return client;
  },
  inject: [ConfigService],
};
