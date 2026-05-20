import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from './redis.service';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // We only cache GET and POST requests
    if (request.method !== 'GET' && request.method !== 'POST') {
      return next.handle();
    }

    // Base cache key from URL
    let cacheKey = `civicpath:cache:${request.method}:${request.url}`;

    // If it's a POST request (like the /inside boundary query), we MUST include the body in the cache key
    // Otherwise, different coordinates will return the same cached result!
    if (request.method === 'POST' && request.body && Object.keys(request.body).length > 0) {
      cacheKey += `:${JSON.stringify(request.body)}`;
    }

    // Check if we have a cached response
    const cachedResponse = await this.redisService.get<any>(cacheKey);
    if (cachedResponse) {
      console.log(`[Redis Interceptor] Cache HIT for key: ${cacheKey}`);
      return of(cachedResponse);
    }

    console.log(`[Redis Interceptor] Cache MISS for key: ${cacheKey}. Processing request...`);

    // If no cache, process the route handler and then save the result to Redis
    return next.handle().pipe(
      tap(async (response) => {
        // Cache the result for 60 seconds (you can adjust this as needed)
        await this.redisService.set(cacheKey, response, 60);
      }),
    );
  }
}
