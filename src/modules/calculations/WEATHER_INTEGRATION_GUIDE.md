# 🌤️ Руководство по интеграции погодных данных

## 📋 Обзор

Модуль CALCULATIONS теперь поддерживает интеграцию с погодными данными для получения точных расчетов полета с учетом реальных условий.

## 🚀 Быстрый старт

### 1. Создание экземпляра
```javascript
import { createCalculationsWithWeather } from './calculations-with-weather.js';

// Создание экземпляра с погодными данными
const calculations = createCalculationsWithWeather(weatherMCP);
await calculations.init();
```

### 2. Базовый расчет с погодой
```javascript
const waypoints = [
    { lat: 55.7558, lon: 37.6176, name: 'Москва' },
    { lat: 59.9311, lon: 30.3609, name: 'СПб' }
];

const flightParams = {
    cruiseSpeed: 200,  // км/ч
    fuelFlow: 600      // кг/ч
};

const results = await calculations.calculateRouteWithWeather(waypoints, flightParams);
```

### 3. Сравнение с базовыми расчетами
```javascript
const comparison = await calculations.compareCalculations(waypoints, flightParams);

console.log('Разница во времени:', comparison.comparison.timeDifferencePercent + '%');
console.log('Разница в топливе:', comparison.comparison.fuelDifferencePercent + '%');
```

## 🔧 API методы

### Основные методы:
- `calculateRouteWithWeather()` - Расчет с погодными данными
- `calculateRouteWithoutWeather()` - Расчет без погодных данных
- `compareCalculations()` - Сравнение расчетов
- `getState()` - Получение состояния модуля

### Параметры опций:
```javascript
const options = {
    includeForecast: false,  // Включить прогноз
    includeAlerts: true,     // Включить предупреждения
    useCache: true          // Использовать кэш
};
```

## 📊 Структура результатов

### Основные показатели:
- `totalDistance` - Общее расстояние (км)
- `totalTime` - Общее время (часы)
- `totalFuel` - Общий расход топлива (кг)
- `formattedTime` - Форматированное время ("ч:мм")
- `formattedDistance` - Форматированное расстояние
- `formattedFuel` - Форматированный расход топлива

### Погодные данные:
- `weatherImpact` - Влияние погоды на расчеты
- `statistics.weatherRating` - Рейтинг погодных условий
- `statistics.riskLevel` - Уровень риска
- `segments[].weather` - Погодные данные по сегментам

### Сравнение:
- `statistics.timeDifference` - Разница во времени с базовыми расчетами
- `statistics.fuelDifference` - Разница в топливе с базовыми расчетами
- `basicResults` - Результаты базовых расчетов для сравнения

## 🌤️ Погодные факторы

### Влияние ветра:
- **Встречный ветер** - увеличивает время полета
- **Попутный ветер** - уменьшает время полета
- **Боковой ветер** - влияет на расход топлива

### Влияние температуры:
- **Низкая температура** - увеличивает плотность воздуха
- **Высокая температура** - уменьшает плотность воздуха

### Влияние давления:
- **Низкое давление** - уменьшает плотность воздуха
- **Высокое давление** - увеличивает плотность воздуха

### Влияние видимости:
- **Плохая видимость** - увеличивает время полета
- **Хорошая видимость** - стандартное время полета

## 📈 Рейтинги и оценки

### Рейтинг погодных условий:
- `excellent` - Отличные условия
- `good` - Хорошие условия
- `moderate` - Умеренные условия
- `poor` - Плохие условия

### Уровень риска:
- `low` - Низкий риск
- `moderate` - Умеренный риск
- `high` - Высокий риск

## 🔄 События

### Входящие события:
- `route-loaded` - Загрузка маршрута
- `flight-params-changed` - Изменение параметров полета
- `recalculate-route` - Запрос на пересчет

### Исходящие события:
- `calculations-complete` - Завершение расчетов
- `calculations-updated` - Обновление расчетов
- `calculations-recalculated` - Пересчет завершен
- `calculation-error` - Ошибка расчетов

## 💾 Кэширование

### Автоматическое кэширование:
- Результаты расчетов кэшируются на 5 минут
- Кэш очищается при изменении маршрута
- Поддержка принудительной очистки кэша

### Статистика кэша:
```javascript
const cacheStats = calculations.getState().weatherCacheStats;
console.log('Размер кэша:', cacheStats.calculationCache);
```

## ⚠️ Обработка ошибок

### Fallback к базовым расчетам:
При ошибке получения погодных данных модуль автоматически переключается на базовые расчеты без погоды.

### Индикаторы ошибок:
- `weatherEnabled: false` - Погодные данные отключены
- `weatherDataAvailable: false` - Данные погоды недоступны
- `weatherError` - Сообщение об ошибке
- `fallbackUsed: true` - Использован fallback

## 🧪 Тестирование

### Примеры использования:
```bash
# Запуск примеров
node examples/weather-integration-example.js

# Веб-демо
open example-usage.html
```

### Тестовые сценарии:
1. **Базовые расчеты** - без погодных данных
2. **Расчеты с ветром** - различные ветровые условия
3. **Расчеты с температурой** - экстремальные температуры
4. **Расчеты с давлением** - низкое/высокое давление
5. **Расчеты с видимостью** - плохая видимость
6. **Комплексные условия** - все факторы вместе
7. **Кэширование** - проверка работы кэша
8. **Обработка ошибок** - отсутствие погодных данных

## 🔗 Интеграция с EFB

### Обновление интерфейса:
```javascript
EventBus.on('calculations-complete', (data) => {
    if (data.weatherEnabled) {
        updateWeatherPanel(data.results.weatherImpact);
        updateRiskIndicator(data.results.statistics.riskLevel);
    }
    updateFlightDataDisplay(data.results);
});
```

### Отображение на карте:
```javascript
EventBus.on('calculations-complete', (data) => {
    displayWeatherOnMap(data.results.segments);
    showWeatherAlerts(data.results.statistics.riskLevel);
});
```

## 📝 Рекомендации

### Для разработчиков:
1. **Всегда проверяйте** `weatherEnabled` перед использованием погодных данных
2. **Обрабатывайте ошибки** и используйте fallback к базовым расчетам
3. **Используйте кэширование** для улучшения производительности
4. **Мониторьте события** для обновления интерфейса

### Для пользователей:
1. **Проверяйте рейтинг погоды** перед полетом
2. **Обращайте внимание на уровень риска**
3. **Учитывайте рекомендации** системы
4. **Сравнивайте расчеты** с погодой и без

---

**Модуль готов к использованию в производственной среде! 🚀**
