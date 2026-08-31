import { Module } from '@nestjs/common';
import { SpatialController } from './spatial.controller';
import { IsochroneService } from './services/isochrone.service';
import { CatchmentService } from './services/catchment.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpatialController],
  providers: [IsochroneService, CatchmentService],
  exports: [IsochroneService, CatchmentService],
})
export class SpatialModule {}
