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
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExamesService } from './exames.service';
import { CreateExameDto, ExameResponseDto, PaginatedExamesDto } from './dto/create-exame.dto';

@ApiTags('Exames')
@Controller('exames')
export class ExamesController {
  constructor(private readonly examesService: ExamesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo exame' })
  @ApiResponse({
    status: 201,
    description: 'Exame criado com sucesso',
    type: ExameResponseDto,
  })
  @ApiResponse({ status: 200, description: 'Exame já existe' })
  @ApiResponse({ status: 400, description: 'Paciente não encontrado ou dados inválidos' })
  async create(@Body(ValidationPipe) createExameDto: CreateExameDto, @Res({ passthrough: true }) res): Promise<ExameResponseDto> {
    // Verificar se já existe (para definir o status code correto)
    const exameExistente = await this.examesService.findByIdempotencyKey(createExameDto.idempotencyKey);
    
    const exame = await this.examesService.create(createExameDto);
    
    // Se já existia, retornar 200, senão 201
    if (exameExistente) {
      res.status(HttpStatus.OK);
    } else {
      res.status(HttpStatus.CREATED);
    }
    
    return exame as any;
  }

  @Get()
  @ApiOperation({ summary: 'Listar exames com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'pacienteId', required: false, type: String, description: 'Filtrar por paciente' })
  @ApiResponse({
    status: 200,
    description: 'Lista de exames',
    type: PaginatedExamesDto,
  })
  findAll(
    @Query('page', new ValidationPipe({ transform: true })) page: number = 1,
    @Query('pageSize', new ValidationPipe({ transform: true })) pageSize: number = 10,
    @Query('pacienteId') pacienteId?: string,
  ): Promise<PaginatedExamesDto> {
    return this.examesService.findAll(page, pageSize, pacienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um exame por ID' })
  @ApiResponse({
    status: 200,
    description: 'Exame encontrado',
    type: ExameResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  findOne(@Param('id') id: string): Promise<ExameResponseDto | null> {
    return this.examesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um exame' })
  @ApiResponse({
    status: 200,
    description: 'Exame atualizado com sucesso',
    type: ExameResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou paciente não encontrado' })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExameDto: CreateExameDto,
  ): Promise<ExameResponseDto> {
    return this.examesService.update(id, updateExameDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar um exame' })
  @ApiResponse({ status: 204, description: 'Exame deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Exame não encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.examesService.remove(id);
  }
}