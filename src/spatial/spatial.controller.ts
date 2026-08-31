import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IsochroneService } from './services/isochrone.service';
import { CatchmentService } from './services/catchment.service';
import { IsochroneRequestDto, CatchmentRequestDto } from './dto/spatial-request.dto';

@Controller('spatial')
export class SpatialController {
  constructor(
    private readonly isochroneService: IsochroneService,
    private readonly catchmentService: CatchmentService,
  ) {}

  @Post('isochrone')
  @HttpCode(HttpStatus.OK)
  async getIsochrone(@Body() dto: IsochroneRequestDto) {
    return this.isochroneService.generateIsochrone(
      dto.longitude,
      dto.latitude,
      dto.driveTimeMinutes,
      dto.mode,
    );
  }

  @Post('catchment-analysis')
  @HttpCode(HttpStatus.OK)
  async analyzeCatchment(@Body() dto: CatchmentRequestDto) {
    return this.catchmentService.analyzeCatchment(
      dto.longitude,
      dto.latitude,
      dto.radiusMeters,
    );
  }
}
