// src/service/weatherService.ts

import dayjs from 'dayjs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// —– TYPES —–
interface GeoCodeResponseItem {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface ForecastListItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    icon: string;
    description: string;
    main: string;
  }>;
}

// —– MODEL —–
export class Weather {
  constructor(
    public city: string,
    public date: string,
    public tempF: number,
    public windSpeed: number,
    public humidity: number,
    public icon: string,
    public iconDescription: string
  ) {}
}

// —– SERVICE —–
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Missing OPENWEATHER_API_KEY in environment');
    }

    // Allow override, but default to the official API
    this.baseURL =
      process.env.API_BASE_URL?.replace(/\/$/, '') ||
      'https://api.openweathermap.org';
  }

  // Helper to fetch & JSON-decode, with HTTP error check
  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenWeather HTTP ${res.status}: ${text}`);
    }
    return res.json();
  }

  private buildGeocodeUrl(city: string) {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(
      city
    )}&limit=1&appid=${this.apiKey}`;
  }

  private buildForecastUrl(lat: number, lon: number) {
    return `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
  }

  /**
   * Returns [today, nextDay1, nextDay2, nextDay3, nextDay4, nextDay5]
   */
  public async getWeatherForCity(city: string): Promise<Weather[]> {
    // 1️⃣ Geocode lookup
    const geo = await this.fetchJson<GeoCodeResponseItem[]>(
      this.buildGeocodeUrl(city)
    );
    if (!geo.length) throw new Error('City not found');
    const { name, lat, lon } = geo[0];

    // 2️⃣ 5‑day forecast (3‑hr intervals)
    const payload = await this.fetchJson<{ list: ForecastListItem[] }>(
      this.buildForecastUrl(lat, lon)
    );

    // 3️⃣ Today’s weather (first entry)
    const now = payload.list[0];
    const today = new Weather(
      name,
      dayjs.unix(now.dt).format('M/D/YYYY'),
      now.main.temp,
      now.wind.speed,
      now.main.humidity,
      now.weather[0].icon,
      now.weather[0].description || now.weather[0].main
    );

    // 4️⃣ One snapshot per day at 12:00:00, next 5 days
    const daily = payload.list
      .filter((item) => item.dt_txt.endsWith('12:00:00'))
      .slice(0, 5)
      .map(
        (item) =>
          new Weather(
            name,
            dayjs.unix(item.dt).format('M/D/YYYY'),
            item.main.temp,
            item.wind.speed,
            item.main.humidity,
            item.weather[0].icon,
            item.weather[0].description || item.weather[0].main
          )
      );

    return [today, ...daily];
  }
}

// —– EXPORT INSTANCE —–
export default new WeatherService();
