# 📋 Atualização dos Campos de Consumidores - Frontend

## 🎯 Resumo da Atualização

O backend foi atualizado para incluir **novos campos obrigatórios e opcionais** no cadastro de consumidores. Todos os representantes e administradores agora podem preencher informações mais detalhadas sobre os consumidores.

## 🆕 Novos Campos Adicionados

### 📝 **Campos Obrigatórios (Novos)**

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `documentType` | Enum | Tipo do documento (CPF/CNPJ) | `"CPF"` ou `"CNPJ"` |
| `phone` | String | Telefone do consumidor | `"(48) 99999-9999"` |
| `email` | String | E-mail do consumidor | `"joao@email.com"` |
| `street` | String | Rua do endereço | `"Rua das Flores"` |
| `number` | String | Número do endereço | `"123"` |
| `neighborhood` | String | Bairro | `"Centro"` |
| `zipCode` | String | CEP | `"88010-000"` |

### 📝 **Campos Opcionais (Novos)**

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `representativeName` | String | Nome do representante (opcional) | `"Maria Representante"` |
| `representativeRg` | String | RG do representante (opcional) | `"12.345.678-9"` |
| `receiveWhatsapp` | Boolean | Se recebe WhatsApp (padrão: false) | `true` ou `false` |
| `complement` | String | Complemento do endereço | `"Apto 101"` |
| `birthDate` | Date | Data de nascimento | `"1990-01-15"` |
| `observations` | String | Observações | `"Cliente preferencial"` |
| `arrivalDate` | Date | Data de chegada (relacionamento com representante) | `"2024-01-15"` |

## 🔄 Campos que Já Existiam (Mantidos)

- ✅ `name` - Nome Completo
- ✅ `cpfCnpj` - Documento
- ✅ `concessionaire` - Distribuidora
- ✅ `ucNumber` - Numero UC
- ✅ `consumerType` - Classe Instalação
- ✅ `averageMonthlyConsumption` - kWh Mensal
- ✅ `city` - Cidade
- ✅ `state` - UF
- ✅ `representativeId` - Relacionamento com representante

## 🎨 Implementação no Frontend

### 📋 **Formulário de Cadastro - Campos Obrigatórios**

```typescript
// Campos obrigatórios que devem ser adicionados ao formulário
const requiredFields = [
  {
    name: 'documentType',
    label: 'Tipo do Documento',
    type: 'select',
    options: [
      { value: 'CPF', label: 'CPF' },
      { value: 'CNPJ', label: 'CNPJ' }
    ],
    required: true
  },
  {
    name: 'phone',
    label: 'Telefone',
    type: 'tel',
    placeholder: '(48) 99999-9999',
    required: true
  },
  {
    name: 'email',
    label: 'E-mail',
    type: 'email',
    placeholder: 'joao@email.com',
    required: true
  },
  {
    name: 'street',
    label: 'Rua',
    type: 'text',
    placeholder: 'Rua das Flores',
    required: true
  },
  {
    name: 'number',
    label: 'Número',
    type: 'text',
    placeholder: '123',
    required: true
  },
  {
    name: 'neighborhood',
    label: 'Bairro',
    type: 'text',
    placeholder: 'Centro',
    required: true
  },
  {
    name: 'zipCode',
    label: 'CEP',
    type: 'text',
    placeholder: '88010-000',
    required: true
  }
];
```

### 📋 **Formulário de Cadastro - Campos Opcionais**

```typescript
// Campos opcionais que devem ser adicionados ao formulário
const optionalFields = [
  {
    name: 'representativeName',
    label: 'Nome do Representante',
    type: 'text',
    placeholder: 'Maria Representante'
  },
  {
    name: 'representativeRg',
    label: 'RG do Representante',
    type: 'text',
    placeholder: '12.345.678-9'
  },
  {
    name: 'receiveWhatsapp',
    label: 'Receber WhatsApp',
    type: 'checkbox',
    default: false
  },
  {
    name: 'complement',
    label: 'Complemento',
    type: 'text',
    placeholder: 'Apto 101'
  },
  {
    name: 'birthDate',
    label: 'Data de Nascimento',
    type: 'date'
  },
  {
    name: 'observations',
    label: 'Observações',
    type: 'textarea',
    placeholder: 'Cliente preferencial'
  },
  {
    name: 'arrivalDate',
    label: 'Data de Chegada',
    type: 'date'
  }
];
```

## 🔗 **Endpoints da API**

### 📤 **Para Representantes (Cadastro)**
```
POST /consumers/representative
```

### 📤 **Para Administradores (Cadastro Direto)**
```
POST /consumers
```

### 📝 **Para Atualização**
```
PATCH /consumers/representative/:id  (Representantes)
PATCH /consumers/:id                 (Administradores)
```

## 📊 **Estrutura Completa do Payload**

```json
{
  "name": "João Silva Santos",
  "documentType": "CPF",
  "cpfCnpj": "123.456.789-00",
  "representativeName": "Maria Representante",
  "representativeRg": "12.345.678-9",
  "phone": "(48) 99999-9999",
  "email": "joao@email.com",
  "concessionaire": "CELESC",
  "ucNumber": "12345678",
  "consumerType": "RESIDENTIAL",
  "phase": "MONOPHASIC",
  "averageMonthlyConsumption": 350.5,
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

## 🎨 **Sugestões de Layout**

### 📱 **Seção de Dados Pessoais**
- Nome Completo
- Tipo do Documento + Documento
- Telefone
- E-mail
- Data de Nascimento

### 🏠 **Seção de Endereço**
- Rua
- Número
- Complemento
- Bairro
- Cidade
- UF
- CEP

### ⚡ **Seção Técnica**
- Concessionária
- Número UC
- Classe Instalação
- kWh Mensal
- Desconto Oferecido

### 👤 **Seção do Representante (Opcional)**
- Nome do Representante
- RG do Representante
- Data de Chegada

### 📝 **Seção Adicional**
- Receber WhatsApp (checkbox)
- Observações (textarea)

## 🔧 **Validações Importantes**

### 📧 **E-mail**
- Formato válido de e-mail
- Campo obrigatório

### 📱 **Telefone**
- Formato brasileiro recomendado
- Campo obrigatório

### 📮 **CEP**
- Formato: 00000-000
- Campo obrigatório

### 📅 **Datas**
- Formato: YYYY-MM-DD
- Data de nascimento: não pode ser futura
- Data de chegada: não pode ser futura

## 🚀 **Implementação Sugerida**

1. **Atualizar formulários** de cadastro de consumidores
2. **Adicionar validações** para os novos campos
3. **Implementar máscaras** para telefone e CEP
4. **Criar seções organizadas** no formulário
5. **Atualizar listagens** para mostrar novos campos
6. **Implementar filtros** por novos campos
7. **Atualizar relatórios** com novas informações

## 📋 **Checklist de Implementação**

- [ ] Adicionar campos obrigatórios ao formulário
- [ ] Adicionar campos opcionais ao formulário
- [ ] Implementar validações de e-mail e telefone
- [ ] Adicionar máscaras para CEP e telefone
- [ ] Organizar campos em seções lógicas
- [ ] Atualizar listagem de consumidores
- [ ] Implementar filtros por novos campos
- [ ] Atualizar relatórios e estatísticas
- [ ] Testar integração com API
- [ ] Validar responsividade mobile

## 🔗 **Referências Técnicas**

- **Enum DocumentType**: `CPF` | `CNPJ`
- **Enum ConsumerType**: `RESIDENTIAL` | `COMMERCIAL` | `INDUSTRIAL` | `RURAL` | `PUBLIC_POWER`
- **Enum PhaseType**: `MONOPHASIC` | `BIPHASIC` | `TRIPHASIC`
- **Todas as validações** estão implementadas no backend
- **Swagger atualizado** com documentação completa

---

**📅 Data da Atualização**: Janeiro 2025  
**👨‍💻 Responsável**: Backend Team  
**🔄 Status**: Implementado e Testado

