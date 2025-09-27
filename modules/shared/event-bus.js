// Event Bus - Система событий для связи между модулями
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

// Создаем глобальный экземпляр
window.EventBus = new EventBus();

export default window.EventBus;
