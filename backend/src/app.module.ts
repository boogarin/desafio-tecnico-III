import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PacientesModule } from './pacientes/pacientes.module';
import { ExamesModule } from './exames/exames.module';

@Module({
  imports: [PacientesModule, ExamesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
