-- Modalidades
CREATE TYPE "Modalidade" AS ENUM ('CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA');

-- Tabela de Pacientes
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "dataNascimento" DATE NOT NULL,
    "sexo" VARCHAR(1) NOT NULL,
    "endereco" VARCHAR(500) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- Tabela de Exames
CREATE TABLE "exames" (
    "id" TEXT NOT NULL,
    "modalidade" "Modalidade" NOT NULL,
    "data" DATE NOT NULL,
    "resultado" TEXT NOT NULL,
    "idempotencyKey" VARCHAR(255) NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exames_pkey" PRIMARY KEY ("id")
);

-- Validar CPF
CREATE UNIQUE INDEX "pacientes_cpf_key" ON "pacientes"("cpf");

-- Validar idempotencyKey
CREATE UNIQUE INDEX "exames_idempotencyKey_key" ON "exames"("idempotencyKey");

-- Índice para pacienteId
CREATE INDEX "exames_pacienteId_idx" ON "exames"("pacienteId");

-- Índice para idempotencyKey
CREATE INDEX "exames_idempotencyKey_idx" ON "exames"("idempotencyKey");

-- Chave estrangeira para pacienteId
ALTER TABLE "exames" ADD CONSTRAINT "exames_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
