# Модуль 9: MCP-INTEGRATION - Интеграция с MCP

## 📋 Описание
Модуль для интеграции с MCP (Model Context Protocol) серверами и инструментами.

## 🎯 Функции
- Подключение к MCP серверам
- Управление MCP инструментами
- Обработка MCP запросов и ответов
- Интеграция с внешними сервисами
- Кэширование MCP данных
- Обработка ошибок MCP

## 📁 Файлы модуля
- `mcp-client.js` - MCP клиент
- `mcp-tools.js` - Управление инструментами
- `weather-mcp.js` - Специализированный модуль для погодных данных ⭐
- `test-weather.js` - Тесты погодной интеграции
- `test-weather.html` - Веб-интерфейс для тестирования
- `mcp-handlers.js` - Обработчики запросов
- `mcp-cache.js` - Кэширование данных
- `mcp-config.js` - Конфигурация MCP

## 🔗 Зависимости
- `shared/constants.js` - Константы
- `shared/utils.js` - Утилиты
- `shared/event-bus.js` - Система событий

## 🚀 API модуля
```javascript
export default {
    init: () => {},           // Инициализация MCP
    destroy: () => {},        // Очистка соединений
    update: (data) => {},     // Обновление данных
    getState: () => {},       // Получение состояния
    setState: (state) => {},  // Установка состояния
    
    // MCP специфичные методы
    connect: (server) => {},  // Подключение к серверу
    disconnect: () => {},     // Отключение
    callTool: (tool, params) => {}, // Вызов инструмента
    listTools: () => {},      // Список доступных инструментов
    getToolInfo: (tool) => {} // Информация об инструменте
}
```

## 📝 События
- `mcp-connected` - Подключение к MCP серверу
- `mcp-disconnected` - Отключение от сервера
- `mcp-tool-call` - Вызов MCP инструмента
- `mcp-tool-result` - Результат выполнения инструмента
- `mcp-error` - Ошибка MCP

## 🛠️ Поддерживаемые MCP инструменты
- **Figma MCP** - Работа с Figma файлами
- **SVG Maker** - Генерация SVG изображений
- **Web Search** - Поиск в интернете
- **Weather MCP** - Погодные данные для авиации ⭐
  - `get_current_weather` - Текущая погода
  - `get_weather_forecast` - Прогноз погоды
  - `get_metar_data` - METAR данные
  - `get_taf_data` - TAF прогнозы
  - `get_wind_data` - Детальные данные о ветре
  - `get_weather_alerts` - Погодные предупреждения

## 🎨 Интеграция с проектом
- Автоматическое подключение при инициализации
- Кэширование результатов для производительности
- Обработка ошибок и повторные попытки
- Логирование всех MCP операций

## ⚙️ Конфигурация
```javascript
const MCP_CONFIG = {
    servers: {
        figma: {
            url: 'mcp://figma',
            tools: ['get_figma_data', 'download_figma_images']
        },
        svgmaker: {
            url: 'mcp://svgmaker',
            tools: ['svgmaker_generate', 'svgmaker_edit']
        }
    },
    cache: {
        enabled: true,
        ttl: 300000 // 5 минут
    },
    retry: {
        attempts: 3,
        delay: 1000
    }
}
```
