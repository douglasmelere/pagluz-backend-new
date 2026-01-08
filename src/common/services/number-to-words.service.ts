import { Injectable } from '@nestjs/common';
import { numeroPorExtenso } from 'numero-por-extenso';

@Injectable()
export class NumberToWordsService {
  /**
   * Converte número para extenso em português
   */
  toWords(number: number | string): string {
    const num = typeof number === 'string' ? parseFloat(number) : number;
    if (isNaN(num) || num === 0) {
      return 'zero';
    }
    
    try {
      return numeroPorExtenso(num, numeroPorExtenso.estilo.monetario);
    } catch (error) {
      // Fallback para números simples
      return numeroPorExtenso(num);
    }
  }

  /**
   * Converte número para extenso sem formatação monetária
   */
  toWordsSimple(number: number | string): string {
    const num = typeof number === 'string' ? parseFloat(number) : number;
    if (isNaN(num) || num === 0) {
      return 'zero';
    }
    
    try {
      return numeroPorExtenso(num);
    } catch (error) {
      return String(num);
    }
  }
}

