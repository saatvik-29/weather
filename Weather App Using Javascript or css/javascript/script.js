// Weather App Enhanced Version
class WeatherApp {
    constructor() {
        this.apiKey = "4f8234a62amsh42185b0b78f249cp12e57ajsnb401d01fcbbf";
        this.baseUrl = "https://weatherapi-com.p.rapidapi.com";
        this.currentLocation = null;
        this.isLoading = false;
        
        this.initializeApp();
    }

    initializeApp() {
        // Add event listeners
        document.getElementById("searchTxt").addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.getWeatherData();
            }
        });

        // Add geolocation button
        this.addGeolocationButton();
        
        // Add loading state
        this.addLoadingState();
        
        // Initialize with default location
        this.getWeatherData("London");
    }

    addGeolocationButton() {
        const searchContainer = document.querySelector('.search_icon');
        const geolocationBtn = document.createElement('button');
        geolocationBtn.className = 'button_icon geolocation-btn';
        geolocationBtn.innerHTML = '<i class="bi bi-geo-alt-fill"></i>';
        geolocationBtn.title = 'Get current location';
        geolocationBtn.onclick = () => this.getCurrentLocation();
        searchContainer.appendChild(geolocationBtn);
    }

    addLoadingState() {
        const searchBtn = document.querySelector('.button_icon');
        searchBtn.innerHTML = '<i class="bi bi-search"></i>';
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError("Geolocation is not supported by this browser.");
            return;
        }

        this.showLoading(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherData(`${latitude},${longitude}`);
            },
            (error) => {
                this.showError("Unable to retrieve your location. Please search manually.");
                this.showLoading(false);
            }
        );
    }

    async getWeatherData(location = null) {
        if (this.isLoading) return;
        
        const inputVal = location || document.getElementById("searchTxt").value.trim();
        
        if (!inputVal) {
            this.showError("Please enter a location.");
            return;
        }

        this.isLoading = true;
        this.showLoading(true);

        try {
            // Get current weather
            const currentWeather = await this.fetchWeatherData(`/current.json?q=${encodeURIComponent(inputVal)}`);
            
            // Get forecast
            const forecast = await this.fetchWeatherData(`/forecast.json?q=${encodeURIComponent(inputVal)}&days=5`);
            
            this.displayCurrentWeather(currentWeather);
            this.displayForecast(forecast.forecast.forecastday);
            
            this.currentLocation = inputVal;
            this.showError(""); // Clear any previous errors
            
        } catch (error) {
            console.error("Weather fetch error:", error);
            this.showError("Failed to fetch weather data. Please check the location and try again.");
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    async fetchWeatherData(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": "weatherapi-com.p.rapidapi.com",
                "x-rapidapi-key": this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    displayCurrentWeather(data) {
        // Update location info
        document.getElementById("location").textContent = data.location.name;
        document.getElementById("locationParts").innerHTML = 
            `<i class='bi bi-geo-alt'></i> ${data.location.region}, ${data.location.country}`;
        
        // Update date and time
        const localTime = new Date(data.location.localtime);
        document.getElementById("dateTime").innerHTML = 
            `<i class='bi bi-calendar'></i> ${localTime.toLocaleDateString()}`;
        document.getElementById("weekDay").textContent = localTime.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Update weather info
        document.getElementById("txtWord").textContent = data.current.condition.text;
        document.getElementById("humidity").textContent = `Humidity: ${data.current.humidity}%`;
        document.getElementById("precipitation").textContent = `Precipitation: ${data.current.precip_mm}mm`;
        document.getElementById("wind").textContent = `Wind: ${data.current.wind_kph} km/h`;
        
        // Update temperatures
        document.getElementById("temperatureC").textContent = `${Math.round(data.current.temp_c)}°C`;
        document.getElementById("temperatureF").textContent = `${Math.round(data.current.temp_f)}°F`;
        
        // Update weather icon
        document.getElementById("weatherIcon").src = `https:${data.current.condition.icon}`;
        
        // Add additional weather details
        this.addWeatherDetails(data.current);
    }

    addWeatherDetails(current) {
        // Create additional details section if it doesn't exist
        let detailsSection = document.getElementById("weatherDetails");
        if (!detailsSection) {
            detailsSection = document.createElement("div");
            detailsSection.id = "weatherDetails";
            detailsSection.className = "weather-details";
            document.querySelector(".weather").appendChild(detailsSection);
        }

        detailsSection.innerHTML = `
            <div class="detail-item">
                <i class="bi bi-eye"></i>
                <span>Visibility: ${current.vis_km} km</span>
            </div>
            <div class="detail-item">
                <i class="bi bi-thermometer"></i>
                <span>Feels like: ${Math.round(current.feelslike_c)}°C</span>
            </div>
            <div class="detail-item">
                <i class="bi bi-speedometer2"></i>
                <span>Pressure: ${current.pressure_mb} mb</span>
            </div>
            <div class="detail-item">
                <i class="bi bi-sun"></i>
                <span>UV Index: ${current.uv}</span>
            </div>
        `;
    }

    displayForecast(forecastDays) {
        // Create forecast section if it doesn't exist
        let forecastSection = document.getElementById("forecastSection");
        if (!forecastSection) {
            forecastSection = document.createElement("div");
            forecastSection.id = "forecastSection";
            forecastSection.className = "forecast-section";
            document.querySelector(".container").appendChild(forecastSection);
        }

        forecastSection.innerHTML = `
            <div class="card-box forecast-card">
                <h3 class="forecast-title">5-Day Forecast</h3>
                <div class="forecast-grid">
                    ${forecastDays.map(day => `
                        <div class="forecast-item">
                            <div class="forecast-date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" class="forecast-icon">
                            <div class="forecast-temps">
                                <span class="forecast-high">${Math.round(day.day.maxtemp_c)}°</span>
                                <span class="forecast-low">${Math.round(day.day.mintemp_c)}°</span>
                            </div>
                            <div class="forecast-desc">${day.day.condition.text}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showLoading(show) {
        const searchBtn = document.querySelector('.button_icon');
        if (show) {
            searchBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
            searchBtn.disabled = true;
        } else {
            searchBtn.innerHTML = '<i class="bi bi-search"></i>';
            searchBtn.disabled = false;
        }
    }

    showError(message) {
        let errorDiv = document.getElementById("errorMessage");
        if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.id = "errorMessage";
            errorDiv.className = "error-message";
            document.querySelector(".container").insertBefore(errorDiv, document.querySelector(".card-box"));
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = message ? "block" : "none";
    }
}

// Temperature unit toggle function
function updateTemperatureUnits() {
    const isCelsius = document.getElementById("unitToggle").checked;
    const temperatureCelsiusElement = document.getElementById("temperatureC");
    const temperatureFahrenheitElement = document.getElementById("temperatureF");

    if (isCelsius) {
        temperatureCelsiusElement.style.display = "inline";
        temperatureFahrenheitElement.style.display = "none";
    } else {
        temperatureCelsiusElement.style.display = "none";
        temperatureFahrenheitElement.style.display = "inline";
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Legacy function for backward compatibility
function getdata() {
    if (window.weatherApp) {
        window.weatherApp.getWeatherData();
    }
}