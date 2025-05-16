const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');
require('dotenv').config();

const app = express();

// ⭐ Handle Stripe webhook first (raw body)
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// ⭐ Then apply normal JSON parsing for all other routes
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/payment', paymentRoutes);

module.exports = app;
