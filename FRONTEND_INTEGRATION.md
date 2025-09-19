# 🚀 Integração Frontend - Sistema Pagluz

Documentação completa para integração do frontend com a API de gestão de energia.

## 🔐 **Autenticação**

### **Login**
```typescript
// POST /auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
  };
}

// Exemplo de uso
const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

### **Logout**
```typescript
// POST /auth/logout
const logout = async (): Promise<void> => {
  await fetch('/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};
```

## 👥 **Usuários**

### **Criar Usuário (SUPER_ADMIN)**
```typescript
// POST /auth/create-admin
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **Perfil do Usuário**
```typescript
// GET /auth/profile
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string;
  loginCount: number;
}
```

## 🏢 **Representantes**

### **Criar Representante**
```typescript
// POST /representatives
interface CreateRepresentativeRequest {
  name: string;
  email: string;
  password: string;
  cpfCnpj: string;
  phone: string;
  city: string;
  state: string;
  commissionRate?: number;
  specializations?: string[];
  notes?: string;
}

interface Representative {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  city: string;
  state: string;
  commissionRate: number;
  specializations: string[];
  status: RepresentativeStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  loginCount: number;
  _count: {
    Consumer: number;
  };
}
```

### **Listar Representantes**
```typescript
// GET /representatives
type RepresentativesList = Representative[];

// Exemplo com paginação
const getRepresentatives = async (page = 1, limit = 50): Promise<RepresentativesList> => {
  const response = await fetch(`/representatives?page=${page}&limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### **Login de Representante**
```typescript
// POST /auth/login-representative
interface RepresentativeLoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'REPRESENTATIVE';
    status: RepresentativeStatus;
    commissionRate: number;
    lastLoginAt: string | null;
    loginCount: number;
  };
}
```

## 👥 **Consumidores**

### **Criar Consumidor (Admin)**
```typescript
// POST /consumers
interface CreateConsumerRequest {
  name: string;
  cpfCnpj: string;
  ucNumber: string;
  concessionaire: string;
  city: string;
  state: string;
  consumerType: ConsumerType;
  phase: PhaseType;
  averageMonthlyConsumption: number;
  discountOffered: number;
  status?: ConsumerStatus;
  allocatedPercentage?: number;
  generatorId?: string;
  representativeId?: string;
}
```

### **Criar Consumidor (Representante)**
```typescript
// POST /consumers/representative
// O representante é automaticamente vinculado
interface CreateConsumerRepresentativeRequest {
  name: string;
  cpfCnpj: string;
  ucNumber: string;
  concessionaire: string;
  city: string;
  state: string;
  consumerType: ConsumerType;
  phase: PhaseType;
  averageMonthlyConsumption: number;
  discountOffered: number;
}
```

### **Consumidor**
```typescript
interface Consumer {
  id: string;
  name: string;
  cpfCnpj: string;
  ucNumber: string;
  concessionaire: string;
  city: string;
  state: string;
  consumerType: ConsumerType;
  phase: PhaseType;
  averageMonthlyConsumption: number;
  discountOffered: number;
  status: ConsumerStatus;
  allocatedPercentage: number | null;
  generatorId: string | null;
  representativeId: string | null;
  createdAt: string;
  updatedAt: string;
  generator?: Generator;
  Representative?: Representative;
}
```

### **Consumidores do Representante**
```typescript
// GET /consumers/representative/my-consumers
const getMyConsumers = async (): Promise<Consumer[]> => {
  const response = await fetch('/consumers/representative/my-consumers', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## ⚡ **Geradores**

### **Criar Gerador**
```typescript
// POST /generators
interface CreateGeneratorRequest {
  ownerName: string;
  cpfCnpj: string;
  sourceType: SourceType;
  installedPower: number;
  concessionaire: string;
  ucNumber: string;
  city: string;
  state: string;
  status?: GeneratorStatus;
  observations?: string;
}

interface Generator {
  id: string;
  ownerName: string;
  cpfCnpj: string;
  sourceType: SourceType;
  installedPower: number;
  concessionaire: string;
  ucNumber: string;
  city: string;
  state: string;
  status: GeneratorStatus;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  consumers: Consumer[];
}
```

## 📊 **Dashboards**

### **Dashboard Principal (Admin)**
```typescript
// GET /dashboard
interface AdminDashboard {
  totalGenerators: number;
  totalConsumers: number;
  totalInstalledPower: number;
  totalMonthlyConsumption: number;
  allocationRate: number;
  generatorsBySource: Array<{
    sourceType: SourceType;
    count: number;
    totalPower: number;
  }>;
  consumersByType: Array<{
    consumerType: ConsumerType;
    count: number;
    totalConsumption: number;
  }>;
}
```

### **Dashboard do Representante**
```typescript
// GET /representative-dashboard
interface RepresentativeDashboard {
  stats: {
    totalConsumers: number;
    totalKwh: number;
    allocatedKwh: number;
    pendingKwh: number;
    allocationRate: number;
    estimatedMonthlySavings: number;
  };
  consumersByStatus: {
    allocated: {
      count: number;
      totalKwh: number;
      consumers: Consumer[];
    };
    inProcess: {
      count: number;
      totalKwh: number;
      consumers: Consumer[];
    };
    converted: {
      count: number;
      totalKwh: number;
      consumers: Consumer[];
    };
    available: {
      count: number;
      totalKwh: number;
      consumers: Consumer[];
    };
  };
  geographicDistribution: Array<{
    state: string;
    count: number;
    totalKwh: number;
  }>;
  monthlyEvolution: Array<{
    month: string;
    newConsumers: number;
    totalKwh: number;
  }>;
  recentActivity: Consumer[];
}
```

### **Materiais Comerciais**
```typescript
// GET /representative-dashboard/materials
interface CommercialMaterials {
  brochures: Array<{
    id: string;
    title: string;
    description: string;
    downloadUrl: string;
    category: string;
  }>;
  presentations: Array<{
    id: string;
    title: string;
    description: string;
    downloadUrl: string;
    slides: number;
  }>;
  videos: Array<{
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: string;
  }>;
}
```

## 📝 **Auditoria (SUPER_ADMIN)**

### **Logs de Auditoria**
```typescript
// GET /audit/logs
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: any | null;
  newValues: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Exemplo com filtros
const getAuditLogs = async (filters: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AuditLogsResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });
  
  const response = await fetch(`/audit/logs?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## 🔧 **Enums e Tipos**

```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  REPRESENTATIVE = 'REPRESENTATIVE'
}

enum RepresentativeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  SUSPENDED = 'SUSPENDED'
}

enum ConsumerStatus {
  AVAILABLE = 'AVAILABLE',
  ALLOCATED = 'ALLOCATED',
  IN_PROCESS = 'IN_PROCESS',
  CONVERTED = 'CONVERTED'
}

enum ConsumerType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  RURAL = 'RURAL',
  PUBLIC_POWER = 'PUBLIC_POWER'
}

enum PhaseType {
  MONOPHASIC = 'MONOPHASIC',
  BIPHASIC = 'BIPHASIC',
  TRIPHASIC = 'TRIPHASIC'
}

enum SourceType {
  SOLAR = 'SOLAR',
  HYDRO = 'HYDRO',
  BIOMASS = 'BIOMASS',
  WIND = 'WIND'
}

enum GeneratorStatus {
  UNDER_ANALYSIS = 'UNDER_ANALYSIS',
  AWAITING_ALLOCATION = 'AWAITING_ALLOCATION',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
```

## 🚀 **Exemplos Práticos**

### **Configuração do Cliente HTTP**
```typescript
class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Métodos da API
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.access_token;
    localStorage.setItem('token', response.access_token);
    return response;
  }

  async getRepresentatives(): Promise<Representative[]> {
    return this.request<Representative[]>('/representatives');
  }

  async createConsumer(data: CreateConsumerRequest): Promise<Consumer> {
    return this.request<Consumer>('/consumers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRepresentativeDashboard(): Promise<RepresentativeDashboard> {
    return this.request<RepresentativeDashboard>('/representative-dashboard');
  }
}

// Uso
const api = new ApiClient('http://localhost:3000');

// Login
const user = await api.login({
  email: 'douglas@pagluz.com',
  password: 'admin123'
});

// Usar outras funcionalidades
const representatives = await api.getRepresentatives();
const dashboard = await api.getRepresentativeDashboard();
```

### **Hook React para Autenticação**
```typescript
import { useState, useEffect, createContext, useContext } from 'react';

interface AuthContextType {
  user: UserProfile | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar token e carregar usuário
      api.getProfile().then(setUser).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await api.login(credentials);
    setUser(response.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📋 **Códigos de Status e Erros**

```typescript
interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Tratamento de erros
const handleApiError = (error: any): string => {
  if (error.statusCode === 401) {
    // Token expirado ou inválido
    localStorage.removeItem('token');
    window.location.href = '/login';
    return 'Sessão expirada. Faça login novamente.';
  }
  
  if (error.statusCode === 403) {
    return 'Acesso negado. Você não tem permissão para esta ação.';
  }
  
  if (error.statusCode === 409) {
    return 'Conflito: Os dados já existem no sistema.';
  }
  
  return error.message || 'Erro interno do servidor.';
};
```

## 🔒 **Segurança e Validações**

### **Headers Obrigatórios**
```typescript
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'X-Requested-With': 'XMLHttpRequest'
};
```

### **Validação de Dados**
```typescript
// Exemplo de validação para CPF/CNPJ
const validateCpfCnpj = (value: string): boolean => {
  const clean = value.replace(/\D/g, '');
  return clean.length === 11 || clean.length === 14;
};

// Exemplo de validação para email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## 🌐 **URLs e Endpoints Base**

### **Ambiente de Desenvolvimento:**
- **Base URL:** `http://localhost:3000`
- **Swagger:** `http://localhost:3000/api`

### **Endpoints Principais:**
```typescript
const API_ENDPOINTS = {
  // Autenticação
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  LOGIN_REPRESENTATIVE: '/auth/login-representative',
  PROFILE: '/auth/profile',
  CREATE_ADMIN: '/auth/create-admin',
  
  // Usuários
  USERS: '/users',
  
  // Representantes
  REPRESENTATIVES: '/representatives',
  
  // Consumidores
  CONSUMERS: '/consumers',
  CONSUMERS_REPRESENTATIVE: '/consumers/representative',
  MY_CONSUMERS: '/consumers/representative/my-consumers',
  
  // Geradores
  GENERATORS: '/generators',
  
  // Dashboards
  DASHBOARD: '/dashboard',
  REPRESENTATIVE_DASHBOARD: '/representative-dashboard',
  MATERIALS: '/representative-dashboard/materials',
  
  // Auditoria
  AUDIT_LOGS: '/audit/logs',
  AUDIT_STATS: '/audit/statistics',
  AUDIT_USER: '/audit/user',
} as const;
```

## 📱 **Exemplos de Componentes React**

### **Formulário de Login:**
```typescript
import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login({ email, password });
      // Redirecionar após login
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};
```

### **Lista de Representantes:**
```typescript
import React, { useState, useEffect } from 'react';
import { Representative } from './types';

export const RepresentativesList: React.FC = () => {
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        const data = await api.getRepresentatives();
        setRepresentatives(data);
      } catch (error) {
        console.error('Erro ao buscar representantes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepresentatives();
  }, []);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Representantes ({representatives.length})</h2>
      {representatives.map(rep => (
        <div key={rep.id}>
          <h3>{rep.name}</h3>
          <p>Email: {rep.email}</p>
          <p>Cidade: {rep.city} - {rep.state}</p>
          <p>Comissão: {rep.commissionRate}%</p>
          <p>Clientes: {rep._count.Consumer}</p>
        </div>
      ))}
    </div>
  );
};
```

### **Dashboard do Representante:**
```typescript
import React, { useState, useEffect } from 'react';
import { RepresentativeDashboard } from './types';

export const RepresentativeDashboardView: React.FC = () => {
  const [dashboard, setDashboard] = useState<RepresentativeDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getRepresentativeDashboard();
        setDashboard(data);
      } catch (error) {
        console.error('Erro ao buscar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) return <div>Carregando dashboard...</div>;
  if (!dashboard) return <div>Erro ao carregar dashboard</div>;

  return (
    <div>
      <h2>Dashboard do Representante</h2>
      
      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Clientes</h3>
          <p className="stat-number">{dashboard.stats.totalConsumers}</p>
        </div>
        <div className="stat-card">
          <h3>Total de kWh</h3>
          <p className="stat-number">{dashboard.stats.totalKwh.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Taxa de Alocação</h3>
          <p className="stat-number">{dashboard.stats.allocationRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Economia Mensal</h3>
          <p className="stat-number">R$ {dashboard.stats.estimatedMonthlySavings}</p>
        </div>
      </div>

      {/* Consumidores por Status */}
      <div className="consumers-by-status">
        <h3>Consumidores por Status</h3>
        {Object.entries(dashboard.consumersByStatus).map(([status, data]) => (
          <div key={status} className="status-group">
            <h4>{status.charAt(0).toUpperCase() + status.slice(1)} ({data.count})</h4>
            <p>Total kWh: {data.totalKwh.toLocaleString()}</p>
            {data.consumers.map(consumer => (
              <div key={consumer.id} className="consumer-item">
                <span>{consumer.name}</span>
                <span>{consumer.averageMonthlyConsumption} kWh</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🔄 **Gerenciamento de Estado**

### **Store com Zustand:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  user: UserProfile | null;
  setToken: (token: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
```

### **Store para Representantes:**
```typescript
interface RepresentativesStore {
  representatives: Representative[];
  isLoading: boolean;
  setRepresentatives: (reps: Representative[]) => void;
  addRepresentative: (rep: Representative) => void;
  updateRepresentative: (id: string, updates: Partial<Representative>) => void;
  removeRepresentative: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useRepresentativesStore = create<RepresentativesStore>((set, get) => ({
  representatives: [],
  isLoading: false,
  setRepresentatives: (reps) => set({ representatives: reps }),
  addRepresentative: (rep) => set((state) => ({
    representatives: [...state.representatives, rep]
  })),
  updateRepresentative: (id, updates) => set((state) => ({
    representatives: state.representatives.map(rep =>
      rep.id === id ? { ...rep, ...updates } : rep
    )
  })),
  removeRepresentative: (id) => set((state) => ({
    representatives: state.representatives.filter(rep => rep.id !== id)
  })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

## 🎨 **CSS e Estilização**

### **Variáveis CSS para Tema:**
```css
:root {
  /* Cores principais */
  --primary-color: #2563eb;
  --primary-dark: #1d4ed8;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  
  /* Cores de fundo */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #e2e8f0;
  
  /* Cores de texto */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  
  /* Espaçamentos */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Bordas */
  --border-radius: 0.5rem;
  --border-color: #e2e8f0;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### **Classes Utilitárias:**
```css
/* Grid de estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
}

/* Lista de consumidores */
.consumers-by-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.status-group {
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.consumer-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.consumer-item:last-child {
  border-bottom: none;
}
```

## 📱 **Responsividade e Mobile**

### **Breakpoints CSS:**
```css
/* Mobile First */
.container {
  padding: var(--spacing-md);
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
    max-width: 768px;
    margin: 0 auto;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-xl);
    max-width: 1024px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .consumers-by-status {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## 🚀 **Deploy e Produção**

### **Variáveis de Ambiente:**
```env
# .env.production
REACT_APP_API_URL=https://api.pagluz.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

### **Configuração de Build:**
```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:prod": "REACT_APP_ENVIRONMENT=production npm run build",
    "deploy": "npm run build:prod && aws s3 sync build/ s3://pagluz-frontend"
  }
}
```

---

**🎉 Documentação 100% completa! Agora você tem tudo necessário para desenvolver o frontend do sistema Pagluz com exemplos práticos, tipos TypeScript, componentes React e estilos CSS.**

**📚 Use esta documentação como referência completa para sua implementação frontend.**

