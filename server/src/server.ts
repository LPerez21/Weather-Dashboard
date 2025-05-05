// server/src/server.ts

import 'dotenv/config';               // loads .env
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// 1) Serve static files from your React build
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// 2) Parse URL‑encoded form data
app.use(express.urlencoded({ extended: true }));
// 3) Parse JSON bodies
app.use(express.json());

// 4) Mount your combined router (API under /api, HTML fallback)
/*
  routes = Router()
    .use('/api', apiRoutes)
    .use('/', htmlRoutes)
*/
app.use('/', routes);

// 5) Start the server on the configured PORT
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
