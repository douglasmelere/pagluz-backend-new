# 🚀 Guia de Configuração - Pagluz Backend

Este guia vai te ajudar a configurar e rodar o projeto pela primeira vez.

## 📋 Pré-requisitos

- ✅ Node.js (v22.18.0 ou superior) - **Já instalado**
- ✅ npm (v11.5.2 ou superior) - **Já instalado**
- ✅ Docker (v29.1.3 ou superior) - **Já instalado**
- ⚠️ PostgreSQL (pode ser via Docker)

## 🔧 Passos de Configuração

### 1. ✅ Dependências Instaladas
As dependências do projeto já foram instaladas com `npm install`.

### 2. ✅ Arquivo .env Criado
O arquivo `.env` foi criado com as seguintes variáveis:
- `DATABASE_URL`: URL de conexão com o PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (altere em produção!)
- `PORT`: Porta do servidor (padrão: 3000)

### 3. 🗄️ Configurar Banco de Dados PostgreSQL

Você tem duas opções:

#### Opção A: Usar Docker (Recomendado - Mais Fácil)

1. Inicie o PostgreSQL com Docker:
```bash
docker-compose up -d
```

2. Aguarde alguns segundos para o banco inicializar completamente.

3. Execute as migrations do Prisma:
```bash
npx prisma db push
```

#### Opção B: PostgreSQL Local

Se você já tem PostgreSQL instalado localmente:

1. Crie o banco de dados:
```sql
CREATE DATABASE "pagluz-db";
```

2. Ajuste o arquivo `.env` com suas credenciais:
```
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/pagluz-db?schema=public
```

3. Execute as migrations:
```bash
npx prisma db push
```

### 4. 👤 Configurar SUPER_ADMIN

Após configurar o banco, execute o script para criar o usuário SUPER_ADMIN:

```bash
npm run db:setup:super-admin
```

**Credenciais padrão:**
- Email: `douglas@pagluz.com`
- Senha: `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

### 5. 🚀 Iniciar a Aplicação

#### Modo Desenvolvimento (com hot-reload):
```bash
npm run start:dev
```

#### Modo Produção:
```bash
npm run build
npm run start:prod
```

A aplicação estará disponível em: `http://localhost:3000`

### 6. 📚 Acessar Documentação Swagger

Após iniciar a aplicação, acesse:
```
http://localhost:3000/api
```

## 🧪 Testar a Aplicação

### Testar Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"douglas@pagluz.com\",\"password\":\"admin123\"}"
```

## 🛠️ Comandos Úteis

- `npm run start:dev` - Inicia em modo desenvolvimento
- `npm run build` - Compila o projeto
- `npm run start:prod` - Inicia em modo produção
- `npm run test` - Executa testes unitários
- `npm run test:e2e` - Executa testes end-to-end
- `npx prisma studio` - Abre interface visual do banco de dados
- `docker-compose down` - Para o PostgreSQL do Docker
- `docker-compose logs -f postgres` - Ver logs do PostgreSQL

## ⚠️ Problemas Comuns

### Erro: "Can't reach database server"
- Verifique se o PostgreSQL está rodando
- Se estiver usando Docker: `docker-compose up -d`
- Verifique se a porta 5432 está livre

### Erro: "Database does not exist"
- Execute `npx prisma db push` para criar as tabelas

### Erro: "JWT_SECRET is not defined"
- Verifique se o arquivo `.env` existe e contém `JWT_SECRET`

## 📝 Próximos Passos

1. ✅ Iniciar PostgreSQL (Docker ou local)
2. ✅ Executar `npx prisma db push`
3. ✅ Executar `npm run db:setup:super-admin`
4. ✅ Executar `npm run start:dev`
5. ✅ Acessar `http://localhost:3000/api` para ver a documentação

---

**Desenvolvido por:** Douglas Melere  
**Email:** douglas@pagluz.com








