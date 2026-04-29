import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    '*.preview.emergentagent.com',
    '*.emergent.host',
    '*.optowire.net',
    'optowire.net',
    'eqp-showcase.preview.emergentagent.com',
  ]
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

// API Proxy to backend
const backendPort = process.env['BACKEND_PORT'] || '8001';
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${backendPort}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  }
}));

// Serve robots.txt as plain text (must come before Angular SSR handler)
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.sendFile(join(browserDistFolder, 'robots.txt'));
});

// Proxy for external Optowire API — avoids CORS issues in browser
const API_BASE_URL = process.env['API_BASE_URL'] || 'https://api-prod.optowire.net';
const PARTNER_KEY = process.env['PARTNER_KEY'] || '';

app.use('/ext', createProxyMiddleware({
  target: API_BASE_URL,
  changeOrigin: true,
  pathRewrite: { '^/ext': '' },
  on: {
    proxyReq: (proxyReq: any) => {
      proxyReq.setHeader('x-partner-key', PARTNER_KEY);
      // Remove browser-added headers that cause CORS rejection at external API
      proxyReq.removeHeader('origin');
      proxyReq.removeHeader('referer');
    }
  }
}));

// Dynamic sitemap from backend — must be before express.static
app.get('/sitemap.xml', createProxyMiddleware({
  target: `http://localhost:${backendPort}`,
  changeOrigin: true,
}));

// 301 redirects for legacy language-prefixed URLs (/am/..., /ge/...) → canonical URL
app.use(/^\/(am|ge)(\/.*)?$/, (req: express.Request, res: express.Response) => {
  const rest = req.params[1] || '/';
  const qs = Object.keys(req.query).length ? '?' + new URLSearchParams(req.query as Record<string, string>).toString() : '';
  res.redirect(301, rest + qs);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Express error handler — catches unhandled SSR errors and returns 500
 * instead of crashing the process or leaking stack traces.
 */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('SSR unhandled error:', err?.message || err);
  if (!res.headersSent) {
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 3000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
