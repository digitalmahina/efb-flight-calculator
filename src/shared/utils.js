/**
 * Utils - Утилиты для всех модулей
 * Версия: 2.0.0 (Refactored)
 */

class Utils {
    // Форматирование времени в ЧЧ:ММ
    static formatTime(hours) {
        const totalMinutes = Math.round(hours * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    
    // Форматирование расстояния
    static formatDistance(km, decimals = 2) {
        return `${km.toFixed(decimals)} км`;
    }
    
    // Форматирование топлива
    static formatFuel(kg, decimals = 1) {
        return `${kg.toFixed(decimals)} кг`;
    }
    
    // Форматирование скорости
    static formatSpeed(kmh, decimals = 0) {
        return `${kmh.toFixed(decimals)} км/ч`;
    }
    
    // Расчет расстояния между двумя точками (формула гаверсинуса)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Радиус Земли в километрах
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    // Конвертация градусов в радианы
    static toRadians(degrees) {
        return degrees * (Math.PI/180);
    }
    
    // Конвертация радианов в градусы
    static toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    
    // Расчет азимута между двумя точками
    static calculateBearing(lat1, lon1, lat2, lon2) {
        const dLon = this.toRadians(lon2 - lon1);
        const lat1Rad = this.toRadians(lat1);
        const lat2Rad = this.toRadians(lat2);
        
        const y = Math.sin(dLon) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
        
        let bearing = Math.atan2(y, x);
        bearing = this.toDegrees(bearing);
        bearing = (bearing + 360) % 360;
        
        return bearing;
    }
    
    // Получение короткого имени для маркера
    static getShortName(name) {
        if (!name || name === '') return 'WPT';
        
        if (name.length > 4) {
            return name.substring(0, 4).toUpperCase();
        }
        
        return name.toUpperCase();
    }
    
    // Валидация координат
    static validateCoordinates(lat, lon) {
        return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }
    
    // Валидация скорости
    static validateSpeed(speed) {
        return speed > 0 && speed <= 2000;
    }
    
    // Валидация расхода топлива
    static validateFuelFlow(fuelFlow) {
        return fuelFlow > 0 && fuelFlow <= 5000;
    }
    
    // Создание уникального ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Дебаунс функции
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Троттлинг функции
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Показ уведомления
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '4px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // Цвета в зависимости от типа
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Клонирование объекта
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
    
    // Проверка на пустой объект
    static isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
    
    // Получение случайного элемента из массива
    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Округление до указанного количества знаков
    static roundTo(value, decimals) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
}

// Экспорт для использования в модулях
export default Utils;
