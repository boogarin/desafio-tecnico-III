import { Module } from '@nestjs/common';
import { ExamesService } from './exames.service';
import { ExamesController } from './exames.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ExamesController],
  providers: [ExamesService, PrismaService],
  exports: [ExamesService],
})
export class ExamesModule {}
