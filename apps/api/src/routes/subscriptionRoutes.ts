import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController';

const router = Router();

// Rutas de checkout y creación de suscripciones
router.post(
  '/subscriptions/stripe/checkout',
  subscriptionController.createStripeCheckout.bind(subscriptionController)
);
router.post(
  '/subscriptions/paypal/create',
  subscriptionController.createPayPalSubscription.bind(subscriptionController)
);
router.post(
  '/subscriptions/paypal/activate',
  subscriptionController.activatePayPalSubscription.bind(subscriptionController)
);

// Rutas de consulta de suscripciones
router.get(
  '/subscriptions/user/:userId',
  subscriptionController.getUserSubscriptions.bind(subscriptionController)
);
router.get(
  '/subscriptions/user/:userId/active',
  subscriptionController.getActiveSubscription.bind(subscriptionController)
);

// Rutas de gestión de suscripciones
router.post(
  '/subscriptions/:subscriptionId/cancel',
  subscriptionController.cancelSubscription.bind(subscriptionController)
);

// Webhooks (estas rutas deben recibir el body raw para verificar firmas)
router.post('/webhooks/stripe', subscriptionController.stripeWebhook.bind(subscriptionController));
router.post('/webhooks/paypal', subscriptionController.paypalWebhook.bind(subscriptionController));

export default router;
