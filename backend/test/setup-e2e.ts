import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente de teste
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });

// Verificar se DATABASE_URL está configurada
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está configurada para testes');
}

console.log('🧪 Configuração de teste carregada');
console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
