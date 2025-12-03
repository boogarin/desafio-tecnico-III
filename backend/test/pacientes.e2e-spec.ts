import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Pacientes (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    prismaService = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterAll(async () => {
    // Limpar dados de teste
    await prismaService.exame.deleteMany({});
    await prismaService.paciente.deleteMany({});
    await app.close();
  });

  describe('POST /pacientes', () => {
    beforeAll(async () => {
      // Limpar dados antes deste bloco
      await prismaService.exame.deleteMany({});
      await prismaService.paciente.deleteMany({});
    });
    it('Cenário 1: Criar paciente com dados válidos - deve retornar 201 com UUID', async () => {
      const pacienteData = {
        nome: 'João Silva',
        cpf: '54891605197', // CPF válido
        dataNascimento: '1990-01-15',
        sexo: 'M',
        endereco: 'Rua A, 123',
        telefone: '11999999999',
      };

      const response = await request(app.getHttpServer())
        .post('/pacientes')
        .send(pacienteData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(pacienteData.nome);
      expect(response.body.cpf).toBe(pacienteData.cpf);
      expect(response.body).toHaveProperty('criadoEm');
      expect(response.body).toHaveProperty('atualizadoEm');
    });

    it('Cenário 2: Criar paciente com CPF já existente - deve retornar 409', async () => {
      const pacienteData = {
        nome: 'Maria Santos',
        cpf: '26447541604', // CPF válido
        dataNascimento: '1985-05-20',
        sexo: 'F',
        endereco: 'Rua B, 456',
        telefone: '11888888888',
      };

      // Criar primeiro paciente
      await request(app.getHttpServer())
        .post('/pacientes')
        .send(pacienteData)
        .expect(201);

      // Tentar criar paciente com mesmo CPF
      const response = await request(app.getHttpServer())
        .post('/pacientes')
        .send(pacienteData)
        .expect(409);

      expect(response.body.message).toContain('CPF já cadastrado');
    });

    it('Deve validar CPF inválido - retornar 400', async () => {
      const pacienteData = {
        nome: 'Pedro Oliveira',
        cpf: '00000000000', // CPF inválido
        dataNascimento: '1995-03-10',
        sexo: 'M',
        endereco: 'Rua C, 789',
        telefone: '11777777777',
      };

      const response = await request(app.getHttpServer())
        .post('/pacientes')
        .send(pacienteData)
        .expect(400);

      expect(response.body.message).toContain('CPF inválido');
    });

    it('Deve validar campos obrigatórios - retornar 400', async () => {
      const pacienteData = {
        nome: 'Ana Costa',
        // cpf ausente
        dataNascimento: '1988-07-25',
        sexo: 'F',
      };

      await request(app.getHttpServer())
        .post('/pacientes')
        .send(pacienteData)
        .expect(400);
    });
  });

  describe('GET /pacientes', () => {
    beforeAll(async () => {
      // Não limpar - os testes gerenciam sua própria limpeza
    });

    it('Cenário 8: Listar pacientes com paginação - deve retornar lista corretamente', async () => {
      // Limpar apenas exames, manter pacientes existentes
      await prismaService.exame.deleteMany({});
      
      // Deletar apenas pacientes de teste de paginação se existirem (não deletar paciente de teste de exames)
      await prismaService.paciente.deleteMany({
        where: { 
          AND: [
            { nome: { startsWith: 'TESTE_PAGINACAO_' } },
            { NOT: { cpf: '82354403933' } } // Manter paciente de teste de exames
          ]
        }
      });
      
      // CPFs válidos para teste (diferentes do beforeEach e sem duplicatas)
      const cpfsValidos = [
        '46155416516', '25110204918', '66039183900', '31559273305',
        '88470805339', '73053446804', '53368468561', '64062925028',
        '06134182397', '11980714436', '39735688395', '27751275847',
        '75492734300', '73131706619', '31896288588'
      ];
      
      // Criar múltiplos pacientes para teste de paginação
      for (let i = 1; i <= 15; i++) {
        await request(app.getHttpServer())
          .post('/pacientes')
          .send({
            nome: `TESTE_PAGINACAO_Paciente ${i}`,
            cpf: cpfsValidos[i - 1],
            dataNascimento: '1990-01-01',
            sexo: 'M',
            endereco: `Rua ${i}`,
            telefone: '11999999999',
          });
      }

      // Testar paginação - página 1
      const response1 = await request(app.getHttpServer())
        .get('/pacientes?page=1&pageSize=10')
        .expect(200);

      // Devemos ter pelo menos 10 pacientes na primeira página
      expect(response1.body.data).toHaveLength(10);
      // Total deve ser pelo menos 15 (pode ter pacientes de outros testes)
      expect(response1.body.total).toBeGreaterThanOrEqual(15);
      expect(response1.body.page).toBe(1);
      expect(response1.body.pageSize).toBe(10);

      // Testar paginação - página 2
      const response2 = await request(app.getHttpServer())
        .get('/pacientes?page=2&pageSize=10')
        .expect(200);

      // Segunda página deve ter pelo menos 5 pacientes
      expect(response2.body.data.length).toBeGreaterThanOrEqual(5);
      expect(response2.body.page).toBe(2);
      expect(response2.body.total).toBeGreaterThanOrEqual(15);
    });

    it('Deve retornar lista vazia quando não há pacientes', async () => {
      // Limpar todos os dados para este teste específico
      await prismaService.exame.deleteMany({});
      await prismaService.paciente.deleteMany({});
      
      const response = await request(app.getHttpServer())
        .get('/pacientes')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });
});
