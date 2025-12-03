FROM node:22-alpine

WORKDIR /app

# Instala Angular CLI globalmente
RUN npm install -g @angular/cli@latest

# Copia arquivos de dependência primeiro
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./
COPY proxy.conf.json ./

# Instala dependências
RUN npm install

# Copia o restante
COPY . .

# Expõe a porta
EXPOSE 4200

# Desabilita analytics do Angular
ENV NG_CLI_ANALYTICS=false

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000", "--proxy-config", "proxy.conf.json"]