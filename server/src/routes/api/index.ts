import { Router } from 'express';
import weatherRoutes from './weatherRoutes.js';
const router = Router();

router.use('/weather', weatherRoutes);  // all /api/weather-related routes

export default router;
