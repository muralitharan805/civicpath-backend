import { Module } from '@nestjs/common';
import { ParliamentConstituencyService } from './parliament-constituency.service';
import { ParliamentConstituencyController } from './parliament-constituency.controller';

@Module({
  controllers: [ParliamentConstituencyController],
  providers: [ParliamentConstituencyService],
  exports: [ParliamentConstituencyService],
})
export class ParliamentConstituencyModule {}
