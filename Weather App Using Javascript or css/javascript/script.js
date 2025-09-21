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
        
        // Add new features
        this.addFavoritesSystem();
        this.addWeatherMap();
        
        // Initialize with default location
        this.getWeatherData("London");
        
        // Make app globally accessible
        window.weatherApp = this;
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
        
        // Add weather alerts
        this.displayWeatherAlerts(data.current);
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

    displayWeatherAlerts(current) {
        // Create alerts section if it doesn't exist
        let alertsSection = document.getElementById("weatherAlerts");
        if (!alertsSection) {
            alertsSection = document.createElement("div");
            alertsSection.id = "weatherAlerts";
            alertsSection.className = "weather-alerts";
            document.querySelector(".weather").appendChild(alertsSection);
        }

        const alerts = this.generateWeatherAlerts(current);
        
        if (alerts.length > 0) {
            alertsSection.innerHTML = `
                <div class="alerts-header">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>Weather Alerts</span>
                </div>
                <div class="alerts-list">
                    ${alerts.map(alert => `
                        <div class="alert-item ${alert.severity}">
                            <i class="bi ${alert.icon}"></i>
                            <span>${alert.message}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            alertsSection.innerHTML = '';
        }
    }

    generateWeatherAlerts(current) {
        const alerts = [];
        
        // High wind alert
        if (current.wind_kph > 50) {
            alerts.push({
                severity: 'high',
                icon: 'bi-wind',
                message: `High wind warning: ${current.wind_kph} km/h winds`
            });
        }
        
        // High UV alert
        if (current.uv > 8) {
            alerts.push({
                severity: 'high',
                icon: 'bi-sun',
                message: `High UV warning: UV index ${current.uv} - Stay protected!`
            });
        }
        
        // Heat alert
        if (current.temp_c > 35) {
            alerts.push({
                severity: 'high',
                icon: 'bi-thermometer-high',
                message: `Heat warning: ${Math.round(current.temp_c)}°C - Stay hydrated!`
            });
        }
        
        // Cold alert
        if (current.temp_c < 0) {
            alerts.push({
                severity: 'medium',
                icon: 'bi-thermometer-low',
                message: `Cold warning: ${Math.round(current.temp_c)}°C - Dress warmly!`
            });
        }
        
        // High humidity alert
        if (current.humidity > 80) {
            alerts.push({
                severity: 'medium',
                icon: 'bi-droplet',
                message: `High humidity: ${current.humidity}% - Very muggy conditions`
            });
        }
        
        // Precipitation alert
        if (current.precip_mm > 10) {
            alerts.push({
                severity: 'medium',
                icon: 'bi-cloud-rain',
                message: `Heavy precipitation: ${current.precip_mm}mm - Expect wet conditions`
            });
        }
        
        return alerts;
    }

    addWeatherMap() {
        // Create weather map section
        let mapSection = document.getElementById("weatherMapSection");
        if (!mapSection) {
            mapSection = document.createElement("div");
            mapSection.id = "weatherMapSection";
            mapSection.className = "weather-map-section";
            document.querySelector(".container").appendChild(mapSection);
        }

        mapSection.innerHTML = `
            <div class="card-box map-card">
                <h3 class="map-title">
                    <i class="bi bi-map"></i>
                    Interactive Weather Map
                </h3>
                <div class="map-container">
                    <div class="map-placeholder">
                        <i class="bi bi-globe"></i>
                        <p>Weather Map Integration</p>
                        <small>Interactive map showing current weather conditions</small>
                        <button class="map-btn" onclick="this.openWeatherMap()">
                            <i class="bi bi-box-arrow-up-right"></i>
                            Open Full Map
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    openWeatherMap() {
        const location = this.currentLocation || 'London';
        const mapUrl = `https://www.google.com/maps/search/weather+${encodeURIComponent(location)}`;
        window.open(mapUrl, '_blank');
    }

    addFavoritesSystem() {
        // Add favorites button to search area
        const searchContainer = document.querySelector('.search_icon');
        const favoritesBtn = document.createElement('button');
        favoritesBtn.className = 'button_icon favorites-btn';
        favoritesBtn.innerHTML = '<i class="bi bi-heart"></i>';
        favoritesBtn.title = 'Favorite locations';
        favoritesBtn.onclick = () => this.toggleFavoritesPanel();
        searchContainer.appendChild(favoritesBtn);

        // Add current location to favorites button
        const addToFavoritesBtn = document.createElement('button');
        addToFavoritesBtn.className = 'button_icon add-favorite-btn';
        addToFavoritesBtn.innerHTML = '<i class="bi bi-heart-fill"></i>';
        addToFavoritesBtn.title = 'Add to favorites';
        addToFavoritesBtn.onclick = () => this.addToFavorites();
        searchContainer.appendChild(addToFavoritesBtn);
    }

    addToFavorites() {
        if (!this.currentLocation) return;
        
        const favorites = this.getFavorites();
        if (!favorites.includes(this.currentLocation)) {
            favorites.push(this.currentLocation);
            localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
            this.showNotification('Added to favorites!', 'success');
        } else {
            this.showNotification('Already in favorites!', 'info');
        }
    }

    getFavorites() {
        const stored = localStorage.getItem('weatherFavorites');
        return stored ? JSON.parse(stored) : [];
    }

    toggleFavoritesPanel() {
        let panel = document.getElementById("favoritesPanel");
        if (!panel) {
            panel = document.createElement("div");
            panel.id = "favoritesPanel";
            panel.className = "favorites-panel";
            document.querySelector(".container").appendChild(panel);
        }

        const favorites = this.getFavorites();
        
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            panel.innerHTML = `
                <div class="favorites-header">
                    <h4><i class="bi bi-heart-fill"></i> Favorite Locations</h4>
                    <button class="close-btn" onclick="this.parentElement.parentElement.style.display='none'">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="favorites-list">
                    ${favorites.length > 0 ? 
                        favorites.map(fav => `
                            <div class="favorite-item" onclick="window.weatherApp.getWeatherData('${fav}'); this.parentElement.parentElement.style.display='none'">
                                <i class="bi bi-geo-alt"></i>
                                <span>${fav}</span>
                                <button class="remove-fav" onclick="event.stopPropagation(); window.weatherApp.removeFavorite('${fav}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        `).join('') :
                        '<div class="no-favorites">No favorite locations yet</div>'
                    }
                </div>
            `;
            panel.style.display = 'block';
        }
    }

    removeFavorite(location) {
        const favorites = this.getFavorites();
        const updated = favorites.filter(fav => fav !== location);
        localStorage.setItem('weatherFavorites', JSON.stringify(updated));
        this.toggleFavoritesPanel(); // Refresh panel
        this.showNotification('Removed from favorites!', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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