// src/main.ts

import './styles/jass.css';

// —– DATA TYPES —–
interface City {
  name: string;
  id: string;
}

interface Weather {
  city: string;
  date: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;
}

interface ApiResponse {
  weatherData?: Weather[];
  history?: City[];
  error?: string;
}

// —– DOM REFERENCES —–
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement;

// —– FETCH FUNCTIONS —–
async function fetchWeather(cityName: string): Promise<void> {
  try {
    const res = await fetch('/api/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cityName })
    });
    const data: ApiResponse = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch weather data');
    }
    if (!data.weatherData || data.weatherData.length === 0) {
      throw new Error('No weather data returned');
    }

    // Destructure current + forecast
    const [current, ...forecast] = data.weatherData;
    renderCurrentWeather(current);
    renderForecast(forecast);

    // Update history list
    if (data.history) renderSearchHistory(data.history);
  } catch (err: any) {
    console.error('fetchWeather error:', err);
    alert(err.message);
  }
}

async function fetchSearchHistory(): Promise<City[]> {
  const res = await fetch('/api/weather/history');
  const data = await res.json() as ApiResponse;
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load search history');
  }
  return data as unknown as City[];  // history endpoint returns City[]
}

async function deleteCityFromHistory(id: string): Promise<void> {
  const res = await fetch(`/api/weather/history/${id}`, { method: 'DELETE' });
  const data = await res.json() as ApiResponse;
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete city');
  }
}

// —– RENDER FUNCTIONS —–
function renderCurrentWeather(current: Weather): void {
  const heading = document.createElement('h2');
  heading.textContent = `${current.city} (${current.date})`;

  const icon = document.createElement('img');
  icon.src = `https://openweathermap.org/img/w/${current.icon}.png`;
  icon.alt = current.iconDescription;
  icon.classList.add('weather-img');
  heading.append(icon);

  const tempEl = document.createElement('p');
  tempEl.textContent = `Temp: ${current.tempF} °F`;

  const windEl = document.createElement('p');
  windEl.textContent = `Wind: ${current.windSpeed} MPH`;

  const humidityEl = document.createElement('p');
  humidityEl.textContent = `Humidity: ${current.humidity} %`;

  todayContainer.innerHTML = '';
  todayContainer.append(heading, tempEl, windEl, humidityEl);
}

function renderForecast(forecast: Weather[]): void {
  forecastContainer.innerHTML = '';

  const titleCol = document.createElement('div');
  titleCol.classList.add('col-12');
  const title = document.createElement('h4');
  title.textContent = '5-Day Forecast:';
  titleCol.append(title);
  forecastContainer.append(titleCol);

  for (const day of forecast) {
    renderForecastCard(day);
  }
}

function renderForecastCard(day: Weather): void {
  const col = document.createElement('div');
  col.classList.add('col-auto');

  const card = document.createElement('div');
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');

  const body = document.createElement('div');
  body.classList.add('card-body', 'p-2');

  const dateEl = document.createElement('h5');
  dateEl.classList.add('card-title');
  dateEl.textContent = day.date;

  const icon = document.createElement('img');
  icon.src = `https://openweathermap.org/img/w/${day.icon}.png`;
  icon.alt = day.iconDescription;

  const tempEl = document.createElement('p');
  tempEl.classList.add('card-text');
  tempEl.textContent = `Temp: ${day.tempF} °F`;

  const windEl = document.createElement('p');
  windEl.classList.add('card-text');
  windEl.textContent = `Wind: ${day.windSpeed} MPH`;

  const humidityEl = document.createElement('p');
  humidityEl.classList.add('card-text');
  humidityEl.textContent = `Humidity: ${day.humidity} %`;

  body.append(dateEl, icon, tempEl, windEl, humidityEl);
  card.append(body);
  col.append(card);
  forecastContainer.append(col);
}

function renderSearchHistory(history: City[]): void {
  searchHistoryContainer.innerHTML = '';

  if (history.length === 0) {
    searchHistoryContainer.innerHTML = '<p class="text-center">No Previous Search History</p>';
    return;
  }

  // show most recent first
  [...history].reverse().forEach((city) => {
    const item = buildHistoryListItem(city);
    searchHistoryContainer.append(item);
  });
}

// —– HELPERS —–
function buildHistoryListItem(city: City): HTMLDivElement {
  const div = document.createElement('div');
  div.classList.add('d-flex', 'gap-2', 'col-12', 'm-1');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city.name;
  btn.addEventListener('click', () => fetchWeather(city.name));

  const del = document.createElement('button');
  del.type = 'button';
  del.classList.add('fas', 'fa-trash-alt', 'btn', 'btn-danger', 'col-2');
  del.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteCityFromHistory(city.id)
      .then(loadHistory)
      .catch((err) => { console.error(err); alert(err.message); });
  });

  div.append(btn, del);
  return div;
}

function loadHistory(): void {
  fetchSearchHistory()
    .then(renderSearchHistory)
    .catch((err) => { console.error(err); });
}

// —– EVENT BINDING —–
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (!city) {
    alert('City cannot be blank');
    return;
  }
  fetchWeather(city);
  searchInput.value = '';
});

loadHistory();

