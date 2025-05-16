const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/pay', paymentController.createPayment);
router.get('/payment-status/:orderId', paymentController.getPaymentStatus);

// ⭐ Add webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);


module.exports = router;
