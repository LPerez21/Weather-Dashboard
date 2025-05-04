// src/routes/api/weatherRoutes.ts

import { Router, Request, Response } from 'express';
import HistoryService from '../../service/historyService';
import WeatherService from '../../service/weatherService';

interface WeatherRequest extends Request {
  body: { cityName: string };
}

const router = Router();

/**
 * GET /api/weather/history
 * Return all saved cities as JSON.
 */
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getAllCities();
    res.json(history);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to load search history' });
  }
});

/**
 * POST /api/weather
 * Body: { cityName }
 * — Fetches forecast for the city, saves it to history, then returns:
 *   { weatherData: Weather[], history: City[] }
 */
router.post('/', async (req: WeatherRequest, res: Response) => {
  const { cityName } = req.body;
  if (!cityName?.trim()) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // 1) Fetch weather data
    const weatherData = await WeatherService.getWeatherForCity(cityName.trim());

    // 2) Save city to history
    await HistoryService.addCity(cityName.trim());

    // 3) Load updated history
    const history = await HistoryService.getAllCities();

    // 4) Respond with both
    res.json({ weatherData, history });
  } catch (err) {
    console.error('Weather fetch error:', err);
    const status = err instanceof Error && err.message.includes('not found') ? 404 : 500;
    res
      .status(status)
      .json({ error: err instanceof Error ? err.message : 'Failed to fetch weather data' });
  }
});

/**
 * DELETE /api/weather/history/:id
 * Removes a city from history by its ID, then returns updated history.
 */
router.delete('/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'City ID is required' });
  }

  try {
    await HistoryService.removeCity(id);
    const history = await HistoryService.getAllCities();
    res.json({ success: true, history });
  } catch (err) {
    console.error('History delete error:', err);
    const status = err instanceof Error && err.message.includes('not fou
