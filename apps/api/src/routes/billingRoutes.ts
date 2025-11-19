import { Router } from 'express';
import { billingController } from '../controllers/billingController';

const router = Router();

// Billing management routes
router.post('/billing/change-date', billingController.changeBillingDate.bind(billingController));
router.post('/billing/pay-pending', billingController.payPendingInvoice.bind(billingController));
router.get('/billing/status/:userId', billingController.getBillingStatus.bind(billingController));
router.post('/billing/reactivate/:userId', billingController.reactivateAccount.bind(billingController));
router.post('/billing/suspend/:userId', billingController.suspendAccount.bind(billingController));
router.post('/billing/check-overdue', billingController.checkOverdueInvoices.bind(billingController));

// Invoice routes
router.post('/invoices', billingController.createInvoice.bind(billingController));
router.get('/invoices/user/:userId', billingController.getUserInvoices.bind(billingController));
router.get('/invoices/:invoiceId', billingController.getInvoiceById.bind(billingController));
router.post('/invoices/:invoiceId/pay', billingController.markInvoiceAsPaid.bind(billingController));
router.post('/invoices/:invoiceId/cancel', billingController.cancelInvoice.bind(billingController));

export default router;
