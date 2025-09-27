/**
 * Event Bus - Система событий для связи между модулями
 * Версия: 2.0.0 (Refactored)
 */

class EventBus {
    constructor() {
        this.events = {};
        this.debugMode = false;
    }
    
    // Подписка на событие
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        if (this.debugMode) {
            console.log(`EventBus: Subscribed to ${event}`);
        }
    }
    
    // Отписка от события
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
            
            if (this.debugMode) {
                console.log(`EventBus: Unsubscribed from ${event}`);
            }
        }
    }
    
    // Отправка события
    emit(event, data) {
        if (this.events[event]) {
            if (this.debugMode) {
                console.log(`EventBus: Emitting ${event}`, data);
            }
            
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        } else if (this.debugMode) {
            console.warn(`EventBus: No listeners for ${event}`);
        }
    }
    
    // Очистка всех событий
    clear() {
        this.events = {};
        if (this.debugMode) {
            console.log('EventBus: All events cleared');
        }
    }
    
    // Получение списка всех событий
    getEvents() {
        return Object.keys(this.events);
    }
    
    // Получение количества подписчиков на событие
    getListenerCount(event) {
        return this.events[event] ? this.events[event].length : 0;
    }
    
    // Включение/выключение режима отладки
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`EventBus: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Создаем глобальный экземпляр
const eventBus = new EventBus();

// Экспорт для использования в модулях
export default eventBus;
