import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

/**
 * Root Controller handling top-level API welcoming health endpoints.
 */
@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Welcoming health check endpoint under global prefix api/v1.
   *
   * @returns Welcoming string message
   */
  @Get()
  @ApiOperation({ summary: 'API Root Welcoming Health Endpoint' })
  getHello(): string {
    return this.appService.getHello();
  }
}
