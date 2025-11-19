import { Request, Response } from 'express';
import { cardPaymentService } from '../services/CardPaymentService';

export class PaymentController {
  /**
   * Crea un Payment Intent para procesar un pago
   */
  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { userId, amount, currency, description, metadata } = req.body;

      if (!userId || !amount) {
        res.status(400).json({
          success: false,
          message: 'userId y amount son requeridos',
        });
        return;
      }

      const result = await cardPaymentService.createPaymentIntent(
        userId,
        amount,
        currency || 'USD',
        description,
        metadata
      );

      res.status(200).json({
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al crear payment intent',
        error: error.message,
      });
    }
  }

  /**
   * Procesa un pago con tarjeta
   */
  async processCardPayment(req: Request, res: Response): Promise<void> {
    try {
      const { userId, paymentMethodId, amount, currency, description, metadata } = req.body;

      if (!userId || !paymentMethodId || !amount) {
        res.status(400).json({
          success: false,
          message: 'userId, paymentMethodId y amount son requeridos',
        });
        return;
      }

      const result = await cardPaymentService.processCardPayment(
        userId,
        paymentMethodId,
        amount,
        currency || 'USD',
        description,
        metadata
      );

      res.status(200).json({
        success: true,
        payment: result.payment,
        paymentIntent: result.paymentIntent,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Error al procesar el pago',
        error: error.message,
      });
    }
  }

  /**
   * Confirma un Payment Intent
   */
  async confirmPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.params;

      const paymentIntent = await cardPaymentService.confirmPaymentIntent(paymentIntentId);

      res.status(200).json({
        success: true,
        paymentIntent,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al confirmar payment intent',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene el estado de un Payment Intent
   */
  async getPaymentIntentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.params;

      const status = await cardPaymentService.getPaymentIntentStatus(paymentIntentId);

      res.status(200).json({
        success: true,
        status,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado del payment intent',
        error: error.message,
      });
    }
  }

  /**
   * Cancela un Payment Intent
   */
  async cancelPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId } = req.params;

      const paymentIntent = await cardPaymentService.cancelPaymentIntent(paymentIntentId);

      res.status(200).json({
        success: true,
        paymentIntent,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al cancelar payment intent',
        error: error.message,
      });
    }
  }

  /**
   * Crea un Setup Intent para guardar tarjeta
   */
  async createSetupIntent(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'userId es requerido',
        });
        return;
      }

      const result = await cardPaymentService.createSetupIntent(userId);

      res.status(200).json({
        success: true,
        clientSecret: result.clientSecret,
        setupIntentId: result.setupIntentId,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al crear setup intent',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene los métodos de pago de un usuario
   */
  async getPaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      const paymentMethods = await cardPaymentService.getPaymentMethods(customerId);

      res.status(200).json({
        success: true,
        paymentMethods,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métodos de pago',
        error: error.message,
      });
    }
  }

  /**
   * Elimina un método de pago
   */
  async detachPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { paymentMethodId } = req.params;

      await cardPaymentService.detachPaymentMethod(paymentMethodId);

      res.status(200).json({
        success: true,
        message: 'Método de pago eliminado',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar método de pago',
        error: error.message,
      });
    }
  }

  /**
   * Procesa un reembolso
   */
  async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      const result = await cardPaymentService.refundPayment(paymentId, amount, reason);

      res.status(200).json({
        success: true,
        refund: result.refund,
        refundPayment: result.refundPayment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al procesar reembolso',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene el historial de pagos de un usuario
   */
  async getUserPayments(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await cardPaymentService.getUserPayments(userId, limit, offset);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial de pagos',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene un pago específico por ID
   */
  async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      const payment = await cardPaymentService.getPaymentById(paymentId);

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pago no encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        payment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener pago',
        error: error.message,
      });
    }
  }

  /**
   * Crea un cliente de Stripe
   */
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { userId, email, name } = req.body;

      if (!userId || !email || !name) {
        res.status(400).json({
          success: false,
          message: 'userId, email y name son requeridos',
        });
        return;
      }

      const customerId = await cardPaymentService.createCustomer(userId, email, name);

      res.status(200).json({
        success: true,
        customerId,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al crear cliente',
        error: error.message,
      });
    }
  }

  /**
   * Asocia un método de pago a un cliente
   */
  async attachPaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { paymentMethodId, customerId } = req.body;

      if (!paymentMethodId || !customerId) {
        res.status(400).json({
          success: false,
          message: 'paymentMethodId y customerId son requeridos',
        });
        return;
      }

      await cardPaymentService.attachPaymentMethodToCustomer(paymentMethodId, customerId);

      res.status(200).json({
        success: true,
        message: 'Método de pago asociado al cliente',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al asociar método de pago',
        error: error.message,
      });
    }
  }
}

export const paymentController = new PaymentController();
