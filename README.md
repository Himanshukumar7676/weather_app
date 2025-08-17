# 🌦️ AI Weather App

A sleek, modern, and interactive weather application that provides real-time weather data and conversational summaries powered by Google's Gemini AI.


## ✨ Features

* **Real-Time Weather Data**: Get up-to-the-minute weather information for any city in the world.
* **AI-Powered Summaries**: Instead of just data, get a friendly, conversational summary of the weather conditions, powered by the Google Gemini API.
* **Dynamic UI**: The background of the app changes to reflect the current weather conditions.
* **Detailed Forecasts**:
    * **Hourly Forecast**: See the weather forecast for the next 24 hours.
    * **7-Day Forecast**: Plan your week with a detailed 7-day forecast.
* **Interactive Elements**:
    * Click on any day in the 7-day forecast to see more details like sunrise and sunset times.
    * Toggle between **Celsius (°C)** and **Fahrenheit (°F)**.
* **Geolocation**: Automatically fetch the weather for your current location with a single click.
* **Responsive Design**: A clean and fully responsive interface that looks great on any device, from mobile phones to desktops.

## 🛠️ Technologies Used

* **Frontend**: HTML5, CSS3, Vanilla JavaScript
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
* **Icons**: [Lucide Icons](https://lucide.dev/) for clean and beautiful icons.
* **APIs**:
    * [**Open-Meteo**](https://open-meteo.com/): For comprehensive and free weather forecast data.
    * [**Nominatim**](https://nominatim.org/): For reverse geocoding to find a city name from coordinates.
    * [**Google Gemini**](https://ai.google.dev/): For generating the AI-powered weather summaries.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You'll need a modern web browser like Chrome, Firefox, or Safari.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/ai-weather-app.git](https://github.com/your-username/ai-weather-app.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd ai-weather-app
    ```
3.  **Get your Google AI API Key:**
    * Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    * Click on "**Create API key**" to generate a new key.
    * Copy the generated API key.

4.  **Add the API Key to the project:**
    * Open the `script.js` file.
    * Find the following line:
        ```javascript
        const apiKey = "";
        ```
    * Paste your API key inside the quotes:
        ```javascript
        const apiKey = "YOUR_API_KEY_HERE";
        ```

5.  **Open the application:**
    * Simply open the `index.html` file in your web browser.

---
