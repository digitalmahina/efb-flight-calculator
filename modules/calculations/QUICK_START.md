# 🚀 Быстрый старт - Модуль CALCULATIONS

## 📋 Что это?

Модуль `CALCULATIONS` - это ядро вычислительной логики авиационного калькулятора, которое выполняет все математические расчеты для полетов.

## ⚡ Быстрое использование

### 1. Инициализация
```javascript
import Calculations from './calculations.js';

// Инициализация модуля
await Calculations.init();
```

### 2. Базовые расчеты
```javascript
// Расстояние между точками
const distance = Calculations.calculateDistance(55.7558, 37.6176, 59.9311, 30.3609);

// Время полета
const time = Calculations.calculateTime(635, 200); // 635 км при 200 км/ч

// Расход топлива
const fuel = Calculations.calculateFuel(3.175, 600); // 3.175 часа при 600 кг/ч
```

### 3. Полный расчет маршрута
```javascript
const route = [
    { lat: 55.7558, lon: 37.6176, name: 'Москва' },
    { lat: 59.9311, lon: 30.3609, name: 'СПб' }
];

const params = {
    cruiseSpeed: 200,  // км/ч
    fuelFlow: 600,     // кг/ч
    reserveFuel: 10    // %
};

const result = Calculations.calculateRoute(route, params);
console.log(`Расстояние: ${result.formattedDistance}`);
console.log(`Время: ${result.formattedTime}`);
console.log(`Топливо: ${result.formattedFuel}`);
```

## 🎯 Основные функции

| Функция | Описание |
|---------|----------|
| `calculateDistance()` | Расчет расстояния между точками |
| `calculateTime()` | Расчет времени полета |
| `calculateFuel()` | Расчет расхода топлива |
| `calculateRoute()` | Полный расчет маршрута |
| `formatTime()` | Форматирование времени |
| `validateInputs()` | Валидация входных данных |

## 📁 Структура файлов

```
calculations/
├── calculations.js          # Главный файл модуля
├── distance-calculator.js   # Расчеты расстояний
├── time-calculator.js       # Расчеты времени
├── fuel-calculator.js       # Расчеты топлива
├── route-optimizer.js       # Оптимизация маршрутов
├── tests/                   # Тесты
├── examples/                # Примеры использования
└── README.md               # Полная документация
```

## 🧪 Тестирование

```bash
# Запуск всех тестов
node tests/run-all-tests.js

# Запуск отдельных тестов
node tests/distance.test.js
node tests/time.test.js
node tests/fuel.test.js
```

## 📚 Примеры

```bash
# Базовые примеры
node examples/basic-calculations.js

# Продвинутые примеры
node examples/advanced-optimization.js

# Веб-интерфейс
open example-usage.html
```

## 🔧 Интеграция с другими модулями

```javascript
// Подписка на события
EventBus.on('route-loaded', (data) => {
    const results = Calculations.calculateRoute(data.route);
    EventBus.emit('calculations-complete', results);
});

// Отправка результатов
EventBus.emit('calculations-complete', {
    totalDistance: 635,
    totalTime: 3.175,
    totalFuel: 1905
});
```

## ⚠️ Важные замечания

1. **Всегда инициализируйте модуль** перед использованием
2. **Проверяйте входные данные** с помощью `validateInputs()`
3. **Используйте кэширование** для повторных расчетов
4. **Обрабатывайте ошибки** при работе с модулем

## 🆘 Поддержка

- 📖 Полная документация: `README.md`
- 🧪 Тесты: папка `tests/`
- 📚 Примеры: папка `examples/`
- 🌐 Демо: `example-usage.html`

---

**Модуль готов к использованию! 🎉**
