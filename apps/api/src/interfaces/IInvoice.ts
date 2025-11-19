import { Document, Types } from 'mongoose';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  invoiceNumber: string; // Número único de factura
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  paymentId?: Types.ObjectId;

  // Fechas
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;

  // Montos
  subtotal: number;
  tax: number; // Impuestos
  discount: number;
  total: number;
  amountPaid: number;
  amountDue: number;

  // Items de la factura
  items: IInvoiceItem[];

  // Estado
  status: InvoiceStatus;

  // URLs
  pdfUrl?: string;

  // Información del cliente (snapshot)
  customerInfo: {
    name: string;
    email: string;
    address?: string;
    taxId?: string; // RNC, RFC, etc.
  };

  // Notas
  notes?: string;

  // Metadata
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}
