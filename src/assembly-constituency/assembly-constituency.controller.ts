import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  AssemblyConstituencyService,
  AssemblyConstituency,
  ParliamentConstituency,
} from './assembly-constituency.service';
import { FindByCoordinatesDto } from './dto/find-by-coordinates.dto';
import { RedisCacheInterceptor } from '../providers/redis/redis-cache.interceptor';

export interface ConstituencyBoundaryResponse {
  assemblyConstituency: AssemblyConstituency | null;
  parliamentConstituency: ParliamentConstituency | null;
}

@ApiTags('assembly-constituencies')
@UseInterceptors(RedisCacheInterceptor)
@Controller('assembly-constituencies')
export class AssemblyConstituencyController {
  constructor(
    private readonly assemblyConstituencyService: AssemblyConstituencyService,
  ) {}

  @ApiOperation({ summary: 'Get total count of assembly constituencies' })
  @ApiResponse({ status: 200, description: 'Return the total count.' })
  @Get('count')
  async getCount(): Promise<{ count: number }> {
    const count = await this.assemblyConstituencyService.count();
    return { count };
  }

  @ApiOperation({ summary: 'List paginated assembly constituencies' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return list of constituencies.' })
  @Get()
  async getConstituencies(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any[]> {
    return this.assemblyConstituencyService.findMany(limit);
  }

  @ApiOperation({ summary: 'Find constituencies near coordinates' })
  @ApiQuery({ name: 'lon', required: true, type: String })
  @ApiQuery({ name: 'lat', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return nearest constituencies.' })
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

  @ApiOperation({ summary: 'Find constituency containing specific coordinates' })
  @ApiResponse({ status: 200, description: 'Return the containing constituency.' })
  @ApiResponse({ status: 404, description: 'No constituency found for these coordinates.' })
  @Post('inside')
  async findInsideBoundary(
    @Body() findByCoordinatesDto: FindByCoordinatesDto,
  ): Promise<ConstituencyBoundaryResponse> {
    const { latitude, longitude } = findByCoordinatesDto;
    const [assemblyConstituency, parliamentConstituency] = await Promise.all([
      this.assemblyConstituencyService.findByCoordinates(
        longitude,
        latitude,
      ),
      this.assemblyConstituencyService.findParliamentByCoordinates(
        longitude,
        latitude,
      ),
    ]);

    if (!assemblyConstituency && !parliamentConstituency) {
      throw new NotFoundException(
        `No assembly or parliament constituency boundary contains the coordinates (lat: ${latitude}, lon: ${longitude}).`,
      );
    }

    return {
      assemblyConstituency,
      parliamentConstituency,
    };
  }
}

