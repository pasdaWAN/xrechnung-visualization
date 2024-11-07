import { readFileSync } from 'fs';
import { join } from 'path';
import * as SaxonJS from 'saxon-js';

interface TransformationResult {
  content: string;
  format: 'html' | 'pdf';
  metadata?: Record<string, unknown>;
}

interface TransformationOptions {
  format: 'html' | 'pdf';
  language?: string;
  template?: string;
}

interface CachedTransformation {
  result: TransformationResult;
  timestamp: number;
}

export class TransformerService {
  private static readonly TEMPLATE_DIR = join(__dirname, '../xsl');
  private static readonly XSL_MAPPINGS = {
    html: {
      ubl: 'ubl-invoice-xr.xsl',
      uncefact: 'uncefact-invoice-xr.xsl'
    },
    pdf: {
      ubl: 'ubl-invoice-pdf.xsl',
      uncefact: 'uncefact-invoice-pdf.xsl'
    }
  };
  private static readonly cache = new Map<string, CachedTransformation>();
  private static readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  static async transformXML(
    filePath: string, 
    options: TransformationOptions = { format: 'html' }
  ): Promise<TransformationResult> {
    const cacheKey = `${filePath}:${options.format}:${options.language || 'de'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached?.timestamp && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      return cached.result;
    }
    
    const result = await this.performTransformation(filePath, options);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  }

  private static async performTransformation(
    filePath: string,
    options: TransformationOptions
  ): Promise<TransformationResult> {
    try {
      const xmlContent = readFileSync(filePath, 'utf-8');
      const documentType = this.detectDocumentType(xmlContent);
      
      // Get appropriate XSL template
      const xslTemplate = this.getXslTemplate(documentType, options.format);
      const xslPath = join(this.TEMPLATE_DIR, xslTemplate);
      const xslContent = readFileSync(xslPath, 'utf-8');

      // Transform using Saxon-JS
      const result = await SaxonJS.transform({
        stylesheetText: xslContent,
        sourceText: xmlContent,
        destination: 'serialized',
        parameters: {
          language: options.language || 'de',
          template: options.template || 'default'
        }
      });

      // Extract metadata if available
      const metadata = this.extractMetadata(result);

      return {
        content: result.principalResult,
        format: options.format,
        metadata
      };
    } catch (error) {
      throw new Error(`Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static detectDocumentType(xmlContent: string): 'ubl' | 'uncefact' {
    if (xmlContent.includes('urn:oasis:names:specification:ubl:schema:xsd')) {
      return 'ubl';
    }
    if (xmlContent.includes('urn:un:unece:uncefact')) {
      return 'uncefact';
    }
    throw new Error('Unsupported document format');
  }

  private static getXslTemplate(documentType: 'ubl' | 'uncefact', format: 'html' | 'pdf'): string {
    return this.XSL_MAPPINGS[format][documentType];
  }

  private static extractMetadata(transformationResult: any): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};
    
    try {
      // Extract common metadata
      const metadataNodes = transformationResult.metadata || {};
      
      // Map specific fields
      if (metadataNodes.invoiceNumber) {
        metadata.invoiceNumber = metadataNodes.invoiceNumber;
      }
      if (metadataNodes.issueDate) {
        metadata.issueDate = metadataNodes.issueDate;
      }
      if (metadataNodes.totalAmount) {
        metadata.totalAmount = parseFloat(metadataNodes.totalAmount);
      }
    } catch (error) {
      console.warn('Error extracting metadata:', error);
    }
    
    return metadata;
  }
} 