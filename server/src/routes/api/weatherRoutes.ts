import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService';
import WeatherService from '../../service/weatherService';

interface WeatherRequest extends Request {
  body: {
    cityName: string;
  };
}

// POST endpoint to fetch weather data
router.post('/', async (req: WeatherRequest, res: Response) => {
  try {
    const { cityName } = req.body;
    
    if (!cityName?.trim()) {
      return res.status(400).json({ error: 'City name is required' });
    }

    const weatherData = await WeatherService.getWeatherForCity(cityName.trim());
    await HistoryService.addCity(cityName.trim());
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather fetch error:', error);
    const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch weather data' 
    });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch history' 
    });
  }
});

// DELETE city from history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'City ID is required' });
    }

    await HistoryService.removeCity(id);
    res.json({ success: true, message: 'Removed city from search history' });
  } catch (error) {
    console.error('History delete error:', error);
    const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ 
      error: error instanceof Error ? error.message : 'Failed to delete history item' 
    });
  }
});

export default router;
