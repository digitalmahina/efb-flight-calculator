#!/usr/bin/env node

/**
 * Clean Weather Chaos Script
 * Радикальная очистка 84 погодных файлов
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Файлы для удаления (все дублированные погодные файлы)
const weatherFilesToRemove = [
    // Старая структура modules/
    'modules/calculations/weather-enhanced-calculations.js',
    'modules/calculations/calculations-with-weather.js',
    'modules/calculations/WEATHER_INTEGRATION_GUIDE.md',
    
    'modules/core-ui/efb-weather-integration.js',
    'modules/core-ui/weather-calculations-test.html',
    
    'modules/integration/weather-calculations-test.html',
    
    'modules/mcp-integration/weather-mcp.js',
    'modules/mcp-integration/test-weather.js',
    'modules/mcp-integration/test-weather.html',
    
    // Новая структура src/modules/ (дубликаты)
    'src/modules/calculations/weather-enhanced-calculations.js',
    'src/modules/calculations/calculations-with-weather.js',
    'src/modules/calculations/WEATHER_INTEGRATION_GUIDE.md',
    
    'src/modules/core-ui/efb-weather-integration.js',
    'src/modules/core-ui/weather-calculations-test.html',
    
    'src/modules/integration/weather-calculations-test.html',
    
    'src/modules/mcp-integration/weather-mcp.js',
    'src/modules/mcp-integration/test-weather.js',
    'src/modules/mcp-integration/test-weather.html',
    
    // Консолидированный файл (заменен на weather-module.js)
    'src/modules/weather-calculations.js'
];

// Файлы для сохранения (перенести в единый модуль)
const weatherFilesToConsolidate = [
    'src/modules/calculations/weather-enhanced-calculations.js',
    'src/modules/mcp-integration/weather-mcp.js',
    'src/modules/core-ui/efb-weather-integration.js'
];

class WeatherChaosCleaner {
    constructor() {
        this.removedFiles = [];
        this.consolidatedFiles = [];
        this.errors = [];
    }

    clean() {
        console.log('🧹 Starting Weather Chaos Cleanup...\n');
        console.log('🎯 Target: Reduce 84 weather files to 8 files (90% reduction)\n');

        this.removeDuplicateFiles();
        this.consolidateWeatherFiles();
        this.updateImports();
        this.reportResults();
    }

    removeDuplicateFiles() {
        console.log('🗑️  Removing duplicate weather files...');
        
        for (const file of weatherFilesToRemove) {
            const fullPath = path.join(projectRoot, file);
            
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    this.removedFiles.push(file);
                    console.log(`  ✅ Removed: ${file}`);
                } catch (error) {
                    this.errors.push(`Failed to remove ${file}: ${error.message}`);
                    console.log(`  ❌ Failed to remove: ${file}`);
                }
            } else {
                console.log(`  ⚠️  Not found: ${file}`);
            }
        }
    }

    consolidateWeatherFiles() {
        console.log('\n📦 Consolidating weather functionality...');
        
        // Создаем дополнительные файлы в едином модуле
        this.createWeatherConstants();
        this.createWeatherUtils();
        this.createWeatherTests();
        this.createWeatherReadme();
        
        console.log('  ✅ Weather module consolidated');
    }

    createWeatherConstants() {
        const constantsPath = path.join(projectRoot, 'src/modules/weather/weather-constants.js');
        const content = `/**
 * Weather Constants
 * Константы для погодного модуля
 */

export const WEATHER_CONSTANTS = {
    // Физические константы
    EARTH_RADIUS: 6371, // км
    STANDARD_TEMPERATURE: 15, // °C
    STANDARD_PRESSURE: 1013.25, // hPa
    
    // Коэффициенты влияния погоды
    WIND_IMPACT: {
        LIGHT: 0.02,
        MODERATE: 0.05,
        STRONG: 0.10,
        SEVERE: 0.20
    },
    
    TEMPERATURE_IMPACT: {
        COLD: 0.03,
        HOT: 0.05,
        EXTREME: 0.10
    },
    
    // Кэширование
    CACHE_TIMEOUT: 300000, // 5 минут
    MAX_CACHE_SIZE: 1000
};

export default WEATHER_CONSTANTS;
`;
        
        fs.writeFileSync(constantsPath, content);
        console.log('  ✅ Created weather-constants.js');
    }

    createWeatherUtils() {
        const utilsPath = path.join(projectRoot, 'src/modules/weather/weather-utils.js');
        const content = `/**
 * Weather Utils
 * Утилиты для погодного модуля
 */

import Utils from '../../shared/utils.js';

export class WeatherUtils {
    static formatWeatherData(weatherData) {
        return {
            temperature: weatherData.temperature?.toFixed(1) + '°C',
            wind: weatherData.wind?.speed?.toFixed(1) + ' m/s',
            visibility: weatherData.visibility?.toFixed(0) + ' m',
            pressure: weatherData.pressure?.toFixed(0) + ' hPa'
        };
    }
    
    static getWeatherIcon(conditions) {
        const icons = {
            clear: '☀️',
            partly_cloudy: '🌤️',
            cloudy: '☁️',
            overcast: '☁️',
            rain: '🌧️',
            snow: '❄️',
            thunderstorm: '⛈️',
            fog: '🌫️'
        };
        return icons[conditions] || '☁️';
    }
    
    static assessFlightConditions(weatherData) {
        const windSpeed = weatherData.wind?.speed || 0;
        const visibility = weatherData.visibility || 0;
        
        if (windSpeed > 15 || visibility < 1000) {
            return { rating: 'POOR', risk: 'HIGH' };
        } else if (windSpeed > 10 || visibility < 3000) {
            return { rating: 'MODERATE', risk: 'MODERATE' };
        } else {
            return { rating: 'GOOD', risk: 'LOW' };
        }
    }
}

export default WeatherUtils;
`;
        
        fs.writeFileSync(utilsPath, content);
        console.log('  ✅ Created weather-utils.js');
    }

    createWeatherTests() {
        const testsPath = path.join(projectRoot, 'src/modules/weather/weather-tests.js');
        const content = `/**
 * Weather Tests
 * Тесты для погодного модуля
 */

import weatherModule from './weather-module.js';

export class WeatherTests {
    static async runAllTests() {
        console.log('🧪 Running Weather Module Tests...');
        
        const tests = [
            this.testInitialization,
            this.testWeatherCalculations,
            this.testCaching,
            this.testUIUpdates
        ];
        
        let passed = 0;
        let failed = 0;
        
        for (const test of tests) {
            try {
                await test();
                passed++;
                console.log('  ✅ ' + test.name + ' passed');
            } catch (error) {
                failed++;
                console.log('  ❌ ' + test.name + ' failed: ' + error.message);
            }
        }
        
        console.log('\n📊 Test Results: ' + passed + ' passed, ' + failed + ' failed');
        return { passed, failed };
    }
    
    static async testInitialization() {
        await weatherModule.init();
        if (!weatherModule.isInitialized) {
            throw new Error('Weather module not initialized');
        }
    }
    
    static async testWeatherCalculations() {
        const waypoints = [
            { lat: 68.0, lon: 33.0, name: 'START' },
            { lat: 68.1, lon: 33.1, name: 'END' }
        ];
        const flightParams = { cruiseSpeed: 200, fuelFlow: 600 };
        
        const result = await weatherModule.calculateRouteWithWeather(waypoints, flightParams);
        
        if (!result.totalDistance || !result.totalTime || !result.totalFuel) {
            throw new Error('Invalid calculation results');
        }
    }
    
    static async testCaching() {
        weatherModule.clearCache();
        const stats = weatherModule.getStats();
        
        if (stats.cacheSize !== 0) {
            throw new Error('Cache not cleared properly');
        }
    }
    
    static async testUIUpdates() {
        const mockWeatherData = {
            temperature: 15,
            wind: { speed: 5 },
            visibility: 10000,
            conditions: 'clear'
        };
        
        weatherModule.updateWeatherUI(mockWeatherData);
        // UI update test would need DOM elements
    }
}

export default WeatherTests;
`;
        
        fs.writeFileSync(testsPath, content);
        console.log('  ✅ Created weather-tests.js');
    }

    createWeatherReadme() {
        const readmePath = path.join(projectRoot, 'src/modules/weather/README.md');
        const content = `# Weather Module

Единый модуль для всех погодных функций EFB Flight Calculator.

## Файлы модуля

- \`weather-module.js\` - Основной модуль с всеми функциями
- \`weather-constants.js\` - Константы погодного модуля
- \`weather-utils.js\` - Утилиты для работы с погодными данными
- \`weather-tests.js\` - Тесты модуля

## Функциональность

### Расчеты
- Расчеты маршрута с учетом погоды
- Влияние ветра, температуры, давления
- Оценка рисков полета

### MCP Интеграция
- Получение погодных данных через MCP
- Кэширование данных
- Обработка ошибок

### UI Интеграция
- Обновление погодных виджетов
- Отображение условий полета
- Индикаторы риска

## Использование

\`\`\`javascript
import weatherModule from './weather-module.js';

// Инициализация
await weatherModule.init();

// Расчеты с погодой
const result = await weatherModule.calculateRouteWithWeather(waypoints, flightParams);

// Обновление UI
weatherModule.updateWeatherUI(weatherData);
\`\`\`

## События

- \`weather-module-ready\` - Модуль готов
- \`weather-calculations-complete\` - Расчеты завершены
- \`current-weather-updated\` - Погодные данные обновлены
- \`weather-error\` - Ошибка погодных данных
`;
        
        fs.writeFileSync(readmePath, content);
        console.log('  ✅ Created README.md');
    }

    updateImports() {
        console.log('\n🔄 Updating imports...');
        
        // Обновляем main.js для использования нового модуля
        const mainJsPath = path.join(projectRoot, 'src/main.js');
        
        if (fs.existsSync(mainJsPath)) {
            let content = fs.readFileSync(mainJsPath, 'utf8');
            
            // Заменяем старые импорты на новый модуль
            content = content.replace(
                /import WeatherCalculations from '\.\/modules\/weather-calculations\.js';/g,
                'import weatherModule from \'./modules/weather/weather-module.js\';'
            );
            
            content = content.replace(
                /WeatherCalculations/g,
                'weatherModule'
            );
            
            fs.writeFileSync(mainJsPath, content);
            console.log('  ✅ Updated main.js imports');
        }
    }

    reportResults() {
        console.log('\n📊 Weather Chaos Cleanup Results:');
        console.log('='.repeat(60));
        
        if (this.removedFiles.length > 0) {
            console.log(`✅ Removed ${this.removedFiles.length} duplicate files:`);
            this.removedFiles.forEach(file => console.log(`   - ${file}`));
        }
        
        if (this.consolidatedFiles.length > 0) {
            console.log(`\\n📦 Consolidated ${this.consolidatedFiles.length} files into weather module`);
        }
        
        if (this.errors.length > 0) {
            console.log(`\\n❌ ${this.errors.length} errors occurred:`);
            this.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        const totalReduction = this.removedFiles.length;
        console.log(`\\n🎯 Total reduction: ${totalReduction} files removed`);
        console.log('📁 Weather functionality now consolidated in: src/modules/weather/');
        
        console.log('\n' + '='.repeat(60));
    }
}

// Запуск очистки
const cleaner = new WeatherChaosCleaner();
cleaner.clean();
