# Energy Management API

API completa para gerenciamento de energia renovável desenvolvida em Nest.js com PostgreSQL e Prisma ORM.

## 🚀 Funcionalidades

### 🔐 Autenticação e Usuários
- Sistema de autenticação JWT
- Acesso restrito a usuários administradores
- CRUD completo para gerenciamento de usuários
- Conta admin padrão pré-configurada

### 👥 Clientes Consumidores
- CRUD completo com validações
- Campos: nome, CPF/CNPJ, UC, concessionária, cidade, estado, tipo, fase, consumo médio, desconto
- Sistema de alocação a geradores
- Status de disponibilidade (disponível/alocado)
- Cálculos automáticos de energia alocada

### ⚡ Clientes Geradores
- CRUD completo para geradores de energia
- Campos: proprietário, CPF/CNPJ, tipo de fonte, potência, localização, status
- Cálculo automático de capacidade alocada e disponível
- Suporte a múltiplas fontes: solar, hídrica, biomassa, eólica

### 📊 Dashboard Completa
- Indicadores em tempo real
- Estatísticas de consumidores e geradores
- Gráficos de distribuição por estado
- Insights de economia e alocação
- Registro de atividade recente

## 🛠️ Tecnologias

- **Backend**: Nest.js
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT + Passport
- **Validação**: class-validator
- **Documentação**: Swagger/OpenAPI
- **Deploy**: EasyPanel + Nixpacks

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd energy-management-api
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Configure o banco de dados**
   ```bash
   # Gerar cliente Prisma
   npx prisma generate
   
   # Executar migrations
   npx prisma migrate dev
   
   # Seed inicial (criar admin)
   npm run db:seed
   ```

5. **Inicie a aplicação**
   ```bash
   # Desenvolvimento
   npm run start:dev
   
   # Produção
   npm run build
   npm run start:prod
   ```

## 🌐 Endpoints da API

### Autenticação
- `POST /auth/login` - Login do usuário
- `GET /auth/profile` - Perfil do usuário logado
- `POST /auth/create-admin` - Criar admin padrão

### Usuários
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário
- `GET /users/:id` - Buscar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Remover usuário

### Consumidores
- `GET /consumers` - Listar consumidores
- `POST /consumers` - Criar consumidor
- `GET /consumers/:id` - Buscar consumidor
- `PATCH /consumers/:id` - Atualizar consumidor
- `DELETE /consumers/:id` - Remover consumidor
- `POST /consumers/:id/allocate` - Alocar a gerador
- `POST /consumers/:id/deallocate` - Desalocar
- `GET /consumers/statistics` - Estatísticas
- `GET /consumers/by-state` - Por estado

### Geradores
- `GET /generators` - Listar geradores
- `POST /generators` - Criar gerador
- `GET /generators/:id` - Buscar gerador
- `PATCH /generators/:id` - Atualizar gerador
- `DELETE /generators/:id` - Remover gerador
- `GET /generators/statistics` - Estatísticas
- `GET /generators/by-state` - Por estado
- `GET /generators/by-source-type` - Por tipo de fonte

### Dashboard
- `GET /dashboard` - Dados completos da dashboard
- `GET /dashboard/generators-by-source` - Distribuição por fonte
- `GET /dashboard/consumers-by-type` - Distribuição por tipo

## 📖 Documentação da API

Acesse a documentação interativa em: `http://localhost:3000/api`

## 🔑 Conta Administrador Padrão

- **Email**: douglasmelere@gmail.com
- **Senha**: Juninhoplay13!

## 🚀 Deploy no EasyPanel

### Configuração Automática (Nixpacks)

1. **Conecte seu repositório** ao EasyPanel
2. **Configure as variáveis de ambiente**:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=sua-chave-secreta-super-forte
   PORT=3000
   NODE_ENV=production
   ```
3. **Deploy automático** - O Nixpacks detectará automaticamente o projeto

### Configuração Manual

Se preferir configuração manual:

1. **Build Command**: `npm run build`
2. **Start Command**: `npm run deploy`
3. **Port**: `3000`

### Variáveis de Ambiente Obrigatórias

- `DATABASE_URL`: URL de conexão PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT
- `PORT`: Porta da aplicação (padrão: 3000)
- `NODE_ENV`: Ambiente (production)

## 🗄️ Estrutura do Banco de Dados

### Entidades Principais

- **User**: Usuários do sistema
- **Consumer**: Clientes consumidores
- **Generator**: Clientes geradores

### Relacionamentos

- Consumer → Generator (many-to-one)
- Generator → Consumer[] (one-to-many)

## 📊 Funcionalidades da Dashboard

### Indicadores Principais
- Total de geradores cadastrados
- Total de consumidores
- Potência instalada total
- Novos clientes na semana

### Gráficos e Distribuições
- Distribuição por estado (SC, PR, outros)
- Distribuição por tipo de fonte
- Distribuição por tipo de consumidor

### Insights Calculados
- Consumo total mensal
- Taxa de alocação (%)
- Economia estimada (R$)
- Utilização de capacidade

## 🔧 Scripts Disponíveis

- `npm run build` - Compilar aplicação
- `npm run start:dev` - Desenvolvimento
- `npm run start:prod` - Produção
- `npm run db:migrate` - Executar migrations
- `npm run db:generate` - Gerar cliente Prisma
- `npm run db:seed` - Seed inicial
- `npm run deploy` - Deploy (migrate + start)

## 🏗️ Arquitetura

### Estrutura Modular (DDD)
```
src/
├── modules/
│   ├── auth/          # Autenticação
│   ├── users/         # Usuários
│   ├── consumers/     # Consumidores
│   ├── generators/    # Geradores
│   └── dashboard/     # Dashboard
├── common/
│   ├── guards/        # Guards de autenticação
│   ├── decorators/    # Decorators customizados
│   └── filters/       # Filtros de exceção
├── config/
│   ├── prisma.service.ts
│   └── config.module.ts
└── scripts/
    └── seed.ts        # Script de seed
```

### Validações e DTOs
- Validação completa com class-validator
- DTOs tipados para todas as operações
- Transformação automática de dados

### Segurança
- Autenticação JWT
- Guards de proteção
- Validação de entrada
- CORS configurado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através do email: douglasmelere@gmail.com

