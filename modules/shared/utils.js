// Утилиты для всех модулей
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
}

// Экспорт для использования в модулях
window.Utils = Utils;
export default Utils;
