# 👤 Atualizações do Frontend - Sistema de Representantes

## 📋 Resumo das Implementações

O backend foi atualizado com **novos campos para consumidores** e **sistema de comissões**. Aqui estão todas as modificações necessárias no frontend dos representantes.

---

## 🆕 **1. NOVOS CAMPOS DE CONSUMIDORES**

### 📝 **Campos Obrigatórios (Novos)**

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `documentType` | Select | Tipo do documento (CPF/CNPJ) | Obrigatório |
| `phone` | Text | Telefone do consumidor | Obrigatório |
| `email` | Email | E-mail do consumidor | Obrigatório, formato válido |
| `street` | Text | Rua do endereço | Obrigatório |
| `number` | Text | Número do endereço | Obrigatório |
| `neighborhood` | Text | Bairro | Obrigatório |
| `zipCode` | Text | CEP | Obrigatório, formato 00000-000 |

### 📝 **Campos Opcionais (Novos)**

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `representativeName` | Text | Nome do representante | Opcional |
| `representativeRg` | Text | RG do representante | Opcional |
| `receiveWhatsapp` | Checkbox | Receber WhatsApp | Padrão: false |
| `complement` | Text | Complemento do endereço | Opcional |
| `birthDate` | Date | Data de nascimento | Opcional, não pode ser futura |
| `observations` | Textarea | Observações | Opcional |
| `arrivalDate` | Date | Data de chegada | Opcional, não pode ser futura |

---

## 🎨 **2. LAYOUT SUGERIDO PARA FORMULÁRIO**

### 📱 **Seção: Dados Pessoais**
```typescript
// Campos obrigatórios
- Nome Completo (já existia)
- Tipo do Documento (novo) - Select: CPF/CNPJ
- Documento (já existia)
- Telefone (novo) - Máscara: (00) 00000-0000
- E-mail (novo) - Validação de formato
- Data de Nascimento (novo) - Date picker
```

### 🏠 **Seção: Endereço**
```typescript
// Campos obrigatórios
- Rua (novo)
- Número (novo)
- Complemento (novo) - Opcional
- Bairro (novo)
- Cidade (já existia)
- UF (já existia)
- CEP (novo) - Máscara: 00000-000
```

### ⚡ **Seção: Dados Técnicos**
```typescript
// Campos existentes (mantidos)
- Concessionária
- Número UC
- Classe Instalação
- kWh Mensal
- Desconto Oferecido
```

### 👤 **Seção: Dados do Representante (Opcional)**
```typescript
// Campos opcionais
- Nome do Representante (novo)
- RG do Representante (novo)
- Data de Chegada (novo)
```

### 📝 **Seção: Configurações**
```typescript
// Campos opcionais
- Receber WhatsApp (novo) - Checkbox
- Observações (novo) - Textarea
```

---

## 💰 **3. NOVA FUNCIONALIDADE: SISTEMA DE COMISSÕES**

### 🎛️ **Nova Página: Minhas Comissões**

**Rota:** `/representative/commissions`

**Funcionalidades:**
- ✅ **Ver todas as comissões** do representante
- ✅ **Filtros** por período, status, consumidor
- ✅ **Estatísticas** detalhadas
- ✅ **Histórico** de comissões

**Layout Sugerido:**
```typescript
// Card: Resumo Financeiro
- Total de Comissões: R$ 2.450,00
- Comissões Pagas: R$ 1.800,00
- Comissões Pendentes: R$ 650,00
- Total de Consumidores: 15

// Tabela: Lista de Comissões
| Consumidor | kWh | Valor | Status | Data |
|------------|-----|--------|--------|------|
| João Silva | 509 | R$ 198,08 | Pago | 15/10/2025 |
| Maria Santos | 350 | R$ 136,25 | Pendente | 18/10/2025 |

// Filtros
- Período: Date range picker
- Status: Select (Todos/Pago/Pendente)
- Consumidor: Search input
```

### 📊 **Nova Página: Estatísticas de Comissões**

**Rota:** `/representative/commissions/stats`

**Funcionalidades:**
- ✅ **Gráficos** de evolução mensal
- ✅ **Distribuição** por status
- ✅ **Top consumidores** por valor
- ✅ **Métricas** de performance

**Layout Sugerido:**
```typescript
// Card: Evolução Mensal (Gráfico)
- Últimos 6 meses
- Valor total por mês
- Número de comissões por mês

// Card: Distribuição por Status
- Pago: 70%
- Pendente: 30%

// Card: Top Consumidores
- João Silva: R$ 198,08
- Maria Santos: R$ 136,25
- Pedro Costa: R$ 124,50
```

### 🔍 **Nova Página: Detalhes da Comissão**

**Rota:** `/representative/commissions/:id`

**Funcionalidades:**
- ✅ **Informações completas** da comissão
- ✅ **Dados do consumidor** relacionado
- ✅ **Histórico** de alterações
- ✅ **Cálculo detalhado** da comissão

**Layout Sugerido:**
```typescript
// Card: Informações da Comissão
- Valor: R$ 198,08
- Status: Pago
- Data de Cálculo: 15/10/2025
- Data de Pagamento: 20/10/2025

// Card: Dados do Consumidor
- Nome: João Silva
- kWh: 509
- Cidade: Florianópolis
- Status: Aprovado

// Card: Cálculo Detalhado
- Consumo: 509 kWh
- Preço do kWh: R$ 0,90
- Fórmula: (509 * 0.865 * 0.90) / 2
- Resultado: R$ 198,08
```

---

## 🔗 **4. NOVOS ENDPOINTS DA API**

### 📤 **Comissões do Representante**
```
GET /commissions/representative/my-commissions     - Listar comissões
GET /commissions/representative/stats              - Estatísticas
GET /commissions/representative/by-period          - Filtrar por período
GET /commissions/representative/:id                 - Detalhes de uma comissão
```

### 📤 **Consumidores (Atualizados)**
```
POST /consumers/representative                      - Cadastrar consumidor (novos campos)
GET /consumers/representative/my-consumers          - Listar consumidores
GET /consumers/representative/filtered              - Filtrar consumidores
PATCH /consumers/representative/:id                 - Atualizar consumidor
```

---

## 🎨 **5. COMPONENTES SUGERIDOS**

### 💰 **Componente: CommissionCard**
```typescript
interface CommissionCardProps {
  commission: {
    id: string;
    consumerName: string;
    kwh: number;
    value: number;
    status: 'PENDING' | 'PAID';
    date: string;
  };
  onViewDetails: (id: string) => void;
}
```

### 📊 **Componente: CommissionStats**
```typescript
interface CommissionStatsProps {
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  totalConsumers: number;
  monthlyEvolution: Array<{
    month: string;
    count: number;
    value: number;
  }>;
}
```

### 📝 **Componente: ConsumerForm (Atualizado)**
```typescript
interface ConsumerFormProps {
  // Campos existentes + novos campos
  documentType: 'CPF' | 'CNPJ';
  phone: string;
  email: string;
  street: string;
  number: string;
  neighborhood: string;
  zipCode: string;
  representativeName?: string;
  representativeRg?: string;
  receiveWhatsapp?: boolean;
  complement?: string;
  birthDate?: string;
  observations?: string;
  arrivalDate?: string;
}
```

### 🔍 **Componente: CommissionFilters**
```typescript
interface CommissionFiltersProps {
  onFilterChange: (filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    consumerName?: string;
  }) => void;
}
```

---

## 🚀 **6. IMPLEMENTAÇÃO SUGERIDA**

### 📋 **Checklist de Implementação:**

**Fase 1: Campos de Consumidores**
- [ ] Atualizar formulário de cadastro
- [ ] Adicionar validações para novos campos
- [ ] Implementar máscaras (telefone, CEP)
- [ ] Organizar campos em seções
- [ ] Atualizar listagem de consumidores

**Fase 2: Sistema de Comissões**
- [ ] Criar página de comissões
- [ ] Implementar estatísticas
- [ ] Adicionar filtros e busca
- [ ] Criar página de detalhes

**Fase 3: Integração e Testes**
- [ ] Testar todos os endpoints
- [ ] Validar cálculos de comissão
- [ ] Implementar tratamento de erros
- [ ] Adicionar loading states

---

## 📊 **7. EXEMPLOS DE PAYLOAD**

### 📤 **Cadastro de Consumidor (Atualizado)**
```json
{
  "name": "João Silva Santos",
  "documentType": "CPF",
  "cpfCnpj": "123.456.789-00",
  "phone": "(48) 99999-9999",
  "email": "joao@email.com",
  "concessionaire": "CELESC",
  "ucNumber": "12345678",
  "consumerType": "RESIDENTIAL",
  "phase": "MONOPHASIC",
  "averageMonthlyConsumption": 509,
  "discountOffered": 15.5,
  "receiveWhatsapp": true,
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 101",
  "neighborhood": "Centro",
  "city": "Florianópolis",
  "state": "SC",
  "zipCode": "88010-000",
  "birthDate": "1990-01-15",
  "observations": "Cliente preferencial",
  "arrivalDate": "2024-01-15"
}
```

### 📤 **Resposta: Lista de Comissões**
```json
{
  "commissions": [
    {
      "id": "comm-123",
      "consumerName": "João Silva",
      "kwhConsumption": 509,
      "commissionValue": 198.08,
      "status": "PAID",
      "calculatedAt": "2024-10-15T10:30:00Z",
      "paidAt": "2024-10-20T14:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### 📤 **Resposta: Estatísticas**
```json
{
  "totalCommissions": 2450.00,
  "paidCommissions": 1800.00,
  "pendingCommissions": 650.00,
  "totalConsumers": 15,
  "monthlyEvolution": [
    {
      "month": "Out 2024",
      "count": 5,
      "value": 850.00
    }
  ]
}
```

---

## 🎯 **8. BENEFÍCIOS PARA REPRESENTANTES**

- ✅ **Dados mais completos** dos consumidores
- ✅ **Acompanhamento de comissões** em tempo real
- ✅ **Estatísticas detalhadas** de performance
- ✅ **Histórico completo** de comissões
- ✅ **Filtros avançados** para análise
- ✅ **Transparência total** sobre valores

---

## 📱 **9. SUGESTÕES DE UX/UI**

### 🎨 **Design Sugerido:**
- **Cores**: Verde para comissões pagas, laranja para pendentes
- **Ícones**: 💰 para comissões, 📊 para estatísticas
- **Gráficos**: Barras para evolução mensal, pizza para distribuição
- **Responsivo**: Funciona bem em mobile e desktop

### 🔔 **Notificações Sugeridas:**
- "Nova comissão disponível: R$ 198,08"
- "Comissão paga: R$ 136,25"
- "Consumidor aprovado: João Silva"

---

**📅 Data da Atualização**: Janeiro 2025  
**👨‍💻 Responsável**: Backend Team  
**🔄 Status**: Implementado e Testado

