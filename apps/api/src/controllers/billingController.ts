import { Request, Response } from 'express';
import { billingService } from '../services/BillingService';
import { invoiceService } from '../services/InvoiceService';

export class BillingController {
  /**
   * Cambia la fecha de facturación del usuario
   */
  async changeBillingDate(req: Request, res: Response): Promise<void> {
    try {
      const { userId, newBillingDay } = req.body;

      if (!userId || !newBillingDay) {
        res.status(400).json({
          success: false,
          message: 'userId y newBillingDay son requeridos',
        });
        return;
      }

      const result = await billingService.changeBillingDate(userId, newBillingDay);

      res.status(200).json({
        success: true,
        message: 'Fecha de facturación actualizada',
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Procesa el pago de una factura pendiente
   */
  async payPendingInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { userId, paymentId } = req.body;

      if (!userId || !paymentId) {
        res.status(400).json({
          success: false,
          message: 'userId y paymentId son requeridos',
        });
        return;
      }

      const result = await billingService.payPendingInvoice(userId, paymentId);

      res.status(200).json({
        success: true,
        message: 'Pago procesado',
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Obtiene el estado de facturación de un usuario
   */
  async getBillingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const status = await billingService.getBillingStatus(userId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Reactiva una cuenta manualmente
   */
  async reactivateAccount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await billingService.reactivateAccount(userId);

      res.status(200).json({
        success: true,
        message: 'Cuenta reactivada',
        user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Suspende una cuenta manualmente
   */
  async suspendAccount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({
          success: false,
          message: 'reason es requerido',
        });
        return;
      }

      const user = await billingService.suspendAccount(userId, reason);

      res.status(200).json({
        success: true,
        message: 'Cuenta suspendida',
        user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Verifica facturas vencidas (cron job)
   */
  async checkOverdueInvoices(req: Request, res: Response): Promise<void> {
    try {
      await billingService.checkOverdueInvoices();

      res.status(200).json({
        success: true,
        message: 'Facturas vencidas verificadas',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Crea una factura
   */
  async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { userId, items, dueDate, tax, discount, notes, customerInfo, subscriptionId, paymentId } = req.body;

      if (!userId || !items || !dueDate) {
        res.status(400).json({
          success: false,
          message: 'userId, items y dueDate son requeridos',
        });
        return;
      }

      const invoice = await invoiceService.createInvoice({
        userId,
        subscriptionId,
        paymentId,
        items,
        dueDate: new Date(dueDate),
        tax,
        discount,
        notes,
        customerInfo,
      });

      res.status(201).json({
        success: true,
        invoice,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Obtiene facturas de un usuario
   */
  async getUserInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const status = req.query.status as any;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await invoiceService.getUserInvoices(userId, status, limit, offset);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Obtiene una factura por ID
   */
  async getInvoiceById(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId } = req.params;

      const invoice = await invoiceService.getInvoiceById(invoiceId);

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: 'Factura no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        invoice,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Marca una factura como pagada
   */
  async markInvoiceAsPaid(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId } = req.params;
      const { paymentId } = req.body;

      const invoice = await invoiceService.markAsPaid(invoiceId, paymentId);

      res.status(200).json({
        success: true,
        message: 'Factura marcada como pagada',
        invoice,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Cancela una factura
   */
  async cancelInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId } = req.params;

      const invoice = await invoiceService.cancelInvoice(invoiceId);

      res.status(200).json({
        success: true,
        message: 'Factura cancelada',
        invoice,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const billingController = new BillingController();
