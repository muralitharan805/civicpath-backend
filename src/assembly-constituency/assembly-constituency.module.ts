import { Module } from '@nestjs/common';
import { AssemblyConstituencyService } from './assembly-constituency.service';
import { AssemblyConstituencyController } from './assembly-constituency.controller';

@Module({
  controllers: [AssemblyConstituencyController],
  providers: [AssemblyConstituencyService],
})
export class AssemblyConstituencyModule {}
