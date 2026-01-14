# 🚀 Sistema de Gestão de Energia - Pagluz Backend

Sistema completo de gestão de energia com controle de representantes, consumidores, geradores e auditoria completa.

## 🏗️ **Arquitetura do Sistema**

### **Hierarquia de Usuários:**
- **SUPER_ADMIN** (Douglas) - Acesso total ao sistema
- **ADMIN** - Podem fazer tudo menos criar usuários
- **MANAGER** - Gerenciam representantes e consumidores
- **OPERATOR** - Apenas visualizam e editam dados básicos
- **REPRESENTATIVE** - Acesso ao dashboard próprio

### **Tecnologias:**
- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Autenticação:** JWT + bcrypt
- **Documentação:** Swagger/OpenAPI
- **Testes:** Jest + Supertest

## 🔐 **Autenticação e Segurança**

### **Login:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "douglas@pagluz.com",
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx123456",
    "email": "douglas@pagluz.com",
    "name": "Douglas Melere",
    "role": "SUPER_ADMIN",
    "isActive": true
  }
}
```

### **Uso do Token:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Logout:**
```http
POST /auth/logout
Authorization: Bearer {token}
```

## 👥 **Gestão de Usuários**

### **Criar Usuário (apenas SUPER_ADMIN):**
```http
POST /auth/create-admin
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "name": "João Admin",
  "email": "joao.admin@pagluz.com",
  "password": "senha123",
  "role": "ADMIN"
}
```

**Roles disponíveis:** `ADMIN`, `MANAGER`, `OPERATOR`

### **Perfil do Usuário:**
```http
GET /auth/profile
Authorization: Bearer {token}
```

## 🏢 **Gestão de Representantes**

### **Criar Representante:**
```http
POST /representatives
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao.silva@pagluz.com",
  "password": "senha123",
  "cpfCnpj": "123.456.789-00",
  "phone": "(11) 99999-9999",
  "city": "São Paulo",
  "state": "SP",
  "commissionRate": 5.0,
  "specializations": ["Residencial", "Comercial"],
  "notes": "Representante experiente"
}
```

### **Listar Representantes:**
```http
GET /representatives
Authorization: Bearer {admin_token}
```

### **Obter Representante:**
```http
GET /representatives/{id}
Authorization: Bearer {admin_token}
```

### **Atualizar Representante:**
```http
PATCH /representatives/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "João Silva Atualizado",
  "commissionRate": 7.5
}
```

### **Excluir Representante:**
```http
DELETE /representatives/{id}
Authorization: Bearer {admin_token}
```

### **Login de Representante:**
```http
POST /auth/login-representative
Content-Type: application/json

{
  "email": "joao.silva@pagluz.com",
  "password": "senha123"
}
```

## 👥 **Gestão de Consumidores**

### **Criar Consumidor (Admin):**
```http
POST /consumers
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Empresa ABC",
  "cpfCnpj": "12.345.678/0001-90",
  "ucNumber": "12345678",
  "concessionaire": "CELESC",
  "city": "Florianópolis",
  "state": "SC",
  "consumerType": "COMMERCIAL",
  "phase": "TRIPHASIC",
  "averageMonthlyConsumption": 800,
  "discountOffered": 12
}
```

### **Criar Consumidor (Representante):**
```http
POST /consumers/representative
Authorization: Bearer {representative_token}
Content-Type: application/json

{
  "name": "Cliente do Representante",
  "cpfCnpj": "98.765.432/0001-10",
  "ucNumber": "87654321",
  "concessionaire": "CELESC",
  "city": "São Paulo",
  "state": "SP",
  "consumerType": "RESIDENTIAL",
  "phase": "MONOPHASIC",
  "averageMonthlyConsumption": 350,
  "discountOffered": 8
}
```

**Nota:** O representante é automaticamente vinculado ao consumidor.

### **Listar Consumidores:**
```http
GET /consumers
Authorization: Bearer {admin_token}
```

### **Consumidores do Representante:**
```http
GET /consumers/representative/my-consumers
Authorization: Bearer {representative_token}
```

### **Obter Consumidor:**
```http
GET /consumers/{id}
Authorization: Bearer {admin_token}
```

### **Atualizar Consumidor:**
```http
PATCH /consumers/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "averageMonthlyConsumption": 900,
  "discountOffered": 15
}
```

### **Excluir Consumidor:**
```http
DELETE /consumers/{id}
Authorization: Bearer {admin_token}
```

### **Alocar Consumidor a Gerador:**
```http
POST /consumers/{id}/allocate
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "generatorId": "clxxx123456",
  "percentage": 80.5
}
```

## ⚡ **Gestão de Geradores**

### **Criar Gerador:**
```http
POST /generators
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "ownerName": "João da Silva",
  "cpfCnpj": "123.456.789-00",
  "sourceType": "SOLAR",
  "installedPower": 5000,
  "concessionaire": "CELESC",
  "ucNumber": "87654321",
  "city": "Florianópolis",
  "state": "SC",
  "observations": "Usina solar residencial"
}
```

### **Listar Geradores:**
```http
GET /generators
Authorization: Bearer {admin_token}
```

### **Obter Gerador:**
```http
GET /generators/{id}
Authorization: Bearer {admin_token}
```

### **Atualizar Gerador:**
```http
PATCH /generators/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "installedPower": 6000,
  "status": "ACTIVE"
}
```

### **Excluir Gerador:**
```http
DELETE /generators/{id}
Authorization: Bearer {admin_token}
```

## 📊 **Dashboards**

### **Dashboard Principal (Admin):**
```http
GET /dashboard
Authorization: Bearer {admin_token}
```

### **Dashboard do Representante:**
```http
GET /representative-dashboard
Authorization: Bearer {representative_token}
```

**Resposta:**
```json
{
  "stats": {
    "totalConsumers": 5,
    "totalKwh": 4865,
    "allocatedKwh": 503.78,
    "pendingKwh": 4361.22,
    "allocationRate": 10.36,
    "estimatedMonthlySavings": 49.12
  },
  "consumersByStatus": {
    "allocated": {
      "count": 3,
      "totalKwh": 3825,
      "consumers": [...]
    },
    "available": {
      "count": 2,
      "totalKwh": 1040,
      "consumers": [...]
    }
  }
}
```

### **Materiais Comerciais:**
```http
GET /representative-dashboard/materials
Authorization: Bearer {representative_token}
```

## 📝 **Auditoria (apenas SUPER_ADMIN)**

### **Listar Logs de Auditoria:**
```http
GET /audit/logs?page=1&limit=50&userId=clxxx123456&action=CREATE&entityType=Consumer
Authorization: Bearer {super_admin_token}
```

**Parâmetros de Filtro:**
- `page`: Número da página
- `limit`: Itens por página
- `userId`: Filtrar por usuário
- `action`: Filtrar por ação (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- `entityType`: Filtrar por tipo de entidade
- `startDate`: Data inicial (ISO)
- `endDate`: Data final (ISO)

### **Estatísticas de Auditoria:**
```http
GET /audit/statistics
Authorization: Bearer {super_admin_token}
```

### **Logs de Usuário Específico:**
```http
GET /audit/user/{userId}
Authorization: Bearer {super_admin_token}
```

## 🔧 **Configuração e Instalação**

### **1. Instalar Dependências:**
```bash
npm install
```

### **2. Configurar Variáveis de Ambiente:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pagluz-db"
JWT_SECRET="your-secret-key"
```

### **3. Sincronizar Banco de Dados:**
```bash
npx prisma db push
```

### **4. Configurar SUPER_ADMIN:**
```bash
npm run db:setup:super-admin
```

### **5. Executar Aplicação:**
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 🧪 **Testes**

### **Executar Testes:**
```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📊 **Estrutura do Banco de Dados**

### **Tabelas Principais:**
- `users` - Usuários do sistema
- `commercial_representatives` - Representantes comerciais
- `consumers` - Consumidores de energia
- `generators` - Geradores de energia
- `audit_logs` - Logs de auditoria
- `blacklisted_tokens` - Tokens JWT invalidados

### **Relacionamentos:**
- Usuário → Logs de Auditoria (1:N)
- Representante → Consumidores (1:N)
- Gerador → Consumidores (1:N)
- Representante → Tokens (1:N)

## 🚨 **Segurança e Validações**

### **Proteções Implementadas:**
- ✅ **Autenticação JWT** com expiração
- ✅ **Criptografia de senhas** com bcrypt (salt 12)
- ✅ **Blacklist de tokens** para logout
- ✅ **Bloqueio de conta** após 5 tentativas falhadas
- ✅ **Validação de hierarquia** de usuários
- ✅ **Auditoria completa** de todas as ações
- ✅ **Validação de dados** com class-validator
- ✅ **Rate limiting** implícito via validações

### **Headers de Segurança:**
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## 📱 **Exemplos de Uso para Frontend**

### **Fluxo de Login:**
```javascript
// 1. Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'douglas@pagluz.com',
    password: 'admin123'
  })
});

const { access_token, user } = await loginResponse.json();

// 2. Armazenar token
localStorage.setItem('token', access_token);

// 3. Usar token nas requisições
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json'
};
```

### **Criar Representante:**
```javascript
const createRepresentative = async (data) => {
  const response = await fetch('/representatives', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

// Uso
const newRepresentative = await createRepresentative({
  name: 'João Silva',
  email: 'joao.silva@pagluz.com',
  password: 'senha123',
  cpfCnpj: '123.456.789-00',
  phone: '(11) 99999-9999',
  city: 'São Paulo',
  state: 'SP'
});
```

### **Dashboard do Representante:**
```javascript
const getRepresentativeDashboard = async () => {
  const response = await fetch('/representative-dashboard', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.json();
};

// Uso
const dashboard = await getRepresentativeDashboard();
console.log(`Total de clientes: ${dashboard.stats.totalConsumers}`);
console.log(`Total de kWh: ${dashboard.stats.totalKwh}`);
```

### **Logout:**
```javascript
const logout = async () => {
  await fetch('/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  // Limpar token local
  localStorage.removeItem('token');
  // Redirecionar para login
  window.location.href = '/login';
};
```

## 📋 **Códigos de Status HTTP**

- **200** - Sucesso
- **201** - Criado com sucesso
- **204** - Sucesso sem conteúdo (DELETE)
- **400** - Requisição inválida
- **401** - Não autorizado
- **403** - Acesso negado
- **404** - Não encontrado
- **409** - Conflito (dados duplicados)
- **422** - Dados inválidos
- **500** - Erro interno do servidor

## 🔍 **Filtros e Paginação**

### **Exemplo de Paginação:**
```http
GET /audit/logs?page=2&limit=25
```

### **Exemplo de Filtros:**
```http
GET /consumers?state=SC&consumerType=COMMERCIAL
```

## 📞 **Suporte e Contato**

Para dúvidas ou problemas:
- **Desenvolvedor:** Douglas Melere
- **Email:** douglas@pagluz.com
- **Sistema:** Sistema de Gestão de Energia Pagluz

---

**⚠️ IMPORTANTE:** Este sistema é para uso interno da Pagluz. Mantenha as credenciais seguras e não compartilhe tokens de acesso.

