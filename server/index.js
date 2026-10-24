// CalmPop - Standalone Production Backend Server
// Serves /api/* endpoints and static client assets from dist/

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { apiApp } from './api.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Mount API
app.use(apiApp);

// Mount Static Assets if dist exists
const DIST_PATH = path.resolve('dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[CalmPop Server] Production server running on http://localhost:${PORT}`);
});
