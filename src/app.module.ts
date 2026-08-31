import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AssemblyConstituencyModule } from './assembly-constituency/assembly-constituency.module';
import { ParliamentConstituencyModule } from './parliament-constituency/parliament-constituency.module';
import { ConstituencyModule } from './constituency/constituency.module';
import { redisConfig } from './config/redis.config';
import { RedisModule } from './providers/redis/redis.module';

import { SpatialModule } from './spatial/spatial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),
    PrismaModule,
    AssemblyConstituencyModule,
    ParliamentConstituencyModule,
    ConstituencyModule,
    RedisModule,
    SpatialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
