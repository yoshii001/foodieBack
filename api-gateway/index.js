import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Load environment variables FIRST
dotenv.config();

// Verify critical environment variables
const requiredEnvVars = ['USER_API', 'RESTAURANT_API', 'PAYMENT_API', 'ORDER_API', 'DELIVERY_API'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.path}`);
  next();
});

// Common proxy options
const proxyOptions = {
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(502).json({ error: 'Service unavailable' });
  },
  timeout: 5000
};

// Proxy routes
app.use('/users', createProxyMiddleware({
  ...proxyOptions,
  target: process.env.USER_API,
  pathRewrite: { '^/users': '/' }
}));

app.use('/restaurants', createProxyMiddleware({
  ...proxyOptions,
  target: process.env.RESTAURANT_API,
  pathRewrite: { '^/restaurants': '/' }
}));

app.use('/menus', createProxyMiddleware({
  ...proxyOptions,
  target: process.env.RESTAURANT_API,
  pathRewrite: { '^/menus': '/' }
}));

app.use('/payments', createProxyMiddleware({
  ...proxyOptions,
  target: process.env.PAYMENT_API,
  pathRewrite: { '^/payments': '/' }
}));

app.use('/orders', createProxyMiddleware({
  ...proxyOptions,
  target: process.env.ORDER_API,
  pathRewrite: { '^/orders': '/' }
}));

app.use('/deliveries', createProxyMiddleware({
  ...proxyOptions,
  target: process.env.DELIVERY_API,
  pathRewrite: { '^/deliveries': '/' }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      user: !!process.env.USER_API,
      restaurant: !!process.env.RESTAURANT_API,
      payment: !!process.env.PAYMENT_API,
      order: !!process.env.ORDER_API,
      delivery: !!process.env.DELIVERY_API
    }
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running at http://localhost:${PORT}`);
  console.log('Proxying services:');
  console.log(`- User Service: ${process.env.USER_API}`);
  console.log(`- Restaurant Service: ${process.env.RESTAURANT_API}`);
  console.log(`- Payment Service: ${process.env.PAYMENT_API}`);
  console.log(`- Order Service: ${process.env.ORDER_API}`);
  console.log(`- Delivery Service: ${process.env.DELIVERY_API}`);
});
