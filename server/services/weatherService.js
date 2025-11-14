const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  hasValidKey() {
    // OpenWeather keys are typically 32+ chars; treat short keys as invalid
    return typeof this.apiKey === 'string' && this.apiKey.trim().length >= 32;
  }

  async getCurrentWeather(location) {
    if (!this.hasValidKey()) {
      return this.getMockWeatherData();
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatWeatherData(response.data);
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Weather API unauthorized/forbidden. Falling back to mock weather.');
        }
        return this.getMockWeatherData();
      }
      console.warn('Weather API error. Using mock weather.');
      return this.getMockWeatherData();
    }
  }

  async getWeatherForecast(location, days = 5) {
    if (!this.hasValidKey()) {
      return this.getMockForecastData();
    }

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
          cnt: days * 8 // 8 forecasts per day (3-hour intervals)
        }
      });

      return this.formatForecastData(response.data);
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Weather Forecast unauthorized/forbidden. Falling back to mock forecast.');
        }
        return this.getMockForecastData();
      }
      console.warn('Weather Forecast error. Using mock forecast.');
      return this.getMockForecastData();
    }
  }

  formatWeatherData(data) {
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      cloudiness: data.clouds.all,
      rainfall: data.rain ? data.rain['1h'] || 0 : 0,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    };
  }

  formatForecastData(data) {
    return {
      location: data.city.name,
      forecast: data.list.map(item => ({
        date: new Date(item.dt * 1000).toISOString(),
        temperature: {
          min: item.main.temp_min,
          max: item.main.temp_max,
          current: item.main.temp
        },
        humidity: item.main.humidity,
        rainfall: item.rain ? item.rain['3h'] || 0 : 0,
        description: item.weather[0].description,
        windSpeed: item.wind.speed
      }))
    };
  }

  getMockWeatherData() {
    return {
      temperature: 28,
      humidity: 65,
      pressure: 1013,
      windSpeed: 5.2,
      description: 'partly cloudy',
      cloudiness: 40,
      rainfall: 0,
      coordinates: {
        lat: 28.6139,
        lon: 77.2090
      }
    };
  }

  getMockForecastData() {
    const forecast = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      forecast.push({
        date: date.toISOString(),
        temperature: {
          min: 22 + Math.random() * 5,
          max: 32 + Math.random() * 5,
          current: 27 + Math.random() * 8
        },
        humidity: 60 + Math.random() * 20,
        rainfall: Math.random() < 0.3 ? Math.random() * 10 : 0,
        description: ['sunny', 'partly cloudy', 'cloudy', 'light rain'][Math.floor(Math.random() * 4)],
        windSpeed: 3 + Math.random() * 5
      });
    }

    return {
      location: 'Sample Location',
      forecast
    };
  }
}

module.exports = new WeatherService();