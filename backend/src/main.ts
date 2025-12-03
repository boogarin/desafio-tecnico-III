import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
  });

  // Validação global de dados recebidos
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('MobileMed - Cadastro de Pacientes e Exames Médicos')
    .setDescription('API REST para cadastro e consulta de pacientes e exames')
    .setVersion('1.0')
    .addTag('Pacientes', 'Operações com pacientes')
    .addTag('Exames', 'Operações com exames')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api`);
}
bootstrap();
