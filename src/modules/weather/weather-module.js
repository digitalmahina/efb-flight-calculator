/**
 * WEATHER MODULE - Единый модуль погоды
 * Консолидирует ВСЕ погодные функции в одном месте
 * Версия: 3.0.0 (Consolidated)
 */

import EventBus from '../../shared/event-bus.js';
import Utils from '../../shared/utils.js';
import CONSTANTS from '../../shared/constants.js';

class WeatherModule {
    constructor() {
        this.weatherCache = new Map();
        this.calculationCache = new Map();
        this.mcpClient = null;
        this.cacheTimeout = 300000; // 5 минут
        this.isInitialized = false;
        
        this.setupEventListeners();
        this.initializeConstants();
    }

    // ========================================
    // ИНИЦИАЛИЗАЦИЯ И КОНСТАНТЫ
    // ========================================
    
    initializeConstants() {
        this.constants = {
            // Физические константы
            EARTH_RADIUS: 6371, // км
            STANDARD_TEMPERATURE: 15, // °C
            STANDARD_PRESSURE: 1013.25, // hPa
            
            // Коэффициенты влияния погоды
            WIND_IMPACT: {
                LIGHT: 0.02,      // 2% влияние при слабом ветре
                MODERATE: 0.05,   // 5% влияние при умеренном ветре
                STRONG: 0.10,     // 10% влияние при сильном ветре
                SEVERE: 0.20      // 20% влияние при очень сильном ветре
            },
            
            TEMPERATURE_IMPACT: {
                COLD: 0.03,       // 3% увеличение расхода при низкой температуре
                HOT: 0.05,        // 5% увеличение расхода при высокой температуре
                EXTREME: 0.10     // 10% увеличение при экстремальных температурах
            }
        };
    }

    setupEventListeners() {
        EventBus.on('current-weather-updated', (data) => {
            console.log('WeatherModule: Weather data updated, clearing cache');
            this.clearCache();
        });

        EventBus.on('weather-error', (data) => {
            console.warn('WeatherModule: Weather error received:', data);
        });

        EventBus.on('route-loaded', (data) => {
            console.log('WeatherModule: Route loaded, clearing cache');
            this.clearCache();
        });
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('WeatherModule: Initializing...');
        try {
            this.isInitialized = true;
            console.log('WeatherModule: Initialized successfully');
            EventBus.emit('weather-module-ready');
        } catch (error) {
            console.error('WeatherModule: Initialization failed:', error);
            EventBus.emit('weather-module-error', { error: error.message });
        }
    }

    // ========================================
    // РАСЧЕТЫ С ПОГОДОЙ
    // ========================================
    
    async calculateRouteWithWeather(waypoints, flightParams, options = {}) {
        const cacheKey = this.generateCacheKey(waypoints, flightParams, options);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('WeatherModule: Using cached results');
            return cached;
        }

        const startTime = Date.now();
        const results = {
            totalDistance: 0,
            totalTime: 0,
            totalFuel: 0,
            segments: [],
            weatherImpact: {
                windImpact: 0,
                temperatureImpact: 0,
                pressureImpact: 0,
                visibilityImpact: 0,
                overallImpact: 0
            },
            statistics: {
                weatherRating: 'UNKNOWN',
                riskLevel: 'UNKNOWN',
                averageGroundSpeed: flightParams.cruiseSpeed,
                fuelEfficiency: flightParams.fuelFlow / flightParams.cruiseSpeed
            },
            timestamp: new Date().toISOString(),
            calculationTime: 0
        };

        if (waypoints.length < 2) {
            throw new Error('Route must have at least 2 waypoints for weather calculations.');
        }

        try {
            // Получаем погодные данные для маршрута
            const routeWeather = await this.getRouteWeather(waypoints, options);

            let cumulativeDistance = 0;
            let cumulativeTime = 0;
            let cumulativeFuel = 0;

            for (let i = 1; i < waypoints.length; i++) {
                const startPoint = waypoints[i - 1];
                const endPoint = waypoints[i];
                const startWeather = routeWeather[i - 1]?.weather;
                const endWeather = routeWeather[i]?.weather;

                const segment = this.calculateSegmentWithWeather(
                    startPoint, endPoint, startWeather, endWeather, flightParams, options
                );

                cumulativeDistance += segment.distance;
                cumulativeTime += segment.time;
                cumulativeFuel += segment.fuel;

                results.segments.push({
                    ...segment,
                    cumulativeDistance,
                    cumulativeTime,
                    cumulativeFuel
                });
                results.totalDistance += segment.distance;
                results.totalTime += segment.time;
                results.totalFuel += segment.fuel;
            }

            this.updateOverallImpact(results);
            this.updateStatistics(results);

        } catch (error) {
            console.error('WeatherModule: Error during route calculation with weather:', error);
            EventBus.emit('weather-calculations-error', { error: error.message, waypoints, flightParams });
            throw error;
        }

        results.calculationTime = Date.now() - startTime;
        this.setCache(cacheKey, results);
        EventBus.emit('weather-calculations-complete', results);
        return results;
    }

    calculateSegmentWithWeather(startPoint, endPoint, startWeather, endWeather, flightParams, options) {
        const distance = Utils.calculateDistance(startPoint.lat, startPoint.lon, endPoint.lat, endPoint.lon);
        const course = Utils.calculateBearing(startPoint.lat, startPoint.lon, endPoint.lat, endPoint.lon);

        let effectiveSpeed = flightParams.cruiseSpeed;
        let fuelFlow = flightParams.fuelFlow;
        let segmentWeatherImpact = { wind: 0, temp: 0, pressure: 0, visibility: 0 };

        if (startWeather && endWeather) {
            // Усредняем погодные условия для сегмента
            const avgWindSpeed = (startWeather.wind.speed + endWeather.wind.speed) / 2;
            const avgWindDirection = (startWeather.wind.direction + endWeather.wind.direction) / 2;
            const avgTemperature = (startWeather.temperature + endWeather.temperature) / 2;
            const avgPressure = (startWeather.pressure + endWeather.pressure) / 2;
            const avgVisibility = (startWeather.visibility + endWeather.visibility) / 2;

            // Влияние ветра
            if (options.includeWind !== false) {
                const windEffect = this.calculateWindEffect(flightParams.cruiseSpeed, avgWindSpeed, avgWindDirection, course);
                effectiveSpeed = windEffect.effectiveSpeed;
                segmentWeatherImpact.wind = (flightParams.cruiseSpeed - effectiveSpeed) / flightParams.cruiseSpeed;
            }

            // Влияние температуры на расход топлива
            if (options.includeTemperature !== false) {
                const tempImpactFactor = this.calculateTemperatureImpact(avgTemperature);
                fuelFlow *= (1 + tempImpactFactor);
                segmentWeatherImpact.temp = tempImpactFactor;
            }

            // Влияние давления
            if (options.includePressure !== false) {
                const pressureImpactFactor = this.calculatePressureImpact(avgPressure);
                fuelFlow *= (1 + pressureImpactFactor);
                segmentWeatherImpact.pressure = pressureImpactFactor;
            }

            // Влияние видимости
            if (options.includeVisibility !== false && avgVisibility < CONSTANTS.WEATHER.POOR_VISIBILITY_THRESHOLD) {
                effectiveSpeed *= CONSTANTS.WEATHER.POOR_VISIBILITY_SPEED_FACTOR;
                segmentWeatherImpact.visibility = (1 - CONSTANTS.WEATHER.POOR_VISIBILITY_SPEED_FACTOR);
            }
        }

        const time = distance / effectiveSpeed;
        const fuel = time * fuelFlow;

        return {
            startPoint,
            endPoint,
            distance,
            time,
            fuel,
            course,
            effectiveSpeed,
            fuelFlow,
            weather: { start: startWeather, end: endWeather },
            weatherImpact: segmentWeatherImpact
        };
    }

    // ========================================
    // MCP ИНТЕГРАЦИЯ
    // ========================================
    
    async getRouteWeather(waypoints, options = {}) {
        const batchSize = options.batchSize || 5;
        const allWeatherData = [];
        
        for (let i = 0; i < waypoints.length; i += batchSize) {
            const batch = waypoints.slice(i, i + batchSize);
            const batchPromises = batch.map(wp => this.getCurrentWeather({ lat: wp.lat, lon: wp.lon }, options));
            const batchResults = await Promise.allSettled(batchPromises);

            batchResults.forEach((res, index) => {
                if (res.status === 'fulfilled') {
                    allWeatherData.push({ waypoint: batch[index], weather: res.value });
                } else {
                    console.warn('WeatherModule: Failed to get weather for waypoint:', batch[index].name, res.reason);
                    allWeatherData.push({ waypoint: batch[index], weather: null, error: res.reason });
                }
            });
        }
        
        EventBus.emit('route-weather-loaded', allWeatherData);
        return allWeatherData;
    }

    async getCurrentWeather(coordinates, options = {}) {
        const cacheKey = this.generateCacheKey('get_current_weather', coordinates);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('WeatherModule: Using cached current weather for', coordinates);
            return cached;
        }

        try {
            // Пытаемся вызвать реальный MCP инструмент, если клиент доступен
            let rawWeather;
            if (this.mcpClient && typeof this.mcpClient.callTool === 'function') {
                try {
                    const mcpResult = await this.mcpClient.callTool('get_current_weather', {
                        lat: coordinates.lat,
                        lon: coordinates.lon,
                        icao: options.icao
                    });
                    rawWeather = this.extractWeatherFromMcp(mcpResult);
                } catch (mcpError) {
                    console.warn('WeatherModule: MCP get_current_weather failed, falling back to simulation:', mcpError);
                    rawWeather = await this.getSimulatedWeather(coordinates);
                }
            } else {
                // Fallback на симуляцию, если MCP клиент не проброшен
                rawWeather = await this.getSimulatedWeather(coordinates);
            }

            const processedData = this.processAviationWeather(rawWeather);
            this.setCache(cacheKey, processedData);
            EventBus.emit('current-weather-updated', processedData);
            return processedData;
        } catch (error) {
            console.error('WeatherModule: Error getting current weather:', error);
            EventBus.emit('weather-error', { type: 'current_weather', error: error.message, coordinates });
            throw error;
        }
    }

    extractWeatherFromMcp(mcpResult) {
        try {
            if (!mcpResult) return null;

            // Формат content/text
            if (mcpResult.content && Array.isArray(mcpResult.content) && mcpResult.content.length > 0) {
                const first = mcpResult.content[0];
                if (first && typeof first.text === 'string') {
                    const parsed = JSON.parse(first.text);
                    // Если JSON содержит поле 'current', используем его
                    if (parsed.current && typeof parsed.current === "object") {
                        console.log("WeatherModule: Extracting weather data from MCP content/text current field");
                        return parsed.current;
                    }
                    return parsed;
                }
            }

            // Формат MCP клиента: { current: { temperature, wind, ... } }
            if (mcpResult.current && typeof mcpResult.current === "object") {
                console.log("WeatherModule: Extracting weather data from MCP current field");
                return mcpResult.current;
            }

            // Если это уже объект с нужными полями
            if (typeof mcpResult === 'object') {
                return mcpResult;
            }
        } catch (e) {
            console.warn('WeatherModule: Failed to parse MCP weather result, using simulation:', e);
        }
        return null;
    }

    // ========================================
    // UI ИНТЕГРАЦИЯ
    // ========================================
    
    updateWeatherUI(weatherData) {
        // Обновление UI элементов
        const elements = {
            weatherUpdateTime: document.getElementById('weatherUpdateTime'),
            currentTemp: document.getElementById('currentTemp'),
            weatherIcon: document.getElementById('weatherIcon'),
            windSpeed: document.getElementById('windSpeed'),
            visibility: document.getElementById('visibility'),
            cloudBase: document.getElementById('cloudBase'),
            flightRating: document.getElementById('flightRating'),
            riskLevel: document.getElementById('riskLevel')
        };

        if (weatherData) {
            if (elements.weatherUpdateTime) {
                elements.weatherUpdateTime.textContent = Utils.formatTime(new Date().getHours() + new Date().getMinutes() / 60);
            }
            if (elements.currentTemp) {
                elements.currentTemp.textContent = weatherData.temperature?.toFixed(0) || '--';
            }
            if (elements.weatherIcon) {
                elements.weatherIcon.textContent = this.getWeatherIcon(weatherData.conditions);
            }
            if (elements.windSpeed) {
                elements.windSpeed.textContent = weatherData.windSpeedKts || '--';
            }
            if (elements.visibility) {
                elements.visibility.textContent = weatherData.visibilitySm || '--';
            }
            if (elements.cloudBase) {
                elements.cloudBase.textContent = weatherData.cloudBaseFt || '--';
            }
        }
    }

    // ========================================
    // УТИЛИТЫ И ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ========================================
    
    calculateWindEffect(groundSpeed, windSpeed, windDirection, course) {
        const windAngleRad = Utils.toRadians(Math.abs(windDirection - course));
        const headwind = windSpeed * Math.cos(windAngleRad);
        const crosswind = windSpeed * Math.sin(windAngleRad);
        
        return {
            effectiveSpeed: groundSpeed - headwind,
            crosswind: crosswind,
            headwind: headwind
        };
    }

    calculateTemperatureImpact(temperatureC) {
        if (temperatureC > 30) return 0.05; // +5% топлива
        if (temperatureC > 20) return 0.02; // +2% топлива
        if (temperatureC < 0) return -0.01; // -1% топлива (лучшая эффективность)
        return 0;
    }

    calculatePressureImpact(pressureHPa) {
        if (pressureHPa < 980) return 0.03; // +3% топлива
        if (pressureHPa < 1000) return 0.01; // +1% топлива
        return 0;
    }

    async getSimulatedWeather(coordinates) {
        return {
            temperature: 15 + Math.random() * 20 - 10, // -5°C to 25°C
            pressure: 1000 + Math.random() * 40 - 20, // 980-1020 hPa
            wind: {
                speed: Math.random() * 15, // 0-15 m/s
                direction: Math.random() * 360 // 0-360°
            },
            visibility: 5000 + Math.random() * 10000, // 5-15 km
            conditions: ['clear', 'partly_cloudy', 'cloudy', 'overcast'][Math.floor(Math.random() * 4)],
            timestamp: new Date().toISOString()
        };
    }

    processAviationWeather(weatherData) {
        // Проверяем, что данные погоды не null/undefined
        if (!weatherData || !weatherData.wind) {
            console.log("WeatherModule: processAviationWeather - weatherData is null or missing wind data");
            return {
                temperature: null,
                pressure: null,
                wind: { speed: null, direction: null },
                visibility: null,
                clouds: { base: null },
                conditions: "unknown",
                windSpeedKts: "N/A",
                visibilitySm: "N/A",
                cloudBaseFt: "N/A",
                flightRating: "UNKNOWN",
                riskLevel: "UNKNOWN"
            };
        }
        
        const windSpeedKts = weatherData.wind.speed * 1.94384; // m/s to knots
        const visibilitySm = weatherData.visibility / 1609.34; // meters to statute miles
        const cloudBaseFt = (weatherData.clouds?.base || 1000) * 3.28084; // meters to feet

        let flightRating = 'GOOD';
        let riskLevel = 'LOW';

        if (visibilitySm < 3 || windSpeedKts > 25 || cloudBaseFt < 1000) {
            flightRating = 'MODERATE';
            riskLevel = 'MODERATE';
        }
        if (visibilitySm < 1 || windSpeedKts > 35 || cloudBaseFt < 500) {
            flightRating = 'POOR';
            riskLevel = 'HIGH';
        }

        return {
            ...weatherData,
            windSpeedKts: windSpeedKts.toFixed(1),
            visibilitySm: visibilitySm.toFixed(1),
            cloudBaseFt: cloudBaseFt.toFixed(0),
            flightRating,
            riskLevel
        };
    }

    getWeatherIcon(conditions) {
        switch (conditions) {
            case 'clear': return '☀️';
            case 'partly_cloudy': return '🌤️';
            case 'cloudy': return '☁️';
            case 'overcast': return '☁️';
            case 'rain': return '🌧️';
            case 'snow': return '❄️';
            case 'thunderstorm': return '⛈️';
            case 'fog': return '🌫️';
            default: return '☁️';
        }
    }

    updateOverallImpact(results) {
        let totalWindImpact = 0;
        let totalTempImpact = 0;
        let totalPressureImpact = 0;
        let totalVisibilityImpact = 0;

        results.segments.forEach(segment => {
            totalWindImpact += segment.weatherImpact.wind;
            totalTempImpact += segment.weatherImpact.temp;
            totalPressureImpact += segment.weatherImpact.pressure;
            totalVisibilityImpact += segment.weatherImpact.visibility;
        });

        results.weatherImpact.windImpact = totalWindImpact / results.segments.length;
        results.weatherImpact.temperatureImpact = totalTempImpact / results.segments.length;
        results.weatherImpact.pressureImpact = totalPressureImpact / results.segments.length;
        results.weatherImpact.visibilityImpact = totalVisibilityImpact / results.segments.length;
        results.weatherImpact.overallImpact = 
            (results.weatherImpact.windImpact + 
             results.weatherImpact.temperatureImpact + 
             results.weatherImpact.pressureImpact + 
             results.weatherImpact.visibilityImpact) / 4;
    }

    updateStatistics(results) {
        const overallImpact = results.weatherImpact.overallImpact;
        if (overallImpact > 0.1) {
            results.statistics.weatherRating = 'POOR';
            results.statistics.riskLevel = 'HIGH';
        } else if (overallImpact > 0.05) {
            results.statistics.weatherRating = 'MODERATE';
            results.statistics.riskLevel = 'MODERATE';
        } else if (overallImpact < -0.02) {
            results.statistics.weatherRating = 'EXCELLENT';
            results.statistics.riskLevel = 'LOW';
        } else {
            results.statistics.weatherRating = 'GOOD';
            results.statistics.riskLevel = 'LOW';
        }

        results.statistics.averageGroundSpeed = results.totalDistance / results.totalTime;
        results.statistics.fuelEfficiency = results.totalFuel / results.totalDistance;
    }

    // ========================================
    // КЭШИРОВАНИЕ
    // ========================================
    
    generateCacheKey(...args) {
        return args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join('_');
    }

    getFromCache(key) {
        if (this.calculationCache.has(key)) {
            const cached = this.calculationCache.get(key);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            } else {
                this.calculationCache.delete(key);
            }
        }
        return null;
    }

    setCache(key, data) {
        this.calculationCache.set(key, { data, timestamp: Date.now() });
    }

    clearCache() {
        this.calculationCache.clear();
        this.weatherCache.clear();
        console.log('WeatherModule: Cache cleared');
    }

    // ========================================
    // ПУБЛИЧНЫЙ API
    // ========================================
    
    getStats() {
        return {
            cacheSize: this.calculationCache.size,
            weatherCacheSize: this.weatherCache.size,
            cacheTimeout: this.cacheTimeout,
            isInitialized: this.isInitialized
        };
    }

    destroy() {
        this.clearCache();
        EventBus.off('current-weather-updated');
        EventBus.off('weather-error');
        EventBus.off('route-loaded');
        console.log('WeatherModule: Destroyed');
    }
}

// Создаем и экспортируем singleton
const weatherModule = new WeatherModule();
export default weatherModule;
