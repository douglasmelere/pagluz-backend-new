/**
 * Exemplo de Uso: Sistema de Resumo de Faturas com Gemini
 * 
 * Este arquivo demonstra como o sistema de análise de faturas funciona
 * após a implementação do Google Gemini Vision.
 */

// ============================================
// EXEMPLO 1: Upload de Fatura (Representante)
// ============================================

/**
 * POST /consumers/{consumerId}/invoice
 * 
 * Representante faz upload de uma foto/PDF da fatura
 */
async function exampleUploadInvoice() {
  const consumerId = "consumer-123";
  const representativeToken = "eyJhbGciOiJIUzI1NiIs...";
  
  // Preparar arquivo
  const fileInput = document.getElementById('invoice-file') as HTMLInputElement;
  const file = fileInput.files?.[0];
  
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  // Fazer upload
  const response = await fetch(`/consumers/${consumerId}/invoice`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${representativeToken}`,
    },
    body: formData,
  });
  
  const result = await response.json();
  
  console.log('Resposta do Upload:', {
    invoiceUrl: result.invoiceUrl,
    invoiceFileName: result.invoiceFileName,
    scannedData: result.scannedData, // { processing: true }
  });
  
  // A fatura está sendo processada em background
  // Após alguns segundos, o admin verá os dados
}

// ============================================
// EXEMPLO 2: Obter Dados Processados (Admin)
// ============================================

/**
 * GET /consumers/{consumerId}
 * 
 * Admin obtém os dados da fatura já processados pelo Gemini
 */
async function exampleGetProcessedInvoice() {
  const consumerId = "consumer-123";
  const adminToken = "eyJhbGciOiJIUzI1NiIs...";
  
  const response = await fetch(`/consumers/${consumerId}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  
  const consumer = await response.json();
  
  console.log('Dados da Fatura Processada:', {
    ucNumber: consumer.invoiceScannedData?.ucNumber,
    consumerName: consumer.invoiceScannedData?.consumerName,
    consumptionKwh: consumer.invoiceScannedData?.consumptionKwh,
    totalValue: consumer.invoiceScannedData?.totalValue,
    dueDate: consumer.invoiceScannedData?.dueDate,
    description: consumer.invoiceScannedData?.description,
    highlights: consumer.invoiceScannedData?.highlights,
    processing: consumer.invoiceScannedData?.processing,
  });
  
  /* Resposta exemplo:
  {
    ucNumber: "1234567890",
    consumerName: "João Silva Costa",
    consumptionKwh: 350,
    totalValue: 287.50,
    dueDate: "15/01/2025",
    description: "Fatura referente ao período de 01 a 31 de janeiro de 2025. Consumidor residencial com consumo de 350 kWh. Nenhuma anomalia detectada.",
    highlights: [
      "Consumo dentro do padrão para residência",
      "Data de vencimento: 15/01/2025",
      "Nenhuma taxa adicional detectada"
    ],
    processing: false
  }
  */
}

// ============================================
// EXEMPLO 3: Componente React com Polling
// ============================================

/**
 * Componente React que faz upload e aguarda processamento
 */
import React, { useState, useEffect } from 'react';

function InvoiceUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  
  // Fazer upload
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setProcessing(true);
    
    const response = await fetch(`/consumers/${consumerId}/invoice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    await response.json();
    
    // Começar a verificar o processamento
    pollForProcessing();
  }
  
  // Polling: verificar a cada 2 segundos se foi processado
  async function pollForProcessing() {
    const maxAttempts = 30; // 60 segundos máximo
    let attempts = 0;
    
    const interval = setInterval(async () => {
      attempts++;
      
      const response = await fetch(`/consumers/${consumerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const consumer = await response.json();
      const scannedData = consumer.invoiceScannedData;
      
      if (!scannedData.processing || attempts >= maxAttempts) {
        clearInterval(interval);
        setInvoiceData(scannedData);
        setProcessing(false);
      }
    }, 2000); // 2 segundos
  }
  
  return (
    <div>
      <h2>Upload de Fatura</h2>
      
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit" disabled={!file || processing}>
          {processing ? 'Processando...' : 'Upload'}
        </button>
      </form>
      
      {invoiceData && !processing && (
        <div className="invoice-summary">
          <h3>Resumo da Fatura</h3>
          <p><strong>UC:</strong> {invoiceData.ucNumber}</p>
          <p><strong>Consumidor:</strong> {invoiceData.consumerName}</p>
          <p><strong>Consumo:</strong> {invoiceData.consumptionKwh} kWh</p>
          <p><strong>Valor:</strong> R$ {invoiceData.totalValue}</p>
          <p><strong>Vencimento:</strong> {invoiceData.dueDate}</p>
          
          <div className="description">
            <h4>Resumo</h4>
            <p>{invoiceData.description}</p>
          </div>
          
          <div className="highlights">
            <h4>Pontos Importantes</h4>
            <ul>
              {invoiceData.highlights.map((h: string, i: number) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// EXEMPLO 4: TypeScript Interfaces
// ============================================

interface InvoiceScannedData {
  ucNumber?: string;
  consumerName?: string;
  consumerDocument?: string;
  serviceType?: string;
  referenceMonth?: string;
  consumptionKwh?: number;
  totalValue?: number;
  dueDate?: string;
  description: string;
  highlights: string[];
  processing: boolean;
  processedAt?: string;
  error?: string;
  friendlyFileName?: string;
}

interface ConsumerWithInvoice {
  id: string;
  name: string;
  invoiceUrl?: string;
  invoiceFileName?: string;
  invoiceUploadedAt?: string;
  invoiceScannedData?: InvoiceScannedData;
}

// ============================================
// EXEMPLO 5: Service em Angular
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  
  constructor(private http: HttpClient) {}
  
  uploadInvoice(consumerId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(
      `/consumers/${consumerId}/invoice`,
      formData
    );
  }
  
  getConsumerWithInvoice(consumerId: string): Observable<ConsumerWithInvoice> {
    return this.http.get<ConsumerWithInvoice>(`/consumers/${consumerId}`);
  }
  
  pollInvoiceProcessing(
    consumerId: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Observable<InvoiceScannedData> {
    return new Observable(observer => {
      let attempts = 0;
      
      const interval = setInterval(() => {
        this.getConsumerWithInvoice(consumerId).subscribe(
          consumer => {
            const scannedData = consumer.invoiceScannedData;
            
            if (!scannedData?.processing || attempts >= maxAttempts) {
              clearInterval(interval);
              observer.next(scannedData!);
              observer.complete();
            }
            
            attempts++;
          },
          error => {
            clearInterval(interval);
            observer.error(error);
          }
        );
      }, intervalMs);
    });
  }
}

// ============================================
// EXEMPLO 6: Uso no Componente Angular
// ============================================

import { Component } from '@angular/core';

@Component({
  selector: 'app-invoice-upload',
  templateUrl: './invoice-upload.component.html'
})
export class InvoiceUploadComponent {
  invoiceData: InvoiceScannedData | null = null;
  isProcessing = false;
  
  constructor(private invoiceService: InvoiceService) {}
  
  onFileSelected(event: any, consumerId: string) {
    const file = event.target.files[0];
    if (!file) return;
    
    this.isProcessing = true;
    
    // Upload
    this.invoiceService.uploadInvoice(consumerId, file).subscribe(() => {
      // Polling
      this.invoiceService.pollInvoiceProcessing(consumerId).subscribe(
        data => {
          this.invoiceData = data;
          this.isProcessing = false;
        },
        error => {
          console.error('Erro:', error);
          this.isProcessing = false;
        }
      );
    });
  }
}

// ============================================
// EXEMPLO 7: cURL para Teste
// ============================================

/**
 * Upload de fatura via cURL
 */
// curl -X POST http://localhost:3000/consumers/consumer-123/invoice \
//   -H "Authorization: Bearer YOUR_TOKEN" \
//   -F "file=@/path/to/fatura.jpg"

/**
 * Obter dados da fatura via cURL
 */
// curl http://localhost:3000/consumers/consumer-123 \
//   -H "Authorization: Bearer YOUR_TOKEN"

export { exampleUploadInvoice, exampleGetProcessedInvoice };
