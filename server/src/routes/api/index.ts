import { Router } from 'express';
import weatherRoutes from './weatherRoutes';
import htmlRoutes from '../htmlRoutes';

const router = Router();

router.use('/api', weatherRoutes);  // all /api/weather-related routes
router.use('/', htmlRoutes);        // serve HTML or frontend entry

export default router;
