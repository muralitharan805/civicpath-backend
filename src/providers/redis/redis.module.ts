import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis.provider';
import { RedisService } from './redis.service';
import { RedisCacheInterceptor } from './redis-cache.interceptor';

@Global()
@Module({
  providers: [RedisProvider, RedisService, RedisCacheInterceptor],
  exports: [RedisService, RedisProvider, RedisCacheInterceptor],
})
export class RedisModule {}
