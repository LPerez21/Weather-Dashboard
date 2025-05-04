// src/routes/htmlRoutes.ts

import express, { Router, Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Adjust this to point at your client’s dist folder
const clientDist = path.join(__dirname, '../../..', 'client', 'dist');

const router: Router = Router();

// 1) Serve JS/CSS/assets from clientDist
router.use(express.static(clientDist));

// 2) For any other path, send back index.html
router.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

export default router;
