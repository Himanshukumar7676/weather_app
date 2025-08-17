
let currentUnit = 'celsius'; 
let currentWeatherData = null;
let currentCityName = '';


const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const locationBtn = document.getElementById('location-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const weatherContent = document.getElementById('weather-content');
const hourlyContainer = document.getElementById('hourly-forecast-container');
const dailyContainer = document.getElementById('daily-forecast-container');
const unitToggle = document.getElementById('unit-toggle');


const weatherCodeMap = {
    0: { description: 'Clear sky', icon: 'sun', background: 'https://images.unsplash.com/photo-1590077428593-a55d22756b70?q=80&w=2070&auto=format&fit=crop' },
    1: { description: 'Mainly clear', icon: 'sun', background: 'https://images.unsplash.com/photo-1590077428593-a55d22756b70?q=80&w=2070&auto=format&fit=crop' },
    2: { description: 'Partly cloudy', icon: 'cloud-sun', background: 'https://images.unsplash.com/photo-1517685352821-92cf884ee6a5?q=80&w=2070&auto=format&fit=crop' },
    3: { description: 'Overcast', icon: 'cloud', background: 'https://images.unsplash.com/photo-1499956827185-0d63ee78a910?q=80&w=1974&auto=format&fit=crop' },
    45: { description: 'Fog', icon: 'cloud-fog', background: 'https://images.unsplash.com/photo-1487621167305-5d248087c883?q=80&w=2070&auto=format&fit=crop' },
    48: { description: 'Depositing rime fog', icon: 'cloud-fog', background: 'https://images.unsplash.com/photo-1487621167305-5d248087c883?q=80&w=2070&auto=format&fit=crop' },
    51: { description: 'Light drizzle', icon: 'cloud-drizzle', background: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1935&auto=format&fit=crop' },
    53: { description: 'Moderate drizzle', icon: 'cloud-drizzle', background: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1935&auto=format&fit=crop' },
    55: { description: 'Dense drizzle', icon: 'cloud-drizzle', background: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1935&auto=format&fit=crop' },
    61: { description: 'Slight rain', icon: 'cloud-rain', background: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2070&auto=format&fit=crop' },
    63: { description: 'Moderate rain', icon: 'cloud-rain', background: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2070&auto=format&fit=crop' },
    65: { description: 'Heavy rain', icon: 'cloud-rain-wind', background: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2070&auto=format&fit=crop' },
    71: { description: 'Slight snow fall', icon: 'cloud-snow', background: 'https://images.unsplash.com/photo-1516715094185-4a3bdee8158a?q=80&w=1974&auto=format&fit=crop' },
    73: { description: 'Moderate snow fall', icon: 'cloud-snow', background: 'https://images.unsplash.com/photo-1516715094185-4a3bdee8158a?q=80&w=1974&auto=format&fit=crop' },
    75: { description: 'Heavy snow fall', icon: 'cloud-snow', background: 'https://images.unsplash.com/photo-1516715094185-4a3bdee8158a?q=80&w=1974&auto=format&fit=crop' },
    80: { description: 'Slight rain showers', icon: 'cloud-hail', background: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2070&auto=format&fit=crop' },
    81: { description: 'Moderate rain showers', icon: 'cloud-hail', background: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2070&auto=format&fit=crop' },
    82: { description: 'Violent rain showers', icon: 'cloud-hail', background: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2070&auto=format&fit=crop' },
    95: { description: 'Thunderstorm', icon: 'cloud-lightning', background: 'https://images.unsplash.com/photo-1605727226434-d264a8d831aa?q=80&w=2070&auto=format&fit=crop' },
};


const toFahrenheit = (celsius) => Math.round(celsius * 9 / 5 + 32);
const toMph = (kph) => Math.round(kph / 1.609);


async function getWeatherData(lat, lon) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,visibility&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&timezone=auto`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Could not fetch weather data.');
    return response.json();
}

async function getCityCoords(city) {
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Could not fetch city coordinates.');
    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error('City not found.');
    const { latitude, longitude, name, admin1, country } = data.results[0];
    return { lat: latitude, lon: longitude, name: `${name}, ${admin1 || country}` };
}

async function getCityNameFromCoords(lat, lon) {
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Could not fetch city name.');
    const data = await response.json();
    return data.address.city || data.address.town || data.address.village || 'Current Location';
}

async function getAiSummary(weatherData, cityName) {
    const tempUnit = currentUnit === 'celsius' ? '°C' : '°F';
    const windUnit = currentUnit === 'celsius' ? 'km/h' : 'mph';

    const currentTemp = currentUnit === 'celsius' ? weatherData.current.temperature_2m : toFahrenheit(weatherData.current.temperature_2m);
    const feelsLikeTemp = currentUnit === 'celsius' ? weatherData.current.apparent_temperature : toFahrenheit(weatherData.current.apparent_temperature);
    const maxTemp = currentUnit === 'celsius' ? weatherData.daily.temperature_2m_max[0] : toFahrenheit(weatherData.daily.temperature_2m_max[0]);
    const minTemp = currentUnit === 'celsius' ? weatherData.daily.temperature_2m_min[0] : toFahrenheit(weatherData.daily.temperature_2m_min[0]);
    const windSpeed = currentUnit === 'celsius' ? weatherData.current.wind_speed_10m : toMph(weatherData.current.wind_speed_10m);

    const prompt = `
        Based on the following weather data for ${cityName}, write a short, friendly, and conversational weather summary (about 2-3 sentences).
        Mention the general feel of the day, the temperature, and the main weather condition. You could suggest a suitable activity.
        Keep it light and positive.
        
        Weather Data:
        - Current Temperature: ${currentTemp}${tempUnit}
        - Apparent (Feels Like) Temperature: ${feelsLikeTemp}${tempUnit}
        - Weather Condition: ${weatherCodeMap[weatherData.current.weather_code].description}
        - Max Temperature Today: ${maxTemp}${tempUnit}
        - Min Temperature Today: ${minTemp}${tempUnit}
        - Wind Speed: ${windSpeed} ${windUnit}
    `;

    const apiKey = "AIzaSyCirRgD8if1CvyNSPlQ1PTFMSOO1pa6iyE";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('AI summary generation failed.');
        const result = await response.json();
        return result.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error fetching AI summary:', error);
        return "Could not connect to the AI service.";
    }
}


function renderUI() {
    if (!currentWeatherData) return;

    const data = currentWeatherData;
    const cityName = currentCityName;
    const { current, daily, hourly } = data;
    const weatherInfo = weatherCodeMap[current.weather_code] || weatherCodeMap[0];

    
    document.body.style.backgroundImage = `url('${weatherInfo.background}')`;

    
    updateGreeting(data.timezone);

    
    document.getElementById('city-name').textContent = cityName;
    document.getElementById('weather-description').textContent = weatherInfo.description;
    document.getElementById('current-temp').textContent = `${Math.round(currentUnit === 'celsius' ? current.temperature_2m : toFahrenheit(current.temperature_2m))}°`;
    document.getElementById('high-temp').textContent = Math.round(currentUnit === 'celsius' ? daily.temperature_2m_max[0] : toFahrenheit(daily.temperature_2m_max[0]));
    document.getElementById('low-temp').textContent = Math.round(currentUnit === 'celsius' ? daily.temperature_2m_min[0] : toFahrenheit(daily.temperature_2m_min[0]));

    const iconContainer = document.getElementById('weather-icon');
    iconContainer.innerHTML = `<i data-lucide="${weatherInfo.icon}" class="w-full h-full text-white"></i>`;

    
    document.getElementById('feels-like').textContent = `${Math.round(currentUnit === 'celsius' ? current.apparent_temperature : toFahrenheit(current.apparent_temperature))}°`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').textContent = `${Math.round(currentUnit === 'celsius' ? current.wind_speed_10m : toMph(current.wind_speed_10m))} ${currentUnit === 'celsius' ? 'km/h' : 'mph'}`;
    document.getElementById('pressure').textContent = `${Math.round(current.surface_pressure)} hPa`;
    document.getElementById('visibility').textContent = `${Math.round(current.visibility / 1000)} km`;
    document.getElementById('uv-index').textContent = Math.round(daily.uv_index_max[0]);

    updateHourlyForecast(hourly);
    updateDailyForecast(daily);

    
    lucide.createIcons();

    
    if (weatherContent.classList.contains('opacity-0')) {
        [weatherContent, hourlyContainer, dailyContainer].forEach(el => {
            el.classList.remove('opacity-0');
            el.classList.add('fade-in');
        });
    }
}

function updateGreeting(timezone) {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    const hour = now.getHours();
    let greetingText = 'Good Morning';
    if (hour >= 12 && hour < 17) {
        greetingText = 'Good Afternoon';
    } else if (hour >= 17) {
        greetingText = 'Good Evening';
    }
    document.getElementById('greeting').textContent = greetingText;
}

function updateHourlyForecast(hourlyData) {
    const hourlyForecast = document.getElementById('hourly-forecast');
    hourlyForecast.innerHTML = '';
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: currentWeatherData.timezone }));
    const currentHour = now.getHours();
    const startIndex = hourlyData.time.findIndex(time => new Date(time).getHours() === currentHour);

    if (startIndex === -1) return;

    for (let i = startIndex; i < startIndex + 24; i++) {
        if (!hourlyData.time[i]) continue;
        const time = new Date(hourlyData.time[i]);
        const tempC = hourlyData.temperature_2m[i];
        const temp = Math.round(currentUnit === 'celsius' ? tempC : toFahrenheit(tempC));
        const weatherInfo = weatherCodeMap[hourlyData.weather_code[i]] || weatherCodeMap[0];
        const hourText = i === startIndex ? 'Now' : time.toLocaleTimeString([], { hour: 'numeric', hour12: true }).toLowerCase();

        const hourEl = document.createElement('div');
        hourEl.className = 'flex flex-col items-center flex-shrink-0 space-y-2 p-2 rounded-lg transition-colors hover:bg-white/10';
        hourEl.innerHTML = `
            <p class="text-sm text-white/80">${hourText}</p>
            <i data-lucide="${weatherInfo.icon}" class="w-8 h-8 text-white"></i>
            <p class="text-lg font-semibold">${temp}°</p>
        `;
        hourlyForecast.appendChild(hourEl);
    }
}

function updateDailyForecast(dailyData) {
    const dailyForecast = document.getElementById('daily-forecast');
    dailyForecast.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const date = new Date(dailyData.time[i]);
        const dayName = i === 0 ? 'Today' : date.toLocaleDateString([], { weekday: 'short' });
        const highTemp = Math.round(currentUnit === 'celsius' ? dailyData.temperature_2m_max[i] : toFahrenheit(dailyData.temperature_2m_max[i]));
        const lowTemp = Math.round(currentUnit === 'celsius' ? dailyData.temperature_2m_min[i] : toFahrenheit(dailyData.temperature_2m_min[i]));
        const weatherInfo = weatherCodeMap[dailyData.weather_code[i]] || weatherCodeMap[0];
        const sunrise = new Date(dailyData.sunrise[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(dailyData.sunset[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const dayEl = document.createElement('div');
        dayEl.className = 'daily-item bg-white/5 rounded-lg transition-colors hover:bg-white/10';
        dayEl.innerHTML = `
            <div class="flex items-center justify-between p-3 cursor-pointer">
                <p class="font-medium w-1/4">${dayName}</p>
                <i data-lucide="${weatherInfo.icon}" class="w-8 h-8 text-white"></i>
                <div class="flex items-center justify-end w-1/4">
                    <span class="font-semibold">${highTemp}°</span>
                    <span class="text-white/70 ml-3">${lowTemp}°</span>
                    <i data-lucide="chevron-down" class="chevron-icon w-5 h-5 ml-3 text-white/70 transition-transform"></i>
                </div>
            </div>
            <div class="daily-details bg-black/20 px-4">
                <div class="flex justify-around text-sm">
                    <div class="flex items-center gap-2">
                        <i data-lucide="sunrise" class="w-5 h-5 text-yellow-300"></i>
                        <span>${sunrise}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i data-lucide="sunset" class="w-5 h-5 text-orange-400"></i>
                        <span>${sunset}</span>
                    </div>
                </div>
            </div>
        `;
        dailyForecast.appendChild(dayEl);
    }
}

async function updateAiSummary(data, cityName) {
    const aiSummaryContent = document.getElementById('ai-summary-content');
    aiSummaryContent.innerHTML = `<div class="flex items-center gap-3"><div class="loader ai-loader"></div><span>Generating summary...</span></div>`;
    const summary = await getAiSummary(data, cityName);
    aiSummaryContent.textContent = summary;
}


async function fetchAndDisplayWeather(city) {
    showLoading();
    try {
        const { lat, lon, name } = await getCityCoords(city);
        currentWeatherData = await getWeatherData(lat, lon);
        currentCityName = name;
        renderUI();
        updateAiSummary(currentWeatherData, currentCityName);
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

async function fetchAndDisplayWeatherByCoords(lat, lon) {
    showLoading();
    try {
        currentCityName = await getCityNameFromCoords(lat, lon);
        currentWeatherData = await getWeatherData(lat, lon);
        renderUI();
        updateAiSummary(currentWeatherData, currentCityName);
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

function handleSearch(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchAndDisplayWeather(city);
        cityInput.value = '';
    }
}

function handleLocationClick() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => fetchAndDisplayWeatherByCoords(position.coords.latitude, position.coords.longitude),
            (err) => showError("Unable to retrieve your location. Please grant permission.")
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
}

function handleUnitToggle() {
    currentUnit = unitToggle.checked ? 'fahrenheit' : 'celsius';
    renderUI();
}

function handleDailyForecastClick(e) {
    const item = e.target.closest('.daily-item');
    if (item) {
        item.classList.toggle('expanded');
    }
}


function showLoading() { loadingOverlay.classList.remove('hidden'); loadingOverlay.classList.add('flex'); }
function hideLoading() { loadingOverlay.classList.add('hidden'); loadingOverlay.classList.remove('flex'); }
function showError(message) { errorText.textContent = message; errorMessage.classList.remove('hidden'); }


document.addEventListener('DOMContentLoaded', () => {
    searchForm.addEventListener('submit', handleSearch);
    locationBtn.addEventListener('click', handleLocationClick);
    unitToggle.addEventListener('change', handleUnitToggle);
    document.getElementById('daily-forecast').addEventListener('click', handleDailyForecastClick);
    fetchAndDisplayWeather('New Delhi');
});
