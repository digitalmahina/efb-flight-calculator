# Модуль 7: CALCULATIONS - Расчеты полета

## 📋 Описание
Модуль для математических расчетов авиационных полетов с интеграцией погодных данных.

## 🎯 Основные функции
- Расчет расстояний между точками маршрута
- Расчет времени полета с учетом погодных условий
- Расчет расхода топлива с корректировкой на погоду
- Оптимизация маршрута по погодным факторам
- Статистика полета и анализ рисков

## 📁 Файлы модуля
- `weather-calculations.js` - Основной модуль расчетов с погодой ⭐
- `calculations-with-weather.js` - Интегрированный модуль с погодой ⭐
- `calculations.js` - Базовые расчеты без погоды
- `distance-calculator.js` - Расчеты расстояний
- `time-calculator.js` - Расчеты времени
- `fuel-calculator.js` - Расчеты топлива
- `route-optimizer.js` - Оптимизация маршрута

## 🔗 Зависимости
- `../mcp-integration/weather-mcp.js` - Погодные данные
- `../shared/event-bus.js` - Система событий
- `../shared/utils.js` - Общие утилиты
- `../shared/constants.js` - Константы

## 🚀 API модуля

### Основные методы:
```javascript
// Создание экземпляра с погодными данными
const calculations = createCalculationsWithWeather(weatherMCP);
await calculations.init();

// Расчет маршрута с погодой
await calculations.calculateRouteWithWeather(waypoints, flightParams, options)

// Расчет маршрута без погоды
calculations.calculateRouteWithoutWeather(waypoints, flightParams)

// Сравнение расчетов с погодой и без
await calculations.compareCalculations(waypoints, flightParams)

// Прямое использование погодных расчетов
const weatherCalc = new WeatherCalculations(weatherMCP);
await weatherCalc.calculateRouteWithWeather(waypoints, flightParams)
```

### Параметры входа:
```javascript
const waypoints = [
    { lat: 68.0, lon: 33.0, name: 'START' },
    { lat: 69.0, lon: 34.0, name: 'END' }
];

const flightParams = {
    cruiseSpeed: 200,    // км/ч
    fuelFlow: 600        // кг/ч
};

const options = {
    includeForecast: false,
    includeAlerts: true,
    useCache: true
};
```

### Результат:
```javascript
const results = {
    // Основные показатели (с погодой)
    totalDistance: 1500.5,     // км
    totalTime: 7.5,            // часы
    totalFuel: 4500.0,         // кг
    
    // Форматированные значения
    formattedTime: "07:30",
    formattedDistance: "1500.50 км",
    formattedFuel: "4500.0 кг",
    
    // Сегменты с погодными данными
    segments: [...],           // Детали по сегментам
    
    // Влияние погоды
    weatherImpact: {           // Влияние погоды
        windImpact: 0.05,
        temperatureImpact: 0.02,
        pressureImpact: 0.01,
        visibilityImpact: 0.03,
        overallImpact: 0.11
    },
    
    // Статистика
    statistics: {              // Статистика
        averageSpeed: 200.0,
        fuelEfficiency: 3.0,
        weatherRating: 'good',
        riskLevel: 'low',
        timeDifference: 0.3,   // Разница с базовыми расчетами
        fuelDifference: 150.0, // Разница с базовыми расчетами
        timeDifferencePercent: 4.2,
        fuelDifferencePercent: 3.4
    },
    
    // Базовые расчеты для сравнения
    basicResults: {
        totalTime: 7.2,
        totalFuel: 4350.0,
        formattedTime: "07:12",
        formattedFuel: "4350.0 кг"
    },
    
    // Метаданные
    weatherEnabled: true,
    weatherDataAvailable: true,
    calculatedAt: "2024-01-15T10:30:00.000Z"
};
```

## 🌤️ Погодные факторы

### Влияние ветра:
- **Встречный ветер** - увеличивает время полета
- **Попутный ветер** - уменьшает время полета
- **Боковой ветер** - влияет на расход топлива
- **Порывы ветра** - увеличивают нестабильность

### Влияние температуры:
- **Низкая температура** - увеличивает плотность воздуха
- **Высокая температура** - уменьшает плотность воздуха
- **Экстремальные температуры** - влияют на производительность

### Влияние давления:
- **Низкое давление** - уменьшает плотность воздуха
- **Высокое давление** - увеличивает плотность воздуха

### Влияние видимости:
- **Плохая видимость** - увеличивает время полета
- **Хорошая видимость** - стандартное время полета

## 📊 Категории оценки

### Ветер:
- `calm` - Штиль (< 5 м/с)
- `light` - Легкий (5-10 м/с)
- `moderate` - Умеренный (10-15 м/с)
- `fresh` - Свежий (15-25 м/с)
- `strong` - Сильный (> 25 м/с)

### Температура:
- `very_cold` - Очень холодно (< -20°C)
- `cold` - Холодно (-20°C до 0°C)
- `normal` - Нормально (0°C до 25°C)
- `hot` - Жарко (25°C до 35°C)
- `very_hot` - Очень жарко (> 35°C)

### Видимость:
- `excellent` - Отличная (> 10 км)
- `good` - Хорошая (5-10 км)
- `moderate` - Умеренная (2-5 км)
- `poor` - Плохая (< 2 км)

## 🎯 Рейтинги условий полета

### Общий рейтинг:
- `excellent` - Отличные условия
- `good` - Хорошие условия
- `moderate` - Умеренные условия
- `poor` - Плохие условия

### Уровень риска:
- `low` - Низкий риск
- `moderate` - Умеренный риск
- `high` - Высокий риск

## 📝 События

### Входящие события:
- `route-changed` - Изменение маршрута
- `weather-calculations-refresh` - Принудительное обновление
- `weather-error` - Ошибка получения погоды

### Исходящие события:
- `weather-calculations-complete` - Завершение расчетов
- `weather-calculations-error` - Ошибка расчетов
- `weather-calculations-cache-cleared` - Очистка кэша

## ⚙️ Конфигурация

### Константы:
```javascript
const constants = {
    EARTH_RADIUS: 6371,           // км
    STANDARD_TEMPERATURE: 15,     // °C
    STANDARD_PRESSURE: 1013.25,   // hPa
    LAPSE_RATE: 0.0065,           // °C/м
    
    WIND_IMPACT: {
        LIGHT: 0.02,      // 2% влияние
        MODERATE: 0.05,   // 5% влияние
        STRONG: 0.10,     // 10% влияние
        SEVERE: 0.20      // 20% влияние
    },
    
    TEMPERATURE_IMPACT: {
        COLD: 0.03,       // 3% увеличение
        HOT: 0.05,        // 5% увеличение
        EXTREME: 0.10     // 10% увеличение
    }
};
```

## 🧪 Тестирование

### Тестовые сценарии:
1. **Базовые расчеты** - без погодных данных
2. **Расчеты с ветром** - различные ветровые условия
3. **Расчеты с температурой** - экстремальные температуры
4. **Расчеты с давлением** - низкое/высокое давление
5. **Расчеты с видимостью** - плохая видимость
6. **Комплексные условия** - все факторы вместе
7. **Кэширование** - проверка работы кэша
8. **Обработка ошибок** - отсутствие погодных данных

### Пример теста:
```javascript
const waypoints = [
    { lat: 68.0, lon: 33.0, name: 'START' },
    { lat: 69.0, lon: 34.0, name: 'END' }
];

const flightParams = {
    cruiseSpeed: 200,
    fuelFlow: 600
};

const results = await weatherCalculations.calculateRouteWithWeather(
    waypoints, 
    flightParams
);

console.log('Total time:', results.totalTime);
console.log('Total fuel:', results.totalFuel);
console.log('Weather rating:', results.statistics.weatherRating);
```

## 🔧 Интеграция

### С EFB интерфейсом:
```javascript
// Обновление данных полета
EventBus.on('weather-calculations-complete', (results) => {
    updateFlightDataDisplay(results);
    updateRouteList(results.segments);
    updateWeatherPanel(results.weatherImpact);
});
```

### С картой:
```javascript
// Отображение погодных данных на карте
EventBus.on('weather-calculations-complete', (results) => {
    displayWeatherOnMap(results.segments);
    showWeatherAlerts(results.statistics.riskLevel);
});
```

## 📈 Производительность

### Оптимизации:
- **Кэширование расчетов** - 5 минут TTL
- **Пакетная обработка** - обработка сегментов группами
- **Умное кэширование** - по зонам погоды
- **Асинхронные операции** - неблокирующие расчеты

### Ограничения:
- **Максимум точек маршрута** - 100 точек
- **Таймаут запросов** - 30 секунд
- **Размер кэша** - 100 записей
- **Частота обновления** - не чаще 1 раза в минуту

## 🚀 Готовность к использованию

✅ **Основной функционал** - готов
✅ **Погодная интеграция** - готова
✅ **Кэширование** - реализовано
✅ **Обработка ошибок** - реализована
✅ **Система событий** - интегрирована
⏳ **Тестирование** - в процессе
⏳ **Документация** - обновляется

---

*Модуль готов к интеграции с EFB интерфейсом и другими компонентами системы*