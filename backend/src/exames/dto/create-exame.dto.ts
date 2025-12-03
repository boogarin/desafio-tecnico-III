import { IsString, IsDateString, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Modalidade {
  CR = 'CR',
  CT = 'CT',
  DX = 'DX',
  MG = 'MG',
  MR = 'MR',
  NM = 'NM',
  OT = 'OT',
  PT = 'PT',
  RF = 'RF',
  US = 'US',
  XA = 'XA',
}

export class CreateExameDto {
  @ApiProperty({ enum: Modalidade, example: 'CT' })
  @IsEnum(Modalidade)
  @IsNotEmpty()
  modalidade: string;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  @IsNotEmpty()
  data: string;

  @ApiProperty({ example: 'Resultado do exame' })
  @IsString()
  @IsNotEmpty()
  resultado: string;

  @ApiProperty({ example: 'uuid-da-requisicao-1234' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;
}

export class ExameResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: Modalidade })
  modalidade: string;

  @ApiProperty()
  data: Date;

  @ApiProperty()
  resultado: string;

  @ApiProperty()
  idempotencyKey: string;

  @ApiProperty()
  pacienteId: string;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;
}

export class PaginatedExamesDto {
  @ApiProperty({ type: [ExameResponseDto] })
  data: ExameResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}
