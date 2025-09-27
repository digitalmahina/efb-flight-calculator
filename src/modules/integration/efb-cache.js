// EFB Cache System - Специализированные кэши для EFB данных
import SmartCache from './smart-cache.js';
import CacheDependencies from './cache-dependencies.js';
import PredictiveCache from './predictive-cache.js';
import CacheMetrics from './cache-metrics.js';
import EventBus from '../shared/event-bus.js';
import Utils from '../shared/utils.js';
import CONSTANTS from '../shared/constants.js';

/**
 * Специализированная система кэширования для EFB
 */
class EFBCache {
    constructor(options = {}) {
        // Основные кэши
        this.routeCache = new SmartCache({
            defaultTTL: 3600000, // 1 час
            maxSize: 100,
            ...options.routeCache
        });
        
        this.weatherCache = new SmartCache({
            defaultTTL: 300000, // 5 минут
            maxSize: 200,
            ...options.weatherCache
        });
        
        this.calculationCache = new SmartCache({
            defaultTTL: 1800000, // 30 минут
            maxSize: 500,
            ...options.calculationCache
        });
        
        this.mapCache = new SmartCache({
            defaultTTL: 86400000, // 24 часа
            maxSize: 1000,
            ...options.mapCache
        });
        
        this.mcpCache = new SmartCache({
            defaultTTL: 600000, // 10 минут
            maxSize: 300,
            ...options.mcpCache
        });
        
        // Системы управления
        this.dependencies = CacheDependencies;
        this.predictive = PredictiveCache;
        this.metrics = CacheMetrics;
        
        // Конфигурация
        this.config = {
            enableRouteCaching: options.enableRouteCaching !== false,
            enableWeatherCaching: options.enableWeatherCaching !== false,
            enableCalculationCaching: options.enableCalculationCaching !== false,
            enableMapCaching: options.enableMapCaching !== false,
            enableMCPCaching: options.enableMCPCaching !== false,
            enablePredictiveCaching: options.enablePredictiveCaching !== false,
            ...options
        };
        
        // Подписываемся на события
        this.setupEventListeners();
        
        console.log('EFB Cache system initialized');
    }
    
    /**
     * Настройка слушателей событий
     */
    setupEventListeners() {
        if (window.EventBus) {
            // События маршрута
            window.EventBus.on(CONSTANTS.EVENTS.ROUTE_LOADED, (data) => {
                this.handleRouteLoaded(data);
            });
            
            window.EventBus.on(CONSTANTS.EVENTS.ROUTE_CLEARED, () => {
                this.handleRouteCleared();
            });
            
            // События расчетов
            window.EventBus.on(CONSTANTS.EVENTS.CALCULATION_COMPLETE, (data) => {
                this.handleCalculationComplete(data);
            });
            
            // События погоды
            window.EventBus.on('weather-data-received', (data) => {
                this.handleWeatherData(data);
            });
            
            // События MCP
            window.EventBus.on('mcp-tool-result', (data) => {
                this.handleMCPResult(data);
            });
        }
    }
    
    /**
     * Кэширование данных маршрута
     */
    cacheRoute(routeId, routeData) {
        if (!this.config.enableRouteCaching) return;
        
        const cacheKey = `route:${routeId}`;
        const cacheData = {
            id: routeId,
            waypoints: routeData.waypoints || [],
            distance: routeData.distance || 0,
            duration: routeData.duration || 0,
            fuel: routeData.fuel || 0,
            metadata: {
                createdAt: Date.now(),
                source: routeData.source || 'unknown',
                version: routeData.version || '1.0'
            }
        };
        
        this.routeCache.set(cacheKey, cacheData, {
            ttl: this.calculateRouteTTL(routeData),
            dependencies: ['route', 'waypoints'],
            priority: 3
        });
        
        // Кэшируем отдельные точки маршрута
        if (routeData.waypoints) {
            routeData.waypoints.forEach((waypoint, index) => {
                this.cacheWaypoint(routeId, index, waypoint);
            });
        }
        
        console.log(`Route cached: ${routeId}`);
    }
    
    /**
     * Кэширование точки маршрута
     */
    cacheWaypoint(routeId, index, waypoint) {
        const cacheKey = `waypoint:${routeId}:${index}`;
        const cacheData = {
            routeId,
            index,
            name: waypoint.name,
            lat: waypoint.lat,
            lon: waypoint.lon,
            elevation: waypoint.elevation || 0,
            metadata: {
                cachedAt: Date.now()
            }
        };
        
        this.routeCache.set(cacheKey, cacheData, {
            ttl: 3600000, // 1 час
            dependencies: ['route', 'waypoints'],
            priority: 2
        });
    }
    
    /**
     * Получение кэшированного маршрута
     */
    getRoute(routeId) {
        const cacheKey = `route:${routeId}`;
        return this.routeCache.get(cacheKey);
    }
    
    /**
     * Получение кэшированной точки маршрута
     */
    getWaypoint(routeId, index) {
        const cacheKey = `waypoint:${routeId}:${index}`;
        return this.routeCache.get(cacheKey);
    }
    
    /**
     * Кэширование погодных данных
     */
    cacheWeatherData(location, weatherData) {
        if (!this.config.enableWeatherCaching) return;
        
        const cacheKey = this.generateWeatherKey(location);
        const cacheData = {
            location,
            current: weatherData.current,
            forecast: weatherData.forecast,
            metar: weatherData.metar,
            taf: weatherData.taf,
            alerts: weatherData.alerts,
            metadata: {
                cachedAt: Date.now(),
                source: weatherData.source || 'unknown'
            }
        };
        
        this.weatherCache.set(cacheKey, cacheData, {
            ttl: this.calculateWeatherTTL(weatherData.type),
            dependencies: ['weather', 'location'],
            priority: 2
        });
        
        console.log(`Weather data cached for ${location.lat},${location.lon}`);
    }
    
    /**
     * Получение кэшированных погодных данных
     */
    getWeatherData(location) {
        const cacheKey = this.generateWeatherKey(location);
        return this.weatherCache.get(cacheKey);
    }
    
    /**
     * Кэширование результатов расчетов
     */
    cacheCalculation(calculationId, parameters, result) {
        if (!this.config.enableCalculationCaching) return;
        
        const cacheKey = this.generateCalculationKey(calculationId, parameters);
        const cacheData = {
            id: calculationId,
            parameters,
            result,
            metadata: {
                calculatedAt: Date.now(),
                version: '1.0'
            }
        };
        
        this.calculationCache.set(cacheKey, cacheData, {
            ttl: this.calculateCalculationTTL(calculationId),
            dependencies: this.getCalculationDependencies(calculationId, parameters),
            priority: 2
        });
        
        console.log(`Calculation cached: ${calculationId}`);
    }
    
    /**
     * Получение кэшированного результата расчета
     */
    getCalculation(calculationId, parameters) {
        const cacheKey = this.generateCalculationKey(calculationId, parameters);
        return this.calculationCache.get(cacheKey);
    }
    
    /**
     * Кэширование данных карты
     */
    cacheMapData(mapKey, mapData) {
        if (!this.config.enableMapCaching) return;
        
        const cacheData = {
            key: mapKey,
            tiles: mapData.tiles,
            bounds: mapData.bounds,
            zoom: mapData.zoom,
            metadata: {
                cachedAt: Date.now(),
                size: mapData.size || 0
            }
        };
        
        this.mapCache.set(mapKey, cacheData, {
            ttl: 86400000, // 24 часа
            dependencies: ['map', 'location'],
            priority: 1
        });
        
        console.log(`Map data cached: ${mapKey}`);
    }
    
    /**
     * Получение кэшированных данных карты
     */
    getMapData(mapKey) {
        return this.mapCache.get(mapKey);
    }
    
    /**
     * Кэширование результатов MCP
     */
    cacheMCPResult(toolName, parameters, result) {
        if (!this.config.enableMCPCaching) return;
        
        const cacheKey = this.generateMCPKey(toolName, parameters);
        const cacheData = {
            toolName,
            parameters,
            result,
            metadata: {
                cachedAt: Date.now(),
                source: 'mcp'
            }
        };
        
        this.mcpCache.set(cacheKey, cacheData, {
            ttl: this.calculateMCPTTL(toolName),
            dependencies: this.getMCPDependencies(toolName, parameters),
            priority: 2
        });
        
        console.log(`MCP result cached: ${toolName}`);
    }
    
    /**
     * Получение кэшированного результата MCP
     */
    getMCPResult(toolName, parameters) {
        const cacheKey = this.generateMCPKey(toolName, parameters);
        return this.mcpCache.get(cacheKey);
    }
    
    /**
     * Обработка загрузки маршрута
     */
    handleRouteLoaded(routeData) {
        if (routeData && routeData.id) {
            this.cacheRoute(routeData.id, routeData);
        }
    }
    
    /**
     * Обработка очистки маршрута
     */
    handleRouteCleared() {
        // Инвалидируем все данные маршрута
        this.routeCache.invalidatePattern('route:.*');
        this.routeCache.invalidatePattern('waypoint:.*');
        
        console.log('Route cache cleared');
    }
    
    /**
     * Обработка завершения расчетов
     */
    handleCalculationComplete(calculationData) {
        if (calculationData && calculationData.id) {
            this.cacheCalculation(
                calculationData.id,
                calculationData.parameters,
                calculationData.result
            );
        }
    }
    
    /**
     * Обработка погодных данных
     */
    handleWeatherData(weatherData) {
        if (weatherData && weatherData.location) {
            this.cacheWeatherData(weatherData.location, weatherData);
        }
    }
    
    /**
     * Обработка результата MCP
     */
    handleMCPResult(mcpData) {
        if (mcpData && mcpData.toolName) {
            this.cacheMCPResult(
                mcpData.toolName,
                mcpData.parameters,
                mcpData.result
            );
        }
    }
    
    /**
     * Генерация ключа для погодных данных
     */
    generateWeatherKey(location) {
        const lat = Math.round(location.lat * 100) / 100; // Округляем до 2 знаков
        const lon = Math.round(location.lon * 100) / 100;
        return `weather:${lat}:${lon}`;
    }
    
    /**
     * Генерация ключа для расчетов
     */
    generateCalculationKey(calculationId, parameters) {
        const paramKey = Object.keys(parameters)
            .sort()
            .map(key => `${key}:${parameters[key]}`)
            .join('|');
        return `calculation:${calculationId}:${paramKey}`;
    }
    
    /**
     * Генерация ключа для MCP
     */
    generateMCPKey(toolName, parameters) {
        const paramKey = Object.keys(parameters)
            .sort()
            .map(key => `${key}:${parameters[key]}`)
            .join('|');
        return `mcp:${toolName}:${paramKey}`;
    }
    
    /**
     * Вычисление TTL для маршрута
     */
    calculateRouteTTL(routeData) {
        // Маршруты кэшируем на долго, так как они редко меняются
        return 3600000; // 1 час
    }
    
    /**
     * Вычисление TTL для погодных данных
     */
    calculateWeatherTTL(weatherType) {
        const ttlMap = {
            'current': 300000, // 5 минут
            'forecast': 1800000, // 30 минут
            'metar': 600000, // 10 минут
            'taf': 1800000, // 30 минут
            'alerts': 300000 // 5 минут
        };
        
        return ttlMap[weatherType] || 300000; // 5 минут по умолчанию
    }
    
    /**
     * Вычисление TTL для расчетов
     */
    calculateCalculationTTL(calculationId) {
        const ttlMap = {
            'distance': 3600000, // 1 час
            'time': 1800000, // 30 минут
            'fuel': 1800000, // 30 минут
            'optimization': 3600000 // 1 час
        };
        
        return ttlMap[calculationId] || 1800000; // 30 минут по умолчанию
    }
    
    /**
     * Вычисление TTL для MCP
     */
    calculateMCPTTL(toolName) {
        const ttlMap = {
            'get_current_weather': 300000, // 5 минут
            'get_weather_forecast': 1800000, // 30 минут
            'get_metar_data': 600000, // 10 минут
            'get_taf_data': 1800000, // 30 минут
            'web_search': 3600000, // 1 час
            'get_figma_data': 86400000 // 24 часа
        };
        
        return ttlMap[toolName] || 600000; // 10 минут по умолчанию
    }
    
    /**
     * Получение зависимостей для расчетов
     */
    getCalculationDependencies(calculationId, parameters) {
        const dependencies = ['calculations'];
        
        if (parameters.route) dependencies.push('route');
        if (parameters.speed) dependencies.push('speed');
        if (parameters.fuelFlow) dependencies.push('fuel_flow');
        if (parameters.waypoints) dependencies.push('waypoints');
        
        return dependencies;
    }
    
    /**
     * Получение зависимостей для MCP
     */
    getMCPDependencies(toolName, parameters) {
        const dependencies = ['mcp'];
        
        if (parameters.location || parameters.lat || parameters.lon) {
            dependencies.push('location');
        }
        
        if (toolName.includes('weather')) {
            dependencies.push('weather');
        }
        
        return dependencies;
    }
    
    /**
     * Предзагрузка данных на основе предсказаний
     */
    async preloadData(prediction) {
        if (!this.config.enablePredictiveCaching) return;
        
        try {
            switch (prediction.action) {
                case 'route_loaded':
                    await this.preloadRouteData(prediction.context);
                    break;
                    
                case 'waypoint_selected':
                    await this.preloadWaypointData(prediction.context);
                    break;
                    
                case 'map_zoomed':
                    await this.preloadMapData(prediction.context);
                    break;
                    
                case 'weather_requested':
                    await this.preloadWeatherData(prediction.context);
                    break;
            }
        } catch (error) {
            console.error('Error preloading data:', error);
        }
    }
    
    /**
     * Предзагрузка данных маршрута
     */
    async preloadRouteData(context) {
        // Предзагружаем связанные данные
        if (context.waypoints) {
            context.waypoints.forEach((waypoint, index) => {
                this.cacheWaypoint(context.routeId, index, waypoint);
            });
        }
    }
    
    /**
     * Предзагрузка данных точки маршрута
     */
    async preloadWaypointData(context) {
        // Предзагружаем погодные данные для точки
        if (context.waypoint) {
            const weatherData = await this.fetchWeatherData(context.waypoint);
            if (weatherData) {
                this.cacheWeatherData(context.waypoint, weatherData);
            }
        }
    }
    
    /**
     * Предзагрузка данных карты
     */
    async preloadMapData(context) {
        // Предзагружаем соседние тайлы
        const nearbyTiles = this.generateNearbyTiles(context);
        for (const tile of nearbyTiles) {
            const mapData = await this.fetchMapTile(tile);
            if (mapData) {
                this.cacheMapData(tile.key, mapData);
            }
        }
    }
    
    /**
     * Предзагрузка погодных данных
     */
    async preloadWeatherData(context) {
        if (context.location) {
            const weatherData = await this.fetchWeatherData(context.location);
            if (weatherData) {
                this.cacheWeatherData(context.location, weatherData);
            }
        }
    }
    
    /**
     * Генерация соседних тайлов
     */
    generateNearbyTiles(context) {
        const { lat, lon, zoom } = context;
        const tiles = [];
        
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const tileLat = lat + (dy * 0.01);
                const tileLon = lon + (dx * 0.01);
                
                tiles.push({
                    key: `tile:${tileLat}:${tileLon}:${zoom}`,
                    lat: tileLat,
                    lon: tileLon,
                    zoom: zoom
                });
            }
        }
        
        return tiles;
    }
    
    /**
     * Заглушки для внешних вызовов
     */
    async fetchWeatherData(location) {
        // В реальном приложении здесь будет вызов API погоды
        return null;
    }
    
    async fetchMapTile(tile) {
        // В реальном приложении здесь будет загрузка тайла карты
        return null;
    }
    
    /**
     * Получение статистики всех кэшей
     */
    getAllStats() {
        return {
            route: this.routeCache.getStats(),
            weather: this.weatherCache.getStats(),
            calculation: this.calculationCache.getStats(),
            map: this.mapCache.getStats(),
            mcp: this.mcpCache.getStats(),
            dependencies: this.dependencies.getDependencyInfo(),
            predictive: this.predictive.getStats(),
            metrics: this.metrics.getFullStats()
        };
    }
    
    /**
     * Очистка всех кэшей
     */
    clearAll() {
        this.routeCache.clear();
        this.weatherCache.clear();
        this.calculationCache.clear();
        this.mapCache.clear();
        this.mcpCache.clear();
        
        console.log('All EFB caches cleared');
    }
    
    /**
     * Уничтожение системы кэширования
     */
    destroy() {
        this.routeCache.destroy();
        this.weatherCache.destroy();
        this.calculationCache.destroy();
        this.mapCache.destroy();
        this.mcpCache.destroy();
        
        console.log('EFB Cache system destroyed');
    }
}

// Создаем глобальный экземпляр
window.EFBCache = new EFBCache();

export default window.EFBCache;
