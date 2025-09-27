// Predictive Cache System - Система предсказательного кэширования
import SmartCache from './smart-cache.js';
import EventBus from '../shared/event-bus.js';
import Utils from '../shared/utils.js';

/**
 * Система предсказательного кэширования для EFB
 */
class PredictiveCache {
    constructor(options = {}) {
        this.userPatterns = new Map(); // userId -> pattern history
        this.predictionModel = new Map(); // userId -> predictions
        this.preloadQueue = [];
        this.isPreloading = false;
        
        // Конфигурация
        this.config = {
            maxPatternHistory: options.maxPatternHistory || 1000,
            predictionThreshold: options.predictionThreshold || 0.7,
            preloadDelay: options.preloadDelay || 1000,
            maxPreloadConcurrency: options.maxPreloadConcurrency || 3,
            enableLocationPrediction: options.enableLocationPrediction !== false,
            enableTimePrediction: options.enableTimePrediction !== false,
            ...options
        };
        
        // Статистика
        this.stats = {
            predictions: 0,
            successfulPredictions: 0,
            preloadedItems: 0,
            cacheHitsFromPreload: 0
        };
        
        // Подписываемся на события
        this.setupEventListeners();
        
        console.log('Predictive Cache system initialized');
    }
    
    /**
     * Настройка слушателей событий
     */
    setupEventListeners() {
        if (window.EventBus) {
            // Отслеживаем действия пользователя
            window.EventBus.on(CONSTANTS.EVENTS.ROUTE_LOADED, (data) => {
                this.recordUserAction('route_loaded', data);
            });
            
            window.EventBus.on(CONSTANTS.EVENTS.WAYPOINT_SELECTED, (data) => {
                this.recordUserAction('waypoint_selected', data);
            });
            
            window.EventBus.on(CONSTANTS.EVENTS.MAP_ZOOMED, (data) => {
                this.recordUserAction('map_zoomed', data);
            });
            
            window.EventBus.on(CONSTANTS.EVENTS.MAP_PANNED, (data) => {
                this.recordUserAction('map_panned', data);
            });
            
            window.EventBus.on(CONSTANTS.EVENTS.SPEED_CHANGED, (data) => {
                this.recordUserAction('speed_changed', data);
            });
            
            // Отслеживаем попадания в кэш
            window.EventBus.on('cache-hit', (data) => {
                this.recordCacheHit(data);
            });
        }
    }
    
    /**
     * Запись действия пользователя
     */
    recordUserAction(action, context) {
        const userId = this.getCurrentUserId();
        const timestamp = Date.now();
        
        const actionRecord = {
            action,
            context: this.sanitizeContext(context),
            timestamp,
            location: this.getCurrentLocation(),
            timeOfDay: this.getTimeOfDay(),
            dayOfWeek: this.getDayOfWeek()
        };
        
        // Добавляем в историю паттернов
        if (!this.userPatterns.has(userId)) {
            this.userPatterns.set(userId, []);
        }
        
        const patterns = this.userPatterns.get(userId);
        patterns.push(actionRecord);
        
        // Ограничиваем размер истории
        if (patterns.length > this.config.maxPatternHistory) {
            patterns.splice(0, patterns.length - this.config.maxPatternHistory);
        }
        
        // Обновляем модель предсказаний
        this.updatePredictionModel(userId);
        
        // Запускаем предсказания
        this.generatePredictions(userId);
        
        console.log(`User action recorded: ${action}`, actionRecord);
    }
    
    /**
     * Очистка контекста от чувствительных данных
     */
    sanitizeContext(context) {
        const sanitized = { ...context };
        
        // Удаляем чувствительные данные
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.apiKey;
        
        // Округляем координаты для анонимности
        if (sanitized.lat) {
            sanitized.lat = Math.round(sanitized.lat * 100) / 100;
        }
        if (sanitized.lon) {
            sanitized.lon = Math.round(sanitized.lon * 100) / 100;
        }
        
        return sanitized;
    }
    
    /**
     * Обновление модели предсказаний
     */
    updatePredictionModel(userId) {
        const patterns = this.userPatterns.get(userId);
        if (!patterns || patterns.length < 5) {
            return;
        }
        
        // Анализируем последовательности действий
        const sequences = this.extractSequences(patterns);
        const predictions = this.analyzeSequences(sequences);
        
        this.predictionModel.set(userId, predictions);
        this.stats.predictions++;
        
        console.log(`Prediction model updated for user ${userId}`, predictions);
    }
    
    /**
     * Извлечение последовательностей действий
     */
    extractSequences(patterns) {
        const sequences = [];
        const sequenceLength = 3; // Анализируем последовательности из 3 действий
        
        for (let i = 0; i <= patterns.length - sequenceLength; i++) {
            const sequence = patterns.slice(i, i + sequenceLength);
            sequences.push(sequence);
        }
        
        return sequences;
    }
    
    /**
     * Анализ последовательностей для предсказаний
     */
    analyzeSequences(sequences) {
        const predictions = new Map();
        const sequenceCounts = new Map();
        
        // Подсчитываем частоту последовательностей
        sequences.forEach(sequence => {
            const key = sequence.map(s => s.action).join('->');
            sequenceCounts.set(key, (sequenceCounts.get(key) || 0) + 1);
        });
        
        // Генерируем предсказания на основе частых последовательностей
        for (const [sequence, count] of sequenceCounts) {
            if (count >= 2) { // Минимум 2 повторения
                const actions = sequence.split('->');
                const currentAction = actions[actions.length - 1];
                
                // Предсказываем следующее действие
                const nextAction = this.predictNextAction(actions, sequences);
                if (nextAction) {
                    const confidence = Math.min(count / sequences.length, 1.0);
                    predictions.set(currentAction, {
                        nextAction,
                        confidence,
                        frequency: count,
                        context: this.extractCommonContext(sequences, actions)
                    });
                }
            }
        }
        
        return predictions;
    }
    
    /**
     * Предсказание следующего действия
     */
    predictNextAction(actions, sequences) {
        const currentSequence = actions.join('->');
        const possibleNext = new Map();
        
        sequences.forEach(sequence => {
            const seqKey = sequence.map(s => s.action).join('->');
            if (seqKey.startsWith(currentSequence) && sequence.length > actions.length) {
                const nextAction = sequence[actions.length].action;
                possibleNext.set(nextAction, (possibleNext.get(nextAction) || 0) + 1);
            }
        });
        
        // Возвращаем наиболее вероятное следующее действие
        let maxCount = 0;
        let predictedAction = null;
        
        for (const [action, count] of possibleNext) {
            if (count > maxCount) {
                maxCount = count;
                predictedAction = action;
            }
        }
        
        return predictedAction;
    }
    
    /**
     * Извлечение общего контекста
     */
    extractCommonContext(sequences, actions) {
        const contexts = sequences
            .filter(seq => seq.map(s => s.action).join('->').startsWith(actions.join('->')))
            .map(seq => seq[actions.length - 1]?.context)
            .filter(Boolean);
        
        if (contexts.length === 0) return {};
        
        // Находим общие элементы контекста
        const commonContext = {};
        const contextKeys = Object.keys(contexts[0]);
        
        contextKeys.forEach(key => {
            const values = contexts.map(ctx => ctx[key]).filter(Boolean);
            if (values.length > contexts.length * 0.5) { // Более 50% совпадений
                commonContext[key] = this.getMostCommonValue(values);
            }
        });
        
        return commonContext;
    }
    
    /**
     * Получение наиболее частого значения
     */
    getMostCommonValue(values) {
        const counts = new Map();
        values.forEach(value => {
            counts.set(value, (counts.get(value) || 0) + 1);
        });
        
        let maxCount = 0;
        let mostCommon = values[0];
        
        for (const [value, count] of counts) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = value;
            }
        }
        
        return mostCommon;
    }
    
    /**
     * Генерация предсказаний
     */
    generatePredictions(userId) {
        const predictions = this.predictionModel.get(userId);
        if (!predictions) return;
        
        const currentAction = this.getCurrentAction();
        const prediction = predictions.get(currentAction);
        
        if (prediction && prediction.confidence >= this.config.predictionThreshold) {
            this.schedulePreload(prediction);
            this.stats.successfulPredictions++;
        }
    }
    
    /**
     * Планирование предзагрузки
     */
    schedulePreload(prediction) {
        const preloadTask = {
            action: prediction.nextAction,
            context: prediction.context,
            confidence: prediction.confidence,
            scheduledAt: Date.now(),
            priority: prediction.confidence
        };
        
        this.preloadQueue.push(preloadTask);
        
        // Сортируем по приоритету
        this.preloadQueue.sort((a, b) => b.priority - a.priority);
        
        // Запускаем предзагрузку с задержкой
        setTimeout(() => {
            this.processPreloadQueue();
        }, this.config.preloadDelay);
        
        console.log(`Preload scheduled for ${prediction.nextAction}`, preloadTask);
    }
    
    /**
     * Обработка очереди предзагрузки
     */
    async processPreloadQueue() {
        if (this.isPreloading || this.preloadQueue.length === 0) {
            return;
        }
        
        this.isPreloading = true;
        
        try {
            const tasks = this.preloadQueue.splice(0, this.config.maxPreloadConcurrency);
            
            await Promise.all(tasks.map(task => this.executePreload(task)));
            
            // Обрабатываем оставшиеся задачи
            if (this.preloadQueue.length > 0) {
                setTimeout(() => this.processPreloadQueue(), this.config.preloadDelay);
            }
        } finally {
            this.isPreloading = false;
        }
    }
    
    /**
     * Выполнение предзагрузки
     */
    async executePreload(task) {
        try {
            const preloadData = await this.generatePreloadData(task);
            
            if (preloadData) {
                // Сохраняем в кэш
                const globalCache = window.globalCache || window.SmartCache;
                if (globalCache) {
                    const cacheKey = this.generateCacheKey(task.action, task.context);
                    globalCache.set(cacheKey, preloadData, {
                        ttl: this.getPreloadTTL(task.action),
                        priority: task.priority
                    });
                    
                    this.stats.preloadedItems++;
                    console.log(`Preloaded data for ${task.action}`, preloadData);
                }
            }
        } catch (error) {
            console.error(`Error preloading ${task.action}:`, error);
        }
    }
    
    /**
     * Генерация данных для предзагрузки
     */
    async generatePreloadData(task) {
        const { action, context } = task;
        
        switch (action) {
            case 'route_loaded':
                return this.preloadRouteData(context);
                
            case 'waypoint_selected':
                return this.preloadWaypointData(context);
                
            case 'map_zoomed':
                return this.preloadMapTiles(context);
                
            case 'map_panned':
                return this.preloadMapTiles(context);
                
            case 'speed_changed':
                return this.preloadCalculations(context);
                
            case 'weather_requested':
                return this.preloadWeatherData(context);
                
            default:
                return null;
        }
    }
    
    /**
     * Предзагрузка данных маршрута
     */
    async preloadRouteData(context) {
        // Предзагружаем связанные данные маршрута
        return {
            type: 'route_preload',
            waypoints: context.waypoints || [],
            distance: context.distance || 0,
            preloadedAt: Date.now()
        };
    }
    
    /**
     * Предзагрузка данных точки маршрута
     */
    async preloadWaypointData(context) {
        return {
            type: 'waypoint_preload',
            waypoint: context.waypoint,
            nearbyAirports: [],
            weatherData: null,
            preloadedAt: Date.now()
        };
    }
    
    /**
     * Предзагрузка тайлов карты
     */
    async preloadMapTiles(context) {
        const tiles = this.generateNearbyTiles(context);
        return {
            type: 'map_tiles_preload',
            tiles,
            preloadedAt: Date.now()
        };
    }
    
    /**
     * Генерация соседних тайлов
     */
    generateNearbyTiles(context) {
        const { lat, lon, zoom } = context;
        const tiles = [];
        
        // Генерируем тайлы в радиусе 1
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const tileLat = lat + (dy * 0.01);
                const tileLon = lon + (dx * 0.01);
                
                tiles.push({
                    lat: tileLat,
                    lon: tileLon,
                    zoom: zoom,
                    priority: Math.abs(dx) + Math.abs(dy) === 1 ? 1 : 0.5
                });
            }
        }
        
        return tiles;
    }
    
    /**
     * Предзагрузка расчетов
     */
    async preloadCalculations(context) {
        return {
            type: 'calculations_preload',
            speed: context.speed,
            fuelFlow: context.fuelFlow,
            preloadedAt: Date.now()
        };
    }
    
    /**
     * Предзагрузка погодных данных
     */
    async preloadWeatherData(context) {
        return {
            type: 'weather_preload',
            location: context.location,
            preloadedAt: Date.now()
        };
    }
    
    /**
     * Генерация ключа кэша
     */
    generateCacheKey(action, context) {
        const contextKey = Object.keys(context)
            .sort()
            .map(key => `${key}:${context[key]}`)
            .join('|');
        
        return `predictive:${action}:${contextKey}`;
    }
    
    /**
     * Получение TTL для предзагруженных данных
     */
    getPreloadTTL(action) {
        const ttlMap = {
            'route_loaded': 3600000, // 1 час
            'waypoint_selected': 1800000, // 30 минут
            'map_zoomed': 300000, // 5 минут
            'map_panned': 300000, // 5 минут
            'speed_changed': 600000, // 10 минут
            'weather_requested': 300000 // 5 минут
        };
        
        return ttlMap[action] || 300000; // 5 минут по умолчанию
    }
    
    /**
     * Запись попадания в кэш
     */
    recordCacheHit(cacheData) {
        if (cacheData.key && cacheData.key.startsWith('predictive:')) {
            this.stats.cacheHitsFromPreload++;
        }
    }
    
    /**
     * Получение текущего пользователя
     */
    getCurrentUserId() {
        // В реальном приложении здесь будет логика получения ID пользователя
        return 'default_user';
    }
    
    /**
     * Получение текущего действия
     */
    getCurrentAction() {
        // Определяем текущее действие на основе последних событий
        return 'unknown';
    }
    
    /**
     * Получение текущего местоположения
     */
    getCurrentLocation() {
        // В реальном приложении здесь будет получение GPS координат
        return { lat: 68.0, lon: 33.0 };
    }
    
    /**
     * Получение времени дня
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }
    
    /**
     * Получение дня недели
     */
    getDayOfWeek() {
        return new Date().getDay();
    }
    
    /**
     * Получение статистики
     */
    getStats() {
        const totalPredictions = this.stats.predictions;
        const successRate = totalPredictions > 0 ? 
            this.stats.successfulPredictions / totalPredictions : 0;
        
        const preloadEfficiency = this.stats.preloadedItems > 0 ?
            this.stats.cacheHitsFromPreload / this.stats.preloadedItems : 0;
        
        return {
            ...this.stats,
            successRate,
            preloadEfficiency,
            activeUsers: this.userPatterns.size,
            predictionModels: this.predictionModel.size,
            queueSize: this.preloadQueue.length
        };
    }
    
    /**
     * Очистка системы предсказаний
     */
    clear() {
        this.userPatterns.clear();
        this.predictionModel.clear();
        this.preloadQueue = [];
        
        this.stats = {
            predictions: 0,
            successfulPredictions: 0,
            preloadedItems: 0,
            cacheHitsFromPreload: 0
        };
        
        console.log('Predictive Cache system cleared');
    }
    
    /**
     * Уничтожение системы предсказаний
     */
    destroy() {
        this.clear();
        console.log('Predictive Cache system destroyed');
    }
}

// Создаем глобальный экземпляр
window.PredictiveCache = new PredictiveCache();

export default window.PredictiveCache;
