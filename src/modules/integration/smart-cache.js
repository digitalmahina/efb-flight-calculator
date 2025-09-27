// Smart Cache System - Система умного кэширования для EFB
import EventBus from '../shared/event-bus.js';
import Utils from '../shared/utils.js';
import CONSTANTS from '../shared/constants.js';

/**
 * Базовый класс умного кэширования с адаптивным TTL
 */
class SmartCache {
    constructor(options = {}) {
        this.cache = new Map();
        this.accessPatterns = new Map();
        this.ttlMultipliers = new Map();
        this.metrics = {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            averageResponseTime: 0,
            cacheSize: 0,
            memoryUsage: 0
        };
        
        // Конфигурация
        this.config = {
            defaultTTL: options.defaultTTL || 300000, // 5 минут
            maxSize: options.maxSize || 1000,
            cleanupInterval: options.cleanupInterval || 60000, // 1 минута
            enableMetrics: options.enableMetrics !== false,
            enablePredictive: options.enablePredictive !== false,
            ...options
        };
        
        // Запускаем периодическую очистку
        this.startCleanupTimer();
        
        console.log('Smart Cache initialized with config:', this.config);
    }
    
    /**
     * Получение данных из кэша
     */
    get(key, options = {}) {
        const startTime = performance.now();
        this.metrics.totalRequests++;
        
        const cached = this.cache.get(key);
        
        if (cached && this.isValid(cached)) {
            // Попадание в кэш
            this.metrics.hits++;
            this.updateAccessPattern(key);
            this.updateTTLMultiplier(key);
            
            const responseTime = performance.now() - startTime;
            this.updateAverageResponseTime(responseTime);
            
            // Обновляем время последнего доступа
            cached.lastAccessed = Date.now();
            
            if (this.config.enableMetrics) {
                this.emitCacheEvent('hit', { key, responseTime, cached });
            }
            
            return cached.data;
        } else {
            // Промах кэша
            this.metrics.misses++;
            
            if (cached && !this.isValid(cached)) {
                // Удаляем устаревшие данные
                this.cache.delete(key);
            }
            
            const responseTime = performance.now() - startTime;
            this.updateAverageResponseTime(responseTime);
            
            if (this.config.enableMetrics) {
                this.emitCacheEvent('miss', { key, responseTime });
            }
            
            return null;
        }
    }
    
    /**
     * Сохранение данных в кэш
     */
    set(key, data, options = {}) {
        const ttl = options.ttl || this.config.defaultTTL;
        const dependencies = options.dependencies || [];
        const priority = options.priority || 1;
        
        // Проверяем лимит размера кэша
        if (this.cache.size >= this.config.maxSize) {
            this.evictLeastUsed();
        }
        
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            lastAccessed: Date.now(),
            ttl: this.calculateAdaptiveTTL(key, ttl),
            dependencies,
            priority,
            accessCount: 0,
            size: this.calculateDataSize(data)
        };
        
        this.cache.set(key, cacheEntry);
        this.updateCacheMetrics();
        
        if (this.config.enableMetrics) {
            this.emitCacheEvent('set', { key, cacheEntry });
        }
        
        return true;
    }
    
    /**
     * Проверка валидности кэшированных данных
     */
    isValid(cached) {
        const now = Date.now();
        return (now - cached.timestamp) < cached.ttl;
    }
    
    /**
     * Адаптивное вычисление TTL на основе частоты использования
     */
    calculateAdaptiveTTL(key, baseTTL) {
        const accessCount = this.accessPatterns.get(key) || 0;
        const multiplier = this.ttlMultipliers.get(key) || 1.0;
        
        // Увеличиваем TTL для часто используемых данных
        const frequencyMultiplier = Math.min(2.0, 1.0 + (accessCount * 0.1));
        
        return baseTTL * multiplier * frequencyMultiplier;
    }
    
    /**
     * Обновление паттернов доступа
     */
    updateAccessPattern(key) {
        const current = this.accessPatterns.get(key) || 0;
        this.accessPatterns.set(key, current + 1);
        
        // Обновляем TTL множитель на основе частоты использования
        const usageFrequency = current / this.metrics.totalRequests;
        this.updateTTLMultiplier(key, usageFrequency);
    }
    
    /**
     * Обновление TTL множителя
     */
    updateTTLMultiplier(key, usageFrequency = null) {
        if (usageFrequency === null) {
            const accessCount = this.accessPatterns.get(key) || 0;
            usageFrequency = accessCount / this.metrics.totalRequests;
        }
        
        if (usageFrequency > 0.8) {
            // Часто используемые данные - увеличиваем TTL
            this.ttlMultipliers.set(key, 1.5);
        } else if (usageFrequency < 0.2) {
            // Редко используемые данные - уменьшаем TTL
            this.ttlMultipliers.set(key, 0.5);
        } else {
            // Нормальное использование
            this.ttlMultipliers.set(key, 1.0);
        }
    }
    
    /**
     * Удаление наименее используемых элементов
     */
    evictLeastUsed() {
        let leastUsed = null;
        let minScore = Infinity;
        
        for (const [key, cached] of this.cache) {
            const score = this.calculateEvictionScore(cached);
            if (score < minScore) {
                minScore = score;
                leastUsed = key;
            }
        }
        
        if (leastUsed) {
            this.cache.delete(leastUsed);
            this.emitCacheEvent('evicted', { key: leastUsed, reason: 'size_limit' });
        }
    }
    
    /**
     * Вычисление скора для вытеснения (чем меньше, тем больше вероятность вытеснения)
     */
    calculateEvictionScore(cached) {
        const now = Date.now();
        const age = now - cached.timestamp;
        const timeSinceAccess = now - cached.lastAccessed;
        
        // Учитываем приоритет, частоту доступа, возраст и время с последнего доступа
        return (cached.priority * 1000) + 
               (cached.accessCount * 100) - 
               (age / 1000) - 
               (timeSinceAccess / 1000);
    }
    
    /**
     * Инвалидация кэша по ключу
     */
    invalidate(key) {
        const existed = this.cache.has(key);
        this.cache.delete(key);
        this.accessPatterns.delete(key);
        this.ttlMultipliers.delete(key);
        
        if (existed) {
            this.emitCacheEvent('invalidated', { key, reason: 'manual' });
        }
        
        return existed;
    }
    
    /**
     * Инвалидация по паттерну
     */
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];
        
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => this.invalidate(key));
        
        return keysToDelete.length;
    }
    
    /**
     * Очистка устаревших данных
     */
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        
        for (const [key, cached] of this.cache) {
            if (!this.isValid(cached)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.accessPatterns.delete(key);
            this.ttlMultipliers.delete(key);
        });
        
        if (keysToDelete.length > 0) {
            this.emitCacheEvent('cleanup', { 
                removedCount: keysToDelete.length,
                keys: keysToDelete 
            });
        }
        
        this.updateCacheMetrics();
        return keysToDelete.length;
    }
    
    /**
     * Запуск таймера периодической очистки
     */
    startCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }
    
    /**
     * Остановка таймера очистки
     */
    stopCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }
    
    /**
     * Вычисление размера данных
     */
    calculateDataSize(data) {
        try {
            return JSON.stringify(data).length * 2; // Примерная оценка в байтах
        } catch (error) {
            return 1024; // Дефолтный размер
        }
    }
    
    /**
     * Обновление метрик кэша
     */
    updateCacheMetrics() {
        this.metrics.cacheSize = this.cache.size;
        this.metrics.memoryUsage = Array.from(this.cache.values())
            .reduce((total, cached) => total + cached.size, 0);
    }
    
    /**
     * Обновление среднего времени отклика
     */
    updateAverageResponseTime(responseTime) {
        const total = this.metrics.totalRequests;
        this.metrics.averageResponseTime = 
            (this.metrics.averageResponseTime * (total - 1) + responseTime) / total;
    }
    
    /**
     * Отправка событий кэша
     */
    emitCacheEvent(event, data) {
        if (window.EventBus) {
            window.EventBus.emit(`cache-${event}`, data);
        }
    }
    
    /**
     * Получение статистики кэша
     */
    getStats() {
        const hitRate = this.metrics.totalRequests > 0 ? 
            this.metrics.hits / this.metrics.totalRequests : 0;
        
        return {
            ...this.metrics,
            hitRate,
            missRate: 1 - hitRate,
            efficiency: hitRate,
            cacheEntries: this.cache.size,
            memoryUsageMB: (this.metrics.memoryUsage / 1024 / 1024).toFixed(2)
        };
    }
    
    /**
     * Получение детальной информации о кэше
     */
    getDetailedInfo() {
        const entries = Array.from(this.cache.entries()).map(([key, cached]) => ({
            key,
            age: Date.now() - cached.timestamp,
            ttl: cached.ttl,
            accessCount: cached.accessCount,
            priority: cached.priority,
            size: cached.size,
            isValid: this.isValid(cached)
        }));
        
        return {
            stats: this.getStats(),
            entries: entries.sort((a, b) => b.accessCount - a.accessCount),
            config: this.config
        };
    }
    
    /**
     * Очистка всего кэша
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.accessPatterns.clear();
        this.ttlMultipliers.clear();
        
        this.metrics = {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            averageResponseTime: 0,
            cacheSize: 0,
            memoryUsage: 0
        };
        
        this.emitCacheEvent('cleared', { size });
        return size;
    }
    
    /**
     * Уничтожение кэша
     */
    destroy() {
        this.stopCleanupTimer();
        this.clear();
        console.log('Smart Cache destroyed');
    }
}

// Создаем глобальный экземпляр
window.SmartCache = SmartCache;

export default SmartCache;
