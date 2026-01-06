# 🎛️ Atualizações do Frontend - Sistema Interno (Admins/Operadores)

## 📋 Resumo das Implementações

O backend foi atualizado com **novos campos para consumidores** e **sistema de comissões**. Aqui estão todas as modificações necessárias no frontend interno.

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

### 👤 **Seção: Representante (Opcional)**
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

## 💰 **3. SISTEMA DE COMISSÕES**

### 🎛️ **Nova Página: Configurações do Sistema**

**Rota:** `/admin/settings`

**Funcionalidades:**
- ✅ **Definir valor do kWh** (campo numérico)
- ✅ **Ver valor atual** do kWh
- ✅ **Histórico de alterações** (tabela com datas)
- ✅ **Estatísticas gerais** do sistema

**Layout Sugerido:**
```typescript
// Card: Valor Atual do kWh
- Valor atual: R$ 0,90
- Última atualização: 18/10/2025
- Botão: "Alterar Valor"

// Card: Histórico de Alterações
- Tabela com: Data, Valor, Usuário
- Ordenação: Mais recente primeiro

// Card: Estatísticas
- Total de Consumidores
- Total de Representantes
- Total de Comissões
- Valor Total de Comissões
```

### 📊 **Nova Página: Gestão de Comissões**

**Rota:** `/admin/commissions`

**Funcionalidades:**
- ✅ **Listar comissões pendentes** (tabela)
- ✅ **Marcar comissões como pagas** (botão por linha)
- ✅ **Filtros** por representante, período, status
- ✅ **Estatísticas** de comissões

**Layout da Tabela:**
```typescript
| Representante | Consumidor | kWh | Valor | Status | Ações |
|---------------|------------|-----|--------|--------|------|
| Maria Rep.    | João Silva | 509 | R$ 198,08 | Pendente | Marcar Pago |
```

**Filtros Disponíveis:**
- Por representante (select)
- Por período (date range)
- Por status (select: Pendente/Pago)
- Por valor (range slider)

### 🔄 **Atualização: Página de Aprovação de Consumidores**

**Funcionalidades Adicionais:**
- ✅ **Mostrar valor do kWh** atual no momento da aprovação
- ✅ **Calcular comissão** automaticamente (preview)
- ✅ **Indicar se gerará comissão** (se tem representante)

**Layout Sugerido:**
```typescript
// Card: Informações do Consumidor
- Dados do consumidor (todos os novos campos)
- Representante vinculado (se houver)

// Card: Cálculo de Comissão (se tem representante)
- kWh do consumidor: 509
- Valor do kWh: R$ 0,90
- Comissão calculada: R$ 198,08
- Status: Será criada automaticamente

// Botões de Ação
- Aprovar (cria comissão automaticamente)
- Rejeitar
```

---

## 🔗 **4. NOVOS ENDPOINTS DA API**

### 📤 **Configurações do Sistema**
```
GET /settings/kwh-price              - Obter valor atual
POST /settings/kwh-price             - Definir novo valor
GET /settings/kwh-price/history      - Histórico de alterações
GET /settings/stats                  - Estatísticas do sistema
```

### 📤 **Gestão de Comissões**
```
GET /commissions/pending             - Comissões pendentes
POST /commissions/:id/mark-paid      - Marcar como paga
GET /commissions/admin/stats         - Estatísticas de comissões
```

### 📤 **Processamento em Lote**
```
POST /consumers/generate-commissions - Gerar comissões para consumidores existentes
```

---

## 🎨 **5. COMPONENTES SUGERIDOS**

### 📱 **Componente: KwhPriceSelector**
```typescript
interface KwhPriceSelectorProps {
  currentPrice: number;
  onPriceChange: (price: number) => void;
  history: Array<{
    date: string;
    price: number;
    user: string;
  }>;
}
```

### 📊 **Componente: CommissionTable**
```typescript
interface CommissionTableProps {
  commissions: Array<{
    id: string;
    representative: string;
    consumer: string;
    kwh: number;
    value: number;
    status: 'PENDING' | 'PAID';
    date: string;
  }>;
  onMarkAsPaid: (id: string) => void;
  filters: {
    representative?: string;
    status?: string;
    dateRange?: { start: string; end: string };
  };
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
- [ ] Criar página de configurações
- [ ] Implementar gestão de comissões
- [ ] Atualizar página de aprovação
- [ ] Adicionar filtros e estatísticas

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

### 📤 **Definir Valor do kWh**
```json
POST /settings/kwh-price
{
  "price": 0.95
}
```

### 📤 **Marcar Comissão como Paga**
```json
POST /commissions/commission-id/mark-paid
```

---

## 🎯 **8. BENEFÍCIOS DA IMPLEMENTAÇÃO**

- ✅ **Dados mais completos** dos consumidores
- ✅ **Controle total** sobre valores de comissão
- ✅ **Histórico preservado** de alterações
- ✅ **Gestão eficiente** de comissões
- ✅ **Auditoria completa** de todas as ações
- ✅ **Flexibilidade** para ajustes futuros

---

**📅 Data da Atualização**: Janeiro 2025  
**👨‍💻 Responsável**: Backend Team  
**🔄 Status**: Implementado e Testado

