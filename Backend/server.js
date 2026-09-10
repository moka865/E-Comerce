const dotEnv = require('dotenv');
dotEnv.config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { connectDB } = require('./config/db.config');
const errorHandler = require('./middlewares/errorHandler.middleware');
const corsMiddleware = require('./middlewares/cors.middleware');
const logger = require('./utilities/logger.util');
const { startBirthdayJob } = require('./birthday/birthday.job.js');

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(helmet());
app.use(corsMiddleware);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ? 10000 : (parseInt(process.env.RATE_LIMIT_MAX) || 200),
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/files', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/auth', require('./routes/auth.route'));
app.use('/api/v1/users', require('./routes/user.route'));
app.use('/api/v1/products', require('./routes/product.route'));
app.use('/api/v1/categories', require('./routes/category.route'));
app.use('/api/v1/subcategories', require('./routes/subcategory.route'));
app.use('/api/v1/seasons', require('./routes/season.route'));
app.use('/api/v1/cart', require('./routes/cart.route'));
app.use('/api/v1/orders', require('./routes/order.route'));
app.use('/api/v1/testimonials', require('./routes/testimonial.route'));
app.use('/api/v1/notifications', require('./routes/notification.route'));
app.use('/api/v1/delivery-fees', require('./routes/deliveryFee.route'));
app.use('/api/v1/analytics', require('./routes/analytics.route'));
app.use('/api/v1/content', require('./routes/content.route'));
app.use('/api/v1/reports', require('./routes/report.route'));
app.use('/api/v1/admin', require('./routes/admin.route'));

app.get(['/', '/api/v1'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Maison Élégance REST API is running',
    version: '1.0.0',
    frontendUrl: 'http://localhost:4200',
    availableEndpoints: {
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      subcategories: '/api/v1/subcategories',
      seasons: '/api/v1/seasons',
      auth: '/api/v1/auth',
      cart: '/api/v1/cart',
      orders: '/api/v1/orders',
      deliveryFees: '/api/v1/delivery-fees',
      content: '/api/v1/content',
      testimonials: '/api/v1/testimonials',
      analytics: '/api/v1/analytics'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    hint: 'The storefront UI is available at http://localhost:4200'
  });
});

app.use(errorHandler);

startBirthdayJob();

app.listen(port, () => {
  logger.info(`Server started at port: ${port}`);
});