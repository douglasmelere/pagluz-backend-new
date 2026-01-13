# 📱 Guia Completo de Implementação Front-End

Este guia contém todas as instruções necessárias para implementar as novas funcionalidades no front-end, separadas por sistema (Admin e Representante).

---

## 📋 Índice

1. [Sistema de Administradores](#sistema-de-administradores)
   - [Dashboard com Notificações](#dashboard-com-notificações)
   - [Aprovação de Mudanças](#aprovação-de-mudanças)
   - [Visualização de Faturas](#visualização-de-faturas)

2. [Sistema de Representantes](#sistema-de-representantes)
   - [Upload de Faturas](#upload-de-faturas)
   - [Edição de Consumidores com Aprovação](#edição-de-consumidores-com-aprovação)
   - [Visualização de Status de Mudanças](#visualização-de-status-de-mudanças)

3. [Componentes Compartilhados](#componentes-compartilhados)
   - [Componente de Upload de Arquivo](#componente-de-upload-de-arquivo)
   - [Componente de Notificação](#componente-de-notificação)

4. [Exemplos de Código](#exemplos-de-código)

---

## 🔐 Sistema de Administradores

### Dashboard com Notificações

#### Endpoint
```
GET /dashboard
Authorization: Bearer {admin_token}
```

#### Resposta
```json
{
  "summary": {
    "totalGenerators": 10,
    "totalConsumers": 50,
    "totalInstalledPower": 50000,
    "newClientsThisWeek": 5,
    "pendingConsumers": 3,
    "pendingChangeRequests": 5
  },
  "notifications": {
    "pendingChangeRequests": [
      {
        "id": "clxxx123",
        "consumerId": "clxxx456",
        "consumerName": "João Silva",
        "representativeName": "Maria Santos",
        "changedFields": ["name", "phone", "averageMonthlyConsumption"],
        "requestedAt": "2025-12-27T10:30:00Z"
      }
    ],
    "pendingConsumers": 3
  }
}
```

#### Implementação

**1. Componente de Dashboard (React/Next.js exemplo)**

```tsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

interface DashboardData {
  summary: {
    pendingChangeRequests: number;
    pendingConsumers: number;
  };
  notifications: {
    pendingChangeRequests: Array<{
      id: string;
      consumerId: string;
      consumerName: string;
      representativeName: string;
      changedFields: string[];
      requestedAt: string;
    }>;
    pendingConsumers: number;
  };
}

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Dashboard Administrativo</h1>
      
      {/* Badge de Notificações */}
      <div className="notifications-badge">
        <span className="badge">
          {dashboardData?.summary.pendingChangeRequests || 0} Mudanças Pendentes
        </span>
        <span className="badge">
          {dashboardData?.summary.pendingConsumers || 0} Consumidores Pendentes
        </span>
      </div>

      {/* Lista de Notificações */}
      {dashboardData?.notifications.pendingChangeRequests.length > 0 && (
        <div className="notifications-list">
          <h2>Mudanças Pendentes de Aprovação</h2>
          {dashboardData.notifications.pendingChangeRequests.map((request) => (
            <NotificationCard
              key={request.id}
              request={request}
              onApprove={() => handleApprove(request.id)}
              onReject={() => handleReject(request.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**2. Card de Notificação**

```tsx
interface NotificationCardProps {
  request: {
    id: string;
    consumerId: string;
    consumerName: string;
    representativeName: string;
    changedFields: string[];
    requestedAt: string;
  };
  onApprove: () => void;
  onReject: () => void;
}

export function NotificationCard({ request, onApprove, onReject }: NotificationCardProps) {
  return (
    <div className="notification-card">
      <div className="notification-header">
        <h3>{request.consumerName}</h3>
        <span className="representative">Por: {request.representativeName}</span>
        <span className="date">
          {new Date(request.requestedAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
      
      <div className="changed-fields">
        <strong>Campos alterados:</strong>
        <ul>
          {request.changedFields.map((field) => (
            <li key={field}>{translateField(field)}</li>
          ))}
        </ul>
      </div>

      <div className="notification-actions">
        <button onClick={onApprove} className="btn-approve">
          Aprovar
        </button>
        <button onClick={onReject} className="btn-reject">
          Rejeitar
        </button>
        <button onClick={() => viewDetails(request.id)} className="btn-details">
          Ver Detalhes
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
    averageMonthlyConsumption: 'Consumo Médio Mensal',
    discountOffered: 'Desconto Oferecido',
    city: 'Cidade',
    state: 'Estado',
    // Adicione mais traduções conforme necessário
  };
  return translations[field] || field;
}
```

---

### Aprovação de Mudanças

#### 1. Listar Mudanças Pendentes

**Endpoint:**
```
GET /consumers/change-requests/pending?page=1&limit=10
Authorization: Bearer {admin_token}
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "clxxx123",
      "consumerId": "clxxx456",
      "consumer": {
        "id": "clxxx456",
        "name": "João Silva",
        "cpfCnpj": "123.456.789-00",
        "ucNumber": "12345678"
      },
      "representative": {
        "id": "clxxx789",
        "name": "Maria Santos",
        "email": "maria@example.com"
      },
      "oldValues": {
        "name": "João Silva",
        "phone": "(11) 99999-9999"
      },
      "newValues": {
        "name": "João Silva Santos",
        "phone": "(11) 88888-8888"
      },
      "changedFields": ["name", "phone"],
      "status": "PENDING",
      "requestedAt": "2025-12-27T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**Implementação:**

```tsx
export function PendingChangesPage() {
  const [changes, setChanges] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    loadPendingChanges();
  }, [pagination.page]);

  const loadPendingChanges = async () => {
    try {
      const response = await api.get('/consumers/change-requests/pending', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      setChanges(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao carregar mudanças:', error);
    }
  };

  const handleApprove = async (changeRequestId: string) => {
    try {
      await api.post(`/consumers/change-requests/${changeRequestId}/approve`);
      toast.success('Mudança aprovada com sucesso!');
      loadPendingChanges();
    } catch (error) {
      toast.error('Erro ao aprovar mudança');
    }
  };

  const handleReject = async (changeRequestId: string, reason: string) => {
    try {
      await api.post(`/consumers/change-requests/${changeRequestId}/reject`, {
        rejectionReason: reason,
      });
      toast.success('Mudança rejeitada');
      loadPendingChanges();
    } catch (error) {
      toast.error('Erro ao rejeitar mudança');
    }
  };

  return (
    <div>
      <h1>Mudanças Pendentes de Aprovação</h1>
      
      {changes.map((change) => (
        <ChangeRequestCard
          key={change.id}
          change={change}
          onApprove={() => handleApprove(change.id)}
          onReject={(reason) => handleReject(change.id, reason)}
        />
      ))}
    </div>
  );
}
```

#### 2. Card de Comparação (Antes/Depois)

```tsx
interface ChangeRequestCardProps {
  change: {
    id: string;
    consumer: { name: string; cpfCnpj: string };
    representative: { name: string };
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
    changedFields: string[];
  };
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ChangeRequestCard({ change, onApprove, onReject }: ChangeRequestCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="change-request-card">
      <div className="card-header">
        <h3>{change.consumer.name}</h3>
        <span>CPF/CNPJ: {change.consumer.cpfCnpj}</span>
        <span>Representante: {change.representative.name}</span>
      </div>

      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Campo</th>
              <th>Valor Anterior</th>
              <th>Novo Valor</th>
            </tr>
          </thead>
          <tbody>
            {change.changedFields.map((field) => (
              <tr key={field}>
                <td>{translateField(field)}</td>
                <td className="old-value">
                  {formatValue(change.oldValues[field])}
                </td>
                <td className="new-value">
                  {formatValue(change.newValues[field])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-actions">
        <button onClick={onApprove} className="btn-success">
          ✓ Aprovar
        </button>
        <button 
          onClick={() => setShowRejectModal(true)} 
          className="btn-danger"
        >
          ✗ Rejeitar
        </button>
      </div>

      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onConfirm={(reason) => {
            onReject(reason);
            setShowRejectModal(false);
          }}
        />
      )}
    </div>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value instanceof Date) return new Date(value).toLocaleDateString('pt-BR');
  return String(value);
}
```

#### 3. Modal de Rejeição

```tsx
interface RejectModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectModal({ onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Rejeitar Mudança</h2>
        <p>Por favor, informe o motivo da rejeição:</p>
        
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo da rejeição..."
          rows={4}
          required
        />

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(reason)} 
            className="btn-danger"
            disabled={!reason.trim()}
          >
            Confirmar Rejeição
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Visualização de Faturas

**Endpoint:**
```
GET /consumers/:id
Authorization: Bearer {admin_token}
```

**Resposta inclui:**
```json
{
  "id": "clxxx456",
  "name": "João Silva",
  "invoiceUrl": "https://n8n-supabase.../consumers/clxxx456/invoice.pdf",
  "invoiceFileName": "consumer-clxxx456-1234567890.pdf",
  "invoiceUploadedAt": "2025-12-27T10:00:00Z",
  "invoiceScannedData": {
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

**Implementação:**

```tsx
export function ConsumerDetailsPage({ consumerId }: { consumerId: string }) {
  const [consumer, setConsumer] = useState(null);

  useEffect(() => {
    loadConsumer();
  }, [consumerId]);

  const loadConsumer = async () => {
    const response = await api.get(`/consumers/${consumerId}`);
    setConsumer(response.data);
  };

  return (
    <div>
      <h1>{consumer?.name}</h1>
      
      {consumer?.invoiceUrl && (
        <div className="invoice-section">
          <h2>Fatura Anexada</h2>
          
          <div className="invoice-info">
            <p>
              <strong>Upload em:</strong>{' '}
              {new Date(consumer.invoiceUploadedAt).toLocaleString('pt-BR')}
            </p>
            
            {consumer.invoiceScannedData && (
              <div className="scanned-data">
                <h3>Dados Extraídos (OCR)</h3>
                <ul>
                  {consumer.invoiceScannedData.extractedData.ucNumber && (
                    <li>UC: {consumer.invoiceScannedData.extractedData.ucNumber}</li>
                  )}
                  {consumer.invoiceScannedData.extractedData.consumption && (
                    <li>Consumo: {consumer.invoiceScannedData.extractedData.consumption} kWh</li>
                  )}
                  {consumer.invoiceScannedData.extractedData.value && (
                    <li>Valor: R$ {consumer.invoiceScannedData.extractedData.value}</li>
                  )}
                  {consumer.invoiceScannedData.extractedData.dueDate && (
                    <li>Vencimento: {consumer.invoiceScannedData.extractedData.dueDate}</li>
                  )}
                </ul>
                <p className="confidence">
                  Confiança do OCR: {consumer.invoiceScannedData.confidence}%
                </p>
              </div>
            )}
          </div>

          <div className="invoice-actions">
            <a 
              href={consumer.invoiceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
            >
              📄 Ver Fatura
            </a>
            <a 
              href={consumer.invoiceUrl} 
              download
              className="btn-secondary"
            >
              ⬇️ Download
            </a>
          </div>
        </div>
      )}

      {!consumer?.invoiceUrl && (
        <div className="no-invoice">
          <p>Nenhuma fatura anexada</p>
        </div>
      )}
    </div>
  );
}
```

---

## 👤 Sistema de Representantes

### Upload de Faturas

#### Endpoint
```
POST /consumers/representative/:consumerId/invoice
Authorization: Bearer {representative_token}
Content-Type: multipart/form-data
Body: file (PDF ou imagem)
```

#### Implementação

```tsx
import { useState } from 'react';
import { api } from '@/services/api';

export function UploadInvoiceForm({ consumerId }: { consumerId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanning, setScanning] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validação de tipo
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

      // Validação de tamanho (máx 10MB)
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
      
      // Se houver dados do OCR, mostrar
      if (response.data.scannedData) {
        showOcrResults(response.data.scannedData);
      }

      // Limpar formulário
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

  return (
    <div className="upload-invoice-form">
      <h2>Anexar Fatura</h2>
      
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
          <p>
            <strong>Arquivo selecionado:</strong> {file.name}
          </p>
          <p>
            <strong>Tamanho:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p>
            <strong>Tipo:</strong> {file.type}
          </p>
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
  );
}
```

#### Componente de Preview de Imagem

```tsx
export function InvoicePreview({ file }: { file: File }) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  if (!preview) return null;

  return (
    <div className="invoice-preview">
      <img src={preview} alt="Preview da fatura" />
    </div>
  );
}
```

#### Modal de Resultados do OCR

```tsx
export function OcrResultsModal({ 
  data, 
  onClose 
}: { 
  data: any; 
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Dados Extraídos da Fatura</h2>
        
        <div className="ocr-results">
          {data.extractedData.ucNumber && (
            <div className="ocr-field">
              <strong>Número da UC:</strong> {data.extractedData.ucNumber}
            </div>
          )}
          
          {data.extractedData.consumption && (
            <div className="ocr-field">
              <strong>Consumo:</strong> {data.extractedData.consumption} kWh
            </div>
          )}
          
          {data.extractedData.value && (
            <div className="ocr-field">
              <strong>Valor:</strong> R$ {data.extractedData.value}
            </div>
          )}
          
          {data.extractedData.dueDate && (
            <div className="ocr-field">
              <strong>Vencimento:</strong> {data.extractedData.dueDate}
            </div>
          )}

          <div className="ocr-confidence">
            <strong>Confiança do scan:</strong> {data.confidence}%
          </div>
        </div>

        <div className="ocr-text-preview">
          <h3>Texto Completo Extraído:</h3>
          <textarea 
            value={data.text} 
            readOnly 
            rows={10}
            className="ocr-text"
          />
        </div>

        <button onClick={onClose} className="btn-primary">
          Fechar
        </button>
      </div>
    </div>
  );
}
```

---

### Edição de Consumidores com Aprovação

#### Endpoint
```
PATCH /consumers/representative/:consumerId
Authorization: Bearer {representative_token}
Content-Type: application/json
Body: { "name": "Novo Nome", "phone": "...", ... }
```

#### Resposta
```json
{
  "id": "clxxx123",
  "consumerId": "clxxx456",
  "representativeId": "clxxx789",
  "oldValues": { "name": "João Silva" },
  "newValues": { "name": "João Silva Santos" },
  "changedFields": ["name"],
  "status": "PENDING",
  "requestedAt": "2025-12-27T10:30:00Z",
  "consumer": {
    "id": "clxxx456",
    "name": "João Silva",
    "cpfCnpj": "123.456.789-00"
  }
}
```

#### Implementação

```tsx
export function EditConsumerForm({ 
  consumerId, 
  initialData 
}: { 
  consumerId: string;
  initialData: any;
}) {
  const [formData, setFormData] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.patch(
        `/consumers/representative/${consumerId}`,
        formData
      );

      toast.success(
        'Solicitação de alteração enviada! Aguarde aprovação do administrador.'
      );

      // Mostrar modal informativo
      showApprovalPendingModal(response.data);
    } catch (error) {
      console.error('Erro ao enviar alteração:', error);
      toast.error('Erro ao enviar alteração. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-consumer-form">
      <h2>Editar Consumidor</h2>
      
      <div className="form-group">
        <label>Nome</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Telefone</label>
        <input
          type="text"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

      <div className="form-group">
        <label>Consumo Médio Mensal (kWh)</label>
        <input
          type="number"
          step="0.01"
          value={formData.averageMonthlyConsumption || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            averageMonthlyConsumption: parseFloat(e.target.value) 
          })}
        />
      </div>

      <div className="form-group">
        <label>Desconto Oferecido (%)</label>
        <input
          type="number"
          step="0.01"
          value={formData.discountOffered || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            discountOffered: parseFloat(e.target.value) 
          })}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Enviando...' : 'Solicitar Alteração'}
        </button>
      </div>

      <div className="info-box">
        <p>
          ⚠️ <strong>Atenção:</strong> As alterações precisam ser aprovadas 
          por um administrador antes de serem aplicadas.
        </p>
      </div>
    </form>
  );
}
```

#### Modal de Confirmação

```tsx
export function ApprovalPendingModal({ 
  changeRequest 
}: { 
  changeRequest: any;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>✅ Solicitação Enviada!</h2>
        
        <p>
          Sua solicitação de alteração foi enviada e está aguardando 
          aprovação do administrador.
        </p>

        <div className="change-summary">
          <h3>Campos que serão alterados:</h3>
          <ul>
            {changeRequest.changedFields.map((field: string) => (
              <li key={field}>{translateField(field)}</li>
            ))}
          </ul>
        </div>

        <p>
          <strong>ID da Solicitação:</strong> {changeRequest.id}
        </p>

        <button onClick={() => window.location.reload()} className="btn-primary">
          Entendi
        </button>
      </div>
    </div>
  );
}
```

---

### Visualização de Status de Mudanças

#### Endpoint
```
GET /consumers/representative/change-requests
Authorization: Bearer {representative_token}
```

#### Resposta
```json
[
  {
    "id": "clxxx123",
    "consumerId": "clxxx456",
    "status": "PENDING",
    "requestedAt": "2025-12-27T10:30:00Z",
    "reviewedAt": null,
    "rejectionReason": null,
    "consumer": {
      "id": "clxxx456",
      "name": "João Silva"
    },
    "reviewedBy": null
  },
  {
    "id": "clxxx124",
    "consumerId": "clxxx457",
    "status": "APPROVED",
    "requestedAt": "2025-12-26T15:00:00Z",
    "reviewedAt": "2025-12-27T09:00:00Z",
    "rejectionReason": null,
    "consumer": {
      "id": "clxxx457",
      "name": "Maria Santos"
    },
    "reviewedBy": {
      "id": "clxxx999",
      "name": "Admin",
      "email": "admin@example.com"
    }
  },
  {
    "id": "clxxx125",
    "consumerId": "clxxx458",
    "status": "REJECTED",
    "requestedAt": "2025-12-25T14:00:00Z",
    "reviewedAt": "2025-12-26T10:00:00Z",
    "rejectionReason": "Dados inconsistentes",
    "consumer": {
      "id": "clxxx458",
      "name": "Pedro Costa"
    },
    "reviewedBy": {
      "id": "clxxx999",
      "name": "Admin",
      "email": "admin@example.com"
    }
  }
]
```

#### Implementação

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
      PENDING: { text: 'Pendente', class: 'badge-warning' },
      APPROVED: { text: 'Aprovado', class: 'badge-success' },
      REJECTED: { text: 'Rejeitado', class: 'badge-danger' },
    };
    return badges[status] || { text: status, class: '' };
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
                    {statusBadge.text}
                  </span>
                </div>

                <div className="card-body">
                  <p>
                    <strong>Solicitado em:</strong>{' '}
                    {new Date(request.requestedAt).toLocaleString('pt-BR')}
                  </p>

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

## 🔧 Componentes Compartilhados

### Componente de Upload de Arquivo

```tsx
interface FileUploadProps {
  accept?: string;
  maxSize?: number; // em bytes
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUpload({ 
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileSelect,
  disabled = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validação de tamanho
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    onFileSelect(file);
  };

  return (
    <div
      className={`file-upload ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        id="file-upload-input"
        style={{ display: 'none' }}
      />
      <label htmlFor="file-upload-input" className="upload-label">
        <div className="upload-icon">📎</div>
        <p>Arraste um arquivo aqui ou clique para selecionar</p>
        <p className="upload-hint">
          Formatos aceitos: PDF, JPG, PNG, WEBP (máx. {maxSize / 1024 / 1024}MB)
        </p>
      </label>
    </div>
  );
}
```

### Componente de Notificação

```tsx
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: number; // em milissegundos
}

export function Notification({ 
  type, 
  message, 
  onClose, 
  autoClose = 5000 
}: NotificationProps) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div className={`notification notification-${type}`}>
      <span className="notification-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✗'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </span>
      <span className="notification-message">{message}</span>
      {onClose && (
        <button onClick={onClose} className="notification-close">
          ×
        </button>
      )}
    </div>
  );
}
```

---

## 📝 Exemplos de Código

### Configuração do Axios/Fetch

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };
```

### Hook para Upload de Arquivo

```typescript
// hooks/useFileUpload.ts
import { useState } from 'react';
import { api } from '@/services/api';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (
    url: string,
    file: File,
    onSuccess?: (data: any) => void,
    onError?: (error: any) => void
  ) => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        },
      });

      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { uploadFile, uploading, progress };
}
```

---

## 🎨 Estilos CSS Sugeridos

```css
/* Notificações */
.notifications-badge {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  background: #f0f0f0;
}

.badge-warning {
  background: #ffc107;
  color: #000;
}

.badge-success {
  background: #28a745;
  color: #fff;
}

.badge-danger {
  background: #dc3545;
  color: #fff;
}

/* Cards de Notificação */
.notification-card {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: #fff;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.changed-fields ul {
  list-style: none;
  padding: 0;
}

.changed-fields li {
  padding: 0.25rem 0;
}

.notification-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* Upload de Arquivo */
.file-upload {
  border: 2px dashed #ddd;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.file-upload.drag-active {
  border-color: #007bff;
  background: #f0f8ff;
}

.upload-progress {
  margin: 1rem 0;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #f0f0f0;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s;
}

/* Comparação Antes/Depois */
.comparison-table {
  margin: 1rem 0;
  overflow-x: auto;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
}

.comparison-table .old-value {
  background: #fff3cd;
}

.comparison-table .new-value {
  background: #d4edda;
}
```

---

## ✅ Checklist de Implementação

### Para o Sistema de Administradores:
- [ ] Dashboard com contador de notificações
- [ ] Lista de mudanças pendentes
- [ ] Card de comparação (antes/depois)
- [ ] Modal de aprovação/rejeição
- [ ] Visualização de faturas nos detalhes do consumidor
- [ ] Integração com endpoint `/dashboard`
- [ ] Integração com endpoints de aprovação

### Para o Sistema de Representantes:
- [ ] Formulário de upload de fatura
- [ ] Preview de imagem antes do upload
- [ ] Barra de progresso de upload
- [ ] Modal de resultados do OCR
- [ ] Formulário de edição de consumidor
- [ ] Modal de confirmação de solicitação
- [ ] Página de histórico de solicitações
- [ ] Status badges (Pendente/Aprovado/Rejeitado)
- [ ] Integração com endpoints de upload e edição

### Componentes Compartilhados:
- [ ] Componente de upload de arquivo (drag & drop)
- [ ] Componente de notificação/toast
- [ ] Configuração do Axios/Fetch
- [ ] Hook de upload de arquivo
- [ ] Utilitários de formatação

---

**Desenvolvido para:** Pagluz Backend  
**Data:** Dezembro 2025












