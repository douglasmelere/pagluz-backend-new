# 📱 Guia Completo - Sistema de Representantes

Este guia contém todas as instruções para implementar as funcionalidades do sistema de representantes no front-end.

---

## 📋 Índice

1. [Atualização de Consumidores com Aprovação Inteligente](#atualização-de-consumidores-com-aprovação-inteligente)
2. [Upload e Gerenciamento de Faturas](#upload-e-gerenciamento-de-faturas)
3. [Visualização de Status de Solicitações](#visualização-de-status-de-solicitações)
4. [Exemplos de Código Completos](#exemplos-de-código-completos)

---

## 🔄 Atualização de Consumidores com Aprovação Inteligente

### Conceito

O sistema agora diferencia entre **campos críticos** e **campos não críticos**:

- **Campos Críticos** → Requerem aprovação do administrador
- **Campos Não Críticos** → Atualização direta (sem aprovação)

### Campos Críticos (Requerem Aprovação)

Estes campos afetam diretamente cálculos financeiros e operacionais:

- `averageMonthlyConsumption` - Consumo médio mensal (kWh)
- `discountOffered` - Desconto oferecido (%)
- `ucNumber` - Número da UC (Unidade Consumidora)
- `concessionaire` - Concessionária de energia
- `consumerType` - Tipo de consumidor (RESIDENTIAL, COMMERCIAL, etc.)
- `phase` - Fase (MONOPHASIC, BIPHASIC, TRIPHASIC)
- `status` - Status do consumidor
- `allocatedPercentage` - Porcentagem de energia alocada
- `generatorId` - ID do gerador vinculado

### Campos Não Críticos (Atualização Direta)

Estes campos podem ser alterados imediatamente:

- `name` - Nome do consumidor
- `phone` - Telefone
- `email` - E-mail
- `street`, `number`, `complement`, `neighborhood` - Endereço
- `city`, `state`, `zipCode` - Localização
- `birthDate` - Data de nascimento
- `observations` - Observações
- `receiveWhatsapp` - Recebe WhatsApp
- `representativeName`, `representativeRg` - Dados do representante

---

### Endpoint

```
PATCH /consumers/representative/:consumerId
Authorization: Bearer {representative_token}
Content-Type: application/json
```

### Resposta

```json
{
  "consumer": {
    "id": "clxxx456",
    "name": "João Silva Santos",
    "phone": "(48) 99999-9999",
    "email": "joao@email.com",
    "city": "Florianópolis",
    "averageMonthlyConsumption": 350.5,
    "discountOffered": 12.0
  },
  "changeRequest": {
    "id": "clxxx123",
    "status": "PENDING",
    "changedFields": ["averageMonthlyConsumption", "discountOffered"],
    "requestedAt": "2025-12-27T17:30:00Z"
  },
  "message": "Campos não críticos atualizados. Campos críticos aguardam aprovação.",
  "updatedFields": {
    "direct": ["name", "phone", "email", "city"],
    "pending": ["averageMonthlyConsumption", "discountOffered"]
  }
}
```

**Cenários de Resposta:**

1. **Apenas campos não críticos:**
   ```json
   {
     "consumer": { /* atualizado */ },
     "changeRequest": null,
     "message": "Consumidor atualizado com sucesso.",
     "updatedFields": {
       "direct": ["name", "phone"],
       "pending": []
     }
   }
   ```

2. **Apenas campos críticos:**
   ```json
   {
     "consumer": { /* sem mudanças */ },
     "changeRequest": { /* solicitação criada */ },
     "message": "Solicitação de alteração criada. Aguarde aprovação do administrador.",
     "updatedFields": {
       "direct": [],
       "pending": ["averageMonthlyConsumption", "discountOffered"]
     }
   }
   ```

3. **Campos mistos:**
   ```json
   {
     "consumer": { /* parcialmente atualizado */ },
     "changeRequest": { /* solicitação criada */ },
     "message": "Campos não críticos atualizados. Campos críticos aguardam aprovação.",
     "updatedFields": {
       "direct": ["name", "phone"],
       "pending": ["averageMonthlyConsumption"]
     }
   }
   ```

---

### Implementação no Front-End

#### 1. Componente de Edição Completo

```tsx
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface Consumer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  city: string;
  state: string;
  averageMonthlyConsumption: number;
  discountOffered: number;
  ucNumber: string;
  concessionaire: string;
  consumerType: string;
  phase: string;
  // ... outros campos
}

interface UpdateResponse {
  consumer: Consumer;
  changeRequest: {
    id: string;
    status: string;
    changedFields: string[];
    requestedAt: string;
  } | null;
  message: string;
  updatedFields: {
    direct: string[];
    pending: string[];
  };
}

export function EditConsumerForm({ consumerId }: { consumerId: string }) {
  const [consumer, setConsumer] = useState<Consumer | null>(null);
  const [formData, setFormData] = useState<Partial<Consumer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsumer();
  }, [consumerId]);

  const loadConsumer = async () => {
    try {
      const response = await api.get(`/consumers/representative/${consumerId}`);
      setConsumer(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Erro ao carregar consumidor:', error);
      toast.error('Erro ao carregar dados do consumidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.patch<UpdateResponse>(
        `/consumers/representative/${consumerId}`,
        formData
      );

      // Atualiza o estado local com os dados atualizados
      setConsumer(response.data.consumer);

      // Mostra feedback baseado na resposta
      if (response.data.updatedFields.pending.length > 0) {
        showApprovalPendingModal(response.data);
      } else {
        toast.success(response.data.message);
      }

      // Se houver solicitação pendente, mostra notificação
      if (response.data.changeRequest) {
        showChangeRequestNotification(response.data.changeRequest);
      }
    } catch (error) {
      console.error('Erro ao atualizar consumidor:', error);
      toast.error('Erro ao atualizar consumidor. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!consumer) return <div>Consumidor não encontrado</div>;

  return (
    <form onSubmit={handleSubmit} className="edit-consumer-form">
      <h2>Editar Consumidor</h2>

      {/* Campos Não Críticos - Atualização Direta */}
      <div className="form-section">
        <h3>Informações de Contato e Localização</h3>
        <p className="section-note">
          ✅ Estes campos são atualizados imediatamente
        </p>

        <div className="form-group">
          <label>Nome Completo *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Telefone</label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(48) 99999-9999"
          />
        </div>

        <div className="form-group">
          <label>E-mail</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cidade *</label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Estado (UF) *</label>
            <input
              type="text"
              maxLength={2}
              value={formData.state || ''}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>CEP</label>
          <input
            type="text"
            value={formData.zipCode || ''}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            placeholder="88010-000"
          />
        </div>

        <div className="form-group">
          <label>Rua</label>
          <input
            type="text"
            value={formData.street || ''}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Número</label>
            <input
              type="text"
              value={formData.number || ''}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Complemento</label>
            <input
              type="text"
              value={formData.complement || ''}
              onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bairro</label>
          <input
            type="text"
            value={formData.neighborhood || ''}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Data de Nascimento</label>
          <input
            type="date"
            value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Observações</label>
          <textarea
            value={formData.observations || ''}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.receiveWhatsapp || false}
              onChange={(e) => setFormData({ ...formData, receiveWhatsapp: e.target.checked })}
            />
            Recebe WhatsApp
          </label>
        </div>
      </div>

      {/* Campos Críticos - Requerem Aprovação */}
      <div className="form-section critical-fields">
        <h3>Dados Técnicos e Financeiros</h3>
        <p className="section-note warning">
          ⚠️ Estes campos requerem aprovação do administrador
        </p>

        <div className="form-group">
          <label>Número da UC *</label>
          <input
            type="text"
            value={formData.ucNumber || ''}
            onChange={(e) => setFormData({ ...formData, ucNumber: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Concessionária *</label>
          <input
            type="text"
            value={formData.concessionaire || ''}
            onChange={(e) => setFormData({ ...formData, concessionaire: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Tipo de Consumidor *</label>
          <select
            value={formData.consumerType || ''}
            onChange={(e) => setFormData({ ...formData, consumerType: e.target.value })}
            required
          >
            <option value="">Selecione...</option>
            <option value="RESIDENTIAL">Residencial</option>
            <option value="COMMERCIAL">Comercial</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="RURAL">Rural</option>
            <option value="PUBLIC_POWER">Energia Pública</option>
          </select>
        </div>

        <div className="form-group">
          <label>Fase *</label>
          <select
            value={formData.phase || ''}
            onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
            required
          >
            <option value="">Selecione...</option>
            <option value="MONOPHASIC">Monofásico</option>
            <option value="BIPHASIC">Bifásico</option>
            <option value="TRIPHASIC">Trifásico</option>
          </select>
        </div>

        <div className="form-group">
          <label>Consumo Médio Mensal (kWh) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.averageMonthlyConsumption || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              averageMonthlyConsumption: parseFloat(e.target.value) 
            })}
            required
          />
          <small className="field-note">
            ⚠️ Requer aprovação do administrador
          </small>
        </div>

        <div className="form-group">
          <label>Desconto Oferecido (%) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.discountOffered || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              discountOffered: parseFloat(e.target.value) 
            })}
            required
          />
          <small className="field-note">
            ⚠️ Requer aprovação do administrador
          </small>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="info-box">
        <h4>ℹ️ Como funciona:</h4>
        <ul>
          <li>
            <strong>Campos de contato e localização:</strong> São atualizados imediatamente
          </li>
          <li>
            <strong>Campos técnicos e financeiros:</strong> Requerem aprovação do administrador
          </li>
          <li>
            <strong>Mistos:</strong> Campos não críticos são atualizados e críticos aguardam aprovação
          </li>
        </ul>
      </div>
    </form>
  );
}
```

#### 2. Modal de Confirmação com Detalhes

```tsx
interface ApprovalPendingModalProps {
  data: UpdateResponse;
  onClose: () => void;
}

export function ApprovalPendingModal({ data, onClose }: ApprovalPendingModalProps) {
  const hasDirectUpdates = data.updatedFields.direct.length > 0;
  const hasPendingUpdates = data.updatedFields.pending.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>✅ Alterações Processadas</h2>

        {hasDirectUpdates && (
          <div className="success-section">
            <h3>✓ Atualizado Imediatamente</h3>
            <ul>
              {data.updatedFields.direct.map((field) => (
                <li key={field}>
                  <strong>{translateField(field)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasPendingUpdates && (
          <div className="pending-section">
            <h3>⏳ Aguardando Aprovação</h3>
            <p>Os seguintes campos foram enviados para aprovação:</p>
            <ul>
              {data.updatedFields.pending.map((field) => (
                <li key={field}>
                  <strong>{translateField(field)}</strong>
                </li>
              ))}
            </ul>
            {data.changeRequest && (
              <div className="request-info">
                <p>
                  <strong>ID da Solicitação:</strong> {data.changeRequest.id}
                </p>
                <p>
                  <strong>Status:</strong> {data.changeRequest.status}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="modal-message">
          <p>{data.message}</p>
        </div>

        <button onClick={onClose} className="btn-primary">
          Entendi
        </button>
      </div>
    </div>
  );
}

function translateField(field: string): string {
  const translations: Record<string, string> = {
    name: 'Nome',
    phone: 'Telefone',
    email: 'E-mail',
    city: 'Cidade',
    state: 'Estado',
    street: 'Rua',
    number: 'Número',
    complement: 'Complemento',
    neighborhood: 'Bairro',
    zipCode: 'CEP',
    birthDate: 'Data de Nascimento',
    observations: 'Observações',
    receiveWhatsapp: 'Recebe WhatsApp',
    averageMonthlyConsumption: 'Consumo Médio Mensal (kWh)',
    discountOffered: 'Desconto Oferecido (%)',
    ucNumber: 'Número da UC',
    concessionaire: 'Concessionária',
    consumerType: 'Tipo de Consumidor',
    phase: 'Fase',
    status: 'Status',
    allocatedPercentage: 'Porcentagem Alocada',
    generatorId: 'Gerador Vinculado',
  };
  return translations[field] || field;
}
```

#### 3. Indicador Visual de Campos

```tsx
export function FieldIndicator({ fieldName }: { fieldName: string }) {
  const criticalFields = [
    'averageMonthlyConsumption',
    'discountOffered',
    'ucNumber',
    'concessionaire',
    'consumerType',
    'phase',
    'status',
    'allocatedPercentage',
    'generatorId',
  ];

  const isCritical = criticalFields.includes(fieldName);

  return (
    <span className={`field-indicator ${isCritical ? 'critical' : 'non-critical'}`}>
      {isCritical ? (
        <>
          ⚠️ Requer aprovação
        </>
      ) : (
        <>
          ✅ Atualização imediata
        </>
      )}
    </span>
  );
}
```

---

## 📄 Upload e Gerenciamento de Faturas

### Endpoints Disponíveis

#### 1. Upload de Fatura

```
POST /consumers/representative/:consumerId/invoice
Authorization: Bearer {representative_token}
Content-Type: multipart/form-data
Body: file (PDF ou imagem)
```

**Resposta:**
```json
{
  "consumer": { /* consumidor atualizado */ },
  "invoiceUrl": "/consumers/representative/{consumerId}/invoice",
  "invoiceStorageUrl": "https://supabase.../faturas-representantes/...",
  "invoiceFileName": "joao-silva-2025-12-27.pdf",
  "scannedData": {
    "text": "Texto extraído...",
    "confidence": 85.5,
    "extractedData": {
      "ucNumber": "12345678",
      "consumption": 350.5,
      "value": 245.30,
      "dueDate": "15/01/2026"
    }
  }
}
```

#### 2. Download de Fatura

```
GET /consumers/representative/:consumerId/invoice
Authorization: Bearer {representative_token}
```

**Resposta:** Arquivo binário (PDF ou imagem)

#### 3. Remover Fatura

```
DELETE /consumers/representative/:consumerId/invoice
Authorization: Bearer {representative_token}
```

---

### Implementação Completa

```tsx
import { useState } from 'react';
import { api } from '@/services/api';

export function InvoiceManagement({ consumerId }: { consumerId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    loadConsumerInvoice();
  }, [consumerId]);

  const loadConsumerInvoice = async () => {
    try {
      const response = await api.get(`/consumers/representative/${consumerId}`);
      if (response.data.invoiceUrl) {
        setInvoiceData({
          url: response.data.invoiceUrl,
          fileName: response.data.invoiceFileName || 'Fatura',
          uploadedAt: response.data.invoiceUploadedAt,
          scannedData: response.data.invoiceScannedData,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar fatura:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validação
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Tipo de arquivo não permitido. Use PDF ou imagem.');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    setUploading(true);
    setScanning(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        `/consumers/representative/${consumerId}/invoice`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      toast.success('Fatura enviada com sucesso!');
      
      // Atualiza os dados da fatura
      setInvoiceData({
        url: response.data.invoiceUrl,
        fileName: response.data.invoiceFileName,
        uploadedAt: new Date().toISOString(),
        scannedData: response.data.scannedData,
      });

      // Se houver dados do OCR, mostrar
      if (response.data.scannedData) {
        showOcrResults(response.data.scannedData);
      }

      setFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar fatura. Tente novamente.');
    } finally {
      setUploading(false);
      setScanning(false);
    }
  };

  const handleDownload = () => {
    // Usa o endpoint do backend para download
    const downloadUrl = `${API_URL}/consumers/representative/${consumerId}/invoice`;
    window.open(downloadUrl, '_blank');
  };

  const handleRemove = async () => {
    if (!confirm('Tem certeza que deseja remover esta fatura?')) {
      return;
    }

    try {
      await api.delete(`/consumers/representative/${consumerId}/invoice`);
      toast.success('Fatura removida com sucesso');
      setInvoiceData(null);
    } catch (error) {
      console.error('Erro ao remover fatura:', error);
      toast.error('Erro ao remover fatura');
    }
  };

  return (
    <div className="invoice-management">
      <h2>Gerenciar Fatura</h2>

      {invoiceData ? (
        <div className="invoice-info">
          <div className="invoice-header">
            <h3>Fatura Anexada</h3>
            <span className="invoice-date">
              {new Date(invoiceData.uploadedAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="invoice-details">
            <p>
              <strong>Arquivo:</strong> {invoiceData.fileName}
            </p>

            {invoiceData.scannedData && (
              <div className="scanned-data">
                <h4>Dados Extraídos (OCR)</h4>
                {invoiceData.scannedData.extractedData && (
                  <ul>
                    {invoiceData.scannedData.extractedData.ucNumber && (
                      <li>UC: {invoiceData.scannedData.extractedData.ucNumber}</li>
                    )}
                    {invoiceData.scannedData.extractedData.consumption && (
                      <li>Consumo: {invoiceData.scannedData.extractedData.consumption} kWh</li>
                    )}
                    {invoiceData.scannedData.extractedData.value && (
                      <li>Valor: R$ {invoiceData.scannedData.extractedData.value}</li>
                    )}
                    {invoiceData.scannedData.extractedData.dueDate && (
                      <li>Vencimento: {invoiceData.scannedData.extractedData.dueDate}</li>
                    )}
                  </ul>
                )}
                <p className="confidence">
                  Confiança do OCR: {invoiceData.scannedData.confidence}%
                </p>
              </div>
            )}
          </div>

          <div className="invoice-actions">
            <button onClick={handleDownload} className="btn-primary">
              📄 Ver/Download Fatura
            </button>
            <button onClick={handleRemove} className="btn-danger">
              🗑️ Remover Fatura
            </button>
          </div>
        </div>
      ) : (
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="invoice-file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="invoice-file" className="file-label">
              {file ? file.name : 'Selecione um arquivo (PDF ou Imagem)'}
            </label>
          </div>

          {file && (
            <div className="file-preview">
              <p><strong>Arquivo:</strong> {file.name}</p>
              <p><strong>Tamanho:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p>
                {scanning && uploadProgress === 100
                  ? 'Processando OCR...'
                  : `Enviando... ${uploadProgress}%`}
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary"
          >
            {uploading ? 'Enviando...' : 'Enviar Fatura'}
          </button>

          <p className="help-text">
            💡 Dica: Ao enviar uma foto, o sistema fará um scan automático 
            para extrair dados da fatura.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Visualização de Status de Solicitações

### Endpoint

```
GET /consumers/representative/change-requests
Authorization: Bearer {representative_token}
```

### Implementação

```tsx
export function ChangeRequestsHistory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChangeRequests();
  }, []);

  const loadChangeRequests = async () => {
    try {
      const response = await api.get('/consumers/representative/change-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { text: 'Pendente', class: 'badge-warning', icon: '⏳' },
      APPROVED: { text: 'Aprovado', class: 'badge-success', icon: '✅' },
      REJECTED: { text: 'Rejeitado', class: 'badge-danger', icon: '❌' },
    };
    return badges[status] || { text: status, class: '', icon: '' };
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="change-requests-history">
      <h1>Histórico de Alterações</h1>

      {requests.length === 0 ? (
        <p>Nenhuma solicitação de alteração encontrada.</p>
      ) : (
        <div className="requests-list">
          {requests.map((request) => {
            const statusBadge = getStatusBadge(request.status);
            
            return (
              <div key={request.id} className="request-card">
                <div className="card-header">
                  <h3>{request.consumer.name}</h3>
                  <span className={`badge ${statusBadge.class}`}>
                    {statusBadge.icon} {statusBadge.text}
                  </span>
                </div>

                <div className="card-body">
                  <p>
                    <strong>Solicitado em:</strong>{' '}
                    {new Date(request.requestedAt).toLocaleString('pt-BR')}
                  </p>

                  <div className="changed-fields">
                    <strong>Campos alterados:</strong>
                    <ul>
                      {request.changedFields.map((field: string) => (
                        <li key={field}>{translateField(field)}</li>
                      ))}
                    </ul>
                  </div>

                  {request.status !== 'PENDING' && (
                    <>
                      <p>
                        <strong>Revisado em:</strong>{' '}
                        {new Date(request.reviewedAt).toLocaleString('pt-BR')}
                      </p>
                      <p>
                        <strong>Revisado por:</strong>{' '}
                        {request.reviewedBy?.name || 'N/A'}
                      </p>
                    </>
                  )}

                  {request.status === 'REJECTED' && request.rejectionReason && (
                    <div className="rejection-reason">
                      <strong>Motivo da rejeição:</strong>
                      <p>{request.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    onClick={() => viewDetails(request.id)}
                    className="btn-secondary"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Estilos CSS Sugeridos

```css
/* Formulário de Edição */
.edit-consumer-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  background: #fff;
}

.form-section.critical-fields {
  border-color: #ffc107;
  background: #fffbf0;
}

.section-note {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f0f0f0;
  border-radius: 0.25rem;
}

.section-note.warning {
  background: #fff3cd;
  color: #856404;
}

.field-note {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.field-indicator {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.field-indicator.critical {
  background: #fff3cd;
  color: #856404;
}

.field-indicator.non-critical {
  background: #d4edda;
  color: #155724;
}

/* Gerenciamento de Faturas */
.invoice-management {
  padding: 1.5rem;
}

.invoice-info {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: #fff;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.scanned-data {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
}

.scanned-data ul {
  list-style: none;
  padding: 0;
}

.scanned-data li {
  padding: 0.25rem 0;
}

.confidence {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.invoice-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* Histórico de Solicitações */
.request-card {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.changed-fields ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

.changed-fields li {
  padding: 0.25rem 0;
}

.rejection-reason {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 0.25rem;
  color: #721c24;
}
```

---

## ✅ Checklist de Implementação

- [ ] Formulário de edição com todos os campos
- [ ] Separação visual entre campos críticos e não críticos
- [ ] Feedback visual após atualização (modal com detalhes)
- [ ] Upload de faturas com preview
- [ ] Download de faturas via endpoint do backend
- [ ] Visualização de dados do OCR
- [ ] Histórico de solicitações de alteração
- [ ] Status badges (Pendente/Aprovado/Rejeitado)
- [ ] Tratamento de erros
- [ ] Loading states

---

**Desenvolvido para:** Pagluz Backend  
**Data:** Dezembro 2025









