/**
 * 🧮 ГЛАВНЫЙ МОДУЛЬ CALCULATIONS
 * 
 * Объединяет все функции расчета полета в единый API
 * Обеспечивает интеграцию с системой событий и другими модулями
 */

// Импорт всех подмодулей
import DistanceCalculator from './distance-calculator.js';
import TimeCalculator from './time-calculator.js';
import FuelCalculator from './fuel-calculator.js';
import RouteOptimizer from './route-optimizer.js';

// Импорт общих компонентов
import EventBus from '../shared/event-bus.js';
import Utils from '../shared/utils.js';
import CONSTANTS from '../shared/constants.js';

/**
 * Главный класс модуля Calculations
 */
class CalculationsModule {
    constructor() {
        this.isInitialized = false;
        this.currentRoute = null;
        this.calculationCache = new Map();
        this.eventHandlers = new Map();
        
        // Параметры по умолчанию
        this.defaultParams = {
            cruiseSpeed: 200,      // км/ч
            fuelFlow: 600,         // кг/ч
            reserveFuel: 10,       // %
            windSpeed: 0,          // км/ч
            windDirection: 0       // градусы
        };
        
        // Текущие параметры полета
        this.flightParams = { ...this.defaultParams };
    }
    
    /**
     * Инициализация модуля
     */
    async init() {
        if (this.isInitialized) {
            return;
        }
        
        try {
            // Настройка обработчиков событий
            this.setupEventHandlers();
            
            // Инициализация кэша
            this.initializeCache();
            
            this.isInitialized = true;
            
            // Уведомление о готовности
            EventBus.emit('calculations-module-ready', {
                module: 'calculations',
                version: '1.0.0',
                features: [
                    'distance-calculation',
                    'time-calculation',
                    'fuel-calculation',
                    'route-optimization',
                    'route-analysis'
                ]
            });
            
            console.log('✅ Calculations module initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Calculations module:', error);
            EventBus.emit('calculations-module-error', { error: error.message });
            throw error;
        }
    }
    
    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
        // Обработчик загрузки маршрута
        this.eventHandlers.set('route-loaded', (data) => {
            this.handleRouteLoaded(data);
        });
        
        // Обработчик изменения параметров полета
        this.eventHandlers.set('flight-params-changed', (data) => {
            this.handleFlightParamsChanged(data);
        });
        
        // Обработчик запроса на пересчет
        this.eventHandlers.set('recalculate-route', (data) => {
            this.handleRecalculateRoute(data);
        });
        
        // Регистрация обработчиков в EventBus
        this.eventHandlers.forEach((handler, event) => {
            EventBus.on(event, handler);
        });
    }
    
    /**
     * Инициализация кэша
     */
    initializeCache() {
        this.calculationCache.clear();
        this.calculationCache.set('maxSize', 100);
        this.calculationCache.set('ttl', 300000); // 5 минут
    }
    
    /**
     * Обработка загрузки маршрута
     */
    handleRouteLoaded(data) {
        try {
            this.currentRoute = data.route;
            const results = this.calculateRoute(this.currentRoute, this.flightParams);
            
            EventBus.emit('calculations-complete', {
                route: this.currentRoute,
                results: results,
                params: this.flightParams
            });
            
        } catch (error) {
            console.error('Error processing route:', error);
            EventBus.emit('calculation-error', { error: error.message });
        }
    }
    
    /**
     * Обработка изменения параметров полета
     */
    handleFlightParamsChanged(data) {
        try {
            this.flightParams = { ...this.flightParams, ...data.params };
            
            if (this.currentRoute) {
                const results = this.calculateRoute(this.currentRoute, this.flightParams);
                
                EventBus.emit('calculations-updated', {
                    route: this.currentRoute,
                    results: results,
                    params: this.flightParams
                });
            }
            
        } catch (error) {
            console.error('Error updating flight params:', error);
            EventBus.emit('calculation-error', { error: error.message });
        }
    }
    
    /**
     * Обработка запроса на пересчет
     */
    handleRecalculateRoute(data) {
        try {
            if (!this.currentRoute) {
                throw new Error('No route loaded for recalculation');
            }
            
            const params = data.params || this.flightParams;
            const results = this.calculateRoute(this.currentRoute, params);
            
            EventBus.emit('calculations-recalculated', {
                route: this.currentRoute,
                results: results,
                params: params
            });
            
        } catch (error) {
            console.error('Error recalculating route:', error);
            EventBus.emit('calculation-error', { error: error.message });
        }
    }
    
    /**
     * Основная функция расчета маршрута
     */
    calculateRoute(waypoints, params = {}) {
        try {
            const flightParams = { ...this.flightParams, ...params };
            
            // Проверка кэша
            const cacheKey = this.generateCacheKey(waypoints, flightParams);
            const cachedResult = this.getCachedResult(cacheKey);
            if (cachedResult) {
                return cachedResult;
            }
            
            // Расчет расстояний
            const distanceResult = DistanceCalculator.calculateRouteDistance(waypoints);
            
            // Расчет времени
            const timeResult = TimeCalculator.calculateRouteTime(
                distanceResult.segments,
                flightParams.cruiseSpeed,
                flightParams.windSpeed > 0 ? {
                    speed: flightParams.windSpeed,
                    direction: flightParams.windDirection
                } : null
            );
            
            // Расчет топлива
            const fuelResult = FuelCalculator.calculateRouteFuel(
                timeResult.segments,
                flightParams.fuelFlow,
                flightParams.reserveFuel
            );
            
            // Анализ статистики маршрута
            const statistics = RouteOptimizer.analyzeRouteStatistics(distanceResult.segments);
            
            // Проверка безопасности
            const safetyCheck = RouteOptimizer.checkRouteSafety(distanceResult.segments);
            
            // Формирование результата
            const result = {
                // Основные показатели
                totalDistance: distanceResult.totalDistance,
                totalTime: timeResult.totalTime,
                totalFuel: fuelResult.totalFuel,
                
                // Форматированные значения
                formattedTime: timeResult.formattedTotalTime,
                formattedDistance: `${distanceResult.totalDistance} км`,
                formattedFuel: `${fuelResult.totalFuel} кг`,
                
                // Детальная информация
                segments: distanceResult.segments.map((segment, index) => ({
                    ...segment,
                    time: timeResult.segments[index]?.time || 0,
                    fuel: fuelResult.segments[index]?.fuel || 0,
                    formattedTime: timeResult.segments[index]?.formattedTime || '00:00'
                })),
                
                // Статистика
                statistics: {
                    ...statistics,
                    fuelEfficiency: fuelResult.totalDistance > 0 ? 
                        Math.round((fuelResult.totalFuel / distanceResult.totalDistance) * 1000) / 1000 : 0,
                    averageSpeed: flightParams.cruiseSpeed,
                    fuelFlow: flightParams.fuelFlow
                },
                
                // Безопасность
                safety: safetyCheck,
                
                // Параметры расчета
                params: flightParams,
                
                // Метаданные
                calculatedAt: new Date().toISOString(),
                cacheKey: cacheKey
            };
            
            // Сохранение в кэш
            this.setCachedResult(cacheKey, result);
            
            return result;
            
        } catch (error) {
            console.error('Error calculating route:', error);
            throw error;
        }
    }
    
    /**
     * Генерация ключа кэша
     */
    generateCacheKey(waypoints, params) {
        const waypointsHash = waypoints.map(wp => `${wp.lat},${wp.lon}`).join('|');
        const paramsHash = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');
        
        return `${waypointsHash}#${paramsHash}`;
    }
    
    /**
     * Получение результата из кэша
     */
    getCachedResult(key) {
        const cached = this.calculationCache.get(key);
        if (!cached) return null;
        
        const now = Date.now();
        if (now - cached.timestamp > this.calculationCache.get('ttl')) {
            this.calculationCache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    /**
     * Сохранение результата в кэш
     */
    setCachedResult(key, data) {
        // Очистка кэша если он переполнен
        if (this.calculationCache.size >= this.calculationCache.get('maxSize')) {
            const firstKey = this.calculationCache.keys().next().value;
            this.calculationCache.delete(firstKey);
        }
        
        this.calculationCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
    
    /**
     * Валидация входных данных
     */
    validateInputs(waypoints, params) {
        const errors = [];
        
        // Проверка точек маршрута
        if (!Array.isArray(waypoints) || waypoints.length < 2) {
            errors.push('Waypoints must be an array with at least 2 points');
        }
        
        waypoints.forEach((waypoint, index) => {
            if (!waypoint.lat || !waypoint.lon) {
                errors.push(`Waypoint ${index + 1} missing coordinates`);
            }
            
            if (!DistanceCalculator.validateCoordinates(waypoint.lat, waypoint.lon)) {
                errors.push(`Waypoint ${index + 1} has invalid coordinates`);
            }
        });
        
        // Проверка параметров
        if (params.cruiseSpeed && (params.cruiseSpeed <= 0 || params.cruiseSpeed > 1000)) {
            errors.push('Cruise speed must be between 1 and 1000 km/h');
        }
        
        if (params.fuelFlow && (params.fuelFlow <= 0 || params.fuelFlow > 5000)) {
            errors.push('Fuel flow must be between 1 and 5000 kg/h');
        }
        
        if (params.reserveFuel && (params.reserveFuel < 0 || params.reserveFuel > 100)) {
            errors.push('Reserve fuel must be between 0 and 100%');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Получение состояния модуля
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            currentRoute: this.currentRoute,
            flightParams: this.flightParams,
            cacheSize: this.calculationCache.size,
            defaultParams: this.defaultParams
        };
    }
    
    /**
     * Установка состояния модуля
     */
    setState(state) {
        if (state.flightParams) {
            this.flightParams = { ...this.flightParams, ...state.flightParams };
        }
        
        if (state.currentRoute) {
            this.currentRoute = state.currentRoute;
        }
    }
    
    /**
     * Очистка модуля
     */
    async destroy() {
        try {
            // Удаление обработчиков событий
            this.eventHandlers.forEach((handler, event) => {
                EventBus.off(event, handler);
            });
            
            // Очистка кэша
            this.calculationCache.clear();
            
            // Сброс состояния
            this.isInitialized = false;
            this.currentRoute = null;
            this.flightParams = { ...this.defaultParams };
            
            console.log('✅ Calculations module destroyed successfully');
            
        } catch (error) {
            console.error('❌ Error destroying Calculations module:', error);
            throw error;
        }
    }
}

// Создание экземпляра модуля
const calculationsModule = new CalculationsModule();

// Экспорт API модуля
export default {
    // Основные функции
    init: () => calculationsModule.init(),
    destroy: () => calculationsModule.destroy(),
    calculateRoute: (waypoints, params) => calculationsModule.calculateRoute(waypoints, params),
    
    // Отдельные функции расчета
    calculateDistance: (lat1, lon1, lat2, lon2, unit) => 
        DistanceCalculator.calculateDistance(lat1, lon1, lat2, lon2, unit),
    calculateTime: (distance, speed) => 
        TimeCalculator.calculateFlightTime(distance, speed),
    calculateFuel: (time, fuelFlow) => 
        FuelCalculator.calculateFuelConsumption(time, fuelFlow),
    
    // Утилиты
    formatTime: (hours) => TimeCalculator.formatTime(hours),
    validateInputs: (waypoints, params) => calculationsModule.validateInputs(waypoints, params),
    
    // Состояние
    getState: () => calculationsModule.getState(),
    setState: (state) => calculationsModule.setState(state),
    
    // Подмодули
    distance: DistanceCalculator,
    time: TimeCalculator,
    fuel: FuelCalculator,
    optimizer: RouteOptimizer,
    
    // Константы
    constants: {
        DEFAULT_CRUISE_SPEED: 200,
        DEFAULT_FUEL_FLOW: 600,
        DEFAULT_RESERVE_FUEL: 10,
        EARTH_RADIUS_KM: 6371
    }
};

// Экспорт отдельных функций для прямого использования
export {
    DistanceCalculator,
    TimeCalculator,
    FuelCalculator,
    RouteOptimizer
};
