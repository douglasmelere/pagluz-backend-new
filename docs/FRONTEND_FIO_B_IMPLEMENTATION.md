# 🔧 Guia de Implementação - Porcentagem do Fio B no Frontend

## 📋 Resumo

Este guia mostra como integrar a funcionalidade de **gerenciamento da porcentagem do Fio B** no painel administrativo. Os admins poderão visualizar, editar e ver o histórico de alterações.

---

## 🔗 Endpoints da API

### Obter porcentagem atual do Fio B
```
GET /settings/fio-b-percentage
```
**Sem autenticação** (público)

**Resposta:**
```json
{
  "id": "setting-123",
  "key": "FIO_B_PERCENTAGE",
  "value": 33.5,
  "description": "Porcentagem do fio B para cálculo de propostas comerciais",
  "updatedAt": "2026-02-27T10:30:00Z"
}
```

### Definir nova porcentagem do Fio B
```
POST /settings/fio-b-percentage
```
**Autenticação:** JWT Bearer Token + Permissão ADMIN

**Body:**
```json
{
  "percentage": 42.5
}
```

**Resposta:**
```json
{
  "id": "setting-123",
  "key": "FIO_B_PERCENTAGE",
  "value": 42.5,
  "description": "Porcentagem do fio B para cálculo de propostas comerciais",
  "updatedAt": "2026-02-27T10:35:00Z"
}
```

### Obter histórico de alterações
```
GET /settings/fio-b-percentage/history
```
**Autenticação:** JWT Bearer Token + Permissão ADMIN

**Resposta:**
```json
[
  {
    "id": "setting-123",
    "value": 42.5,
    "isActive": true,
    "createdAt": "2026-02-27T10:35:00Z",
    "updatedAt": "2026-02-27T10:35:00Z"
  },
  {
    "id": "setting-122",
    "value": 33.5,
    "isActive": false,
    "createdAt": "2026-02-20T08:00:00Z",
    "updatedAt": "2026-02-27T10:35:00Z"
  }
]
```

---

## 💻 Serviço/Hook para Chamadas da API

### UseSettingsService (React Hook)

```typescript
// src/hooks/useSettingsService.ts

import { useState, useCallback } from 'react';
import { api } from '@/services/api'; // configure com sua instância Axios/Fetch

interface FioBPercentageSetting {
  id: string;
  key: string;
  value: number;
  description: string;
  updatedAt: string;
}

interface FioBHistory {
  id: string;
  value: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useSettingsService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obter porcentagem atual
  const getFioBPercentage = useCallback(async (): Promise<number> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<FioBPercentageSetting>(
        '/settings/fio-b-percentage'
      );
      return response.data.value;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao obter porcentagem';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Definir nova porcentagem
  const setFioBPercentage = useCallback(
    async (percentage: number): Promise<FioBPercentageSetting> => {
      // Validação frontend
      if (percentage < 0 || percentage > 100) {
        throw new Error('Porcentagem deve estar entre 0 e 100');
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.post<FioBPercentageSetting>(
          '/settings/fio-b-percentage',
          { percentage }
        );
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao atualizar porcentagem';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Obter histórico
  const getFioBHistory = useCallback(async (): Promise<FioBHistory[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<FioBHistory[]>(
        '/settings/fio-b-percentage/history'
      );
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao obter histórico';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getFioBPercentage,
    setFioBPercentage,
    getFioBHistory,
  };
};
```

---

## 🎨 Componente React - FioBPercentageSettings

```typescript
// src/components/Admin/FioBPercentageSettings.tsx

import React, { useState, useEffect } from 'react';
import { useSettingsService } from '@/hooks/useSettingsService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Check } from 'lucide-react';

interface FioBHistory {
  id: string;
  value: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const FioBPercentageSettings: React.FC = () => {
  const { loading, error, getFioBPercentage, setFioBPercentage, getFioBHistory } =
    useSettingsService();

  const [currentValue, setCurrentValue] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');
  const [history, setHistory] = useState<FioBHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carregar valor atual ao montar
  useEffect(() => {
    loadCurrentValue();
  }, []);

  const loadCurrentValue = async () => {
    try {
      const value = await getFioBPercentage();
      setCurrentValue(value);
      setInputValue(value.toString());
    } catch (err) {
      console.error('Erro ao carregar porcentagem:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await getFioBHistory();
      setHistory(historyData);
      setShowHistory(!showHistory);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const handleSave = async () => {
    const percentage = parseFloat(inputValue);

    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      alert('Por favor, insira um valor entre 0 e 100');
      return;
    }

    try {
      const result = await setFioBPercentage(percentage);
      setCurrentValue(result.value);
      setSuccessMessage(`Porcentagem atualizada para ${result.value}%`);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  };

  const handleCancel = () => {
    setInputValue(currentValue.toString());
  };

  const hasChanges = parseFloat(inputValue) !== currentValue;

  return (
    <div className="space-y-4">
      {/* Card Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Porcentagem do Fio B
          </CardTitle>
          <CardDescription>
            Configure a porcentagem utilizada no cálculo de propostas comerciais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Valor Atual */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Valor Atual</p>
            <p className="text-3xl font-bold text-blue-600">{currentValue}%</p>
            <p className="text-xs text-gray-500 mt-2">
              Último atualizado: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Erro */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Input e Botões */}
          <div className="space-y-3">
            <div>
              <label htmlFor="fio-b-input" className="block text-sm font-medium mb-2">
                Nova Porcentagem (0-100)
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="fio-b-input"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ex: 42.5"
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={!hasChanges || loading}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>

          {/* Botão do Histórico */}
          <Button
            onClick={loadHistory}
            variant="ghost"
            className="w-full"
            disabled={loading}
          >
            {showHistory ? '🔽 Ocultar Histórico' : '📋 Ver Histórico'}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Alterações */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum histórico disponível</p>
            ) : (
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded border ${
                      item.isActive
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">
                          {item.value}%
                          {item.isActive && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Ativo
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Alterado em: {new Date(item.updatedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

---

## 🔌 Integração no Painel Admin

### Opção 1: Nova Página Dedicada

```typescript
// src/pages/admin/settings/FioBPercentage.tsx

import React from 'react';
import { PageLayout } from '@/components/Layout/PageLayout';
import { FioBPercentageSettings } from '@/components/Admin/FioBPercentageSettings';

export const FioBPercentagePage: React.FC = () => {
  return (
    <PageLayout title="Configurações - Fio B">
      <div className="max-w-2xl">
        <FioBPercentageSettings />
      </div>
    </PageLayout>
  );
};
```

### Opção 2: Seção dentro de Settings Geral

```typescript
// Dentro de src/pages/admin/settings/GeneralSettings.tsx

import { FioBPercentageSettings } from '@/components/Admin/FioBPercentageSettings';

export const GeneralSettingsPage: React.FC = () => {
  return (
    <PageLayout title="Configurações do Sistema">
      <Tabs>
        <TabsContent value="kwh">
          <KwhPriceSettings />
        </TabsContent>
        
        <TabsContent value="fio-b">
          <FioBPercentageSettings />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};
```

---

## 🗂️ Estrutura de Pastas Recomendada

```
src/
├── components/
│   └── Admin/
│       ├── KwhPriceSettings.tsx         (existente)
│       └── FioBPercentageSettings.tsx   (novo)
├── hooks/
│   └── useSettingsService.ts            (novo)
├── pages/
│   └── admin/
│       └── settings/
│           ├── GeneralSettings.tsx
│           └── FioBPercentage.tsx       (opcional)
└── services/
    └── api.ts                           (já existe)
```

---

## 🧪 Exemplo de Testes

```typescript
// src/components/Admin/__tests__/FioBPercentageSettings.test.tsx

import { render, screen, userEvent, waitFor } from '@testing-library/react';
import { FioBPercentageSettings } from '../FioBPercentageSettings';
import * as useSettingsService from '@/hooks/useSettingsService';

describe('FioBPercentageSettings', () => {
  const mockGetFioBPercentage = jest.fn().mockResolvedValue(33.5);
  const mockSetFioBPercentage = jest
    .fn()
    .mockResolvedValue({ value: 45.0, id: '1', key: 'FIO_B_PERCENTAGE', description: '', updatedAt: '' });
  const mockGetFioBHistory = jest.fn().mockResolvedValue([]);

  beforeEach(() => {
    jest.spyOn(useSettingsService, 'useSettingsService').mockReturnValue({
      loading: false,
      error: null,
      getFioBPercentage: mockGetFioBPercentage,
      setFioBPercentage: mockSetFioBPercentage,
      getFioBHistory: mockGetFioBHistory,
    } as any);
  });

  it('deve carregar e exibir a porcentagem atual', async () => {
    render(<FioBPercentageSettings />);
    await waitFor(() => {
      expect(screen.getByText('33.5%')).toBeInTheDocument();
    });
  });

  it('deve salvar nova porcentagem', async () => {
    const user = userEvent.setup();
    render(<FioBPercentageSettings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('33.5')).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('33.5');
    await user.clear(input);
    await user.type(input, '45');

    const saveButton = screen.getByText('Salvar Alterações');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSetFioBPercentage).toHaveBeenCalledWith(45);
    });
  });

  it('deve validar entrada antes de salvar', async () => {
    const user = userEvent.setup();
    render(<FioBPercentageSettings />);

    const input = await screen.findByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '150'); // Valor inválido

    const saveButton = screen.getByText('Salvar Alterações');
    await user.click(saveButton);

    // Deve mostrar alerta de erro
    expect(screen.getByText(/Por favor, insira um valor entre 0 e 100/)).toBeInTheDocument();
  });
});
```

---

## 📱 Uso em Propostas Comerciais

Se você precisa **usar** este valor para **calcular propostas**, faça assim:

```typescript
// src/services/proposalCalculator.ts

import { api } from './api';

export const calculateProposal = async (
  consumerId: string,
  consumptionKwh: number
) => {
  try {
    // Obter KWh price
    const kwhResponse = await api.get('/settings/kwh-price');
    const kwhPrice = kwhResponse.data.value;

    // Obter Fio B percentage
    const fioBResponse = await api.get('/settings/fio-b-percentage');
    const fioBPercentage = fioBResponse.data.value;

    // Calcular valores
    const baseValue = consumptionKwh * kwhPrice;
    const fioBValue = baseValue * (fioBPercentage / 100);
    const totalProposal = baseValue + fioBValue;

    return {
      consumptionKwh,
      kwhPrice,
      baseValue,
      fioBPercentage,
      fioBValue,
      totalProposal,
    };
  } catch (error) {
    console.error('Erro ao calcular proposta:', error);
    throw error;
  }
};
```

---

## ✅ Checklist de Implementação

- [ ] Criar hook `useSettingsService.ts`
- [ ] Criar componente `FioBPercentageSettings.tsx`
- [ ] Integrar componente no painel admin (Settings)
- [ ] Testar endpoints da API com Postman/Insomnia
- [ ] Testar componente React
- [ ] Vincular ao cálculo de propostas (se necessário)
- [ ] Adicionar permissões RBAC (apenas ADMIN)
- [ ] Documentar no manual do usuário

---

## 🚀 Próximas Melhorias

1. **Refresh automático**: Integrar WebSocket ou polling para atualizar estatísticas em tempo real
2. **Alertas**: Notificar via email quando a porcentagem for alterada
3. **Agendamento**: Permitir agendar mudanças futuras
4. **Validação avançada**: Alertar se a porcentagem estiver fora do intervalo esperado
5. **Auditoria visual**: Mostrar quem alterou e quando na interface

---

**Pronto para implementar? Qualquer dúvida, me avise!** 🚀
