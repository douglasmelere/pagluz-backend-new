# Guia Completo de Integração - Sistema de Representantes

## Visão Geral do Sistema

O sistema de representantes é uma API REST desenvolvida em NestJS que gerencia representantes comerciais, consumidores de energia e geradores de energia renovável. O sistema permite que representantes cadastrem consumidores, visualizem estatísticas e gerenciem suas atividades comerciais.

## Tecnologias Utilizadas

- **Backend**: NestJS (Node.js)
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: class-validator e class-transformer
- **Documentação**: Swagger/OpenAPI
- **Criptografia**: bcryptjs para senhas

## Estrutura do Banco de Dados

### Tabela: commercial_representatives
```sql
- id: String (PK)
- name: String
- email: String (unique)
- password: String (criptografada)
- cpfCnpj: String (unique)
- phone: String
- city: String
- state: String
- commissionRate: Float (default: 0)
- specializations: String[] (array)
- status: RepresentativeStatus (ACTIVE, INACTIVE, PENDING_APPROVAL, SUSPENDED)
- notes: String (opcional)
- createdAt: DateTime
- updatedAt: DateTime
- lastLoginAt: DateTime
- loginCount: Int (default: 0)
```

### Tabela: consumers
```sql
- id: String (PK)
- name: String
- cpfCnpj: String
- ucNumber: String (Número da UC)
- concessionaire: String
- city: String
- state: String
- consumerType: ConsumerType (RESIDENTIAL, COMMERCIAL, INDUSTRIAL, RURAL, PUBLIC_POWER)
- phase: PhaseType (MONOPHASIC, BIPHASIC, TRIPHASIC)
- averageMonthlyConsumption: Float
- discountOffered: Float
- status: ConsumerStatus (AVAILABLE, ALLOCATED, IN_PROCESS, CONVERTED)
- allocatedPercentage: Float (opcional)
- generatorId: String (FK opcional)
- representativeId: String (FK)
- createdAt: DateTime
- updatedAt: DateTime
```

### Tabela: generators
```sql
- id: String (PK)
- ownerName: String
- cpfCnpj: String
- sourceType: SourceType (SOLAR, HYDRO, BIOMASS, WIND)
- installedPower: Float
- concessionaire: String
- ucNumber: String
- city: String
- state: String
- status: GeneratorStatus (UNDER_ANALYSIS, AWAITING_ALLOCATION, ACTIVE, INACTIVE)
- observations: String (opcional)
- createdAt: DateTime
- updatedAt: DateTime
```

## Endpoints da API

### Base URL
```
http://localhost:3000
```

### Documentação Swagger
```
http://localhost:3000/api
```

## 1. Autenticação

### POST /auth/login-representative
**Descrição**: Login de representante
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "email": "representante@email.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx123456",
    "email": "representante@email.com",
    "name": "João Silva",
    "role": "REPRESENTATIVE",
    "status": "ACTIVE",
    "commissionRate": 5.5,
    "lastLoginAt": "2024-01-15T10:30:00.000Z",
    "loginCount": 15
  }
}
```

**Resposta de Erro (401)**:
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas",
  "error": "Unauthorized"
}
```

## 2. Gerenciamento de Representantes

### GET /representatives/dashboard/profile
**Descrição**: Obter perfil do representante logado
**Headers**: `Authorization: Bearer {token}`
**Resposta (200)**:
```json
{
  "id": "clxxx123456",
  "name": "João Silva",
  "cpfCnpj": "123.456.789-00",
  "email": "representante@email.com",
  "phone": "(48) 99999-9999",
  "city": "Florianópolis",
  "state": "SC",
  "commissionRate": 5.5,
  "specializations": ["Solar", "Eólica"],
  "status": "ACTIVE",
  "notes": "Representante experiente",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "lastLoginAt": "2024-01-15T10:30:00.000Z",
  "loginCount": 15,
  "Consumer": [
    {
      "id": "clxxx789012",
      "name": "Maria Santos",
      "cpfCnpj": "987.654.321-00",
      "status": "ALLOCATED",
      "averageMonthlyConsumption": 350.5,
      "allocatedPercentage": 80.0,
      "createdAt": "2024-01-10T00:00:00.000Z"
    }
  ],
  "_count": {
    "Consumer": 1
  }
}
```

### PATCH /representatives/dashboard/profile
**Descrição**: Atualizar perfil do representante logado
**Headers**: `Authorization: Bearer {token}`, `Content-Type: application/json`
**Body**:
```json
{
  "name": "João Silva Santos",
  "phone": "(48) 88888-8888",
  "city": "São José",
  "specializations": ["Solar", "Eólica", "Hidrelétrica"]
}
```

### GET /representatives/dashboard/stats
**Descrição**: Obter estatísticas do representante logado
**Headers**: `Authorization: Bearer {token}`
**Resposta (200)**:
```json
{
  "representative": {
    "id": "clxxx123456",
    "name": "João Silva",
    "email": "representante@email.com",
    "status": "ACTIVE",
    "commissionRate": 5.5,
    "specializations": ["Solar", "Eólica"]
  },
  "stats": {
    "totalConsumers": 15,
    "totalKwh": 5250.75,
    "allocatedKwh": 4200.60,
    "pendingKwh": 1050.15,
    "allocationRate": 80.0,
    "loginCount": 15,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  },
  "consumersByStatus": {
    "allocated": 12,
    "inProcess": 2,
    "converted": 1,
    "available": 0
  }
}
```

## 3. Gerenciamento de Consumidores

### POST /consumers/representative
**Descrição**: Criar novo consumidor (representante)
**Headers**: `Authorization: Bearer {token}`, `Content-Type: application/json`
**Body**:
```json
{
  "name": "Maria Santos",
  "cpfCnpj": "987.654.321-00",
  "ucNumber": "12345678",
  "concessionaire": "CELESC",
  "city": "Florianópolis",
  "state": "SC",
  "consumerType": "RESIDENTIAL",
  "phase": "MONOPHASIC",
  "averageMonthlyConsumption": 350.5,
  "discountOffered": 15.5,
  "status": "AVAILABLE",
  "generatorId": "clxxx999888"
}
```

**Resposta de Sucesso (201)**:
```json
{
  "id": "clxxx789012",
  "name": "Maria Santos",
  "cpfCnpj": "987.654.321-00",
  "ucNumber": "12345678",
  "concessionaire": "CELESC",
  "city": "Florianópolis",
  "state": "SC",
  "consumerType": "RESIDENTIAL",
  "phase": "MONOPHASIC",
  "averageMonthlyConsumption": 350.5,
  "discountOffered": 15.5,
  "status": "AVAILABLE",
  "allocatedPercentage": null,
  "generatorId": "clxxx999888",
  "representativeId": "clxxx123456",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "generator": {
    "id": "clxxx999888",
    "ownerName": "João Gerador",
    "sourceType": "SOLAR",
    "installedPower": 5000.0
  },
  "Representative": {
    "id": "clxxx123456",
    "name": "João Silva",
    "email": "representante@email.com"
  }
}
```

### GET /consumers/representative/my-consumers
**Descrição**: Listar consumidores do representante logado
**Headers**: `Authorization: Bearer {token}`
**Resposta (200)**:
```json
[
  {
    "id": "clxxx789012",
    "name": "Maria Santos",
    "cpfCnpj": "987.654.321-00",
    "ucNumber": "12345678",
    "concessionaire": "CELESC",
    "city": "Florianópolis",
    "state": "SC",
    "consumerType": "RESIDENTIAL",
    "phase": "MONOPHASIC",
    "averageMonthlyConsumption": 350.5,
    "discountOffered": 15.5,
    "status": "ALLOCATED",
    "allocatedPercentage": 80.0,
    "generatorId": "clxxx999888",
    "representativeId": "clxxx123456",
    "createdAt": "2024-01-10T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "generator": {
      "id": "clxxx999888",
      "ownerName": "João Gerador",
      "sourceType": "SOLAR",
      "installedPower": 5000.0,
      "status": "ACTIVE"
    }
  }
]
```

## 4. Gerenciamento de Geradores

### GET /generators
**Descrição**: Listar todos os geradores disponíveis
**Headers**: `Authorization: Bearer {token}`
**Resposta (200)**:
```json
[
  {
    "id": "clxxx999888",
    "ownerName": "João Gerador",
    "cpfCnpj": "111.222.333-44",
    "sourceType": "SOLAR",
    "installedPower": 5000.0,
    "concessionaire": "CELESC",
    "ucNumber": "87654321",
    "city": "Florianópolis",
    "state": "SC",
    "status": "ACTIVE",
    "observations": "Gerador em operação",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "consumers": [
      {
        "id": "clxxx789012",
        "name": "Maria Santos",
        "allocatedPercentage": 80.0,
        "averageMonthlyConsumption": 350.5
      }
    ],
    "allocatedPercentage": 80.0,
    "availablePercentage": 20.0,
    "allocatedCapacity": 4000.0,
    "availableCapacity": 1000.0
  }
]
```

### GET /generators/:id
**Descrição**: Obter gerador específico
**Headers**: `Authorization: Bearer {token}`
**Parâmetros**: `id` - ID do gerador
**Resposta (200)**:
```json
{
  "id": "clxxx999888",
  "ownerName": "João Gerador",
  "cpfCnpj": "111.222.333-44",
  "sourceType": "SOLAR",
  "installedPower": 5000.0,
  "concessionaire": "CELESC",
  "ucNumber": "87654321",
  "city": "Florianópolis",
  "state": "SC",
  "status": "ACTIVE",
  "observations": "Gerador em operação",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "consumers": [
    {
      "id": "clxxx789012",
      "name": "Maria Santos",
      "allocatedPercentage": 80.0,
      "averageMonthlyConsumption": 350.5
    }
  ],
  "allocatedPercentage": 80.0,
  "availablePercentage": 20.0,
  "allocatedCapacity": 4000.0,
  "availableCapacity": 1000.0
}
```

## 5. Dashboard e Estatísticas

### GET /dashboard
**Descrição**: Obter dados completos da dashboard
**Headers**: `Authorization: Bearer {token}`
**Resposta (200)**:
```json
{
  "summary": {
    "totalGenerators": 25,
    "totalConsumers": 150,
    "totalInstalledPower": 125000.0,
    "newClientsThisWeek": 8,
    "newGeneratorsThisWeek": 3,
    "newConsumersThisWeek": 5
  },
  "stateDistribution": [
    {
      "state": "SC",
      "generators": 15,
      "consumers": 80,
      "totalInstalledPower": 75000.0,
      "totalConsumption": 28000.0
    },
    {
      "state": "PR",
      "generators": 10,
      "consumers": 70,
      "totalInstalledPower": 50000.0,
      "totalConsumption": 24500.0
    }
  ],
  "recentActivity": [
    {
      "id": "clxxx789012",
      "type": "consumer",
      "name": "Maria Santos",
      "subtype": "RESIDENTIAL",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "clxxx999888",
      "type": "generator",
      "name": "João Gerador",
      "subtype": "SOLAR",
      "createdAt": "2024-01-14T15:20:00.000Z"
    }
  ],
  "insights": {
    "totalMonthlyConsumption": 52500.0,
    "allocationRate": 75.5,
    "estimatedMonthlySavings": 8500.0,
    "totalAllocatedEnergy": 39637.5,
    "capacityUtilization": {
      "totalCapacity": 125000.0,
      "allocatedCapacity": 94375.0,
      "availableCapacity": 30625.0,
      "utilizationRate": 75.5
    },
    "generatorStatus": {
      "underAnalysis": 5,
      "awaitingAllocation": 3
    }
  }
}
```

## 6. Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos
- **401**: Não autorizado (token inválido ou expirado)
- **403**: Acesso negado (permissão insuficiente)
- **404**: Recurso não encontrado
- **409**: Conflito (dados já existem)
- **500**: Erro interno do servidor

## 7. Enums e Constantes

### RepresentativeStatus
```typescript
enum RepresentativeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE", 
  PENDING_APPROVAL = "PENDING_APPROVAL",
  SUSPENDED = "SUSPENDED"
}
```

### ConsumerType
```typescript
enum ConsumerType {
  RESIDENTIAL = "RESIDENTIAL",
  COMMERCIAL = "COMMERCIAL",
  INDUSTRIAL = "INDUSTRIAL",
  RURAL = "RURAL",
  PUBLIC_POWER = "PUBLIC_POWER"
}
```

### PhaseType
```typescript
enum PhaseType {
  MONOPHASIC = "MONOPHASIC",
  BIPHASIC = "BIPHASIC",
  TRIPHASIC = "TRIPHASIC"
}
```

### ConsumerStatus
```typescript
enum ConsumerStatus {
  AVAILABLE = "AVAILABLE",
  ALLOCATED = "ALLOCATED",
  IN_PROCESS = "IN_PROCESS",
  CONVERTED = "CONVERTED"
}
```

### SourceType
```typescript
enum SourceType {
  SOLAR = "SOLAR",
  HYDRO = "HYDRO",
  BIOMASS = "BIOMASS",
  WIND = "WIND"
}
```

### GeneratorStatus
```typescript
enum GeneratorStatus {
  UNDER_ANALYSIS = "UNDER_ANALYSIS",
  AWAITING_ALLOCATION = "AWAITING_ALLOCATION",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}
```

## 8. Configuração do Sistema

### Variáveis de Ambiente Necessárias
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/energy_management"
JWT_SECRET="seu-jwt-secret-aqui"
PORT=3000
```

### Dependências NPM Principais
```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/core": "^11.0.1",
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^11.0.5",
  "@nestjs/swagger": "^11.2.0",
  "@prisma/client": "^6.11.1",
  "bcryptjs": "^3.0.2",
  "class-validator": "^0.14.2",
  "passport-jwt": "^4.0.1"
}
```

## 9. Fluxo de Autenticação

1. **Login**: POST `/auth/login-representative`
2. **Token**: Armazenar o `access_token` retornado
3. **Requisições**: Incluir header `Authorization: Bearer {token}`
4. **Validação**: Token é validado automaticamente pelo sistema
5. **Logout**: POST `/auth/logout` (opcional, tokens têm expiração de 24h)

## 10. Exemplos de Uso Prático

### Exemplo 1: Login e Obter Perfil
```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/auth/login-representative', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'representante@email.com',
    password: 'senha123'
  })
});

const { access_token } = await loginResponse.json();

// 2. Obter perfil
const profileResponse = await fetch('http://localhost:3000/representatives/dashboard/profile', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

const profile = await profileResponse.json();
```

### Exemplo 2: Cadastrar Consumidor
```javascript
const consumerData = {
  name: "Maria Santos",
  cpfCnpj: "987.654.321-00",
  ucNumber: "12345678",
  concessionaire: "CELESC",
  city: "Florianópolis",
  state: "SC",
  consumerType: "RESIDENTIAL",
  phase: "MONOPHASIC",
  averageMonthlyConsumption: 350.5,
  discountOffered: 15.5,
  status: "AVAILABLE",
  generatorId: "clxxx999888"
};

const response = await fetch('http://localhost:3000/consumers/representative', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify(consumerData)
});

const newConsumer = await response.json();
```

### Exemplo 3: Obter Estatísticas
```javascript
const statsResponse = await fetch('http://localhost:3000/representatives/dashboard/stats', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

const stats = await statsResponse.json();
console.log(`Total de consumidores: ${stats.stats.totalConsumers}`);
console.log(`Taxa de alocação: ${stats.stats.allocationRate}%`);
```

## 11. Tratamento de Erros

### Erro de Validação (400)
```json
{
  "statusCode": 400,
  "message": [
    "email deve ser um endereço de email válido",
    "password deve ter pelo menos 6 caracteres"
  ],
  "error": "Bad Request"
}
```

### Erro de Conflito (409)
```json
{
  "statusCode": 409,
  "message": "Já existe um representante com este e-mail",
  "error": "Conflict"
}
```

### Erro de Não Encontrado (404)
```json
{
  "statusCode": 404,
  "message": "Representante não encontrado",
  "error": "Not Found"
}
```

## 12. Considerações de Segurança

1. **Senhas**: Criptografadas com bcryptjs (salt rounds: 10)
2. **Tokens JWT**: Expiração de 24 horas
3. **Validação**: Todos os dados de entrada são validados
4. **CORS**: Configurado para permitir requisições de qualquer origem
5. **Auditoria**: Todas as ações são registradas em logs de auditoria

## 13. Limitações e Observações

1. **RepresentativeAuthGuard**: Atualmente implementado de forma simplificada (busca primeiro representante ativo)
2. **Tokens de Representante**: Sistema de tokens específico para representantes não está totalmente implementado
3. **Permissões**: Sistema de hierarquia focado em usuários administrativos
4. **Rate Limiting**: Não implementado (considerar para produção)

## 14. Próximos Passos para Integração

1. **Implementar autenticação real para representantes**
2. **Configurar sistema de tokens específico para representantes**
3. **Adicionar rate limiting**
4. **Implementar logs de auditoria específicos para representantes**
5. **Adicionar validações de negócio específicas**
6. **Configurar monitoramento e alertas**

Este documento fornece todas as informações necessárias para integrar o sistema externo dos representantes com a API existente. A API está pronta para uso e pode ser testada através da documentação Swagger em `http://localhost:3000/api`.
