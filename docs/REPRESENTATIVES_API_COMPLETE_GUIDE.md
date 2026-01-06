# 📱 Guia Completo da API para App Externo de Representantes

## 🔐 **Autenticação**

### Base URL
```
https://api.pagluz.com.br
```

### Header Obrigatório
```http
Authorization: Bearer {representative_token}
Content-Type: application/json
```

---

## 🔑 **1. AUTENTICAÇÃO**

### Login do Representante
```http
POST /auth/login-representative
```

**Body:**
```json
{
  "email": "representante@pagluz.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "rep_123",
    "name": "João Silva",
    "email": "representante@pagluz.com",
    "status": "ACTIVE",
    "commissionRate": 5.0,
    "specializations": ["Residencial", "Comercial"],
    "city": "São Paulo",
    "state": "SP"
  },
  "expires_in": 86400
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```

---

## 👤 **2. PERFIL DO REPRESENTANTE**

### Ver Meu Perfil
```http
GET /representatives/dashboard/profile
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": "rep_123",
  "name": "João Silva",
  "email": "representante@pagluz.com",
  "cpfCnpj": "123.456.789-00",
  "phone": "(11) 99999-9999",
  "city": "São Paulo",
  "state": "SP",
  "commissionRate": 5.0,
  "specializations": ["Residencial", "Comercial"],
  "status": "ACTIVE",
  "notes": "Representante experiente",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLoginAt": "2024-01-25T10:30:00.000Z",
  "loginCount": 45
}
```

### Atualizar Meu Perfil
```http
PATCH /representatives/dashboard/profile
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "João Silva Atualizado",
  "phone": "(11) 88888-8888",
  "city": "São Paulo",
  "state": "SP",
  "notes": "Representante com 5 anos de experiência"
}
```

### Minhas Estatísticas
```http
GET /representatives/dashboard/stats
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "representative": {
    "id": "rep_123",
    "name": "João Silva",
    "email": "representante@pagluz.com",
    "status": "ACTIVE",
    "commissionRate": 5.0,
    "specializations": ["Residencial", "Comercial"]
  },
  "stats": {
    "totalConsumers": 25,
    "totalKwh": 8750.5,
    "allocatedKwh": 7437.9,
    "pendingKwh": 1312.6,
    "allocationRate": 84.98,
    "loginCount": 45,
    "lastLogin": "2024-01-25T10:30:00.000Z"
  },
  "consumersByStatus": {
    "allocated": 15,
    "inProcess": 7,
    "converted": 3,
    "available": 0
  }
}
```

---

## 👥 **3. GESTÃO DE CONSUMIDORES**

### Criar Novo Consumidor
```http
POST /consumers/representative
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "Maria Santos",
  "cpfCnpj": "987.654.321-00",
  "ucNumber": "87654321",
  "concessionaire": "CELESC",
  "city": "Florianópolis",
  "state": "SC",
  "consumerType": "RESIDENTIAL",
  "phase": "MONOPHASIC",
  "averageMonthlyConsumption": 350,
  "discountOffered": 12,
  "phone": "(48) 99999-9999"
}
```

**Resposta:**
```json
{
  "id": "consumer_456",
  "name": "Maria Santos",
  "cpfCnpj": "987.654.321-00",
  "ucNumber": "87654321",
  "concessionaire": "CELESC",
  "city": "Florianópolis",
  "state": "SC",
  "consumerType": "RESIDENTIAL",
  "phase": "MONOPHASIC",
  "averageMonthlyConsumption": 350,
  "discountOffered": 12,
  "status": "AVAILABLE",
  "allocatedPercentage": null,
  "generatorId": null,
  "createdAt": "2024-01-25T15:30:00.000Z",
  "Representative": {
    "id": "rep_123",
    "name": "João Silva",
    "email": "representante@pagluz.com"
  }
}
```

### Listar Meus Consumidores (Simples)
```http
GET /consumers/representative/my-consumers
Authorization: Bearer {token}
```

### Listar Consumidores com Filtros Avançados
```http
GET /consumers/representative/filtered
Authorization: Bearer {token}
```

**Query Parameters:**
- `status`: `AVAILABLE`, `ALLOCATED`, `IN_PROCESS`, `CONVERTED`
- `consumerType`: `RESIDENTIAL`, `COMMERCIAL`, `INDUSTRIAL`, `RURAL`, `PUBLIC_POWER`
- `state`: Estado (ex: `SC`, `SP`)
- `city`: Cidade (busca parcial)
- `startDate`: Data inicial (`2024-01-01`)
- `endDate`: Data final (`2024-12-31`)
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 20)

**Exemplo:**
```http
GET /consumers/representative/filtered?status=IN_PROCESS&state=SC&page=1&limit=10
```

**Resposta:**
```json
{
  "consumers": [
    {
      "id": "consumer_456",
      "name": "Maria Santos",
      "cpfCnpj": "987.654.321-00",
      "ucNumber": "87654321",
      "concessionaire": "CELESC",
      "city": "Florianópolis",
      "state": "SC",
      "consumerType": "RESIDENTIAL",
      "phase": "MONOPHASIC",
      "averageMonthlyConsumption": 350,
      "discountOffered": 12,
      "status": "IN_PROCESS",
      "allocatedPercentage": null,
      "generatorId": null,
      "createdAt": "2024-01-25T15:30:00.000Z",
      "updatedAt": "2024-01-26T10:15:00.000Z",
      "generator": null
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

### Ver Detalhes de um Consumidor
```http
GET /consumers/representative/{consumerId}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": "consumer_456",
  "name": "Maria Santos",
  "cpfCnpj": "987.654.321-00",
  "ucNumber": "87654321",
  "concessionaire": "CELESC",
  "city": "Florianópolis",
  "state": "SC",
  "consumerType": "RESIDENTIAL",
  "phase": "MONOPHASIC",
  "averageMonthlyConsumption": 350,
  "discountOffered": 12,
  "status": "IN_PROCESS",
  "allocatedPercentage": null,
  "generatorId": null,
  "createdAt": "2024-01-25T15:30:00.000Z",
  "updatedAt": "2024-01-26T10:15:00.000Z",
  "generator": {
    "id": "generator_789",
    "ownerName": "Usina Solar ABC",
    "sourceType": "SOLAR",
    "installedPower": 1000,
    "status": "ACTIVE",
    "city": "Florianópolis",
    "state": "SC",
    "concessionaire": "CELESC"
  },
  "Representative": {
    "id": "rep_123",
    "name": "João Silva",
    "email": "representante@pagluz.com",
    "commissionRate": 5.0
  }
}
```

### Atualizar Consumidor
```http
PATCH /consumers/representative/{consumerId}
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "Maria Santos Atualizada",
  "phone": "(48) 88888-8888",
  "city": "São José",
  "state": "SC",
  "averageMonthlyConsumption": 380,
  "discountOffered": 15,
  "status": "CONVERTED",
  "notes": "Cliente fechou negócio!"
}
```

**Campos Permitidos:**
- `name`: Nome do consumidor
- `phone`: Telefone de contato
- `city`: Cidade
- `state`: Estado
- `averageMonthlyConsumption`: Consumo médio mensal
- `discountOffered`: Desconto oferecido
- `status`: Status do consumidor
- `notes`: Observações

### Histórico de Atividades do Consumidor
```http
GET /consumers/representative/{consumerId}/activity-history
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "consumer": {
    "id": "consumer_456",
    "name": "Maria Santos",
    "cpfCnpj": "987.654.321-00",
    "status": "CONVERTED"
  },
  "activities": [
    {
      "id": "activity_001",
      "action": "CREATE",
      "description": "Consumidor foi cadastrado - Maria Santos",
      "icon": "user-plus",
      "color": "green",
      "timestamp": "2024-01-25T15:30:00.000Z",
      "user": {
        "id": "rep_123",
        "name": "João Silva",
        "email": "representante@pagluz.com",
        "role": "REPRESENTATIVE"
      },
      "oldValues": null,
      "newValues": {
        "name": "Maria Santos",
        "cpfCnpj": "987.654.321-00",
        "status": "AVAILABLE"
      },
      "metadata": {
        "representativeId": "rep_123",
        "createdBy": "representative"
      }
    },
    {
      "id": "activity_002",
      "action": "UPDATE",
      "description": "Status do consumidor foi alterado para \"IN_PROCESS\"",
      "icon": "refresh",
      "color": "orange",
      "timestamp": "2024-01-26T10:15:00.000Z",
      "user": {
        "id": "rep_123",
        "name": "João Silva",
        "email": "representante@pagluz.com",
        "role": "REPRESENTATIVE"
      },
      "oldValues": {
        "status": "AVAILABLE"
      },
      "newValues": {
        "status": "IN_PROCESS"
      }
    }
  ],
  "totalActivities": 2
}
```

---

## 📊 **4. ESTATÍSTICAS E RELATÓRIOS**

### Estatísticas Detalhadas dos Meus Consumidores
```http
GET /consumers/representative/stats/overview
Authorization: Bearer {token}
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
    {
      "month": "out 2024",
      "count": 12,
      "kwh": 4200.0
    },
    {
      "month": "nov 2024",
      "count": 15,
      "kwh": 5250.0
    },
    {
      "month": "dez 2024",
      "count": 18,
      "kwh": 6300.0
    },
    {
      "month": "jan 2025",
      "count": 22,
      "kwh": 7700.0
    }
  ]
}
```

---

## 🏠 **5. DASHBOARD COMPLETO**

### Dashboard do Representante
```http
GET /representative-dashboard
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "representative": {
    "id": "rep_123",
    "name": "João Silva",
    "email": "representante@pagluz.com",
    "status": "ACTIVE",
    "commissionRate": 5.0,
    "specializations": ["Residencial", "Comercial"],
    "city": "São Paulo",
    "state": "SP"
  },
  "stats": {
    "totalConsumers": 45,
    "totalKwh": 15750.5,
    "allocatedKwh": 13387.9,
    "pendingKwh": 2362.6,
    "allocationRate": 84.98,
    "averageDiscount": 12.5,
    "loginCount": 45,
    "lastLogin": "2024-01-25T10:30:00.000Z"
  },
  "consumersByStatus": {
    "allocated": 28,
    "inProcess": 7,
    "converted": 2,
    "available": 8
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
    }
    // ... últimos 6 meses
  ],
  "recentActivity": [
    {
      "id": "consumer_456",
      "name": "Maria Santos",
      "action": "Status alterado para CONVERTED",
      "timestamp": "2024-01-25T15:30:00.000Z"
    }
    // ... últimos 10 consumidores
  ]
}
```

### Materiais Comerciais
```http
GET /representative-dashboard/materials
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "materials": [
    {
      "id": "mat_001",
      "title": "Apresentação Institucional Pagluz",
      "description": "Apresentação completa da empresa e soluções",
      "type": "presentation",
      "url": "https://materials.pagluz.com.br/presentacao-institucional.pdf",
      "size": "2.5 MB",
      "downloadCount": 1250,
      "lastUpdated": "2024-01-20T00:00:00.000Z"
    },
    {
      "id": "mat_002",
      "title": "Calculadora de Economia",
      "description": "Ferramenta para calcular economia do cliente",
      "type": "tool",
      "url": "https://tools.pagluz.com.br/calculadora-economia",
      "size": "0 MB",
      "downloadCount": 3420,
      "lastUpdated": "2024-01-15T00:00:00.000Z"
    },
    {
      "id": "mat_003",
      "title": "Cartão de Visitas Digital",
      "description": "Cartão de visitas personalizado",
      "type": "card",
      "url": "https://materials.pagluz.com.br/cartao-digital.pdf",
      "size": "1.2 MB",
      "downloadCount": 890,
      "lastUpdated": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

---

## 📱 **6. EXEMPLOS DE USO NO FRONTEND**

### Configuração Base
```typescript
// config/api.ts
const API_BASE_URL = 'https://api.pagluz.com.br';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class RepresentativesAPI {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Autenticação
  async login(email: string, password: string) {
    return this.request('/auth/login-representative', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Perfil
  async getProfile() {
    return this.request('/representatives/dashboard/profile');
  }

  async updateProfile(data: any) {
    return this.request('/representatives/dashboard/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Consumidores
  async createConsumer(data: any) {
    return this.request('/consumers/representative', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConsumers(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = `/consumers/representative/filtered${params ? `?${params}` : ''}`;
    return this.request(endpoint);
  }

  async getConsumer(id: string) {
    return this.request(`/consumers/representative/${id}`);
  }

  async updateConsumer(id: string, data: any) {
    return this.request(`/consumers/representative/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getConsumerHistory(id: string) {
    return this.request(`/consumers/representative/${id}/activity-history`);
  }

  // Estatísticas
  async getStats() {
    return this.request('/consumers/representative/stats/overview');
  }

  // Dashboard
  async getDashboard() {
    return this.request('/representative-dashboard');
  }

  async getMaterials() {
    return this.request('/representative-dashboard/materials');
  }
}

export const representativesAPI = new RepresentativesAPI();
```

### Hook de Autenticação
```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { representativesAPI } from '../config/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('representative_token');
    if (token) {
      representativesAPI.setToken(token);
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const response = await representativesAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('representative_token');
      representativesAPI.setToken('');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await representativesAPI.login(email, password);
    const { access_token, user } = response.data;
    
    localStorage.setItem('representative_token', access_token);
    representativesAPI.setToken(access_token);
    setUser(user);
    
    return response;
  };

  const logout = () => {
    localStorage.removeItem('representative_token');
    representativesAPI.setToken('');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
```

### Componente de Listagem de Consumidores
```typescript
// components/ConsumersList.tsx
import React, { useState, useEffect } from 'react';
import { representativesAPI } from '../config/api';

interface Consumer {
  id: string;
  name: string;
  cpfCnpj: string;
  city: string;
  state: string;
  status: string;
  averageMonthlyConsumption: number;
  discountOffered: number;
  createdAt: string;
}

export const ConsumersList: React.FC = () => {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    state: '',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadConsumers();
  }, [filters]);

  const loadConsumers = async () => {
    setLoading(true);
    try {
      const response = await representativesAPI.getConsumers(filters);
      setConsumers(response.data.consumers);
    } catch (error) {
      console.error('Erro ao carregar consumidores:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsumerStatus = async (consumerId: string, status: string) => {
    try {
      await representativesAPI.updateConsumer(consumerId, { status });
      loadConsumers(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {/* Filtros */}
      <div className="filters">
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">Todos os Status</option>
          <option value="AVAILABLE">Disponível</option>
          <option value="IN_PROCESS">Em Processo</option>
          <option value="ALLOCATED">Alocado</option>
          <option value="CONVERTED">Convertido</option>
        </select>
        
        <select 
          value={filters.state} 
          onChange={(e) => setFilters({...filters, state: e.target.value})}
        >
          <option value="">Todos os Estados</option>
          <option value="SC">Santa Catarina</option>
          <option value="SP">São Paulo</option>
          <option value="PR">Paraná</option>
        </select>
      </div>

      {/* Lista de Consumidores */}
      <div className="consumers-list">
        {consumers.map((consumer) => (
          <div key={consumer.id} className="consumer-card">
            <h3>{consumer.name}</h3>
            <p>CPF/CNPJ: {consumer.cpfCnpj}</p>
            <p>Cidade: {consumer.city} - {consumer.state}</p>
            <p>Consumo: {consumer.averageMonthlyConsumption} kWh/mês</p>
            <p>Desconto: {consumer.discountOffered}%</p>
            <p>Status: {consumer.status}</p>
            
            <div className="actions">
              <button 
                onClick={() => updateConsumerStatus(consumer.id, 'IN_PROCESS')}
                disabled={consumer.status === 'IN_PROCESS'}
              >
                Marcar como Em Processo
              </button>
              
              <button 
                onClick={() => updateConsumerStatus(consumer.id, 'CONVERTED')}
                disabled={consumer.status === 'CONVERTED'}
              >
                Marcar como Convertido
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🎨 **7. STATUS E TIPOS DE CONSUMIDORES**

### Status dos Consumidores
```typescript
enum ConsumerStatus {
  AVAILABLE = 'AVAILABLE',      // Disponível para alocação
  ALLOCATED = 'ALLOCATED',      // Alocado a um gerador
  IN_PROCESS = 'IN_PROCESS',    // Em processo de negociação
  CONVERTED = 'CONVERTED'       // Cliente convertido (fechou)
}
```

### Tipos de Consumidores
```typescript
enum ConsumerType {
  RESIDENTIAL = 'RESIDENTIAL',     // Residencial
  COMMERCIAL = 'COMMERCIAL',       // Comercial
  INDUSTRIAL = 'INDUSTRIAL',       // Industrial
  RURAL = 'RURAL',                 // Rural
  PUBLIC_POWER = 'PUBLIC_POWER'    // Poder Público
}
```

### Fases de Energia
```typescript
enum PhaseType {
  MONOPHASIC = 'MONOPHASIC',     // Monofásica
  BIPHASIC = 'BIPHASIC',         // Bifásica
  TRIPHASIC = 'TRIPHASIC'        // Trifásica
}
```

---

## 🚨 **8. CÓDIGOS DE ERRO**

### Códigos HTTP
- `200 OK`: Sucesso
- `201 Created`: Criado com sucesso
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token inválido ou expirado
- `403 Forbidden`: Acesso negado
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: CPF/CNPJ duplicado)
- `500 Internal Server Error`: Erro interno

### Mensagens de Erro Comuns
```json
{
  "statusCode": 401,
  "message": "Token inválido ou expirado",
  "error": "Unauthorized"
}
```

```json
{
  "statusCode": 404,
  "message": "Consumidor não encontrado ou não pertence ao representante",
  "error": "Not Found"
}
```

---

## 🔒 **9. SEGURANÇA**

### Boas Práticas
1. **Armazenar Token**: Use `localStorage` ou `AsyncStorage`
2. **Renovar Token**: Implemente renovação automática
3. **Logout Seguro**: Sempre limpe o token ao fazer logout
4. **Validação**: Valide dados antes de enviar
5. **Tratamento de Erros**: Implemente tratamento adequado

### Exemplo de Interceptor
```typescript
// utils/apiInterceptor.ts
export const setupApiInterceptor = () => {
  // Interceptar requisições para adicionar token
  // Interceptar respostas para tratar erros 401
  // Renovar token automaticamente quando necessário
};
```

---

## 📋 **10. CHECKLIST DE IMPLEMENTAÇÃO**

### ✅ Funcionalidades Essenciais
- [ ] Login/Logout
- [ ] Perfil do representante
- [ ] Listar consumidores
- [ ] Criar consumidor
- [ ] Ver detalhes do consumidor
- [ ] Atualizar status do consumidor
- [ ] Histórico de atividades
- [ ] Estatísticas e dashboard

### ✅ Funcionalidades Avançadas
- [ ] Filtros avançados
- [ ] Paginação
- [ ] Busca por nome/CPF
- [ ] Exportação de dados
- [ ] Notificações push
- [ ] Materiais comerciais
- [ ] Calculadora de economia

### ✅ UX/UI
- [ ] Design responsivo
- [ ] Loading states
- [ ] Error handling
- [ ] Offline support
- [ ] Dark mode
- [ ] Acessibilidade

---

## 🚀 **11. PRÓXIMOS PASSOS**

1. **Configurar Ambiente**: Base URL e autenticação
2. **Implementar Login**: Tela de login com validação
3. **Dashboard Principal**: Cards com estatísticas principais
4. **Lista de Consumidores**: Com filtros e paginação
5. **Detalhes do Consumidor**: Tela completa com histórico
6. **Formulário de Cadastro**: Criar novos consumidores
7. **Perfil do Representante**: Editar informações pessoais
8. **Testes**: Implementar testes unitários e E2E

---

**📞 Suporte**: Para dúvidas sobre a API, entre em contato com a equipe de desenvolvimento da Pagluz.

