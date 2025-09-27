/**
 * EFB Flight Calculator - Main Application
 * Версия: 2.0.0 (Refactored)
 * Главный файл приложения с реальной загрузкой модулей
 */

import EventBus from './shared/event-bus.js';
import Utils from './shared/utils.js';
import CONSTANTS from './shared/constants.js';
import weatherModule from './modules/weather/weather-module.js?v=1758817772';

// Импорт дополнительных модулей
import ModuleLoader from './modules/integration/module-loader.js';
import MCPClient from './modules/mcp-integration/mcp-client.js';

class EFBApplication {
    constructor() {
        this.isInitialized = false;
        this.modules = new Map();
        this.currentRoute = null;
        this.flightParams = {
            cruiseSpeed: CONSTANTS.FLIGHT.DEFAULT_SPEED,
            fuelFlow: CONSTANTS.FLIGHT.DEFAULT_FUEL_FLOW
        };
        
        this.setupEventSystem();
    }
    
    // Инициализация приложения
    async init() {
        if (this.isInitialized) {
            console.log('EFB Application already initialized');
            return;
        }
        
        try {
            console.log('🚀 Initializing EFB Flight Calculator v2.0...');
            
            // Инициализируем модули
            await this.initializeModules();
            
            // Настраиваем DOM обработчики
            this.setupDOMHandlers();
            
            // Запускаем часы
            this.startClock();
            
            // Устанавливаем начальные значения
            this.setInitialValues();
            
            this.isInitialized = true;
            console.log('✅ EFB Application initialized successfully');
            
            EventBus.emit(CONSTANTS.EVENTS.SUCCESS_MESSAGE, 'EFB Application ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize EFB Application:', error);
            EventBus.emit(CONSTANTS.EVENTS.ERROR_OCCURRED, error);
            throw error;
        }
    }
    
    // Инициализация модулей
    async initializeModules() {
        console.log('📦 Initializing modules...');
        
        // Инициализируем загрузчик модулей
        try {
            this.moduleLoader = ModuleLoader;
            this.modules.set('module-loader', ModuleLoader);
            console.log('✅ Module Loader loaded');
        } catch (error) {
            console.warn('⚠️ Module Loader failed to load:', error);
        }
        
        // Инициализируем MCP клиент
        try {
            await MCPClient.init();
            this.modules.set('mcp-client', MCPClient);
            console.log('✅ MCP Client loaded');
        } catch (error) {
            console.warn('⚠️ MCP Client failed to load:', error);
        }
        
        // Инициализируем единый модуль погоды
        try {
            // Пробрасываем ссылку на MCP клиент (если доступен)
            if (this.modules.has('mcp-client')) {
                weatherModule.mcpClient = MCPClient;
            }
            await weatherModule.init();
            this.modules.set('weather-module', weatherModule);
            console.log('✅ Weather Module loaded (consolidated)');
        } catch (error) {
            console.warn('⚠️ Weather Module failed to load:', error);
        }
        
        console.log('📦 Modules initialization complete');
    }
    
    // Настройка системы событий
    setupEventSystem() {
        // Глобальные обработчики ошибок
        EventBus.on(CONSTANTS.EVENTS.ERROR_OCCURRED, (error) => {
            console.error('Application Error:', error);
            this.showError(error.message || 'Unknown error occurred');
        });
        
        EventBus.on(CONSTANTS.EVENTS.SUCCESS_MESSAGE, (message) => {
            console.log('Success:', message);
            this.showSuccess(message);
        });
        
        // Обработчик изменения маршрута
        EventBus.on(CONSTANTS.EVENTS.ROUTE_LOADED, (routeData) => {
            this.handleRouteLoaded(routeData);
        });
        
        // Обработчик очистки маршрута
        EventBus.on(CONSTANTS.EVENTS.ROUTE_CLEARED, () => {
            this.handleRouteCleared();
        });
        
        // Обработчик завершения расчетов
        EventBus.on(CONSTANTS.EVENTS.CALCULATION_COMPLETE, (results) => {
            this.handleCalculationComplete(results);
        });
        
        // Обработчик изменения скорости
        EventBus.on(CONSTANTS.EVENTS.SPEED_CHANGED, (speed) => {
            this.flightParams.cruiseSpeed = speed;
            this.recalculateIfRouteLoaded();
        });
        
        // Обработчик изменения расхода топлива
        EventBus.on(CONSTANTS.EVENTS.FUEL_FLOW_CHANGED, (fuelFlow) => {
            this.flightParams.fuelFlow = fuelFlow;
            this.recalculateIfRouteLoaded();
        });
        
        // Погодные события
        EventBus.on(CONSTANTS.EVENTS.WEATHER_CALCULATIONS_COMPLETE, (results) => {
            this.handleWeatherCalculationsComplete(results);
        });
        
        EventBus.on(CONSTANTS.EVENTS.WEATHER_CALCULATIONS_ERROR, (error) => {
            this.handleWeatherCalculationsError(error);
        });
    }
    
    // Настройка обработчиков DOM
    setupDOMHandlers() {
        console.log('🔧 Setting up DOM handlers...');
        
        // Обработчик загрузки GPX файла
        const loadGpxBtn = document.querySelector(CONSTANTS.SELECTORS.LOAD_GPX_BTN);
        const hiddenFileInput = document.getElementById('hiddenFileInput');
        
        console.log('Load GPX button found:', !!loadGpxBtn);
        console.log('Hidden file input found:', !!hiddenFileInput);
        
        if (loadGpxBtn && hiddenFileInput) {
            loadGpxBtn.addEventListener('click', () => {
                console.log('📁 Load GPX button clicked');
                hiddenFileInput.click();
            });
            
            hiddenFileInput.addEventListener('change', (e) => {
                console.log('📁 File selected:', e.target.files[0]?.name);
                if (e.target.files[0]) {
                    this.handleFileLoad(e.target.files[0]);
                }
            });
        } else {
            console.error('❌ Load GPX button or file input not found!');
        }
        
        // Обработчик кнопки расчета
        const calculateBtn = document.querySelector(CONSTANTS.SELECTORS.CALCULATE_BTN);
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.handleCalculate();
            });
        }
        
        // Обработчик кнопки очистки
        const clearBtn = document.querySelector(CONSTANTS.SELECTORS.CLEAR_ROUTE_BTN);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.handleClearRoute();
            });
        }
        
        // Обработчик кнопки погоды
        const weatherBtn = document.getElementById('weatherBtn');
        if (weatherBtn) {
            weatherBtn.addEventListener('click', () => {
                this.handleWeatherUpdate();
            });
        }
        
        // Обработчики полей ввода
        const speedInput = document.querySelector(CONSTANTS.SELECTORS.SPEED_INPUT);
        if (speedInput) {
            speedInput.addEventListener('input', Utils.debounce((e) => {
                const speed = parseFloat(e.target.value);
                if (Utils.validateSpeed(speed)) {
                    EventBus.emit(CONSTANTS.EVENTS.SPEED_CHANGED, speed);
                }
            }, 500));
        }
        
        const fuelInput = document.querySelector(CONSTANTS.SELECTORS.FUEL_INPUT);
        if (fuelInput) {
            fuelInput.addEventListener('input', Utils.debounce((e) => {
                const fuelFlow = parseFloat(e.target.value);
                if (Utils.validateFuelFlow(fuelFlow)) {
                    EventBus.emit(CONSTANTS.EVENTS.FUEL_FLOW_CHANGED, fuelFlow);
                }
            }, 500));
        }
    }
    
    // Установка начальных значений
    setInitialValues() {
        const speedInput = document.querySelector(CONSTANTS.SELECTORS.SPEED_INPUT);
        const fuelInput = document.querySelector(CONSTANTS.SELECTORS.FUEL_INPUT);
        
        if (speedInput) {
            speedInput.value = this.flightParams.cruiseSpeed;
        }
        
        if (fuelInput) {
            fuelInput.value = this.flightParams.fuelFlow;
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
            
            const timeElement = document.querySelector(CONSTANTS.SELECTORS.CURRENT_TIME);
            const dateElement = document.querySelector(CONSTANTS.SELECTORS.CURRENT_DATE);
            
            if (timeElement) timeElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    // Обработка загрузки файла
    async handleFileLoad(file) {
        try {
            console.log('📁 Loading GPX file:', file.name);
            
            const text = await file.text();
            console.log('📁 GPX file content length:', text.length);
            
            const waypoints = this.parseGPX(text);
            console.log('📁 Parsed waypoints:', waypoints.length);
            
            if (waypoints.length < 2) {
                throw new Error(CONSTANTS.MESSAGES.MIN_WAYPOINTS_REQUIRED);
            }
            
            this.currentRoute = {
                id: Utils.generateId(),
                name: file.name,
                waypoints: waypoints,
                timestamp: new Date().toISOString()
            };
            
            console.log('📁 Route created:', this.currentRoute);
            EventBus.emit(CONSTANTS.EVENTS.ROUTE_LOADED, this.currentRoute);
            
        } catch (error) {
            console.error('Error loading GPX file:', error);
            EventBus.emit(CONSTANTS.EVENTS.ERROR_OCCURRED, error);
        }
    }
    
    // Простой парсер GPX (заглушка)
    parseGPX(gpxText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(gpxText, 'text/xml');
        const waypoints = [];
        
        const trackPoints = xmlDoc.querySelectorAll('trkpt, wpt');
        trackPoints.forEach(point => {
            const lat = parseFloat(point.getAttribute('lat'));
            const lon = parseFloat(point.getAttribute('lon'));
            const name = point.querySelector('name')?.textContent || '';
            
            if (Utils.validateCoordinates(lat, lon)) {
                waypoints.push({
                    lat: lat,
                    lon: lon,
                    name: name,
                    elevation: parseFloat(point.querySelector('ele')?.textContent || '0')
                });
            }
        });
        
        return waypoints;
    }
    
    // Обработка расчета
    async handleCalculate() {
        if (!this.currentRoute) {
            Utils.showNotification(CONSTANTS.MESSAGES.NO_ROUTE_LOADED, 'warning');
            return;
        }
        
        try {
            console.log('🧮 Starting calculations...');
            
            // Базовые расчеты
            const basicResults = this.calculateBasicRoute(this.currentRoute.waypoints);
            
            // Погодные расчеты (если модуль доступен)
            let weatherResults = null;
            if (this.modules.has('weather-module')) {
                try {
                    weatherResults = await weatherModule.calculateRouteWithWeather(
                        this.currentRoute.waypoints,
                        this.flightParams
                    );
                } catch (error) {
                    console.warn('Weather calculations failed, using basic results:', error);
                }
            }
            
            const results = {
                id: Utils.generateId(),
                route: this.currentRoute,
                flightParams: { ...this.flightParams },
                basic: basicResults,
                weather: weatherResults,
                timestamp: new Date().toISOString()
            };
            
            EventBus.emit(CONSTANTS.EVENTS.CALCULATION_COMPLETE, results);
            
        } catch (error) {
            console.error('Error during calculation:', error);
            EventBus.emit(CONSTANTS.EVENTS.ERROR_OCCURRED, error);
        }
    }
    
    // Базовые расчеты маршрута
    calculateBasicRoute(waypoints) {
        let totalDistance = 0;
        let totalTime = 0;
        let totalFuel = 0;
        const segments = [];
        
        for (let i = 1; i < waypoints.length; i++) {
            const startPoint = waypoints[i - 1];
            const endPoint = waypoints[i];
            
            const distance = Utils.calculateDistance(
                startPoint.lat, startPoint.lon,
                endPoint.lat, endPoint.lon
            );
            const time = distance / this.flightParams.cruiseSpeed;
            const fuel = time * this.flightParams.fuelFlow;
            
            segments.push({
                startPoint,
                endPoint,
                distance,
                time,
                fuel,
                course: Utils.calculateBearing(
                    startPoint.lat, startPoint.lon,
                    endPoint.lat, endPoint.lon
                )
            });
            
            totalDistance += distance;
            totalTime += time;
            totalFuel += fuel;
        }
        
        return {
            totalDistance,
            totalTime,
            totalFuel,
            segments,
            averageSpeed: this.flightParams.cruiseSpeed,
            fuelEfficiency: totalFuel / totalDistance
        };
    }
    
    // Обработка очистки маршрута
    handleClearRoute() {
        this.currentRoute = null;
        this.clearDisplay();
        EventBus.emit(CONSTANTS.EVENTS.ROUTE_CLEARED);
        Utils.showNotification(CONSTANTS.MESSAGES.ROUTE_CLEARED, 'info');
    }
    
    // Обработка загрузки маршрута
    handleRouteLoaded(routeData) {
        console.log('📍 Route loaded:', routeData.name);
        console.log('📍 Route data:', routeData);
        console.log('📍 Waypoints count:', routeData.waypoints?.length || 0);
        
        // Профессиональная отладка: проверяем DOM элементы
        const routeList = document.getElementById('routeList');
        console.log('📍 DOM routeList element found:', !!routeList);
        
        this.updateRouteDisplay(routeData);
        Utils.showNotification(CONSTANTS.MESSAGES.ROUTE_LOADED, 'success');
        
        // Проверяем результат обновления
        const routeRows = document.querySelectorAll('.route-waypoint-row');
        console.log('📍 Route rows created:', routeRows.length);
    }
    
    // Обработка завершения расчетов
    handleCalculationComplete(results) {
        console.log('✅ Calculation complete');
        this.updateCalculationDisplay(results);
        Utils.showNotification(CONSTANTS.MESSAGES.CALCULATION_COMPLETE, 'success');
    }
    
    // Обработка завершения погодных расчетов
    handleWeatherCalculationsComplete(results) {
        console.log('🌤️ Weather calculations complete');
        this.updateWeatherDisplay(results);
    }
    
    // Обработка ошибок погодных расчетов
    handleWeatherCalculationsError(error) {
        console.warn('⚠️ Weather calculations error:', error);
        Utils.showNotification(`Weather calculation error: ${error.error}`, 'warning');
    }
    
    // Обработка обновления погоды
    async handleWeatherUpdate() {
        console.log('🌤️ Weather update requested');
        
        if (!this.currentRoute || !this.currentRoute.waypoints.length) {
            Utils.showNotification('Load a route first to get weather data', 'warning');
            return;
        }
        
        try {
            if (this.modules.has('weather-module')) {
                // Получаем погоду для всего маршрута
                const routeWeather = await weatherModule.getRouteWeather(
                    this.currentRoute.waypoints
                );

                // Обновляем карточку текущей погоды по первой точке
                const firstWeather = routeWeather[0]?.weather;
                if (firstWeather) {
                    weatherModule.updateWeatherUI(firstWeather);
                }

                // Обновляем существующие строки маршрута с погодными данными
                const routeRows = document.querySelectorAll('.route-waypoint-row');
                routeWeather.forEach((item, idx) => {
                    const w = item.weather;
                    if (routeRows[idx]) {
                        // Обновляем grid для добавления колонок погоды
                        routeRows[idx].style.gridTemplateColumns = '40px 1fr 80px 60px 60px 60px';
                        
                        // Добавляем погодные данные к существующей строке
                        const existingContent = routeRows[idx].innerHTML;
                        const weatherData = `
                            <div style="color: #00ff00;">${w ? (w.temperature?.toFixed ? w.temperature.toFixed(0) : w.conditions?.temperatureC ?? '--') : '--'}°</div>
                            <div style="color: #00ff00;">${w ? (w.windSpeedKts || w.conditions?.windKts || '--') : '--'}KT</div>
                            <div style="color: #00ff00;">${w ? (w.visibilitySm || w.conditions?.visibilityKm || '--') : '--'}</div>
                        `;
                        routeRows[idx].innerHTML = existingContent + weatherData;
                    }
                });
                
                // Обновляем заголовок для включения погодных колонок
                const routeHeader = document.querySelector('.route-header');
                if (routeHeader) {
                    routeHeader.style.gridTemplateColumns = '40px 1fr 80px 60px 60px 60px';
                    routeHeader.innerHTML = `
                        <div>#</div>
                        <div>WAYPOINT</div>
                        <div>COORDS</div>
                        <div>TEMP</div>
                        <div>WIND</div>
                        <div>VIS</div>
                    `;
                }

                Utils.showNotification('Route weather updated', 'success');
            } else {
                Utils.showNotification('Weather module not available', 'error');
            }
        } catch (error) {
            console.error('Weather update failed:', error);
            Utils.showNotification('Failed to update weather data', 'error');
        }
    }
    
    // Пересчет при изменении параметров
    async recalculateIfRouteLoaded() {
        if (this.currentRoute) {
            await this.handleCalculate();
        }
    }
    
    // Обновление отображения маршрута
    updateRouteDisplay(route) {
        console.log('📍 Updating route display:', route);
        console.log('📍 Route has waypoints:', route.waypoints?.length || 0);
        
        // Обновляем количество точек маршрута
        const waypointCount = document.querySelector(CONSTANTS.SELECTORS.WAYPOINT_COUNT);
        if (waypointCount) {
            waypointCount.textContent = route.waypoints.length;
            console.log('📍 Waypoint count updated:', route.waypoints.length);
        } else {
            console.warn('⚠️ Waypoint count element not found');
        }
        
        // Обновляем ROUTE INFO панель
        const routeList = document.getElementById('routeList');
        console.log('📍 RouteList element:', routeList);
        
        if (routeList) {
            console.log('📍 Clearing routeList content');
            // Удаляем плейсхолдер, если есть
            const placeholder = routeList.querySelector('.route-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            routeList.innerHTML = '';
            
            // Добавляем заголовок
            const header = document.createElement('div');
            header.className = 'route-header';
            header.style.display = 'grid';
            header.style.gridTemplateColumns = '40px 1fr 80px';
            header.style.gap = '8px';
            header.style.padding = '8px';
            header.style.fontWeight = 'bold';
            header.style.borderBottom = '2px solid rgba(0,255,0,0.3)';
            header.style.color = '#00ff00';
            header.innerHTML = `
                <div>#</div>
                <div>WAYPOINT</div>
                <div>COORDS</div>
            `;
            routeList.appendChild(header);
            console.log('📍 Header added to routeList');
            
            // Добавляем точки маршрута
            route.waypoints.forEach((waypoint, index) => {
                const row = document.createElement('div');
                row.className = 'route-waypoint-row';
                row.style.display = 'grid';
                row.style.gridTemplateColumns = '40px 1fr 80px';
                row.style.gap = '8px';
                row.style.padding = '6px 8px';
                row.style.borderBottom = '1px solid rgba(0,255,0,0.15)';
                row.style.fontSize = '12px';
                row.innerHTML = `
                    <div>${index + 1}</div>
                    <div>${waypoint.name || `Point ${index + 1}`}</div>
                    <div>${waypoint.lat.toFixed(3)}, ${waypoint.lon.toFixed(3)}</div>
                `;
                routeList.appendChild(row);
            });
            console.log('📍 Added', route.waypoints.length, 'waypoint rows');
        } else {
            console.error('❌ RouteList element not found! Check HTML structure.');
        }
    }
    
    // Обновление отображения расчетов
    updateCalculationDisplay(results) {
        const basic = results.basic;
        
        // Обновляем основные показатели
        const totalDistance = document.querySelector(CONSTANTS.SELECTORS.TOTAL_DISTANCE);
        if (totalDistance) {
            totalDistance.textContent = Utils.formatDistance(basic.totalDistance);
        }
        
        const flightTime = document.querySelector(CONSTANTS.SELECTORS.FLIGHT_TIME);
        if (flightTime) {
            flightTime.textContent = Utils.formatTime(basic.totalTime);
        }
        
        const totalFuel = document.querySelector(CONSTANTS.SELECTORS.TOTAL_FUEL);
        if (totalFuel) {
            totalFuel.textContent = Utils.formatFuel(basic.totalFuel);
        }
        
        // Обновляем параметры полета
        const cruiseSpeed = document.querySelector(CONSTANTS.SELECTORS.CRUISE_SPEED);
        if (cruiseSpeed) {
            cruiseSpeed.textContent = Utils.formatSpeed(this.flightParams.cruiseSpeed);
        }
        
        const fuelFlow = document.querySelector(CONSTANTS.SELECTORS.FUEL_FLOW);
        if (fuelFlow) {
            fuelFlow.textContent = Utils.formatFuel(this.flightParams.fuelFlow, 0) + '/ч';
        }
    }
    
    // Обновление отображения погодных данных
    updateWeatherDisplay(weatherResults) {
        // Здесь будет обновление погодного виджета
        // когда соответствующий модуль будет загружен
        console.log('Weather display updated:', weatherResults.statistics);
    }
    
    // Очистка отображения
    clearDisplay() {
        const elements = [
            CONSTANTS.SELECTORS.TOTAL_DISTANCE,
            CONSTANTS.SELECTORS.FLIGHT_TIME,
            CONSTANTS.SELECTORS.TOTAL_FUEL,
            CONSTANTS.SELECTORS.WAYPOINT_COUNT
        ];
        
        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = '--';
            }
        });
    }
    
    // Показ ошибки
    showError(message) {
        Utils.showNotification(message, 'error');
    }
    
    // Показ успешного сообщения
    showSuccess(message) {
        Utils.showNotification(message, 'success');
    }
    
    // Получение состояния приложения
    getState() {
        return {
            isInitialized: this.isInitialized,
            loadedModules: Array.from(this.modules.keys()),
            currentRoute: this.currentRoute,
            flightParams: this.flightParams
        };
    }
    
    // Очистка приложения
    async destroy() {
        // Уничтожаем модули
        for (const [name, module] of this.modules) {
            if (module.destroy) {
                await module.destroy();
            }
        }
        
        this.modules.clear();
        this.currentRoute = null;
        this.isInitialized = false;
        
        console.log('EFB Application destroyed');
    }
}

// Создаем глобальный экземпляр
const efbApp = new EFBApplication();
// Делаем доступным из консоли браузера
try { window.efbApp = efbApp; } catch {}
try { globalThis.efbApp = efbApp; } catch {}
try { self.efbApp = efbApp; } catch {}

// Автоматическая инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Профессиональная отладка: экспорт efbApp в глобальную область
    const globalScope = (function() {
        if (typeof window !== 'undefined') return window;
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof self !== 'undefined') return self;
        if (typeof global !== 'undefined') return global;
        return {};
    })();
    
    globalScope.efbApp = efbApp;
    console.log('🔧 EFB Debug: efbApp exposed globally:', !!globalScope.efbApp);
    console.log('🔧 EFB Debug: Available in console as efbApp');

    efbApp.init().catch(error => {
        console.error('❌ EFB Application initialization failed:', error);
    });
});

// Экспорт для использования в других модулях
export default efbApp;
