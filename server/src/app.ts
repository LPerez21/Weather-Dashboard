import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import router from './routes/index.js';  // combines /api/* and HTML fallback

// Resolve __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Path to your React app’s build folder
const clientDist = path.join(__dirname, '../../client/dist');

const app = express();

// 1) Enable CORS
app.use(cors());

// 2) Parse incoming JSON and URL‑encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Serve your React static assets
app.use(express.static(clientDist));

// 4) Mount API + HTML routes
//    routes/index.js should do:
//      router.use('/api', apiRoutes);
//      router.use('/', htmlRoutes);
app.use('/', router);

// 5) Fallback for client‑side routing (in case htmlRoutes doesn’t cover it)
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// 6) Start the server
const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

export default app;
