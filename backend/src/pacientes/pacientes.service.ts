import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto, PacienteResponseDto, PaginatedPacientesDto } from './dto/create-paciente.dto';
import { validateCPF } from '../common/validators/cpf.validator';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async create(createPacienteDto: CreatePacienteDto): Promise<PacienteResponseDto> {
    const { cpf } = createPacienteDto;

    // Validar formato do CPF
    if (!validateCPF(cpf)) {
      throw new BadRequestException('CPF inválido');
    }

    // Verificar se CPF já existe
    const pacienteExistente = await this.prisma.paciente.findUnique({
      where: { cpf },
    });

    if (pacienteExistente) {
      throw new ConflictException('CPF já cadastrado');
    }

    const paciente = await this.prisma.paciente.create({
      data: {
        ...createPacienteDto,
        dataNascimento: new Date(createPacienteDto.dataNascimento),
      },
    });

    return paciente;
  }

  async findAll(page: number = 1, pageSize: number = 10): Promise<PaginatedPacientesDto> {
    const skip = (page - 1) * pageSize;

    const [pacientes, total] = await Promise.all([
      this.prisma.paciente.findMany({
        skip,
        take: pageSize,
        orderBy: { criadoEm: 'desc' },
      }),
      this.prisma.paciente.count(),
    ]);

    return {
      data: pacientes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string): Promise<PacienteResponseDto | null> {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
    });

    return paciente as any;
  }

  async update(id: string, updatePacienteDto: CreatePacienteDto): Promise<PacienteResponseDto> {
    const { cpf } = updatePacienteDto;

    // Verificar se paciente existe
    const pacienteExistente = await this.prisma.paciente.findUnique({
      where: { id },
    });

    if (!pacienteExistente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    // Validar formato do CPF
    if (!validateCPF(cpf)) {
      throw new BadRequestException('CPF inválido');
    }

    // Verificar se CPF já existe em outro paciente
    if (cpf !== pacienteExistente.cpf) {
      const cpfEmUso = await this.prisma.paciente.findUnique({
        where: { cpf },
      });

      if (cpfEmUso) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    const paciente = await this.prisma.paciente.update({
      where: { id },
      data: {
        ...updatePacienteDto,
        dataNascimento: new Date(updatePacienteDto.dataNascimento),
      },
    });

    return paciente;
  }

  async remove(id: string): Promise<void> {
    // Verificar se paciente existe
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    // Verificar se paciente tem exames
    const examesCount = await this.prisma.exame.count({
      where: { pacienteId: id },
    });

    if (examesCount > 0) {
      throw new BadRequestException(
        `Não é possível deletar paciente com exames associados. Total de exames: ${examesCount}`,
      );
    }

    await this.prisma.paciente.delete({
      where: { id },
    });
  }
}
