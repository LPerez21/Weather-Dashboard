import dayjs, { type Dayjs } from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

class Weather {
  constructor(
    public city: string,
    public date: Dayjs | string,
    public tempF: number,
    public windSpeed: number,
    public humidity: number,
    public icon: string,
    public iconDescription: string
  ) {}
}

class WeatherService {
  private readonly baseURL: string;
  private readonly apiKey: string;
  private city = '';

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
    this.apiKey = process.env.API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('API_KEY is required in environment variables');
    }
  }

  private async fetchWithTimeout(url: string, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error instanceof Error ? error : new Error('Network request failed');
    }
  }

  private async fetchLocationData(query: string): Promise<Coordinates> {
    try {
      const response = await this.fetchWithTimeout(query);
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Location not found - please check city name');
      }

      const location = data[0];
      if (!location.name || !location.lat || !location.lon) {
        throw new Error('Invalid location data received from API');
      }

      return location;
    } catch (error) {
      console.error('Location fetch error:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch location data'
      );
    }
  }

  private validateCoordinates(coords: Coordinates): Coordinates {
    if (!coords?.name || typeof coords.lat !== 'number' || typeof coords.lon !== 'number') {
      throw new Error('Invalid coordinates data');
    }
    
    return {
      name: coords.name,
      lat: coords.lat,
      lon: coords.lon,
      country: coords.country || '',
      state: coords.state || ''
    };
  }

  private buildGeocodeQuery(): string {
    const encodedCity = encodeURIComponent(this.city.trim());
    return `${this.baseURL}/geo/1.0/direct?q=${encodedCity}&limit=1&appid=${this.apiKey}`;
  }

  private buildWeatherQuery(coords: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=imperial&appid=${this.apiKey}`;
  }

  private parseCurrentWeather(response: any, cityName: string): Weather {
    if (!response?.main?.temp || !response.weather?.[0]) {
      throw new Error('Invalid weather data structure');
    }

    return new Weather(
      cityName,
      dayjs.unix(response.dt),
      Math.round(response.main.temp),
      Math.round(response.wind.speed),
      response.main.humidity,
      response.weather[0].icon,
      response.weather[0].description || response.weather[0].main
    );
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    if (!Array.isArray(weatherData)) {
      throw new Error('Invalid forecast data');
    }

    const forecast = [currentWeather];
    const middayWeather = weatherData.filter(item => 
      item.dt_txt?.includes('12:00:00')
    );

    middayWeather.forEach(day => {
      try {
        forecast.push(
          new Weather(
            currentWeather.city,
            dayjs.unix(day.dt),
            Math.round(day.main.temp),
            Math.round(day.wind.speed),
            day.main.humidity,
            day.weather[0].icon,
            day.weather[0].description || day.weather[0].main
          )
        );
      } catch (error) {
        console.warn('Skipping invalid forecast day:', error);
      }
    });

    return forecast;
  }

  async getWeatherForCity(city: string): Promise<Weather[]> {
    if (!city?.trim()) {
      throw new Error('City name is required');
    }

    this.city = city.trim();
    
    try {
      const locationQuery = this.buildGeocodeQuery();
      const locationData = await this.fetchLocationData(locationQuery);
      const coordinates = this.validateCoordinates(locationData);
      
      const weatherQuery = this.buildWeatherQuery(coordinates);
      const weatherResponse = await this.fetchWithTimeout(weatherQuery);
      const weatherData = await weatherResponse.json();

      if (!weatherData?.list?.length) {
        throw new Error('No weather data available');
      }

      const currentWeather = this.parseCurrentWeather(
        weatherData.list[0],
        coordinates.name
      );
      
      return this.buildForecastArray(currentWeather, weatherData.list);
    } catch (error) {
      console.error(`Weather fetch failed for "${this.city}":`, error);
      throw new Error(
        `Could not get weather for "${this.city}": ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}

export default new WeatherService();