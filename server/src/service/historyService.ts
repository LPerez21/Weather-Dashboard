// server/src/service/historyService.ts

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export interface City {
  name: string;
  id: string;
}

class HistoryService {
  // From dist/service, two levels up lands in server/, then into db/
  private readonly filePath = path.join(__dirname, '../../db/db.json');

  private async readJson(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data) as City[];
    } catch (err: any) {
      if (err.code === 'ENOENT' || err instanceof SyntaxError) {
        return [];
      }
      throw err;
    }
  }

  private async writeJson(cities: City[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), 'utf8');
  }

  async getAllCities(): Promise<City[]> {
    return this.readJson();
  }

  async addCity(name: string): Promise<City> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('City name cannot be blank');

    const cities = await this.readJson();
    const existing = cities.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;

    const newCity: City = { name: trimmed, id: uuidv4() };
    await this.writeJson([...cities, newCity]);
    return newCity;
  }

  async removeCity(id: string): Promise<void> {
    const cities = await this.readJson();
    const filtered = cities.filter((c) => c.id !== id);
    await this.writeJson(filtered);
  }
}

export default new HistoryService();
