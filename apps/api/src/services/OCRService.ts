import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  type: 'cedula' | 'placa' | 'unknown';
  extractedValue?: string;
}

export class OCRService {
  /**
   * Procesa una imagen y extrae texto usando OCR
   */
  static async processImage(buffer: Buffer): Promise<OCRResult> {
    try {
      const result = await Tesseract.recognize(buffer, 'spa', {
        logger: (m) => console.log(m),
      });

      const text = result.data.text.trim();
      const confidence = result.data.confidence;

      // Detectar tipo de documento y extraer valor
      const detectedType = this.detectDocumentType(text);
      const extractedValue = this.extractValue(text, detectedType);

      return {
        text,
        confidence,
        type: detectedType,
        extractedValue,
      };
    } catch (error) {
      console.error('Error en OCR:', error);
      throw new Error('Error al procesar la imagen con OCR');
    }
  }

  /**
   * Detecta si el texto extraído corresponde a una cédula o placa
   */
  private static detectDocumentType(text: string): 'cedula' | 'placa' | 'unknown' {
    const cleanText = text.replace(/\s+/g, '').toUpperCase();

    // Patrón para cédula colombiana: 11 dígitos
    const cedulaPattern = /\b\d{8,11}\b/;

    // Patrón para placa colombiana: 3 letras + 3 dígitos (ej: ABC123)
    const placaPattern = /\b[A-Z]{3}\s*\d{3}\b/;

    // Palabras clave que indican cédula
    const cedulaKeywords = [
      'CEDULA',
      'CIUDADANIA',
      'IDENTIDAD',
      'REPUBLICA',
      'COLOMBIA',
      'REGISTRADURIA',
      'NACIONAL',
    ];

    // Palabras clave que indican placa
    const placaKeywords = ['PLACA', 'VEHICULO', 'LICENCIA', 'TRANSITO', 'SOAT'];

    // Verificar palabras clave de cédula
    const hasCedulaKeyword = cedulaKeywords.some((keyword) => cleanText.includes(keyword));

    // Verificar palabras clave de placa
    const hasPlacaKeyword = placaKeywords.some((keyword) => cleanText.includes(keyword));

    // Verificar patrones
    const hasCedulaPattern = cedulaPattern.test(cleanText);
    const hasPlacaPattern = placaPattern.test(cleanText);

    // Determinar tipo basado en palabras clave y patrones
    if (hasCedulaKeyword || (hasCedulaPattern && !hasPlacaKeyword)) {
      return 'cedula';
    }

    if (hasPlacaKeyword || (hasPlacaPattern && !hasCedulaKeyword)) {
      return 'placa';
    }

    // Si solo hay un patrón sin palabras clave
    if (hasCedulaPattern && !hasPlacaPattern) {
      return 'cedula';
    }

    if (hasPlacaPattern && !hasCedulaPattern) {
      return 'placa';
    }

    return 'unknown';
  }

  /**
   * Extrae el valor específico (número de cédula o placa) del texto
   */
  private static extractValue(
    text: string,
    type: 'cedula' | 'placa' | 'unknown'
  ): string | undefined {
    const cleanText = text.replace(/\s+/g, ' ').trim().toUpperCase();

    if (type === 'cedula') {
      // Buscar números de 8-11 dígitos (cédulas colombianas)
      const cedulaMatches = cleanText.match(/\b\d{8,11}\b/g);
      if (cedulaMatches && cedulaMatches.length > 0) {
        // Retornar el número más largo encontrado (probablemente la cédula)
        return cedulaMatches.reduce((a, b) => (a.length >= b.length ? a : b));
      }
    }

    if (type === 'placa') {
      // Buscar patrón de placa: 3 letras + 3 dígitos
      const placaMatch = cleanText.match(/\b[A-Z]{3}\s*\d{3}\b/);
      if (placaMatch) {
        // Remover espacios y retornar en formato estándar
        return placaMatch[0].replace(/\s+/g, '');
      }
    }

    return undefined;
  }

  /**
   * Valida si un texto extraído es una cédula válida
   */
  static isValidCedula(cedula: string): boolean {
    // Cédula colombiana: entre 8 y 11 dígitos
    const cleanCedula = cedula.replace(/\D/g, '');
    return cleanCedula.length >= 8 && cleanCedula.length <= 11;
  }

  /**
   * Valida si un texto extraído es una placa válida
   */
  static isValidPlaca(placa: string): boolean {
    // Placa colombiana: 3 letras + 3 dígitos
    const cleanPlaca = placa.replace(/\s+/g, '').toUpperCase();
    return /^[A-Z]{3}\d{3}$/.test(cleanPlaca);
  }

  /**
   * Formatea una cédula removiendo caracteres no numéricos
   */
  static formatCedula(cedula: string): string {
    return cedula.replace(/\D/g, '');
  }

  /**
   * Formatea una placa al formato estándar (ABC123)
   */
  static formatPlaca(placa: string): string {
    return placa.replace(/\s+/g, '').toUpperCase();
  }
}
