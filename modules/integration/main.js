// Main Integration - Главный файл интеграции модулей
import EventBus from '../shared/event-bus.js';
import Utils from '../shared/utils.js';
import CONSTANTS from '../shared/constants.js';
import ModuleLoader from './module-loader.js';

// Импорт системы умного кэширования
import SmartCache from './smart-cache.js';
import CacheDependencies from './cache-dependencies.js';
import PredictiveCache from './predictive-cache.js';
import CacheMetrics from './cache-metrics.js';
import EFBCache from './efb-cache.js';

// Импорт модуля погодных расчетов
import WeatherCalculations from './weather-calculations.js';

class EFBApplication {
    constructor() {
        this.moduleLoader = ModuleLoader;
        this.eventBus = EventBus;
        this.utils = Utils;
        this.constants = CONSTANTS;
        this.isInitialized = false;
        
        // Система умного кэширования
        this.cacheSystem = {
            smartCache: SmartCache,
            dependencies: CacheDependencies,
            predictive: PredictiveCache,
            metrics: CacheMetrics,
            efbCache: EFBCache
        };
        
        // Модуль погодных расчетов
        this.weatherCalculations = WeatherCalculations;
        
        // Глобальный кэш для доступа из других модулей
        window.globalCache = new SmartCache({
            defaultTTL: 300000, // 5 минут
            maxSize: 2000,
            enableMetrics: true,
            enablePredictive: true
        });
    }
    
    // Инициализация приложения
    async init() {
        if (this.isInitialized) {
            return;
        }
        
        try {
            console.log('Initializing EFB Application...');
            
            // Загружаем общие модули
            await this.loadSharedModules();
            
            // Загружаем основные модули
            await this.loadCoreModules();
            
            // Настраиваем систему событий
            this.setupEventSystem();
            
            // Инициализируем приложение
            await this.initializeApplication();
            
            this.isInitialized = true;
            console.log('EFB Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize EFB Application:', error);
            throw error;
        }
    }
    
    // Загрузка общих модулей
    async loadSharedModules() {
        // Общие модули уже загружены через импорты
        console.log('Shared modules loaded');
        
        // Инициализируем систему кэширования
        await this.initializeCacheSystem();
    }
    
    // Инициализация системы кэширования
    async initializeCacheSystem() {
        try {
            console.log('Initializing cache system...');
            
            // Инициализируем компоненты кэширования
            await this.cacheSystem.dependencies.init?.();
            await this.cacheSystem.predictive.init?.();
            await this.cacheSystem.metrics.init?.();
            await this.cacheSystem.efbCache.init?.();
            
            // Инициализируем модуль погодных расчетов
            await this.weatherCalculations.init();
            
            // Настраиваем обработчики событий кэширования
            this.setupCacheEventHandlers();
            
            console.log('Cache system initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize cache system:', error);
            throw error;
        }
    }
    
    // Настройка обработчиков событий кэширования
    setupCacheEventHandlers() {
        // Обработчик алертов кэша
        this.eventBus.on('cache-alert', (alert) => {
            this.handleCacheAlert(alert);
        });
        
        // Обработчик отчетов метрик
        this.eventBus.on('cache-metrics-report', (report) => {
            this.handleCacheMetricsReport(report);
        });
        
        // Обработчик предсказаний
        this.eventBus.on('cache-prediction', (prediction) => {
            this.handleCachePrediction(prediction);
        });
        
        // Обработчики погодных событий
        this.eventBus.on('weather-data-updated', (weatherData) => {
            this.handleWeatherDataUpdated(weatherData);
        });
        
        this.eventBus.on('weather-error', (error) => {
            this.handleWeatherError(error);
        });
        
        this.eventBus.on('weather-calculations-ready', () => {
            this.handleWeatherCalculationsReady();
        });
    }
    
    // Загрузка основных модулей
    async loadCoreModules() {
        // Здесь будут загружаться модули по мере их создания
        // Пример:
        // await this.moduleLoader.loadModule('core-ui');
        // await this.moduleLoader.loadModule('flight-data');
        // await this.moduleLoader.loadModule('navigation-map');
        // и т.д.
        
        console.log('Core modules will be loaded here');
    }
    
    // Настройка системы событий
    setupEventSystem() {
        // Глобальные обработчики событий
        this.eventBus.on(this.constants.EVENTS.ERROR_OCCURRED, (error) => {
            console.error('Application Error:', error);
            this.showError(error.message || 'Unknown error occurred');
        });
        
        this.eventBus.on(this.constants.EVENTS.SUCCESS_MESSAGE, (message) => {
            console.log('Success:', message);
            this.showSuccess(message);
        });
        
        // Обработчик изменения маршрута
        this.eventBus.on(this.constants.EVENTS.ROUTE_LOADED, (routeData) => {
            this.handleRouteLoaded(routeData);
        });
        
        // Обработчик очистки маршрута
        this.eventBus.on(this.constants.EVENTS.ROUTE_CLEARED, () => {
            this.handleRouteCleared();
        });
        
        // Обработчик завершения расчетов
        this.eventBus.on(this.constants.EVENTS.CALCULATION_COMPLETE, (results) => {
            this.handleCalculationComplete(results);
        });
    }
    
    // Инициализация приложения
    async initializeApplication() {
        // Устанавливаем начальные значения
        this.setInitialValues();
        
        // Настраиваем обработчики DOM
        this.setupDOMHandlers();
        
        // Запускаем обновление времени
        this.startClock();
        
        console.log('Application initialized');
    }
    
    // Установка начальных значений
    setInitialValues() {
        // Устанавливаем значения по умолчанию
        const speedInput = document.querySelector(this.constants.SELECTORS.SPEED_INPUT);
        const fuelInput = document.querySelector(this.constants.SELECTORS.FUEL_INPUT);
        
        if (speedInput) {
            speedInput.value = this.constants.FLIGHT.DEFAULT_SPEED;
        }
        
        if (fuelInput) {
            fuelInput.value = this.constants.FLIGHT.DEFAULT_FUEL_FLOW;
        }
    }
    
    // Настройка обработчиков DOM
    setupDOMHandlers() {
        // Обработчик загрузки GPX файла
        const loadGpxBtn = document.querySelector(this.constants.SELECTORS.LOAD_GPX_BTN);
        const hiddenFileInput = document.getElementById('hiddenFileInput');
        
        if (loadGpxBtn && hiddenFileInput) {
            loadGpxBtn.addEventListener('click', () => {
                hiddenFileInput.click();
            });
            
            hiddenFileInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.handleFileLoad(e.target.files[0]);
                }
            });
        }
        
        // Обработчик кнопки расчета
        const calculateBtn = document.querySelector(this.constants.SELECTORS.CALCULATE_BTN);
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.handleCalculate();
            });
        }
        
        // Обработчик кнопки очистки
        const clearBtn = document.querySelector(this.constants.SELECTORS.CLEAR_ROUTE_BTN);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.handleClearRoute();
            });
        }
    }
    
    // Запуск часов
    startClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-GB', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).toUpperCase();
            
            const timeElement = document.querySelector(this.constants.SELECTORS.CURRENT_TIME);
            const dateElement = document.querySelector(this.constants.SELECTORS.CURRENT_DATE);
            
            if (timeElement) timeElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    // Обработка загрузки файла
    async handleFileLoad(file) {
        try {
            this.eventBus.emit(this.constants.EVENTS.ROUTE_LOADED, { file });
        } catch (error) {
            this.eventBus.emit(this.constants.EVENTS.ERROR_OCCURRED, error);
        }
    }
    
    // Обработка расчета
    handleCalculate() {
        try {
            this.eventBus.emit(this.constants.EVENTS.CALCULATION_COMPLETE, {});
        } catch (error) {
            this.eventBus.emit(this.constants.EVENTS.ERROR_OCCURRED, error);
        }
    }
    
    // Обработка очистки маршрута
    handleClearRoute() {
        this.eventBus.emit(this.constants.EVENTS.ROUTE_CLEARED);
    }
    
    // Обработка загрузки маршрута
    handleRouteLoaded(routeData) {
        console.log('Route loaded:', routeData);
        
        // Кэшируем данные маршрута
        if (this.cacheSystem.efbCache && routeData) {
            this.cacheSystem.efbCache.cacheRoute(routeData.id || 'default', routeData);
        }
        
        // Здесь будет логика обработки загруженного маршрута
    }
    
    // Обработка очистки маршрута
    handleRouteCleared() {
        console.log('Route cleared');
        // Здесь будет логика очистки маршрута
    }
    
    // Обработка завершения расчетов
    handleCalculationComplete(results) {
        console.log('Calculation complete:', results);
        
        // Кэшируем результаты расчетов
        if (this.cacheSystem.efbCache && results) {
            this.cacheSystem.efbCache.cacheCalculation(
                results.id || 'default',
                results.parameters || {},
                results
            );
        }
        
        // Здесь будет логика обработки результатов расчетов
    }
    
    // Показ ошибки
    showError(message) {
        // Здесь будет логика показа ошибок
        console.error('Error:', message);
    }
    
    // Показ успешного сообщения
    showSuccess(message) {
        // Здесь будет логика показа успешных сообщений
        console.log('Success:', message);
    }
    
    // Обработка алертов кэша
    handleCacheAlert(alert) {
        console.warn(`Cache Alert [${alert.severity}]: ${alert.message}`);
        
        // Показываем алерт пользователю в зависимости от серьезности
        if (alert.severity === 'high') {
            this.showError(`Cache Warning: ${alert.message}`);
        } else if (alert.severity === 'medium') {
            this.showSuccess(`Cache Info: ${alert.message}`);
        }
    }
    
    // Обработка отчетов метрик кэша
    handleCacheMetricsReport(report) {
        console.log('Cache Metrics Report:', report.summary);
        
        // Логируем рекомендации
        if (report.recommendations && report.recommendations.length > 0) {
            report.recommendations.forEach(rec => {
                console.log(`Cache Recommendation [${rec.priority}]: ${rec.message}`);
            });
        }
    }
    
    // Обработка предсказаний кэша
    handleCachePrediction(prediction) {
        console.log('Cache Prediction:', prediction);
        
        // Выполняем предзагрузку данных
        if (this.cacheSystem.efbCache) {
            this.cacheSystem.efbCache.preloadData(prediction);
        }
    }
    
    // Обработка обновления погодных данных
    handleWeatherDataUpdated(weatherData) {
        console.log('Weather data updated:', weatherData);
        
        // Обновляем интерфейс с новыми погодными данными
        this.updateWeatherInterface(weatherData);
        
        // Уведомляем модуль расчетов о новых погодных данных
        this.eventBus.emit('weather-data-for-calculations', weatherData);
    }
    
    // Обработка ошибок погодных данных
    handleWeatherError(error) {
        console.error('Weather error:', error);
        
        // Показываем ошибку пользователю
        this.showError(`Weather data error: ${error.message}`);
        
        // Обновляем статус погодного виджета
        this.updateWeatherStatus('error');
    }
    
    // Обработка готовности погодных расчетов
    handleWeatherCalculationsReady() {
        console.log('Weather Calculations module ready');
        
        // Обновляем статус погодного виджета
        this.updateWeatherStatus('ready');
        
        // Загружаем погодный виджет в интерфейс
        this.loadWeatherWidget();
    }
    
    // Получение статистики кэширования
    getCacheStats() {
        if (!this.cacheSystem.efbCache) {
            return null;
        }
        
        return this.cacheSystem.efbCache.getAllStats();
    }
    
    // Очистка кэша
    clearCache() {
        if (this.cacheSystem.efbCache) {
            this.cacheSystem.efbCache.clearAll();
        }
        
        if (window.globalCache) {
            window.globalCache.clear();
        }
        
        console.log('All caches cleared');
    }
    
    // Обновление погодного интерфейса
    updateWeatherInterface(weatherData) {
        // Обновляем погодный виджет
        if (this.weatherCalculations) {
            this.weatherCalculations.updateWeatherUI();
        }
        
        // Обновляем статус виджета
        this.updateWeatherStatus('updated');
    }
    
    // Обновление статуса погодного виджета
    updateWeatherStatus(status) {
        const statusElement = document.getElementById('weather-status');
        if (statusElement) {
            statusElement.className = `weather-status ${status}`;
        }
        
        const widget = document.getElementById('weather-widget');
        if (widget) {
            widget.className = `weather-widget dark ${status}`;
        }
    }
    
    // Загрузка погодного виджета в интерфейс
    loadWeatherWidget() {
        // Проверяем, не загружен ли уже виджет
        if (document.getElementById('weather-widget')) {
            return;
        }
        
        // Создаем контейнер для виджета
        const widgetContainer = document.createElement('div');
        widgetContainer.innerHTML = `
            <div id="weather-widget" class="weather-widget dark">
                <div class="weather-update-indicator"></div>
                <div class="weather-header">
                    <div class="weather-title">Weather</div>
                    <div class="weather-status" id="weather-status"></div>
                </div>
                <div class="weather-main">
                    <div class="weather-temp" id="weather-temp">--°C</div>
                    <div class="weather-wind" id="weather-wind">
                        <span class="wind-speed">--</span>
                        <span class="wind-unit">m/s</span>
                        <span class="wind-direction">---°</span>
                    </div>
                    <div class="weather-pressure" id="weather-pressure">---- hPa</div>
                </div>
                <div class="weather-details">
                    <div class="wind-components">
                        <span class="headwind" id="headwind-component">HW: --</span>
                        <span class="crosswind" id="crosswind-component">CW: --</span>
                    </div>
                    <div class="flight-impact">
                        <span class="time-impact" id="time-impact">Time: --%</span>
                        <span class="fuel-impact" id="fuel-impact">Fuel: --%</span>
                    </div>
                </div>
                <div class="weather-indicators">
                    <div class="comfort-indicator" id="flight-comfort-indicator">--%</div>
                    <div class="wind-indicator" id="headwind-indicator">-- m/s</div>
                    <div class="wind-indicator" id="crosswind-indicator">-- m/s</div>
                </div>
                <div class="weather-tooltip">
                    Click for detailed weather information
                </div>
            </div>
        `;
        
        // Добавляем виджет в левый верхний угол
        document.body.appendChild(widgetContainer);
        
        // Загружаем CSS стили
        this.loadWeatherWidgetStyles();
        
        console.log('Weather widget loaded');
    }
    
    // Загрузка стилей погодного виджета
    loadWeatherWidgetStyles() {
        // Проверяем, не загружены ли уже стили
        if (document.getElementById('weather-widget-styles')) {
            return;
        }
        
        // Создаем элемент стилей
        const styleElement = document.createElement('link');
        styleElement.id = 'weather-widget-styles';
        styleElement.rel = 'stylesheet';
        styleElement.href = './modules/integration/weather-widget.css';
        
        // Добавляем стили в head
        document.head.appendChild(styleElement);
    }
    
    // Получение статистики погодных расчетов
    getWeatherStats() {
        if (!this.weatherCalculations) {
            return null;
        }
        
        return this.weatherCalculations.getStats();
    }
    
    // Обновление погодных данных
    async updateWeatherData() {
        if (this.weatherCalculations) {
            await this.weatherCalculations.updateWeatherData();
        }
    }
    
    // Получение состояния приложения
    getState() {
        return {
            isInitialized: this.isInitialized,
            loadedModules: Array.from(this.moduleLoader.loadedModules),
            moduleStates: this.moduleLoader.getAllStates(),
            cacheStats: this.getCacheStats(),
            weatherStats: this.getWeatherStats()
        };
    }
    
    // Очистка приложения
    async destroy() {
        if (this.moduleLoader) {
            await this.moduleLoader.destroy();
        }
        
        if (this.eventBus) {
            this.eventBus.clear();
        }
        
        // Уничтожаем систему кэширования
        if (this.cacheSystem) {
            if (this.cacheSystem.efbCache) {
                this.cacheSystem.efbCache.destroy();
            }
            if (this.cacheSystem.dependencies) {
                this.cacheSystem.dependencies.destroy();
            }
            if (this.cacheSystem.predictive) {
                this.cacheSystem.predictive.destroy();
            }
            if (this.cacheSystem.metrics) {
                this.cacheSystem.metrics.destroy();
            }
        }
        
        // Уничтожаем модуль погодных расчетов
        if (this.weatherCalculations) {
            this.weatherCalculations.destroy();
        }
        
        if (window.globalCache) {
            window.globalCache.destroy();
        }
        
        this.isInitialized = false;
        console.log('EFB Application destroyed');
    }
}

// Создаем глобальный экземпляр
window.EFBApplication = new EFBApplication();

// Автоматическая инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.EFBApplication.init().catch(error => {
        console.error('Failed to initialize application:', error);
    });
});

export default window.EFBApplication;
