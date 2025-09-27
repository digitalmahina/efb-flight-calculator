// Cache Dependencies System - Система зависимостей и инвалидации кэша
import SmartCache from './smart-cache.js';
import EventBus from '../shared/event-bus.js';

/**
 * Система управления зависимостями кэша
 */
class CacheDependencies {
    constructor() {
        this.dependencies = new Map(); // key -> Set of dependencies
        this.reverseDependencies = new Map(); // dependency -> Set of keys
        this.dependencyRules = new Map(); // rule name -> { condition, action }
        this.invalidationQueue = [];
        this.isProcessing = false;
        
        // Подписываемся на события
        this.setupEventListeners();
        
        console.log('Cache Dependencies system initialized');
    }
    
    /**
     * Настройка слушателей событий
     */
    setupEventListeners() {
        if (window.EventBus) {
            // Слушаем события изменения данных
            window.EventBus.on(CONSTANTS.EVENTS.ROUTE_LOADED, (data) => {
                this.handleRouteChange(data);
            });
            
            window.EventBus.on(CONSTANTS.EVENTS.ROUTE_CLEARED, () => {
                this.handleRouteCleared();
            });
            
            window.EventBus.on(CONSTANTS.EVENTS.SPEED_CHANGED, (data) => {
                this.handleSpeedChange(data);
            });
            
            window.EventBus.on(CONSTANTS.EVENTS.FUEL_FLOW_CHANGED, (data) => {
                this.handleFuelFlowChange(data);
            });
            
            // Слушаем события кэша
            window.EventBus.on('cache-set', (data) => {
                this.processNewCacheEntry(data);
            });
        }
    }
    
    /**
     * Установка зависимостей для ключа кэша
     */
    setDependencies(cacheKey, dependencies) {
        // Удаляем старые зависимости
        this.removeDependencies(cacheKey);
        
        // Устанавливаем новые зависимости
        this.dependencies.set(cacheKey, new Set(dependencies));
        
        // Создаем обратные зависимости
        dependencies.forEach(dep => {
            if (!this.reverseDependencies.has(dep)) {
                this.reverseDependencies.set(dep, new Set());
            }
            this.reverseDependencies.get(dep).add(cacheKey);
        });
        
        console.log(`Dependencies set for ${cacheKey}:`, dependencies);
    }
    
    /**
     * Удаление зависимостей для ключа
     */
    removeDependencies(cacheKey) {
        const oldDeps = this.dependencies.get(cacheKey);
        if (oldDeps) {
            // Удаляем обратные зависимости
            oldDeps.forEach(dep => {
                const reverse = this.reverseDependencies.get(dep);
                if (reverse) {
                    reverse.delete(cacheKey);
                    if (reverse.size === 0) {
                        this.reverseDependencies.delete(dep);
                    }
                }
            });
            
            this.dependencies.delete(cacheKey);
        }
    }
    
    /**
     * Инвалидация по зависимости
     */
    invalidateByDependency(dependency, reason = 'dependency_change') {
        const affectedKeys = this.reverseDependencies.get(dependency);
        if (affectedKeys && affectedKeys.size > 0) {
            const keysToInvalidate = Array.from(affectedKeys);
            
            // Добавляем в очередь инвалидации
            this.invalidationQueue.push({
                keys: keysToInvalidate,
                reason,
                dependency,
                timestamp: Date.now(),
                priority: this.calculateInvalidationPriority(dependency, keysToInvalidate)
            });
            
            // Сортируем по приоритету
            this.invalidationQueue.sort((a, b) => b.priority - a.priority);
            
            // Обрабатываем очередь
            this.processInvalidationQueue();
            
            console.log(`Invalidating ${keysToInvalidate.length} keys due to ${dependency} change`);
        }
    }
    
    /**
     * Вычисление приоритета инвалидации
     */
    calculateInvalidationPriority(dependency, keys) {
        let priority = 1;
        
        // Высокий приоритет для критических зависимостей
        if (dependency.includes('route') || dependency.includes('waypoint')) {
            priority += 3;
        }
        
        if (dependency.includes('speed') || dependency.includes('fuel')) {
            priority += 2;
        }
        
        if (dependency.includes('weather') || dependency.includes('metar')) {
            priority += 1;
        }
        
        // Учитываем количество затронутых ключей
        priority += Math.min(keys.length * 0.1, 2);
        
        return priority;
    }
    
    /**
     * Обработка очереди инвалидации
     */
    async processInvalidationQueue() {
        if (this.isProcessing || this.invalidationQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        try {
            while (this.invalidationQueue.length > 0) {
                const invalidation = this.invalidationQueue.shift();
                await this.executeInvalidation(invalidation);
            }
        } finally {
            this.isProcessing = false;
        }
    }
    
    /**
     * Выполнение инвалидации
     */
    async executeInvalidation(invalidation) {
        const { keys, reason, dependency } = invalidation;
        
        // Получаем глобальный кэш
        const globalCache = window.globalCache || window.SmartCache;
        
        if (globalCache) {
            for (const key of keys) {
                try {
                    globalCache.invalidate(key);
                    
                    // Уведомляем о инвалидации
                    if (window.EventBus) {
                        window.EventBus.emit('cache-invalidated', {
                            key,
                            reason,
                            dependency,
                            timestamp: Date.now()
                        });
                    }
                } catch (error) {
                    console.error(`Error invalidating cache key ${key}:`, error);
                }
            }
        }
        
        console.log(`Invalidated ${keys.length} cache entries for ${dependency}`);
    }
    
    /**
     * Добавление правила инвалидации
     */
    addInvalidationRule(ruleName, condition, action) {
        this.dependencyRules.set(ruleName, {
            condition: condition,
            action: action,
            createdAt: Date.now()
        });
        
        console.log(`Invalidation rule added: ${ruleName}`);
    }
    
    /**
     * Проверка и выполнение правил инвалидации
     */
    checkInvalidationRules(context) {
        for (const [ruleName, rule] of this.dependencyRules) {
            try {
                if (rule.condition(context)) {
                    rule.action(context);
                    console.log(`Invalidation rule triggered: ${ruleName}`);
                }
            } catch (error) {
                console.error(`Error in invalidation rule ${ruleName}:`, error);
            }
        }
    }
    
    /**
     * Обработка изменения маршрута
     */
    handleRouteChange(routeData) {
        // Инвалидируем все связанные с маршрутом данные
        this.invalidateByDependency('route', 'route_loaded');
        this.invalidateByDependency('waypoints', 'route_loaded');
        this.invalidateByDependency('distance', 'route_loaded');
        this.invalidateByDependency('calculations', 'route_loaded');
        
        // Проверяем правила инвалидации
        this.checkInvalidationRules({
            type: 'route_change',
            data: routeData,
            timestamp: Date.now()
        });
    }
    
    /**
     * Обработка очистки маршрута
     */
    handleRouteCleared() {
        // Инвалидируем все данные маршрута
        this.invalidateByDependency('route', 'route_cleared');
        this.invalidateByDependency('waypoints', 'route_cleared');
        this.invalidateByDependency('distance', 'route_cleared');
        this.invalidateByDependency('calculations', 'route_cleared');
        this.invalidateByDependency('map', 'route_cleared');
        
        // Проверяем правила инвалидации
        this.checkInvalidationRules({
            type: 'route_cleared',
            timestamp: Date.now()
        });
    }
    
    /**
     * Обработка изменения скорости
     */
    handleSpeedChange(speedData) {
        // Инвалидируем расчеты, зависящие от скорости
        this.invalidateByDependency('speed', 'speed_changed');
        this.invalidateByDependency('time_calculations', 'speed_changed');
        this.invalidateByDependency('fuel_calculations', 'speed_changed');
        
        // Проверяем правила инвалидации
        this.checkInvalidationRules({
            type: 'speed_change',
            data: speedData,
            timestamp: Date.now()
        });
    }
    
    /**
     * Обработка изменения расхода топлива
     */
    handleFuelFlowChange(fuelData) {
        // Инвалидируем расчеты топлива
        this.invalidateByDependency('fuel_flow', 'fuel_flow_changed');
        this.invalidateByDependency('fuel_calculations', 'fuel_flow_changed');
        this.invalidateByDependency('total_fuel', 'fuel_flow_changed');
        
        // Проверяем правила инвалидации
        this.checkInvalidationRules({
            type: 'fuel_flow_change',
            data: fuelData,
            timestamp: Date.now()
        });
    }
    
    /**
     * Обработка нового элемента кэша
     */
    processNewCacheEntry(cacheData) {
        const { key, cacheEntry } = cacheData;
        
        // Автоматически определяем зависимости на основе ключа
        const autoDependencies = this.autoDetectDependencies(key);
        
        if (autoDependencies.length > 0) {
            this.setDependencies(key, autoDependencies);
        }
    }
    
    /**
     * Автоматическое определение зависимостей по ключу
     */
    autoDetectDependencies(key) {
        const dependencies = [];
        
        // Анализируем ключ для определения зависимостей
        if (key.includes('route')) {
            dependencies.push('route');
        }
        
        if (key.includes('waypoint')) {
            dependencies.push('waypoints');
        }
        
        if (key.includes('distance')) {
            dependencies.push('route', 'waypoints');
        }
        
        if (key.includes('time') || key.includes('duration')) {
            dependencies.push('route', 'speed');
        }
        
        if (key.includes('fuel')) {
            dependencies.push('route', 'speed', 'fuel_flow');
        }
        
        if (key.includes('weather')) {
            dependencies.push('location', 'weather');
        }
        
        if (key.includes('map') || key.includes('tile')) {
            dependencies.push('location', 'zoom');
        }
        
        if (key.includes('calculation')) {
            dependencies.push('route', 'speed', 'fuel_flow');
        }
        
        return dependencies;
    }
    
    /**
     * Получение информации о зависимостях
     */
    getDependencyInfo() {
        const info = {
            totalKeys: this.dependencies.size,
            totalDependencies: this.reverseDependencies.size,
            invalidationRules: this.dependencyRules.size,
            queueSize: this.invalidationQueue.length,
            dependencies: {},
            reverseDependencies: {}
        };
        
        // Собираем информацию о зависимостях
        for (const [key, deps] of this.dependencies) {
            info.dependencies[key] = Array.from(deps);
        }
        
        // Собираем информацию об обратных зависимостях
        for (const [dep, keys] of this.reverseDependencies) {
            info.reverseDependencies[dep] = Array.from(keys);
        }
        
        return info;
    }
    
    /**
     * Очистка системы зависимостей
     */
    clear() {
        this.dependencies.clear();
        this.reverseDependencies.clear();
        this.dependencyRules.clear();
        this.invalidationQueue = [];
        
        console.log('Cache Dependencies system cleared');
    }
    
    /**
     * Уничтожение системы зависимостей
     */
    destroy() {
        this.clear();
        console.log('Cache Dependencies system destroyed');
    }
}

// Создаем глобальный экземпляр
window.CacheDependencies = new CacheDependencies();

export default window.CacheDependencies;
