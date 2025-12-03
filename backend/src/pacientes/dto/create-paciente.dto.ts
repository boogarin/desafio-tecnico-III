import { IsString, IsDateString, Length, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePacienteDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  @Matches(/^\d+$/)
  cpf: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  @IsNotEmpty()
  dataNascimento: string;

  @ApiProperty({ example: 'M' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1)
  sexo: string;

  @ApiProperty({ example: 'Rua A, 123' })
  @IsString()
  @IsNotEmpty()
  endereco: string;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  @IsNotEmpty()
  telefone: string;
}

export class PacienteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  cpf: string;

  @ApiProperty()
  dataNascimento: Date;

  @ApiProperty()
  sexo: string;

  @ApiProperty()
  endereco: string;

  @ApiProperty()
  telefone: string;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;
}

export class PaginatedPacientesDto {
  @ApiProperty({ type: [PacienteResponseDto] })
  data: PacienteResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}
