const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const sequelize = require('./config/database');

const factoryRoutes = require('./routes/factories');
const auditorRoutes = require('./routes/auditors');
const auditRoutes = require('./routes/audits');
const reputationRoutes = require('./routes/reputation');
const matchingRoutes = require('./routes/matching');
const metricsRoutes = require('./routes/metrics');
const ipfsRoutes = require('./routes/ipfs');
const nftStorageRoutes = require('./routes/nftstorage');

// Associations fixed - using wallet_address as foreign key reference
const app = express();

// CORS configuration for Vercel frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://fairchain-frontend.vercel.app',
      'https://fairchain.vercel.app',
      'https://fair-chain.vercel.app',  // Your actual Vercel URL
      'https://fairchain-frontend-git-*.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // Convert glob pattern to regex
        const regex = new RegExp(allowed.replace('*', '.*'));
        return regex.test(origin);
      }
      return origin === allowed;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/factories', factoryRoutes);
app.use('/api/auditors', auditorRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/reputation', reputationRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/nftstorage', nftStorageRoutes);

// Root health check for Render
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'fairchain-backend'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'fairchain-backend'
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'FairChain API',
    version: '1.0.0',
    description: 'Ethiopia SME Compliance Verification API',
    endpoints: {
      factories: '/api/factories',
      auditors: '/api/auditors',
      audits: '/api/audits',
      reputation: '/api/reputation',
      matching: '/api/matching',
      metrics: '/api/metrics',
      ipfs: '/api/ipfs',
      nftstorage: '/api/nftstorage',
    },
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ alter: false }); // Disabled alter to avoid FK constraint errors
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`FairChain API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
