import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { AssemblyConstituencyService } from './assembly-constituency.service';

@Controller('assembly-constituencies')
export class AssemblyConstituencyController {
  constructor(
    private readonly assemblyConstituencyService: AssemblyConstituencyService,
  ) {}

  @Get('count')
  async getCount(): Promise<{ count: number }> {
    const count = await this.assemblyConstituencyService.count();
    return { count };
  }

  @Get()
  async getConstituencies(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any[]> {
    return this.assemblyConstituencyService.findMany(limit);
  }

  @Get('near')
  async getNearCoordinates(
    @Query('lon') longitude?: string,
    @Query('lat') latitude?: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number = 5,
  ): Promise<any[]> {
    if (!longitude || !latitude) {
      throw new BadRequestException(
        'Both "lon" and "lat" query parameters are required.',
      );
    }

    const lonNum = parseFloat(longitude);
    const latNum = parseFloat(latitude);

    if (isNaN(lonNum) || isNaN(latNum)) {
      throw new BadRequestException(
        'Invalid coordinates provided. Must be valid decimal numbers.',
      );
    }

    return this.assemblyConstituencyService.findNearCoordinate(
      lonNum,
      latNum,
      limit,
    );
  }
}
