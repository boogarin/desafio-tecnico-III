import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Exames (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let pacienteId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    prismaService = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  beforeEach(async () => {
    // Limpar exames mas manter pacientes se já existem
    await prismaService.exame.deleteMany({});
    
    // Verificar se já existe um paciente de teste
    const pacienteExistente = await prismaService.paciente.findFirst({
      where: { cpf: '82354403933' }
    });
    
    if (pacienteExistente) {
      pacienteId = pacienteExistente.id;
      return;
    }
    
    // Criar paciente para cada teste apenas se não existir
    const pacienteData = {
      nome: 'Paciente Teste Exame',
      cpf: '82354403933',
      dataNascimento: '1990-01-15',
      sexo: 'M',
      endereco: 'Rua Teste, 123',
      telefone: '11999999999',
    };
    
    const pacienteResponse = await request(app.getHttpServer())
      .post('/pacientes')
      .send(pacienteData);
    
    if (pacienteResponse.status !== 201) {
      throw new Error(`Failed to create patient for test: ${pacienteResponse.status} - ${JSON.stringify(pacienteResponse.body)}`);
    }
    
    pacienteId = pacienteResponse.body.id;
  });

  afterAll(async () => {
    await prismaService.exame.deleteMany({});
    await prismaService.paciente.deleteMany({});
    await app.close();
  });

  describe('POST /exames', () => {
    it('Cenário 3: Criar exame com paciente existente e idempotencyKey nova - deve retornar 201', async () => {
      const exameData = {
        modalidade: 'CT',
        data: '2025-01-15',
        resultado: 'Normal',
        idempotencyKey: 'test-key-001',
        pacienteId,
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .send(exameData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.modalidade).toBe(exameData.modalidade);
      expect(response.body.resultado).toBe(exameData.resultado);
      expect(response.body.pacienteId).toBe(pacienteId);
      expect(response.body.idempotencyKey).toBe(exameData.idempotencyKey);
    });
  });

  describe('POST /exames - Teste de Idempotência', () => {
    it('Cenário 4: Reenviar exame com mesma idempotencyKey - deve retornar 200 com mesmo exame', async () => {
      const exameData = {
        modalidade: 'MR',
        data: '2025-01-20',
        resultado: 'Alterado',
        idempotencyKey: 'test-key-idempotency',
        pacienteId,
      };

      // Criar exame pela primeira vez
      const response1 = await request(app.getHttpServer())
        .post('/exames')
        .send(exameData)
        .expect(201);

      const exameId = response1.body.id;

      // Reenviar com mesma idempotencyKey
      const response2 = await request(app.getHttpServer())
        .post('/exames')
        .send(exameData)
        .expect(200);

      // Deve retornar o mesmo exame
      expect(response2.body.id).toBe(exameId);
      expect(response2.body.idempotencyKey).toBe(exameData.idempotencyKey);
    });

    it('Cenário 5: Múltiplas requisições simultâneas com mesma idempotencyKey - apenas um exame persistido', async () => {
      // Garantir que o paciente existe
      const pacienteExiste = await prismaService.paciente.findUnique({
        where: { id: pacienteId }
      });
      
      if (!pacienteExiste) {
        throw new Error('Paciente não existe para teste de concorrência');
      }
      
      const concurrentData = {
        modalidade: 'DX',
        data: '2025-01-25',
        resultado: 'Pendente',
        idempotencyKey: 'test-key-concurrent',
        pacienteId,
      };

      // Enviar 5 requisições simultâneas
      const promises = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .post('/exames')
          .send(concurrentData)
      );

      const responses = await Promise.all(promises);

      // Pelo menos uma deve ter sucesso (201 ou 200), as outras podem retornar 200 também
      const successfulResponses = responses.filter(r => [200, 201].includes(r.status));
      expect(successfulResponses.length).toBeGreaterThanOrEqual(1);

      // Verificar no banco que existe apenas um exame
      const examesNoBanco = await prismaService.exame.findMany({
        where: { idempotencyKey: concurrentData.idempotencyKey },
      });

      expect(examesNoBanco).toHaveLength(1);
    });
  });

  describe('POST /exames - Validation Tests', () => {
    it('Cenário 6: Criar exame com paciente inexistente - deve retornar 400', async () => {
      const exameData = {
        modalidade: 'US',
        data: '2025-02-01',
        resultado: 'Normal',
        idempotencyKey: 'test-key-003',
        pacienteId: '00000000-0000-0000-0000-000000000000', // UUID inválido
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .send(exameData)
        .expect(400);

      expect(response.body.message).toContain('Paciente não encontrado');
    });

    it('Cenário 11: Enviar exame com modalidade inválida - deve retornar 400', async () => {
      const exameData = {
        modalidade: 'INVALID', // Modalidade inválida
        data: '2025-02-05',
        resultado: 'Normal',
        idempotencyKey: 'test-key-004',
        pacienteId,
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .send(exameData)
        .expect(400);

      // A mensagem pode ser string ou array
      const message = Array.isArray(response.body.message) 
        ? response.body.message.join(' ') 
        : response.body.message;
      expect(message).toContain('modalidade');
    });

    it('Deve validar campos obrigatórios - retornar 400', async () => {
      const exameData = {
        modalidade: 'CT',
        // data ausente
        resultado: 'Normal',
        idempotencyKey: 'test-key-005',
        pacienteId,
      };

      await request(app.getHttpServer())
        .post('/exames')
        .send(exameData)
        .expect(400);
    });
  });

  describe('GET /exames', () => {
    it('Cenário 7: Listar exames com paginação (10 por página) - deve retornar paginado corretamente', async () => {
      // Limpar dados antes deste teste
      await prismaService.exame.deleteMany({});
      
      // Garantir que temos um paciente para os exames
      let testPacienteId = pacienteId;
      const pacienteExiste = await prismaService.paciente.findUnique({
        where: { id: testPacienteId }
      });
      
      if (!pacienteExiste) {
        // Criar paciente se não existir
        const novoPaciente = await prismaService.paciente.create({
          data: {
            nome: 'Paciente Teste Paginação Exame',
            cpf: '12345678901',
            dataNascimento: new Date('1990-01-15'),
            sexo: 'M',
            endereco: 'Rua Teste',
            telefone: '11999999999',
          }
        });
        testPacienteId = novoPaciente.id;
      }
      
      // Criar 15 exames
      for (let i = 1; i <= 15; i++) {
        const response = await request(app.getHttpServer())
          .post('/exames')
          .send({
            modalidade: 'CT',
            data: '2025-01-01',
            resultado: 'Normal',
            idempotencyKey: `test-key-page-${i}`,
            pacienteId: testPacienteId,
          });
        
        if (response.status !== 201 && response.status !== 200) {
          throw new Error(`Failed to create exam ${i}: ${response.status} - ${JSON.stringify(response.body)}`);
        }
      }

      // Testar página 1
      const response1 = await request(app.getHttpServer())
        .get('/exames?page=1&pageSize=10')
        .expect(200);

      expect(response1.body.data).toHaveLength(10);
      expect(response1.body.total).toBe(15);
      expect(response1.body.page).toBe(1);
      expect(response1.body.pageSize).toBe(10);
      expect(response1.body.totalPages).toBe(2);

      // Testar página 2
      const response2 = await request(app.getHttpServer())
        .get('/exames?page=2&pageSize=10')
        .expect(200);

      expect(response2.body.data).toHaveLength(5);
      expect(response2.body.page).toBe(2);
    });

    it('Deve retornar lista vazia quando não há exames', async () => {
      // Limpar todos os exames para este teste
      await prismaService.exame.deleteMany({});
      
      const response = await request(app.getHttpServer())
        .get('/exames')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('Fluxo Completo (Paciente → Exame)', () => {
    it('Deve criar paciente e depois criar exame para ele', async () => {
      // 1. Criar paciente
      const pacienteResponse = await request(app.getHttpServer())
        .post('/pacientes')
        .send({
          nome: 'Fluxo Completo',
          cpf: '11144477735', // CPF válido e único
          dataNascimento: '1992-08-15',
          sexo: 'M',
          endereco: 'Rua Fluxo, 789',
          telefone: '11777777777',
        })
        .expect(201);

      const novoPacienteId = pacienteResponse.body.id;

      // 2. Criar exame para o paciente
      const exameResponse = await request(app.getHttpServer())
        .post('/exames')
        .send({
          modalidade: 'PT',
          data: '2025-02-10',
          resultado: 'Normal',
          idempotencyKey: 'test-key-fluxo',
          pacienteId: novoPacienteId,
        })
        .expect(201);

      expect(exameResponse.body.pacienteId).toBe(novoPacienteId);

      // 3. Listar exames do paciente
      const listResponse = await request(app.getHttpServer())
        .get(`/exames?pacienteId=${novoPacienteId}`)
        .expect(200);

      expect(listResponse.body.data).toHaveLength(1);
      expect(listResponse.body.data[0].id).toBe(exameResponse.body.id);
    });
  });
});
