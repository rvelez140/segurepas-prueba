import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

const router = Router();

// Payment Intent routes
router.post('/payments/intent', paymentController.createPaymentIntent.bind(paymentController));
router.post('/payments/intent/:paymentIntentId/confirm', paymentController.confirmPaymentIntent.bind(paymentController));
router.get('/payments/intent/:paymentIntentId/status', paymentController.getPaymentIntentStatus.bind(paymentController));
router.post('/payments/intent/:paymentIntentId/cancel', paymentController.cancelPaymentIntent.bind(paymentController));

// Card payment routes
router.post('/payments/card', paymentController.processCardPayment.bind(paymentController));

// Setup Intent routes (para guardar tarjetas)
router.post('/payments/setup-intent', paymentController.createSetupIntent.bind(paymentController));

// Payment methods routes
router.get('/payments/methods/:customerId', paymentController.getPaymentMethods.bind(paymentController));
router.delete('/payments/methods/:paymentMethodId', paymentController.detachPaymentMethod.bind(paymentController));
router.post('/payments/methods/attach', paymentController.attachPaymentMethod.bind(paymentController));

// Refund routes
router.post('/payments/:paymentId/refund', paymentController.refundPayment.bind(paymentController));

// Payment history routes
router.get('/payments/user/:userId', paymentController.getUserPayments.bind(paymentController));
router.get('/payments/:paymentId', paymentController.getPaymentById.bind(paymentController));

// Customer routes
router.post('/payments/customers', paymentController.createCustomer.bind(paymentController));

export default router;
