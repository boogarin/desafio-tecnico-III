import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto, PacienteResponseDto, PaginatedPacientesDto } from './dto/create-paciente.dto';

@ApiTags('Pacientes')
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Paciente criado com sucesso',
    type: PacienteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'CPF já cadastrado' })
  create(
    @Body(ValidationPipe) createPacienteDto: CreatePacienteDto,
  ): Promise<PacienteResponseDto> {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pacientes com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes',
    type: PaginatedPacientesDto,
  })
  findAll(
    @Query('page', new ValidationPipe({ transform: true })) page: number = 1,
    @Query('pageSize', new ValidationPipe({ transform: true })) pageSize: number = 10,
  ): Promise<PaginatedPacientesDto> {
    return this.pacientesService.findAll(page, pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um paciente por ID' })
  @ApiResponse({
    status: 200,
    description: 'Paciente encontrado',
    type: PacienteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  findOne(@Param('id') id: string): Promise<PacienteResponseDto | null> {
    return this.pacientesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um paciente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente atualizado com sucesso',
    type: PacienteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  @ApiResponse({ status: 409, description: 'CPF já cadastrado' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePacienteDto: CreatePacienteDto,
  ): Promise<PacienteResponseDto> {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar um paciente' })
  @ApiResponse({ status: 204, description: 'Paciente deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  @ApiResponse({ status: 400, description: 'Paciente possui exames associados' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.pacientesService.remove(id);
  }
}
