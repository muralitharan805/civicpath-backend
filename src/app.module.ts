import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssemblyConstituencyModule } from './assembly-constituency/assembly-constituency.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AssemblyConstituencyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
