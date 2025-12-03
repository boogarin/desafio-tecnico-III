# Backend - API de Pacientes e Exames Médicos

## Description

Backend API REST para cadastro e consulta de pacientes e exames médicos DICOM, construído com [NestJS](https://github.com/nestjs/nest) framework e TypeScript. 

**Funcionalidades principais:**
- Cadastro e gerenciamento de pacientes (nome, CPF, data de nascimento, sexo, endereço, telefone)
- Criação e consulta de exames médicos (DICOM, CT, MR, US, etc)
- Validação de CPF
- Idempotência em requisições de criação de exames
- Paginação e filtros avançados
- Documentação interativa com Swagger
- Testes e2e com Jest e Supertest

## Setup

```bash
$ npm install
```

## Architecture

### Estrutura de pastas
- **src/pacientes**: Módulo para gerenciamento de pacientes (controller, service, DTOs)
- **src/exames**: Módulo para gerenciamento de exames (controller, service, DTOs)
- **src/common/validators**: Validadores customizados (ex: validação de CPF)
- **src/prisma**: Serviço Prisma para acesso ao banco de dados
- **prisma**: Configuração do ORM Prisma (schema, migrations)
- **test**: Testes end-to-end (e2e) com Jest e Supertest

### Tecnologias
- **NestJS**: Framework Node.js para aplicações escaláveis
- **Prisma**: ORM para gerenciamento do banco de dados
- **PostgreSQL**: Banco de dados (configurável)
- **Jest & Supertest**: Testes automatizados
- **Swagger**: Documentação interativa da API

## Compilar e rodar projeto

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Endpoints Principais

### Pacientes
- `POST /pacientes` - Criar novo paciente
- `GET /pacientes` - Listar pacientes (com paginação)
- `GET /pacientes/:id` - Buscar paciente por ID
- `PUT /pacientes/:id` - Atualizar paciente
- `DELETE /pacientes/:id` - Deletar paciente

### Exames
- `POST /exames` - Criar novo exame
- `GET /exames` - Listar exames (com paginação e filtros)
- `GET /exames/:id` - Buscar exame por ID
- `PUT /exames/:id` - Atualizar exame
- `DELETE /exames/:id` - Deletar exame

## Documentação da API

Após iniciar a aplicação, acesse a documentação interativa do Swagger em:
```
http://localhost:3000/api
```

## Rodar testes

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Testes Implementados

### app.e2e-spec.ts
- Testa a rota principal GET `/` verificando se retorna status 200 e mensagem "Hello World!"

### pacientes.e2e-spec.ts
- **POST /pacientes**: Criar paciente com validação de dados obrigatórios e CPF válido
- **Validações**: Rejeição de CPFs inválidos, duplicados e dados faltantes
- **GET /pacientes**: Listar pacientes com paginação e filtros
- **GET /pacientes/:id**: Buscar paciente específico

### exames.e2e-spec.ts
- **POST /exames**: Criar exame para paciente existente com idempotencyKey nova
- **Idempotência**: Múltiplas requisições com mesma idempotencyKey retornam o mesmo exame
- **Validação**: Rejeição de pacientes inexistentes, modalidades inválidas e dados faltantes
- **GET /exames**: Listar exames com paginação, filtro por pacienteId
- **Fluxo completo**: Criar paciente → Criar exame → Listar exames do paciente