// src/service/historyService.ts

import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

export interface City {
  name: string;
  id: string;
}

class HistoryService {
  // Resolve path to your JSON file
  private readonly filePath = path.join(__dirname, '../db/db.json');

  /** Read and parse the JSON file; return empty array if missing or invalid */
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

  /** Stringify and overwrite the JSON file */
  private async writeJson(cities: City[]): Promise<void> {
    const json = JSON.stringify(cities, null, 2);
    await fs.writeFile(this.filePath, json, 'utf8');
  }

  /**
   * Get all saved cities.
   */
  async getAllCities(): Promise<City[]> {
    return await this.readJson();
  }

  /**
   * Add a new city (if not already present, case‑insensitive).
   * Returns the new City object (or the existing one if duplicate).
   */
  async addCity(name: string): Promise<City> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('City name cannot be blank');
    }

    const cities = await this.readJson();
    const existing = cities.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    const newCity: City = { name: trimmed, id: uuidv4() };
    await this.writeJson([...cities, newCity]);
    return newCity;
  }

  /**
   * Remove a city by its ID.
   */
  async removeCity(id: string): Promise<void> {
    const cities = await this.readJson();
    const filtered = cities.filter((c) => c.id !== id);
    await this.writeJson(filtered);
  }
}

export default new HistoryService();
