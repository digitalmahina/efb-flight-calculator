// Event Bus - Система событий для связи между модулями (Node- и Browser-safe)
class EventBus {
    constructor() {
        this.events = {};
    }

    // Подписка на событие
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // Отписка от события
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    // Отправка события
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    // Очистка всех событий
    clear() {
        this.events = {};
    }
}

// Универсальное определение глобальной области, безопасное для Node и браузера
const globalScope = (typeof globalThis !== 'undefined')
    ? globalThis
    : (typeof window !== 'undefined')
        ? window
        : (typeof global !== 'undefined')
            ? global
            : {};

const eventBusInstance = new EventBus();

// Экспорт для CommonJS (Node)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = eventBusInstance;
}

// Экспорт и привязка для браузера (глобально)
if (globalScope && !globalScope.EventBus) {
    globalScope.EventBus = eventBusInstance;
}
