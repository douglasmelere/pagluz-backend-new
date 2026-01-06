# API de Consumidores para Representantes - Pagluz Backend

## Visão Geral

Este documento descreve os novos endpoints implementados para que os representantes possam gerenciar e acompanhar seus consumidores através do app externo.

## Autenticação

Todos os endpoints requerem autenticação via token JWT do representante. O token deve ser enviado no header:

```
Authorization: Bearer {representative_token}
```

## Endpoints Implementados

### 1. Listar Consumidores com Filtros Avançados

**Endpoint:** `GET /consumers/representative/filtered`

**Descrição:** Lista os consumidores do representante logado com filtros avançados e paginação.

**Query Parameters:**
- `status` (opcional): Filtro por status do consumidor (`AVAILABLE`, `ALLOCATED`, `IN_PROCESS`, `CONVERTED`)
- `consumerType` (opcional): Filtro por tipo de consumidor (`RESIDENTIAL`, `COMMERCIAL`, `INDUSTRIAL`, `RURAL`, `PUBLIC_POWER`)
- `state` (opcional): Filtro por estado (ex: `SC`, `SP`)
- `city` (opcional): Filtro por cidade (busca parcial, case-insensitive)
- `startDate` (opcional): Data inicial para filtro por período (formato ISO: `2024-01-01`)
- `endDate` (opcional): Data final para filtro por período (formato ISO: `2024-12-31`)
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20, máximo: 100)

**Exemplo de Requisição:**
```http
GET /consumers/representative/filtered?status=ALLOCATED&state=SC&page=1&limit=10
Authorization: Bearer {representative_token}
```

**Resposta:**
```json
{
  "consumers": [
    {
      "id": "consumer_id",
      "name": "João Silva",
      "cpfCnpj": "123.456.789-00",
      "ucNumber": "12345678",
      "concessionaire": "CELESC",
      "city": "Florianópolis",
      "state": "SC",
      "consumerType": "RESIDENTIAL",
      "phase": "MONOPHASIC",
      "averageMonthlyConsumption": 350.5,
      "discountOffered": 12.0,
      "status": "ALLOCATED",
      "allocatedPercentage": 85.0,
      "generatorId": "generator_id",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:45:00.000Z",
      "generator": {
        "id": "generator_id",
        "ownerName": "Usina Solar ABC",
        "sourceType": "SOLAR",
        "installedPower": 1000.0,
        "status": "ACTIVE",
        "city": "Florianópolis",
        "state": "SC"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "totalConsumers": 25,
    "totalKwh": 8750.5,
    "allocatedKwh": 7437.9,
    "pendingKwh": 1312.6,
    "statusBreakdown": {
      "available": 5,
      "allocated": 15,
      "inProcess": 3,
      "converted": 2
    }
  }
}
```

### 2. Obter Consumidor Específico

**Endpoint:** `GET /consumers/representative/{id}`

**Descrição:** Obtém os detalhes completos de um consumidor específico do representante.

**Parâmetros:**
- `id`: ID do consumidor

**Exemplo de Requisição:**
```http
GET /consumers/representative/consumer_123
Authorization: Bearer {representative_token}
```

**Resposta:**
```json
{
  "id": "consumer_123",
  "name": "João Silva",
  "cpfCnpj": "123.456.789-00",
  "ucNumber": "12345678",
  "concessionaire": "CELESC",
  "city": "Florianópolis",
  "state": "SC",
  "consumerType": "RESIDENTIAL",
  "phase": "MONOPHASIC",
  "averageMonthlyConsumption": 350.5,
  "discountOffered": 12.0,
  "status": "ALLOCATED",
  "allocatedPercentage": 85.0,
  "generatorId": "generator_456",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z",
  "generator": {
    "id": "generator_456",
    "ownerName": "Usina Solar ABC",
    "sourceType": "SOLAR",
    "installedPower": 1000.0,
    "status": "ACTIVE",
    "city": "Florianópolis",
    "state": "SC",
    "concessionaire": "CELESC"
  },
  "Representative": {
    "id": "rep_789",
    "name": "Maria Santos",
    "email": "maria@pagluz.com",
    "commissionRate": 5.0
  }
}
```

### 3. Atualizar Consumidor

**Endpoint:** `PATCH /consumers/representative/{id}`

**Descrição:** Permite ao representante atualizar informações do consumidor (campos permitidos).

**Parâmetros:**
- `id`: ID do consumidor

**Body (JSON):**
```json
{
  "name": "João Silva Atualizado",
  "phone": "(48) 99999-9999",
  "city": "São José",
  "state": "SC",
  "averageMonthlyConsumption": 380.0,
  "discountOffered": 15.0,
  "status": "IN_PROCESS",
  "notes": "Cliente interessado em expandir"
}
```

**Campos Permitidos para Atualização:**
- `name`: Nome do consumidor
- `phone`: Telefone de contato
- `city`: Cidade
- `state`: Estado
- `averageMonthlyConsumption`: Consumo médio mensal
- `discountOffered`: Desconto oferecido
- `status`: Status do consumidor
- `notes`: Observações

**Exemplo de Requisição:**
```http
PATCH /consumers/representative/consumer_123
Authorization: Bearer {representative_token}
Content-Type: application/json

{
  "status": "IN_PROCESS",
  "notes": "Cliente aprovou proposta, aguardando documentos"
}
```

**Resposta:**
```json
{
  "id": "consumer_123",
  "name": "João Silva",
  "status": "IN_PROCESS",
  "notes": "Cliente aprovou proposta, aguardando documentos",
  "updatedAt": "2024-01-25T16:20:00.000Z",
  // ... outros campos
}
```

### 4. Obter Estatísticas Detalhadas

**Endpoint:** `GET /consumers/representative/stats/overview`

**Descrição:** Obtém estatísticas completas dos consumidores do representante.

**Exemplo de Requisição:**
```http
GET /consumers/representative/stats/overview
Authorization: Bearer {representative_token}
```

**Resposta:**
```json
{
  "totalConsumers": 45,
  "totalKwh": 15750.5,
  "allocatedKwh": 13387.9,
  "pendingKwh": 2362.6,
  "allocationRate": 84.98,
  "averageDiscount": 12.5,
  "statusBreakdown": {
    "available": 8,
    "allocated": 28,
    "inProcess": 7,
    "converted": 2
  },
  "typeBreakdown": {
    "RESIDENTIAL": 25,
    "COMMERCIAL": 15,
    "INDUSTRIAL": 5
  },
  "stateBreakdown": {
    "SC": 30,
    "PR": 10,
    "RS": 5
  },
  "monthlyEvolution": [
    {
      "month": "ago 2024",
      "count": 5,
      "kwh": 1750.5
    },
    {
      "month": "set 2024",
      "count": 8,
      "kwh": 2800.0
    },
    // ... últimos 6 meses
  ]
}
```

### 5. Histórico de Atividades do Consumidor

**Endpoint:** `GET /consumers/representative/{id}/activity-history`

**Descrição:** Obtém o histórico completo de atividades de um consumidor específico.

**Parâmetros:**
- `id`: ID do consumidor

**Exemplo de Requisição:**
```http
GET /consumers/representative/consumer_123/activity-history
Authorization: Bearer {representative_token}
```

**Resposta:**
```json
{
  "consumer": {
    "id": "consumer_123",
    "name": "João Silva",
    "cpfCnpj": "123.456.789-00",
    "status": "ALLOCATED"
  },
  "activities": [
    {
      "id": "activity_001",
      "action": "CREATE",
      "description": "Consumidor foi cadastrado - João Silva",
      "icon": "user-plus",
      "color": "green",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": "rep_789",
        "name": "Maria Santos",
        "email": "maria@pagluz.com",
        "role": "REPRESENTATIVE"
      },
      "oldValues": null,
      "newValues": {
        "name": "João Silva",
        "cpfCnpj": "123.456.789-00",
        "status": "AVAILABLE"
      },
      "metadata": {
        "representativeId": "rep_789",
        "createdBy": "representative"
      },
      "ipAddress": "192.168.1.100"
    },
    {
      "id": "activity_002",
      "action": "UPDATE",
      "description": "Dados do consumidor foram atualizados",
      "icon": "edit",
      "color": "blue",
      "timestamp": "2024-01-20T14:45:00.000Z",
      "user": {
        "id": "rep_789",
        "name": "Maria Santos",
        "email": "maria@pagluz.com",
        "role": "REPRESENTATIVE"
      },
      "oldValues": {
        "status": "AVAILABLE",
        "averageMonthlyConsumption": 350.0
      },
      "newValues": {
        "status": "IN_PROCESS",
        "averageMonthlyConsumption": 380.0
      },
      "metadata": {
        "representativeId": "rep_789",
        "updatedBy": "representative"
      },
      "ipAddress": "192.168.1.100"
    }
  ],
  "totalActivities": 2
}
```

## Endpoints Existentes (Mantidos)

### Listar Meus Consumidores (Simples)
**Endpoint:** `GET /consumers/representative/my-consumers`

### Criar Consumidor
**Endpoint:** `POST /consumers/representative`

## Códigos de Status HTTP

- `200 OK`: Operação realizada com sucesso
- `201 Created`: Consumidor criado com sucesso
- `400 Bad Request`: Dados inválidos ou representante inativo
- `401 Unauthorized`: Token inválido ou expirado
- `403 Forbidden`: Acesso negado
- `404 Not Found`: Consumidor não encontrado ou não pertence ao representante
- `409 Conflict`: Conflito de dados (ex: CPF/CNPJ duplicado)
- `500 Internal Server Error`: Erro interno do servidor

## Status dos Consumidores

- `AVAILABLE`: Disponível para alocação
- `ALLOCATED`: Alocado a um gerador
- `IN_PROCESS`: Em processo de negociação/implementação
- `CONVERTED`: Cliente convertido (fechou negócio)

## Tipos de Consumidores

- `RESIDENTIAL`: Residencial
- `COMMERCIAL`: Comercial
- `INDUSTRIAL`: Industrial
- `RURAL`: Rural
- `PUBLIC_POWER`: Poder Público

## Considerações de Segurança

1. **Isolamento de Dados**: Representantes só podem acessar seus próprios consumidores
2. **Campos Restritos**: Representantes só podem atualizar campos específicos
3. **Auditoria Completa**: Todas as ações são registradas no sistema de auditoria
4. **Validação de Token**: Todos os endpoints validam o token JWT do representante
5. **Rate Limiting**: Recomenda-se implementar rate limiting nos endpoints

## Exemplos de Uso no Frontend

### Dashboard do Representante
```javascript
// Obter estatísticas para o dashboard
const stats = await fetch('/consumers/representative/stats/overview', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Listar consumidores recentes
const consumers = await fetch('/consumers/representative/filtered?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Listagem de Consumidores
```javascript
// Aplicar filtros
const filtered = await fetch(
  `/consumers/representative/filtered?status=IN_PROCESS&state=SC&page=1&limit=20`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

### Detalhes do Consumidor
```javascript
// Ver detalhes e histórico
const consumer = await fetch(`/consumers/representative/${consumerId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const history = await fetch(`/consumers/representative/${consumerId}/activity-history`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Atualizar Status
```javascript
// Atualizar status do consumidor
const updated = await fetch(`/consumers/representative/${consumerId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'IN_PROCESS',
    notes: 'Cliente aprovou proposta'
  })
});
```

## Notas de Implementação

1. **Paginação**: Todos os endpoints de listagem suportam paginação para otimizar performance
2. **Filtros**: Filtros são aplicados no banco de dados para máxima eficiência
3. **Auditoria**: Sistema de auditoria registra automaticamente todas as ações
4. **Validação**: Validação rigorosa de dados de entrada
5. **Performance**: Queries otimizadas com includes seletivos
6. **Segurança**: Isolamento completo entre representantes

