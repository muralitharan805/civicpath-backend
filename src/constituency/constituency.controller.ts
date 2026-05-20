import {
  Controller,
  Post,
  Body,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AssemblyConstituencyService,
  AssemblyConstituency,
} from '../assembly-constituency/assembly-constituency.service';
import {
  ParliamentConstituencyService,
  ParliamentConstituency,
} from '../parliament-constituency/parliament-constituency.service';
import { FindByCoordinatesDto } from './dto/find-by-coordinates.dto';
import { RedisCacheInterceptor } from '../providers/redis/redis-cache.interceptor';

export interface ConstituencyBoundaryResponse {
  assemblyConstituency: AssemblyConstituency | null;
  parliamentConstituency: ParliamentConstituency | null;
}

@ApiTags('constituencies')
@UseInterceptors(RedisCacheInterceptor)
@Controller('constituencies')
export class ConstituencyController {
  constructor(
    private readonly assemblyService: AssemblyConstituencyService,
    private readonly parliamentService: ParliamentConstituencyService,
  ) {}

  @ApiOperation({ summary: 'Find both assembly and parliament constituencies containing specific coordinates' })
  @ApiResponse({ status: 200, description: 'Return containing assembly and parliament constituencies.' })
  @ApiResponse({ status: 404, description: 'No boundary found containing these coordinates.' })
  @Post('inside')
  async findInsideBoundary(
    @Body() findByCoordinatesDto: FindByCoordinatesDto,
  ): Promise<ConstituencyBoundaryResponse> {
    const { latitude, longitude } = findByCoordinatesDto;

    const [assemblyConstituency, parliamentConstituency] = await Promise.all([
      this.assemblyService.findByCoordinates(longitude, latitude),
      this.parliamentService.findByCoordinates(longitude, latitude),
    ]);

    if (!assemblyConstituency && !parliamentConstituency) {
      throw new NotFoundException(
        `No constituency boundary (assembly or parliament) contains the coordinates (lat: ${latitude}, lon: ${longitude}).`,
      );
    }

    return {
      assemblyConstituency,
      parliamentConstituency,
    };
  }
}
