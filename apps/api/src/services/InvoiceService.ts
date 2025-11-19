import PDFDocument from 'pdfkit';
import { Invoice } from '../models/Invoice';
import { IInvoice, InvoiceStatus } from '../interfaces/IInvoice';
import { User } from '../models/User';
import { Payment } from '../models/Payment';
import { Subscription } from '../models/Subscription';
import { Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

class InvoiceService {
  /**
   * Crea una factura
   */
  async createInvoice(data: {
    userId: string;
    subscriptionId?: string;
    paymentId?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    dueDate: Date;
    tax?: number;
    discount?: number;
    notes?: string;
    customerInfo?: {
      name?: string;
      email?: string;
      address?: string;
      taxId?: string;
    };
  }): Promise<IInvoice> {
    const user = await User.findById(data.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Generar número de factura
    const invoiceNumber = await (Invoice as any).generateInvoiceNumber();

    // Calcular subtotal
    const items = data.items.map(item => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = data.tax || 0;
    const discount = data.discount || 0;
    const total = subtotal + tax - discount;

    // Crear factura
    const invoice = new Invoice({
      invoiceNumber,
      userId: new Types.ObjectId(data.userId),
      subscriptionId: data.subscriptionId ? new Types.ObjectId(data.subscriptionId) : undefined,
      paymentId: data.paymentId ? new Types.ObjectId(data.paymentId) : undefined,
      issueDate: new Date(),
      dueDate: data.dueDate,
      subtotal,
      tax,
      discount,
      total,
      amountDue: total,
      amountPaid: 0,
      items,
      status: InvoiceStatus.PENDING,
      customerInfo: {
        name: data.customerInfo?.name || user.name,
        email: data.customerInfo?.email || user.auth.email,
        address: data.customerInfo?.address,
        taxId: data.customerInfo?.taxId,
      },
      notes: data.notes,
    });

    await invoice.save();

    // Generar PDF
    const pdfPath = await this.generateInvoicePDF(invoice);
    invoice.pdfUrl = pdfPath;
    await invoice.save();

    return invoice;
  }

  /**
   * Genera el PDF de una factura
   */
  async generateInvoicePDF(invoice: IInvoice): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Crear directorio si no existe
        const invoicesDir = path.join(process.cwd(), 'invoices');
        if (!fs.existsSync(invoicesDir)) {
          fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const filename = `${invoice.invoiceNumber}.pdf`;
        const filepath = path.join(invoicesDir, filename);

        // Crear documento PDF
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20)
          .text('FACTURA', 50, 50);

        doc.fontSize(10)
          .text(`Factura #: ${invoice.invoiceNumber}`, 50, 80)
          .text(`Fecha: ${invoice.issueDate.toLocaleDateString('es-ES')}`, 50, 95)
          .text(`Vencimiento: ${invoice.dueDate.toLocaleDateString('es-ES')}`, 50, 110);

        // Company info (izquierda)
        doc.fontSize(10)
          .text('SecurePass', 50, 150)
          .text('Sistema de Control de Acceso', 50, 165)
          .text('info@securepass.com', 50, 180);

        // Customer info (derecha)
        doc.fontSize(10)
          .text('Facturado a:', 350, 150)
          .text(invoice.customerInfo.name, 350, 165)
          .text(invoice.customerInfo.email, 350, 180);

        if (invoice.customerInfo.address) {
          doc.text(invoice.customerInfo.address, 350, 195);
        }

        if (invoice.customerInfo.taxId) {
          doc.text(`RNC/Tax ID: ${invoice.customerInfo.taxId}`, 350, 210);
        }

        // Línea separadora
        doc.moveTo(50, 240)
          .lineTo(550, 240)
          .stroke();

        // Tabla de items
        let y = 260;

        // Headers de la tabla
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .text('Descripción', 50, y)
          .text('Cantidad', 300, y)
          .text('Precio Unit.', 370, y)
          .text('Total', 470, y);

        y += 20;

        // Items
        doc.font('Helvetica');
        invoice.items.forEach(item => {
          doc.fontSize(9)
            .text(item.description, 50, y, { width: 240 })
            .text(item.quantity.toString(), 300, y)
            .text(`$${(item.unitPrice / 100).toFixed(2)}`, 370, y)
            .text(`$${(item.totalPrice / 100).toFixed(2)}`, 470, y);

          y += 25;
        });

        // Línea antes de totales
        y += 10;
        doc.moveTo(300, y)
          .lineTo(550, y)
          .stroke();

        y += 20;

        // Totales
        doc.fontSize(10)
          .text('Subtotal:', 370, y)
          .text(`$${(invoice.subtotal / 100).toFixed(2)}`, 470, y);

        y += 20;

        if (invoice.tax > 0) {
          doc.text('Impuestos:', 370, y)
            .text(`$${(invoice.tax / 100).toFixed(2)}`, 470, y);
          y += 20;
        }

        if (invoice.discount > 0) {
          doc.text('Descuento:', 370, y)
            .text(`-$${(invoice.discount / 100).toFixed(2)}`, 470, y);
          y += 20;
        }

        // Total
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .text('TOTAL:', 370, y)
          .text(`$${(invoice.total / 100).toFixed(2)}`, 470, y);

        y += 30;

        // Monto pagado
        if (invoice.amountPaid > 0) {
          doc.fontSize(10)
            .font('Helvetica')
            .text('Pagado:', 370, y)
            .text(`$${(invoice.amountPaid / 100).toFixed(2)}`, 470, y);

          y += 20;

          doc.font('Helvetica-Bold')
            .text('Monto Debido:', 370, y)
            .text(`$${(invoice.amountDue / 100).toFixed(2)}`, 470, y);
        }

        // Notas
        if (invoice.notes) {
          y += 40;
          doc.fontSize(10)
            .font('Helvetica-Bold')
            .text('Notas:', 50, y);

          y += 15;
          doc.font('Helvetica')
            .text(invoice.notes, 50, y, { width: 500 });
        }

        // Footer
        doc.fontSize(8)
          .text('Gracias por su preferencia', 50, 700, { align: 'center', width: 500 });

        doc.end();

        stream.on('finish', () => {
          resolve(`/invoices/${filename}`);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Marca una factura como pagada
   */
  async markAsPaid(invoiceId: string, paymentId?: string): Promise<IInvoice> {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paidDate = new Date();
    invoice.amountPaid = invoice.total;
    invoice.amountDue = 0;

    if (paymentId) {
      invoice.paymentId = new Types.ObjectId(paymentId);
    }

    await invoice.save();

    return invoice;
  }

  /**
   * Verifica facturas vencidas y actualiza su estado
   */
  async checkOverdueInvoices(): Promise<void> {
    const now = new Date();

    await Invoice.updateMany(
      {
        status: InvoiceStatus.PENDING,
        dueDate: { $lt: now },
      },
      {
        $set: { status: InvoiceStatus.OVERDUE },
      }
    );
  }

  /**
   * Obtiene facturas de un usuario
   */
  async getUserInvoices(
    userId: string,
    status?: InvoiceStatus,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ invoices: IInvoice[]; total: number }> {
    const query: any = { userId: new Types.ObjectId(userId) };

    if (status) {
      query.status = status;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
      Invoice.countDocuments(query),
    ]);

    return { invoices, total };
  }

  /**
   * Obtiene factura por ID
   */
  async getInvoiceById(invoiceId: string): Promise<IInvoice | null> {
    return await Invoice.findById(invoiceId);
  }

  /**
   * Cancela una factura
   */
  async cancelInvoice(invoiceId: string): Promise<IInvoice> {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('No se puede cancelar una factura pagada');
    }

    invoice.status = InvoiceStatus.CANCELED;
    await invoice.save();

    return invoice;
  }

  /**
   * Crea factura automática para una suscripción
   */
  async createSubscriptionInvoice(
    subscriptionId: string,
    paymentId?: string
  ): Promise<IInvoice> {
    const subscription = await Subscription.findById(subscriptionId).populate('userId');
    if (!subscription) {
      throw new Error('Suscripción no encontrada');
    }

    const user = subscription.userId as any;

    // Crear factura
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 días para pagar

    const invoice = await this.createInvoice({
      userId: user._id.toString(),
      subscriptionId: subscriptionId,
      paymentId: paymentId,
      items: [
        {
          description: `Suscripción ${subscription.plan} - ${subscription.billingCycle}`,
          quantity: 1,
          unitPrice: subscription.amount,
        },
      ],
      dueDate,
      notes: `Factura de suscripción ${subscription.plan}`,
    });

    return invoice;
  }
}

export const invoiceService = new InvoiceService();
