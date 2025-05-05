# Weather Dashboard

## Description

This project is a full-stack weather dashboard application that allows users to search for the weather outlook of different cities. It leverages the OpenWeatherMap API to provide current weather conditions and a 5-day forecast. The application features a persistent search history, stored on the backend, which allows users to quickly revisit previously searched locations. The backend is built with Node.js and Express, handling API calls and data management, while the frontend provides the user interface and interacts with the backend via API routes.

## Features

*   **City Search:** Search for weather information by city name.
*   **Current Weather:** Displays the city name, date, weather icon, description, temperature (in Fahrenheit), humidity, and wind speed for the current conditions.
*   **5-Day Forecast:** Provides a forecast for the next five days, including the date, weather icon, temperature, wind speed, and humidity for each day.
*   **Search History:** Saves successfully searched cities to a history list.
*   **History Recall:** Clicking a city in the search history loads its weather data.
*   **History Deletion (Bonus):** Users can remove cities from the search history.
*   **Responsive Design:** (Assuming your frontend starter code is responsive) The application is designed to be viewable on different screen sizes.

## Technologies Used

*   **Frontend:** HTML, CSS, JavaScript
*   **Backend:** Node.js, Express.js
*   **APIs:** OpenWeatherMap API (Geocoding API and 5-day weather forecast API)
*   **Libraries:**
    *   `axios`: HTTP client for making API requests.
    *   `uuid`: For generating unique identifiers for search history entries.
    *   `dotenv`: For securely loading environment variables (like the API key).
*   **Deployment:** Render

## Live Application

You can access the deployed application here:

[Link to your deployed application on Render]

## Screenshot

A visual representation of the application in action:

![Screenshot of the Weather Dashboard application](./screenshot/Screenshot%202025-05-04%20210751.jpg) 

## Installation (Local)

To set up and run this project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone <your-github-repo-url>
    cd <your-repo-name>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Obtain an OpenWeatherMap API Key:**
    *   If you don't have one, sign up for a free account on the [OpenWeatherMap website](https://openweathermap.org/).
    *   Generate your API key from your account dashboard.
    *   Note that it can take up to 2 hours for a new key to become active.
4.  **Create a `.env` file:**
    *   In the root directory of the project, create a file named `.env`.
    *   Add your OpenWeatherMap API key to this file:
        ```
        OPENWEATHER_API_KEY=YOUR_API_KEY_HERE
        ```
        Replace `YOUR_API_KEY_HERE` with your actual API key.
5.  **Start the server:**
    ```bash
    node backend/server.js
    ```
6.  **Access the application:**
    *   Open your web browser and navigate to `http://localhost:3001`.

## API Endpoints

The backend provides the following API endpoints:

*   `GET /api/weather/history`: Retrieves the saved search history.
*   `POST /api/weather`: Searches for weather data for a given city and adds it to the history (if new). Expects a JSON body with a `cityName` property.
*   `DELETE /api/weather/history/:id`: Removes a city from the search history based on its unique ID.

## Deployment

The application is deployed as a web service on Render. Key configuration for deployment includes:

*   Connecting the Render service to this GitHub repository.
*   Setting the build command to `npm install`.
*   Setting the start command to `node backend/server.js`.
*   Configuring the `OPENWEATHER_API_KEY` as an environment variable in Render's dashboard for secure storage.

## Development Process

This project involved:

*   Implementing the backend server using Express.js.
*   Creating API routes to handle weather searches and search history management.
*   Integrating with the OpenWeatherMap API (Geocoding and 5-day forecast).
*   Utilizing the `fs` module for reading and writing to the `searchHistory.json` file.
*   Using the `uuid` library to ensure unique identifiers for history entries.
*   Connecting the existing frontend JavaScript to the new backend API endpoints.
*   Deploying the complete application to the Render platform.

## Contributing

This project was completed as part of a challenge. Contributions are not actively sought, but feel free to fork the repository or open issues if you encounter problems or have suggestions.

## License

This project is licensed under the [MIT License](LICENSE). <!-- Ensure you have a LICENSE file -->

## Credits

*   Starter frontend code provided by [Specify the source if applicable, e.g., your bootcamp/course].
*   Weather data provided by the [OpenWeatherMap API](https://openweathermap.org/).

---

© 2025 Luis Perez