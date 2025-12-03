import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExameDto, ExameResponseDto, PaginatedExamesDto } from './dto/create-exame.dto';

@Injectable()
export class ExamesService {
  constructor(private prisma: PrismaService) {}

  async findByIdempotencyKey(idempotencyKey: string): Promise<ExameResponseDto | null> {
    const exame = await this.prisma.exame.findUnique({
      where: { idempotencyKey },
    });
    return exame as any;
  }

  async create(createExameDto: CreateExameDto): Promise<ExameResponseDto> {
    const { pacienteId, idempotencyKey } = createExameDto;

    // Verificar se o paciente existe
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId },
    });

    if (!paciente) {
      throw new BadRequestException('Paciente não encontrado');
    }

    // Verificar se já existe exame com a mesma idempotencyKey
    const exameExistente = await this.prisma.exame.findUnique({
      where: { idempotencyKey },
    });

    if (exameExistente) {
      // Se já existe, retornar o exame existente
      return exameExistente as any;
    }

    // Criar novo exame com transação para garantir consistência
    const exame = await this.prisma.$transaction(async (tx) => {
      // Verificar novamente dentro da transação
      const exameJaExiste = await tx.exame.findUnique({
        where: { idempotencyKey },
      });

      if (exameJaExiste) {
        return exameJaExiste;
      }

      return tx.exame.create({
        data: {
          ...createExameDto,
          modalidade: createExameDto.modalidade as any,
          data: new Date(createExameDto.data),
        },
      });
    });

    return exame as any;
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    pacienteId?: string,
  ): Promise<PaginatedExamesDto> {
    const skip = (page - 1) * pageSize;

    const whereClause = pacienteId ? { pacienteId } : {};

    const [exames, total] = await Promise.all([
      this.prisma.exame.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { criadoEm: 'desc' },
      }),
      this.prisma.exame.count({ where: whereClause }),
    ]);

    return {
      data: exames as any[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string): Promise<ExameResponseDto | null> {
    const exame = await this.prisma.exame.findUnique({
      where: { id },
    });

    return exame as any;
  }

  async update(id: string, updateExameDto: CreateExameDto): Promise<ExameResponseDto> {
    const { pacienteId } = updateExameDto;

    // Verificar se o exame existe
    const exameExistente = await this.prisma.exame.findUnique({
      where: { id },
    });

    if (!exameExistente) {
      throw new NotFoundException('Exame não encontrado');
    }

    // Verificar se o paciente existe
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId },
    });

    if (!paciente) {
      throw new BadRequestException('Paciente não encontrado');
    }

    const exame = await this.prisma.exame.update({
      where: { id },
      data: {
        ...updateExameDto,
        modalidade: updateExameDto.modalidade as any,
        data: new Date(updateExameDto.data),
      },
    });

    return exame as any;
  }

  async remove(id: string): Promise<void> {
    // Verificar se exame existe
    const exame = await this.prisma.exame.findUnique({
      where: { id },
    });

    if (!exame) {
      throw new NotFoundException('Exame não encontrado');
    }

    await this.prisma.exame.delete({
      where: { id },
    });
  }
}
