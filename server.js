import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

// Import API handlers directly
import healthHandler from './api/health.js';
import diagnoseHandler from './api/diagnose.js';
import dashboardHandler from './api/dashboard.js';
import cropPricesHandler from './api/crop-prices.js';
import weatherHandler from './api/weather.js';
import outbreaksHandler from './api/outbreaks.js';
import presenceHandler from './api/presence.js';
import feedbackHandler from './api/feedback.js';
import diagnosesHandler from './api/diagnoses.js';
import signingTokenHandler from './api/signing-token.js';
import analyticsHandler from './api/analytics.js';
import damScraperHandler from './api/dam-scraper.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cors());

  // Log requests in dev
  app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.path}`);
    next();
  });

  // Wire Vercel serverless API handlers as express routes
  app.all('/api/health', healthHandler);
  app.all('/api/diagnose', diagnoseHandler);
  app.all('/api/dashboard', dashboardHandler);
  app.all('/api/crop-prices', cropPricesHandler);
  app.all('/api/weather', weatherHandler);
  app.all('/api/outbreaks', outbreaksHandler);
  app.all('/api/presence', presenceHandler);
  app.all('/api/feedback', feedbackHandler);
  app.all('/api/diagnoses', diagnosesHandler);
  app.all('/api/signing-token', signingTokenHandler);
  app.all('/api/analytics', analyticsHandler);
  app.all('/api/dam-scraper', damScraperHandler);

  // Serve static assets from public/ folder if needed (favicons, sw.js, manifest.json)
  app.use(express.static(path.join(process.cwd(), 'public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('sw.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        res.setHeader('Service-Worker-Allowed', '/');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  // Vite development or production routing
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in DEVELOPMENT mode with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in PRODUCTION mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CABI Diagnosis Full-Stack application is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
