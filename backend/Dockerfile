FROM node:22-alpine

# Instalar OpenSSL e outras dependências necessárias para Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (cache mais eficiente)
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expõe a porta
EXPOSE 3000

# Comando para inicialização em modo desenvolvimento
CMD ["npm", "run", "start:dev"]