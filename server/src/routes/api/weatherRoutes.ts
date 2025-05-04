import { Router, Request, Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

interface WeatherRequest extends Request {
  body: {
    cityName: string;
  };
}

/**
 * GET /api/weather/history
 * Return all saved cities as JSON.
 */
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getAllCities();
    return res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    return res.status(500).json({ error: 'Failed to load search history' });
  }
});

/**
 * POST /api/weather
 * Body: { cityName }
 * — Fetches geocode + forecast, saves the city, then returns:
 *   { weatherData, history }
 */
router.post('/', async (req: WeatherRequest, res: Response) => {
  try {
    const { cityName } = req.body;
    if (!cityName?.trim()) {
      return res.status(400).json({ error: 'City name is required' });
    }

    // 1) Fetch weather payload
    const weatherData = await WeatherService.getWeatherForCity(cityName.trim());

    // 2) Save to history (id + cityName)
    await HistoryService.addCity(cityName.trim());

    // 3) Return both weather and updated history
    const history = await HistoryService.getAllCities();
    return res.json({ weatherData, history });
  } catch (error) {
    console.error('Weather fetch error:', error);
    const status =
      error instanceof Error && error.message.includes('not found') ? 404 : 500;
    return res
      .status(status)
      .json({ error: error instanceof Error ? error.message : 'Failed to fetch weather data' });
  }
});

/**
 * DELETE /api/weather/history/:id
 * Removes a city from history by its ID.
 */
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'City ID is required' });
    }

    await HistoryService.removeCity(id);
    const history = await HistoryService.getAllCities();
    return res.json({ success: true, message: 'Removed city from search history', history });
  } catch (error) {
    console.error('History delete error:', error);
    const status =
      error instanceof Error && error.message.includes('not found') ? 404 : 500;
    return res
      .status(status)
      .json({ error: error instanceof Error ? error.message : 'Failed to delete history item' });
  }
});

export default router;
