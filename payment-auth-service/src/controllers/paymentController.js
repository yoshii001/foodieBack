require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/paymentModel');


// Create a payment
exports.createPayment = async (req, res) => {
    const { orderId, userId, amount } = req.body;

    if (!orderId || !userId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // 1. Create a Payment Intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Stripe expects cents, so multiply by 100
            currency: "usd",      // Or "lkr" if you switch to Sri Lankan Rupee
            metadata: { orderId, userId },
        });

        // 2. Save initial payment in MongoDB
        const payment = await Payment.create({
            orderId,
            userId,
            amount,
            paymentMethod: "Stripe",
            status: "pending",
            transactionId: paymentIntent.id,
        });

        // 3. Respond with client_secret
        res.status(201).json({
            message: "Payment intent created successfully",
            clientSecret: paymentIntent.client_secret,
            payment,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error.message);
        res.status(500).json({ message: "Payment creation failed" });
    }
};

// Check payment status
exports.getPaymentStatus = async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
    }

    try {
        const payment = await Payment.findOne({ orderId });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error("Error fetching payment status:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.handleStripeWebhook = async (req, res) => {
    let event = req.body;
  
    try {
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const transactionId = paymentIntent.id;
  
        console.log('Webhook received for PaymentIntent ID:', transactionId);
  
        // ⭐ Find Payment document and update it
        const updatedPayment = await Payment.findOneAndUpdate(
          { transactionId },     // Find by transactionId
          { status: "completed" }, // Set status
          { new: true }            // Return updated document
        );
  
        if (updatedPayment) {
          console.log('✅ Payment status updated in MongoDB!');
        } else {
          console.log('❌ No payment found with transactionId:', transactionId);
        }
      }
  
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  };