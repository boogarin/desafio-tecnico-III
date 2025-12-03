# Frontend - Sistema de Cadastro de Pacientes e Exames Médicos

Interface web moderna para cadastro e consulta de pacientes e exames médicos, construída com Angular 19.

## Funcionalidades Principais

- **Autenticação**: Sistema de login/logout com proteção de rotas
- **Gestão de Pacientes**: Criar, visualizar e listar pacientes
- **Gestão de Exames**: Criar e consultar exames associados a pacientes
- **Paginação**: Navegação eficiente entre páginas de dados
- **Dashboard**: Interface unificada com abas para pacientes e exames
- **Validação de Dados**: Validação em tempo real de formulários
- **Tratamento de Erros**: Mensagens de erro e sucesso amigáveis
- **Responsivo**: Design adaptável para diferentes tamanhos de tela

## Tecnologias Utilizadas

### Core
- **Angular 19**: Framework front-end moderno (Standalone Architecture)
- **TypeScript**: Linguagem de tipagem forte
- **RxJS**: Programação reativa

### Formulários e Validação
- **Reactive Forms**: Gerenciamento avançado de formulários
- **Angular Validators**: Validadores built-in
- **Validação Customizada**: CPF e outros formatos específicos

### HTTP e APIs
- **HttpClient**: Comunicação com backend
- **Axios** (via ApiService): Cliente HTTP alternativo
- **Proxy Configuration**: Desenvolvimento sem CORS

### Routing e Guard
- **Angular Router**: Roteamento entre páginas
- **AuthGuard**: Proteção de rotas autenticadas
- **Standalone Routes**: Roteamento moderno sem módulos

### Testes
- **Vitest**: Framework de testes rápido e moderno
- **Angular Testing Utilities**: TestBed, ComponentFixture
- **Mocking**: Serviços mockados com Vitest

### Estilos
- **SCSS**: Pré-processador CSS
- **Angular Animations**: Efeitos visuais (quando necessário)
- **CSS Grid/Flexbox**: Layout responsivo

### Build e Desenvolvimento
- **Vite** (ou Webpack): Build tool
- **Hot Module Replacement (HMR)**: Recarregamento rápido em desenvolvimento
- **Angular CLI**: Ferramentas de desenvolvimento

## Estrutura de Pastas

```
src/
├── app/
│   ├── app.config.ts              # Configuração da aplicação
│   ├── app.routes.ts              # Rotas (Standalone)
│   ├── app.ts                     # Componente raiz
│   ├── guards/
│   │   └── auth.guard.ts          # Protetor de rotas autenticadas
│   ├── pages/
│   │   ├── dashboard/             # Dashboard com pacientes e exames
│   │   └── login/                 # Página de login
│   ├── services/
│   │   ├── api.service.ts         # Comunicação com backend
│   │   ├── auth.service.ts        # Autenticação e gerenciamento de sessão
│   │   └── api.service.spec.ts    # Testes do ApiService
│   └── environments/
│       └── environment.ts         # Configuração de ambiente
├── index.html                      # HTML principal
├── main.ts                         # Entry point
└── styles.scss                     # Estilos globais
```

## Project Setup

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm run test

# Executar testes com cobertura
npm run test:cov
```

## Autenticação

A aplicação implementa um sistema de autenticação simples com:
- Serviço `AuthService` para login/logout
- Guard `AuthGuard` para proteger rotas
- Token armazenado em localStorage
- Verificação de autenticação em cada acesso a rota protegida

## Componentes Principais

### DashboardComponent
- Interface principal com abas
- Gerenciamento de pacientes (criar, listar)
- Gerenciamento de exames (criar, listar)
- Formulários com validação
- Paginação integrada

### LoginComponent
- Formulário de login
- Autenticação contra backend
- Redirecionamento após login bem-sucedido

## Serviços

### ApiService
- Comunicação com backend via HTTP
- Métodos para CRUD de pacientes e exames
- Tratamento de erros e respostas

### AuthService
- Gerenciamento de autenticação
- Verificação de sessão
- Logout e limpeza de dados

## Comunicação com Backend

A aplicação se comunica com a API backend em `http://localhost:3000/api` (desenvolvimento).

### Endpoints Utilizados

**Pacientes:**
- `POST /pacientes` - Criar paciente
- `GET /pacientes` - Listar pacientes (com paginação)
- `GET /pacientes/:id` - Buscar paciente específico
- `PUT /pacientes/:id` - Atualizar paciente
- `DELETE /pacientes/:id` - Deletar paciente

**Exames:**
- `POST /exames` - Criar exame
- `GET /exames` - Listar exames (com paginação e filtros)
- `GET /exames/:id` - Buscar exame específico
- `PUT /exames/:id` - Atualizar exame
- `DELETE /exames/:id` - Deletar exame