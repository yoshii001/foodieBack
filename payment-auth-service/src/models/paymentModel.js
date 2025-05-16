const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["PayHere", "Stripe", "PayPal"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    transactionId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
