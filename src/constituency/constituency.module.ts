import { Module } from '@nestjs/common';
import { AssemblyConstituencyModule } from '../assembly-constituency/assembly-constituency.module';
import { ParliamentConstituencyModule } from '../parliament-constituency/parliament-constituency.module';
import { ConstituencyController } from './constituency.controller';

@Module({
  imports: [AssemblyConstituencyModule, ParliamentConstituencyModule],
  controllers: [ConstituencyController],
})
export class ConstituencyModule {}
