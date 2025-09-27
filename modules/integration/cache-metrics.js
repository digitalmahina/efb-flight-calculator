// Cache Metrics System - Система мониторинга и метрик кэша
import EventBus from '../shared/event-bus.js';
import Utils from '../shared/utils.js';

/**
 * Система мониторинга и аналитики кэша
 */
class CacheMetrics {
    constructor(options = {}) {
        this.metrics = {
            // Основные метрики
            hits: 0,
            misses: 0,
            totalRequests: 0,
            averageResponseTime: 0,
            
            // Метрики производительности
            cacheSize: 0,
            memoryUsage: 0,
            hitRate: 0,
            missRate: 0,
            
            // Метрики операций
            sets: 0,
            gets: 0,
            invalidations: 0,
            evictions: 0,
            cleanups: 0,
            
            // Метрики времени
            totalResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0,
            
            // Метрики по типам данных
            dataTypeMetrics: new Map(),
            
            // Метрики по ключам
            keyMetrics: new Map(),
            
            // Временные метрики
            hourlyStats: new Map(),
            dailyStats: new Map(),
            
            // Метрики ошибок
            errors: 0,
            errorTypes: new Map()
        };
        
        // Конфигурация
        this.config = {
            enableRealTimeMonitoring: options.enableRealTimeMonitoring !== false,
            enableDetailedMetrics: options.enableDetailedMetrics !== false,
            enablePerformanceTracking: options.enablePerformanceTracking !== false,
            metricsRetentionHours: options.metricsRetentionHours || 24,
            reportInterval: options.reportInterval || 60000, // 1 минута
            alertThresholds: {
                hitRate: 0.7, // Минимальный hit rate
                responseTime: 100, // Максимальное время отклика в мс
                memoryUsage: 100 * 1024 * 1024, // 100MB
                errorRate: 0.05 // 5% ошибок
            },
            ...options
        };
        
        // История метрик
        this.metricsHistory = [];
        this.alerts = [];
        
        // Подписываемся на события
        this.setupEventListeners();
        
        // Запускаем периодическую отчетность
        this.startMetricsReporting();
        
        console.log('Cache Metrics system initialized');
    }
    
    /**
     * Настройка слушателей событий
     */
    setupEventListeners() {
        if (window.EventBus) {
            // Основные события кэша
            window.EventBus.on('cache-hit', (data) => {
                this.recordCacheHit(data);
            });
            
            window.EventBus.on('cache-miss', (data) => {
                this.recordCacheMiss(data);
            });
            
            window.EventBus.on('cache-set', (data) => {
                this.recordCacheSet(data);
            });
            
            window.EventBus.on('cache-invalidated', (data) => {
                this.recordCacheInvalidation(data);
            });
            
            window.EventBus.on('cache-evicted', (data) => {
                this.recordCacheEviction(data);
            });
            
            window.EventBus.on('cache-cleanup', (data) => {
                this.recordCacheCleanup(data);
            });
            
            window.EventBus.on('cache-error', (data) => {
                this.recordCacheError(data);
            });
        }
    }
    
    /**
     * Запись попадания в кэш
     */
    recordCacheHit(data) {
        const { key, responseTime, cached } = data;
        
        this.metrics.hits++;
        this.metrics.totalRequests++;
        this.metrics.gets++;
        
        this.updateResponseTimeMetrics(responseTime);
        this.updateHitRate();
        this.updateKeyMetrics(key, 'hit', responseTime);
        this.updateDataTypeMetrics(key, 'hit', responseTime);
        
        // Записываем в историю
        this.recordToHistory('hit', { key, responseTime, timestamp: Date.now() });
        
        // Проверяем алерты
        this.checkAlerts();
        
        console.log(`Cache hit: ${key} (${responseTime.toFixed(2)}ms)`);
    }
    
    /**
     * Запись промаха кэша
     */
    recordCacheMiss(data) {
        const { key, responseTime } = data;
        
        this.metrics.misses++;
        this.metrics.totalRequests++;
        this.metrics.gets++;
        
        this.updateResponseTimeMetrics(responseTime);
        this.updateHitRate();
        this.updateKeyMetrics(key, 'miss', responseTime);
        this.updateDataTypeMetrics(key, 'miss', responseTime);
        
        // Записываем в историю
        this.recordToHistory('miss', { key, responseTime, timestamp: Date.now() });
        
        // Проверяем алерты
        this.checkAlerts();
        
        console.log(`Cache miss: ${key} (${responseTime.toFixed(2)}ms)`);
    }
    
    /**
     * Запись установки в кэш
     */
    recordCacheSet(data) {
        const { key, cacheEntry } = data;
        
        this.metrics.sets++;
        this.updateKeyMetrics(key, 'set', 0);
        this.updateDataTypeMetrics(key, 'set', 0);
        
        // Записываем в историю
        this.recordToHistory('set', { key, size: cacheEntry.size, timestamp: Date.now() });
        
        console.log(`Cache set: ${key}`);
    }
    
    /**
     * Запись инвалидации кэша
     */
    recordCacheInvalidation(data) {
        const { key, reason } = data;
        
        this.metrics.invalidations++;
        this.updateKeyMetrics(key, 'invalidated', 0);
        this.updateDataTypeMetrics(key, 'invalidated', 0);
        
        // Записываем в историю
        this.recordToHistory('invalidated', { key, reason, timestamp: Date.now() });
        
        console.log(`Cache invalidated: ${key} (${reason})`);
    }
    
    /**
     * Запись вытеснения из кэша
     */
    recordCacheEviction(data) {
        const { key, reason } = data;
        
        this.metrics.evictions++;
        this.updateKeyMetrics(key, 'evicted', 0);
        this.updateDataTypeMetrics(key, 'evicted', 0);
        
        // Записываем в историю
        this.recordToHistory('evicted', { key, reason, timestamp: Date.now() });
        
        console.log(`Cache evicted: ${key} (${reason})`);
    }
    
    /**
     * Запись очистки кэша
     */
    recordCacheCleanup(data) {
        const { removedCount, keys } = data;
        
        this.metrics.cleanups++;
        
        // Записываем в историю
        this.recordToHistory('cleanup', { 
            removedCount, 
            keys: keys.length, 
            timestamp: Date.now() 
        });
        
        console.log(`Cache cleanup: ${removedCount} items removed`);
    }
    
    /**
     * Запись ошибки кэша
     */
    recordCacheError(data) {
        const { key, error, operation } = data;
        
        this.metrics.errors++;
        
        const errorType = error.name || 'UnknownError';
        this.metrics.errorTypes.set(
            errorType, 
            (this.metrics.errorTypes.get(errorType) || 0) + 1
        );
        
        this.updateKeyMetrics(key, 'error', 0);
        this.updateDataTypeMetrics(key, 'error', 0);
        
        // Записываем в историю
        this.recordToHistory('error', { 
            key, 
            error: error.message, 
            operation, 
            timestamp: Date.now() 
        });
        
        // Создаем алерт
        this.createAlert('error', {
            message: `Cache error: ${error.message}`,
            key,
            operation,
            severity: 'high'
        });
        
        console.error(`Cache error: ${key} - ${error.message}`);
    }
    
    /**
     * Обновление метрик времени отклика
     */
    updateResponseTimeMetrics(responseTime) {
        this.metrics.totalResponseTime += responseTime;
        this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, responseTime);
        this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime);
        
        if (this.metrics.totalRequests > 0) {
            this.metrics.averageResponseTime = 
                this.metrics.totalResponseTime / this.metrics.totalRequests;
        }
    }
    
    /**
     * Обновление hit rate
     */
    updateHitRate() {
        if (this.metrics.totalRequests > 0) {
            this.metrics.hitRate = this.metrics.hits / this.metrics.totalRequests;
            this.metrics.missRate = this.metrics.misses / this.metrics.totalRequests;
        }
    }
    
    /**
     * Обновление метрик по ключам
     */
    updateKeyMetrics(key, operation, responseTime) {
        if (!this.config.enableDetailedMetrics) return;
        
        if (!this.metrics.keyMetrics.has(key)) {
            this.metrics.keyMetrics.set(key, {
                hits: 0,
                misses: 0,
                sets: 0,
                invalidations: 0,
                evictions: 0,
                errors: 0,
                totalResponseTime: 0,
                averageResponseTime: 0,
                lastAccessed: Date.now()
            });
        }
        
        const keyMetrics = this.metrics.keyMetrics.get(key);
        keyMetrics[operation + 's']++;
        keyMetrics.lastAccessed = Date.now();
        
        if (responseTime > 0) {
            keyMetrics.totalResponseTime += responseTime;
            const totalOps = keyMetrics.hits + keyMetrics.misses;
            if (totalOps > 0) {
                keyMetrics.averageResponseTime = keyMetrics.totalResponseTime / totalOps;
            }
        }
    }
    
    /**
     * Обновление метрик по типам данных
     */
    updateDataTypeMetrics(key, operation, responseTime) {
        if (!this.config.enableDetailedMetrics) return;
        
        const dataType = this.extractDataType(key);
        
        if (!this.metrics.dataTypeMetrics.has(dataType)) {
            this.metrics.dataTypeMetrics.set(dataType, {
                hits: 0,
                misses: 0,
                sets: 0,
                invalidations: 0,
                evictions: 0,
                errors: 0,
                totalResponseTime: 0,
                averageResponseTime: 0,
                keys: new Set()
            });
        }
        
        const typeMetrics = this.metrics.dataTypeMetrics.get(dataType);
        typeMetrics[operation + 's']++;
        typeMetrics.keys.add(key);
        
        if (responseTime > 0) {
            typeMetrics.totalResponseTime += responseTime;
            const totalOps = typeMetrics.hits + typeMetrics.misses;
            if (totalOps > 0) {
                typeMetrics.averageResponseTime = typeMetrics.totalResponseTime / totalOps;
            }
        }
    }
    
    /**
     * Извлечение типа данных из ключа
     */
    extractDataType(key) {
        if (key.includes('route')) return 'route';
        if (key.includes('waypoint')) return 'waypoint';
        if (key.includes('weather')) return 'weather';
        if (key.includes('map') || key.includes('tile')) return 'map';
        if (key.includes('calculation')) return 'calculation';
        if (key.includes('metar') || key.includes('taf')) return 'aviation_weather';
        if (key.includes('predictive')) return 'predictive';
        return 'other';
    }
    
    /**
     * Запись в историю метрик
     */
    recordToHistory(event, data) {
        const historyEntry = {
            event,
            data,
            timestamp: Date.now()
        };
        
        this.metricsHistory.push(historyEntry);
        
        // Ограничиваем размер истории
        const maxHistorySize = this.config.metricsRetentionHours * 60 * 60 * 1000; // в миллисекундах
        const cutoffTime = Date.now() - maxHistorySize;
        this.metricsHistory = this.metricsHistory.filter(entry => entry.timestamp > cutoffTime);
    }
    
    /**
     * Проверка алертов
     */
    checkAlerts() {
        const thresholds = this.config.alertThresholds;
        
        // Проверяем hit rate
        if (this.metrics.hitRate < thresholds.hitRate && this.metrics.totalRequests > 100) {
            this.createAlert('low_hit_rate', {
                message: `Low cache hit rate: ${(this.metrics.hitRate * 100).toFixed(1)}%`,
                value: this.metrics.hitRate,
                threshold: thresholds.hitRate,
                severity: 'medium'
            });
        }
        
        // Проверяем время отклика
        if (this.metrics.averageResponseTime > thresholds.responseTime) {
            this.createAlert('high_response_time', {
                message: `High cache response time: ${this.metrics.averageResponseTime.toFixed(2)}ms`,
                value: this.metrics.averageResponseTime,
                threshold: thresholds.responseTime,
                severity: 'medium'
            });
        }
        
        // Проверяем использование памяти
        if (this.metrics.memoryUsage > thresholds.memoryUsage) {
            this.createAlert('high_memory_usage', {
                message: `High cache memory usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`,
                value: this.metrics.memoryUsage,
                threshold: thresholds.memoryUsage,
                severity: 'high'
            });
        }
        
        // Проверяем частоту ошибок
        const errorRate = this.metrics.totalRequests > 0 ? 
            this.metrics.errors / this.metrics.totalRequests : 0;
        
        if (errorRate > thresholds.errorRate) {
            this.createAlert('high_error_rate', {
                message: `High cache error rate: ${(errorRate * 100).toFixed(1)}%`,
                value: errorRate,
                threshold: thresholds.errorRate,
                severity: 'high'
            });
        }
    }
    
    /**
     * Создание алерта
     */
    createAlert(type, data) {
        const alert = {
            id: Utils.generateId(),
            type,
            ...data,
            timestamp: Date.now(),
            acknowledged: false
        };
        
        this.alerts.push(alert);
        
        // Ограничиваем количество алертов
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
        
        // Отправляем событие
        if (window.EventBus) {
            window.EventBus.emit('cache-alert', alert);
        }
        
        console.warn(`Cache alert: ${alert.message}`);
    }
    
    /**
     * Запуск периодической отчетности
     */
    startMetricsReporting() {
        if (this.reportTimer) {
            clearInterval(this.reportTimer);
        }
        
        this.reportTimer = setInterval(() => {
            this.generateReport();
        }, this.config.reportInterval);
    }
    
    /**
     * Остановка отчетности
     */
    stopMetricsReporting() {
        if (this.reportTimer) {
            clearInterval(this.reportTimer);
            this.reportTimer = null;
        }
    }
    
    /**
     * Генерация отчета
     */
    generateReport() {
        const report = {
            timestamp: Date.now(),
            summary: this.getSummaryMetrics(),
            performance: this.getPerformanceMetrics(),
            dataTypes: this.getDataTypeMetrics(),
            topKeys: this.getTopKeysMetrics(),
            alerts: this.getActiveAlerts(),
            recommendations: this.generateRecommendations()
        };
        
        // Отправляем отчет
        if (window.EventBus) {
            window.EventBus.emit('cache-metrics-report', report);
        }
        
        console.log('Cache metrics report generated:', report.summary);
    }
    
    /**
     * Получение сводных метрик
     */
    getSummaryMetrics() {
        return {
            hitRate: this.metrics.hitRate,
            missRate: this.metrics.missRate,
            totalRequests: this.metrics.totalRequests,
            averageResponseTime: this.metrics.averageResponseTime,
            cacheSize: this.metrics.cacheSize,
            memoryUsage: this.metrics.memoryUsage,
            errors: this.metrics.errors,
            efficiency: this.calculateEfficiency()
        };
    }
    
    /**
     * Получение метрик производительности
     */
    getPerformanceMetrics() {
        return {
            minResponseTime: this.metrics.minResponseTime === Infinity ? 0 : this.metrics.minResponseTime,
            maxResponseTime: this.metrics.maxResponseTime,
            averageResponseTime: this.metrics.averageResponseTime,
            totalResponseTime: this.metrics.totalResponseTime,
            operations: {
                sets: this.metrics.sets,
                gets: this.metrics.gets,
                invalidations: this.metrics.invalidations,
                evictions: this.metrics.evictions,
                cleanups: this.metrics.cleanups
            }
        };
    }
    
    /**
     * Получение метрик по типам данных
     */
    getDataTypeMetrics() {
        const dataTypeMetrics = {};
        
        for (const [dataType, metrics] of this.metrics.dataTypeMetrics) {
            dataTypeMetrics[dataType] = {
                ...metrics,
                keys: Array.from(metrics.keys),
                hitRate: metrics.hits + metrics.misses > 0 ? 
                    metrics.hits / (metrics.hits + metrics.misses) : 0
            };
        }
        
        return dataTypeMetrics;
    }
    
    /**
     * Получение метрик топ ключей
     */
    getTopKeysMetrics(limit = 10) {
        const keyMetricsArray = Array.from(this.metrics.keyMetrics.entries())
            .map(([key, metrics]) => ({
                key,
                ...metrics,
                hitRate: metrics.hits + metrics.misses > 0 ? 
                    metrics.hits / (metrics.hits + metrics.misses) : 0
            }))
            .sort((a, b) => (b.hits + b.misses) - (a.hits + a.misses))
            .slice(0, limit);
        
        return keyMetricsArray;
    }
    
    /**
     * Получение активных алертов
     */
    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.acknowledged);
    }
    
    /**
     * Вычисление эффективности кэша
     */
    calculateEfficiency() {
        if (this.metrics.totalRequests === 0) return 0;
        
        const hitRate = this.metrics.hitRate;
        const responseTimeEfficiency = Math.max(0, 1 - (this.metrics.averageResponseTime / 1000)); // Нормализуем к 1 секунде
        const memoryEfficiency = Math.max(0, 1 - (this.metrics.memoryUsage / (100 * 1024 * 1024))); // Нормализуем к 100MB
        
        return (hitRate * 0.5 + responseTimeEfficiency * 0.3 + memoryEfficiency * 0.2);
    }
    
    /**
     * Генерация рекомендаций
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.hitRate < 0.7) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'Consider increasing cache TTL or improving cache key strategy',
                action: 'optimize_cache_strategy'
            });
        }
        
        if (this.metrics.averageResponseTime > 100) {
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                message: 'Cache response time is high, consider optimizing data structures',
                action: 'optimize_data_structures'
            });
        }
        
        if (this.metrics.memoryUsage > 50 * 1024 * 1024) {
            recommendations.push({
                type: 'memory',
                priority: 'medium',
                message: 'High memory usage, consider implementing cache size limits',
                action: 'implement_cache_limits'
            });
        }
        
        if (this.metrics.errors > this.metrics.totalRequests * 0.01) {
            recommendations.push({
                type: 'reliability',
                priority: 'high',
                message: 'High error rate detected, investigate cache error handling',
                action: 'improve_error_handling'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Получение полной статистики
     */
    getFullStats() {
        return {
            metrics: this.metrics,
            history: this.metricsHistory.slice(-1000), // Последние 1000 записей
            alerts: this.alerts,
            config: this.config,
            timestamp: Date.now()
        };
    }
    
    /**
     * Сброс метрик
     */
    reset() {
        this.metrics = {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            averageResponseTime: 0,
            cacheSize: 0,
            memoryUsage: 0,
            hitRate: 0,
            missRate: 0,
            sets: 0,
            gets: 0,
            invalidations: 0,
            evictions: 0,
            cleanups: 0,
            totalResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0,
            dataTypeMetrics: new Map(),
            keyMetrics: new Map(),
            hourlyStats: new Map(),
            dailyStats: new Map(),
            errors: 0,
            errorTypes: new Map()
        };
        
        this.metricsHistory = [];
        this.alerts = [];
        
        console.log('Cache metrics reset');
    }
    
    /**
     * Уничтожение системы метрик
     */
    destroy() {
        this.stopMetricsReporting();
        this.reset();
        console.log('Cache Metrics system destroyed');
    }
}

// Создаем глобальный экземпляр
window.CacheMetrics = new CacheMetrics();

export default window.CacheMetrics;
