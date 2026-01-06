# 💰 Rotas da API - Sistema de Comissionamento

## 📋 Resumo

Este documento contém **todas as rotas relacionadas ao sistema de comissionamento** implementado no backend.

---

## 🎯 **Base URL:** `https://seu-dominio.com/api`

---

## 👤 **ROTAS PARA REPRESENTANTES**

### 📊 **Comissões do Representante**

#### `GET /commissions/representative/my-commissions`
- **Descrição:** Listar todas as comissões do representante logado
- **Autenticação:** RepresentativeJwtAuthGuard
- **Resposta:** Array de comissões com dados do consumidor

#### `GET /commissions/representative/stats`
- **Descrição:** Estatísticas de comissões do representante
- **Autenticação:** RepresentativeJwtAuthGuard
- **Resposta:** Total, pago, pendente, evolução mensal

#### `GET /commissions/representative/by-period?startDate=2024-01-01&endDate=2024-12-31`
- **Descrição:** Filtrar comissões por período
- **Autenticação:** RepresentativeJwtAuthGuard
- **Query Params:** 
  - `startDate` (formato YYYY-MM-DD)
  - `endDate` (formato YYYY-MM-DD)

#### `GET /commissions/representative/:id`
- **Descrição:** Detalhes de uma comissão específica
- **Autenticação:** RepresentativeJwtAuthGuard
- **Params:** `id` (ID da comissão)

---

## 🎛️ **ROTAS PARA ADMINISTRADORES/OPERADORES**

### 💰 **Gestão de Comissões**

#### `GET /commissions/pending`
- **Descrição:** Listar comissões pendentes de pagamento
- **Autenticação:** JwtAuthGuard + HierarchyAuthGuard
- **Permissão:** OPERATOR ou superior
- **Resposta:** Array de comissões pendentes

#### `POST /commissions/:id/mark-paid`
- **Descrição:** Marcar comissão como paga
- **Autenticação:** JwtAuthGuard + HierarchyAuthGuard
- **Permissão:** OPERATOR ou superior
- **Params:** `id` (ID da comissão)
- **Body:** Nenhum

#### `GET /commissions/admin/stats`
- **Descrição:** Estatísticas gerais de comissões
- **Autenticação:** JwtAuthGuard + HierarchyAuthGuard
- **Permissão:** OPERATOR ou superior

### ⚙️ **Configurações do Sistema**

#### `GET /settings/kwh-price`
- **Descrição:** Obter valor atual do kWh
- **Autenticação:** Nenhuma (público)
- **Resposta:** `{ value: 0.90 }`

#### `POST /settings/kwh-price`
- **Descrição:** Definir valor do kWh
- **Autenticação:** JwtAuthGuard + HierarchyAuthGuard
- **Permissão:** ADMIN
- **Body:** 
```json
{
  "price": 0.95
}
```

#### `GET /settings/kwh-price/history`
- **Descrição:** Histórico de alterações do preço
- **Autenticação:** JwtAuthGuard + HierarchyAuthGuard
- **Permissão:** ADMIN

#### `GET /settings`
- **Descrição:** Todas as configurações do sistema
- **Autenticação:** JwtAuthGuard + HierarchyAuthGuard
- **Permissão:** ADMIN

#### `POST /settings`
- **Descrição:** Definir configuração genérica
- **Autenticação:** JwtAuthGuard + HierarchyAuthGuard
- **Permissão:** ADMIN
- **Body:**
```json
{
  "key": "string",
  "value": "string",
  "description": "string"
}
```

#### `GET /settings/stats`
- **Descrição:** Estatísticas do sistema
- **Autenticação:** JwtAuthGuard + HierarchyAuthGuard
- **Permissão:** ADMIN

### 🔄 **Processamento em Lote**

#### `POST /consumers/generate-commissions`
- **Descrição:** Gerar comissões para consumidores aprovados sem comissão
- **Autenticação:** JwtAuthGuard + HierarchyAuthGuard
- **Permissão:** ADMIN
- **Resposta:** Relatório de processamento

---

## 📊 **EXEMPLOS DE RESPOSTAS**

### 💰 **Lista de Comissões (Representante)**
```json
GET /commissions/representative/my-commissions

[
  {
    "id": "comm-123",
    "representativeId": "rep-456",
    "consumerId": "cons-789",
    "kwhConsumption": 509,
    "kwhPrice": 0.90,
    "commissionValue": 198.08,
    "status": "PAID",
    "calculatedAt": "2024-10-15T10:30:00Z",
    "paidAt": "2024-10-20T14:15:00Z",
    "consumer": {
      "id": "cons-789",
      "name": "João Silva",
      "cpfCnpj": "123.456.789-00",
      "averageMonthlyConsumption": 509,
      "city": "Florianópolis",
      "state": "SC"
    }
  }
]
```

### 📈 **Estatísticas (Representante)**
```json
GET /commissions/representative/stats

{
  "totalCommissions": 2450.00,
  "paidCommissions": 1800.00,
  "pendingCommissions": 650.00,
  "totalConsumers": 15,
  "statusBreakdown": {
    "paid": 12,
    "calculated": 3
  },
  "monthlyCommissions": [
    {
      "month": "Out 2024",
      "count": 5,
      "value": 850.00
    }
  ]
}
```

### ⚙️ **Valor do kWh**
```json
GET /settings/kwh-price

0.90
```

### 🔄 **Processamento em Lote**
```json
POST /consumers/generate-commissions

{
  "totalProcessed": 15,
  "successful": 14,
  "errors": 1,
  "results": [
    {
      "consumerId": "cons-123",
      "consumerName": "João Silva",
      "representativeId": "rep-456",
      "representativeName": "Maria Rep",
      "commissionValue": 198.08,
      "status": "SUCCESS"
    }
  ]
}
```

### 📋 **Comissões Pendentes (Admin)**
```json
GET /commissions/pending

[
  {
    "id": "comm-456",
    "representativeId": "rep-789",
    "consumerId": "cons-123",
    "kwhConsumption": 350,
    "kwhPrice": 0.90,
    "commissionValue": 136.25,
    "status": "CALCULATED",
    "calculatedAt": "2024-10-18T09:15:00Z",
    "representative": {
      "id": "rep-789",
      "name": "Maria Representante",
      "email": "maria@email.com"
    },
    "consumer": {
      "id": "cons-123",
      "name": "Pedro Costa",
      "cpfCnpj": "987.654.321-00",
      "averageMonthlyConsumption": 350,
      "city": "São Paulo",
      "state": "SP"
    }
  }
]
```

### 📊 **Estatísticas do Sistema (Admin)**
```json
GET /settings/stats

{
  "totalConsumers": 150,
  "totalRepresentatives": 25,
  "totalCommissions": 89,
  "totalCommissionsValue": 15420.50,
  "currentKwhPrice": 0.90,
  "lastUpdated": "2024-10-18T12:00:00Z"
}
```

---

## 🔐 **AUTENTICAÇÃO**

### **Para Representantes:**
- **Header:** `Authorization: Bearer <token_representante>`
- **Guard:** `RepresentativeJwtAuthGuard`

### **Para Administradores:**
- **Header:** `Authorization: Bearer <token_admin>`
- **Guard:** `JwtAuthGuard + HierarchyAuthGuard`
- **Permissões:** OPERATOR, MANAGER, ADMIN, SUPER_ADMIN

---

## 🚀 **COMO TESTAR**

### **1. Autenticação**
```bash
# Login como representante
POST /auth/representative/login
{
  "email": "representante@email.com",
  "password": "senha123"
}

# Login como admin
POST /auth/login
{
  "email": "admin@email.com",
  "password": "senha123"
}
```

### **2. Usar Token**
```bash
# Adicionar no header de todas as requisições
Authorization: Bearer <token_recebido>
```

### **3. Testar Rotas**
```bash
# Exemplo: Listar comissões do representante
curl -H "Authorization: Bearer <token>" \
     https://seu-dominio.com/api/commissions/representative/my-commissions

# Exemplo: Definir valor do kWh (admin)
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"price": 0.95}' \
     https://seu-dominio.com/api/settings/kwh-price
```

---

## 📝 **CÓDIGOS DE STATUS**

- **200:** Sucesso
- **201:** Criado com sucesso
- **400:** Erro de validação
- **401:** Não autenticado
- **403:** Sem permissão
- **404:** Recurso não encontrado
- **500:** Erro interno do servidor

---

## 🎯 **FÓRMULA DE CÁLCULO**

```typescript
// C = (K * 0.865 * P) / 2
const commission = (kwhConsumption * 0.865 * kwhPrice) / 2;

// Exemplo:
// K = 509 kWh
// P = R$ 0,90
// C = (509 * 0.865 * 0.90) / 2 = R$ 198,08
```

### 📝 **IMPORTANTE:**
- ✅ **Comissão é calculada automaticamente** pela fórmula fixa
- ❌ **Não há mais percentual individual** por representante
- ✅ **Valor do kWh é configurável** pelo administrador
- ✅ **Comissão é "congelada"** no momento da aprovação

---

## 📋 **STATUS DAS COMISSÕES**

- **PENDING:** Aguardando cálculo
- **CALCULATED:** Calculada, aguardando pagamento
- **PAID:** Paga
- **CANCELLED:** Cancelada

---

**📅 Data da Atualização**: Janeiro 2025  
**👨‍💻 Responsável**: Backend Team  
**🔄 Status**: Implementado e Testado
