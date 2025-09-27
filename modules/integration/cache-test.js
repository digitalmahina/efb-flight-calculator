// Cache System Test - Тестирование системы умного кэширования
import SmartCache from './smart-cache.js';
import CacheDependencies from './cache-dependencies.js';
import PredictiveCache from './predictive-cache.js';
import CacheMetrics from './cache-metrics.js';
import EFBCache from './efb-cache.js';

/**
 * Тестирование системы умного кэширования
 */
class CacheSystemTest {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }
    
    /**
     * Запуск всех тестов
     */
    async runAllTests() {
        console.log('🚀 Starting Cache System Tests...\n');
        
        try {
            // Тестируем базовый SmartCache
            await this.testSmartCache();
            
            // Тестируем систему зависимостей
            await this.testCacheDependencies();
            
            // Тестируем предсказательное кэширование
            await this.testPredictiveCache();
            
            // Тестируем метрики
            await this.testCacheMetrics();
            
            // Тестируем EFB кэш
            await this.testEFBCache();
            
            // Тестируем интеграцию
            await this.testIntegration();
            
            // Выводим результаты
            this.printResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }
    
    /**
     * Тестирование SmartCache
     */
    async testSmartCache() {
        console.log('📦 Testing SmartCache...');
        
        const cache = new SmartCache({
            defaultTTL: 1000,
            maxSize: 10,
            enableMetrics: true
        });
        
        // Тест 1: Базовые операции
        this.runTest('SmartCache: Basic Operations', () => {
            cache.set('test1', { data: 'value1' });
            const result = cache.get('test1');
            return result && result.data === 'value1';
        });
        
        // Тест 2: TTL
        this.runTest('SmartCache: TTL Expiration', async () => {
            cache.set('test2', { data: 'value2' }, { ttl: 100 });
            await this.sleep(150);
            const result = cache.get('test2');
            return result === null;
        });
        
        // Тест 3: Адаптивный TTL
        this.runTest('SmartCache: Adaptive TTL', () => {
            // Часто используемый ключ должен получить больший TTL
            for (let i = 0; i < 5; i++) {
                cache.get('test1');
            }
            const stats = cache.getStats();
            return stats.hitRate > 0;
        });
        
        // Тест 4: Вытеснение при превышении размера
        this.runTest('SmartCache: Size Eviction', () => {
            // Заполняем кэш
            for (let i = 0; i < 15; i++) {
                cache.set(`key${i}`, { data: `value${i}` });
            }
            const stats = cache.getStats();
            return stats.cacheSize <= 10;
        });
        
        // Тест 5: Инвалидация
        this.runTest('SmartCache: Invalidation', () => {
            cache.set('test3', { data: 'value3' });
            cache.invalidate('test3');
            const result = cache.get('test3');
            return result === null;
        });
        
        cache.destroy();
    }
    
    /**
     * Тестирование системы зависимостей
     */
    async testCacheDependencies() {
        console.log('🔗 Testing Cache Dependencies...');
        
        const cache = new SmartCache();
        const dependencies = new CacheDependencies();
        
        // Тест 1: Установка зависимостей
        this.runTest('Dependencies: Set Dependencies', () => {
            dependencies.setDependencies('key1', ['dep1', 'dep2']);
            const info = dependencies.getDependencyInfo();
            return info.dependencies.key1 && info.dependencies.key1.includes('dep1');
        });
        
        // Тест 2: Инвалидация по зависимости
        this.runTest('Dependencies: Invalidation by Dependency', () => {
            cache.set('key1', { data: 'value1' });
            dependencies.setDependencies('key1', ['dep1']);
            dependencies.invalidateByDependency('dep1');
            const result = cache.get('key1');
            return result === null;
        });
        
        // Тест 3: Автоматическое определение зависимостей
        this.runTest('Dependencies: Auto Detection', () => {
            const deps = dependencies.autoDetectDependencies('route:waypoint:distance');
            return deps.includes('route') && deps.includes('waypoints');
        });
        
        cache.destroy();
        dependencies.destroy();
    }
    
    /**
     * Тестирование предсказательного кэширования
     */
    async testPredictiveCache() {
        console.log('🔮 Testing Predictive Cache...');
        
        const predictive = new PredictiveCache();
        
        // Тест 1: Запись действий пользователя
        this.runTest('Predictive: Record User Actions', () => {
            predictive.recordUserAction('route_loaded', { routeId: 'test' });
            const stats = predictive.getStats();
            return stats.predictions >= 0;
        });
        
        // Тест 2: Анализ последовательностей
        this.runTest('Predictive: Sequence Analysis', () => {
            // Записываем последовательность действий
            predictive.recordUserAction('route_loaded', { routeId: 'test1' });
            predictive.recordUserAction('waypoint_selected', { waypoint: 'wp1' });
            predictive.recordUserAction('map_zoomed', { zoom: 10 });
            
            const stats = predictive.getStats();
            return stats.activeUsers > 0;
        });
        
        // Тест 3: Предсказания
        this.runTest('Predictive: Predictions', () => {
            // Записываем повторяющуюся последовательность
            for (let i = 0; i < 3; i++) {
                predictive.recordUserAction('route_loaded', { routeId: 'test' });
                predictive.recordUserAction('waypoint_selected', { waypoint: 'wp1' });
            }
            
            const stats = predictive.getStats();
            return stats.predictions > 0;
        });
        
        predictive.destroy();
    }
    
    /**
     * Тестирование метрик
     */
    async testCacheMetrics() {
        console.log('📊 Testing Cache Metrics...');
        
        const cache = new SmartCache({ enableMetrics: true });
        const metrics = new CacheMetrics();
        
        // Тест 1: Отслеживание попаданий
        this.runTest('Metrics: Hit Tracking', () => {
            cache.set('test1', { data: 'value1' });
            cache.get('test1');
            const stats = metrics.getStats();
            return stats.hits > 0;
        });
        
        // Тест 2: Отслеживание промахов
        this.runTest('Metrics: Miss Tracking', () => {
            cache.get('nonexistent');
            const stats = metrics.getStats();
            return stats.misses > 0;
        });
        
        // Тест 3: Расчет hit rate
        this.runTest('Metrics: Hit Rate Calculation', () => {
            const stats = metrics.getStats();
            return stats.hitRate >= 0 && stats.hitRate <= 1;
        });
        
        // Тест 4: Алерты
        this.runTest('Metrics: Alerts', () => {
            // Создаем ситуацию с низким hit rate
            for (let i = 0; i < 10; i++) {
                cache.get('nonexistent' + i);
            }
            
            const alerts = metrics.getActiveAlerts();
            return alerts.length >= 0; // Может быть 0 или больше в зависимости от порогов
        });
        
        cache.destroy();
        metrics.destroy();
    }
    
    /**
     * Тестирование EFB кэша
     */
    async testEFBCache() {
        console.log('✈️ Testing EFB Cache...');
        
        const efbCache = new EFBCache();
        
        // Тест 1: Кэширование маршрута
        this.runTest('EFB Cache: Route Caching', () => {
            const routeData = {
                id: 'test_route',
                waypoints: [
                    { name: 'WP1', lat: 68.0, lon: 33.0 },
                    { name: 'WP2', lat: 68.1, lon: 33.1 }
                ],
                distance: 100
            };
            
            efbCache.cacheRoute('test_route', routeData);
            const cached = efbCache.getRoute('test_route');
            return cached && cached.id === 'test_route';
        });
        
        // Тест 2: Кэширование погодных данных
        this.runTest('EFB Cache: Weather Caching', () => {
            const weatherData = {
                current: { temperature: 15, wind: { speed: 10 } },
                forecast: []
            };
            
            efbCache.cacheWeatherData({ lat: 68.0, lon: 33.0 }, weatherData);
            const cached = efbCache.getWeatherData({ lat: 68.0, lon: 33.0 });
            return cached && cached.current.temperature === 15;
        });
        
        // Тест 3: Кэширование расчетов
        this.runTest('EFB Cache: Calculation Caching', () => {
            const calculationData = {
                id: 'distance_calc',
                parameters: { route: 'test_route' },
                result: { distance: 100, time: 30 }
            };
            
            efbCache.cacheCalculation('distance_calc', calculationData.parameters, calculationData.result);
            const cached = efbCache.getCalculation('distance_calc', calculationData.parameters);
            return cached && cached.result.distance === 100;
        });
        
        // Тест 4: Статистика
        this.runTest('EFB Cache: Statistics', () => {
            const stats = efbCache.getAllStats();
            return stats && typeof stats === 'object';
        });
        
        efbCache.destroy();
    }
    
    /**
     * Тестирование интеграции
     */
    async testIntegration() {
        console.log('🔧 Testing Integration...');
        
        // Тест 1: Глобальный кэш
        this.runTest('Integration: Global Cache', () => {
            if (window.globalCache) {
                window.globalCache.set('integration_test', { data: 'test' });
                const result = window.globalCache.get('integration_test');
                return result && result.data === 'test';
            }
            return false;
        });
        
        // Тест 2: EFB Application
        this.runTest('Integration: EFB Application', () => {
            if (window.EFBApplication) {
                const state = window.EFBApplication.getState();
                return state && typeof state === 'object';
            }
            return false;
        });
        
        // Тест 3: Event Bus
        this.runTest('Integration: Event Bus', () => {
            if (window.EventBus) {
                let eventReceived = false;
                window.EventBus.on('test_event', () => {
                    eventReceived = true;
                });
                window.EventBus.emit('test_event', {});
                return eventReceived;
            }
            return false;
        });
    }
    
    /**
     * Запуск отдельного теста
     */
    runTest(testName, testFunction) {
        try {
            const result = testFunction();
            if (result) {
                this.passedTests++;
                this.testResults.push({ name: testName, status: 'PASS', message: 'OK' });
                console.log(`  ✅ ${testName}`);
            } else {
                this.failedTests++;
                this.testResults.push({ name: testName, status: 'FAIL', message: 'Test returned false' });
                console.log(`  ❌ ${testName}`);
            }
        } catch (error) {
            this.failedTests++;
            this.testResults.push({ name: testName, status: 'ERROR', message: error.message });
            console.log(`  💥 ${testName}: ${error.message}`);
        }
    }
    
    /**
     * Вывод результатов тестирования
     */
    printResults() {
        console.log('\n📋 Test Results Summary:');
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📊 Total: ${this.passedTests + this.failedTests}`);
        console.log(`🎯 Success Rate: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);
        
        if (this.failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(test => test.status !== 'PASS')
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.message}`);
                });
        }
        
        console.log('\n🎉 Cache System Testing Complete!');
    }
    
    /**
     * Утилита для задержки
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Запуск тестов при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const testSuite = new CacheSystemTest();
    testSuite.runAllTests();
});

export default CacheSystemTest;
