import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

interface City {
  name: string;
  id: string;
}

class HistoryService {
  private readonly dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'db', 'db.json');
    this.initializeDB().catch(console.error);
  }

  private async initializeDB(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      await fs.access(this.dbPath);
    } catch {
      await this.write([]);
    }
  }

  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.dbPath, { encoding: 'utf-8' });
      return JSON.parse(data || '[]') as City[];
    } catch (error) {
      console.error('Failed to read database:', error);
      return [];
    }
  }

  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(
        this.dbPath,
        JSON.stringify(cities, null, 2),
        { encoding: 'utf-8' }
      );
    } catch (error) {
      console.error('Failed to write to database:', error);
      throw new Error('Failed to save history');
    }
  }

  async getCities(): Promise<City[]> {
    try {
      const cities = await this.read();
      return Array.isArray(cities) ? cities : [];
    } catch (error) {
      console.error('Failed to get cities:', error);
      return [];
    }
  }

  async addCity(cityName: string): Promise<City> {
    if (!cityName?.trim()) {
      throw new Error('City name cannot be blank');
    }

    const normalizedCity = cityName.trim();
    const cities = await this.read();

    // Check for existing city (case insensitive)
    const exists = cities.some(
      city => city.name.toLowerCase() === normalizedCity.toLowerCase()
    );

    if (exists) {
      throw new Error('City already exists in history');
    }

    const newCity: City = {
      name: normalizedCity,
      id: uuidv4()
    };

    await this.write([...cities, newCity]);
    return newCity;
  }

  async removeCity(id: string): Promise<void> {
    if (!id) {
      throw new Error('City ID is required');
    }

    const cities = await this.read();
    const filteredCities = cities.filter(city => city.id !== id);

    if (cities.length === filteredCities.length) {
      throw new Error('City not found in history');
    }

    await this.write(filteredCities);
  }
}

export default new HistoryService();