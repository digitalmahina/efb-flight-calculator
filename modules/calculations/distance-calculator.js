/**
 * 🧮 МОДУЛЬ РАСЧЕТА РАССТОЯНИЙ
 * 
 * Отвечает за расчет расстояний между географическими точками
 * используя формулу Хаверсинуса для точного расчета на сфере
 */

// Константы для расчетов
const EARTH_RADIUS_KM = 6371; // Радиус Земли в километрах
const EARTH_RADIUS_NM = 3440; // Радиус Земли в морских милях
const EARTH_RADIUS_MI = 3959; // Радиус Земли в милях

/**
 * Конвертирует градусы в радианы
 * @param {number} degrees - Угол в градусах
 * @returns {number} Угол в радианах
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Конвертирует радианы в градусы
 * @param {number} radians - Угол в радианах
 * @returns {number} Угол в градусах
 */
function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Проверяет валидность координат
 * @param {number} lat - Широта
 * @param {number} lon - Долгота
 * @returns {boolean} true если координаты валидны
 */
function validateCoordinates(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
        return false;
    }
    
    if (isNaN(lat) || isNaN(lon)) {
        return false;
    }
    
    if (lat < -90 || lat > 90) {
        return false;
    }
    
    if (lon < -180 || lon > 180) {
        return false;
    }
    
    return true;
}

/**
 * Рассчитывает расстояние между двумя точками на сфере используя формулу Хаверсинуса
 * @param {number} lat1 - Широта первой точки
 * @param {number} lon1 - Долгота первой точки
 * @param {number} lat2 - Широта второй точки
 * @param {number} lon2 - Долгота второй точки
 * @param {string} unit - Единица измерения ('km', 'nm', 'mi')
 * @returns {number} Расстояние в указанных единицах
 */
function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
    // Валидация входных данных
    if (!validateCoordinates(lat1, lon1) || !validateCoordinates(lat2, lon2)) {
        throw new Error('Invalid coordinates provided');
    }
    
    // Конвертация в радианы
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);
    
    // Разности координат
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = lon2Rad - lon1Rad;
    
    // Формула Хаверсинуса
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // Выбор радиуса в зависимости от единицы измерения
    let radius;
    switch (unit.toLowerCase()) {
        case 'nm':
        case 'nautical':
            radius = EARTH_RADIUS_NM;
            break;
        case 'mi':
        case 'miles':
            radius = EARTH_RADIUS_MI;
            break;
        case 'km':
        case 'kilometers':
        default:
            radius = EARTH_RADIUS_KM;
            break;
    }
    
    const distance = radius * c;
    
    // Округление до 6 знаков после запятой
    return Math.round(distance * 1000000) / 1000000;
}

/**
 * Рассчитывает азимут (направление) от первой точки ко второй
 * @param {number} lat1 - Широта первой точки
 * @param {number} lon1 - Долгота первой точки
 * @param {number} lat2 - Широта второй точки
 * @param {number} lon2 - Долгота второй точки
 * @returns {number} Азимут в градусах (0-360)
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
    if (!validateCoordinates(lat1, lon1) || !validateCoordinates(lat2, lon2)) {
        throw new Error('Invalid coordinates provided');
    }
    
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);
    const deltaLonRad = toRadians(lon2 - lon1);
    
    const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);
    
    let bearing = toDegrees(Math.atan2(y, x));
    
    // Нормализация к диапазону 0-360
    bearing = (bearing + 360) % 360;
    
    return Math.round(bearing * 100) / 100;
}

/**
 * Рассчитывает промежуточную точку на пути между двумя точками
 * @param {number} lat1 - Широта первой точки
 * @param {number} lon1 - Долгота первой точки
 * @param {number} lat2 - Широта второй точки
 * @param {number} lon2 - Долгота второй точки
 * @param {number} fraction - Доля пути (0-1)
 * @returns {Object} Координаты промежуточной точки {lat, lon}
 */
function calculateIntermediatePoint(lat1, lon1, lat2, lon2, fraction) {
    if (!validateCoordinates(lat1, lon1) || !validateCoordinates(lat2, lon2)) {
        throw new Error('Invalid coordinates provided');
    }
    
    if (fraction < 0 || fraction > 1) {
        throw new Error('Fraction must be between 0 and 1');
    }
    
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);
    
    const deltaLonRad = lon2Rad - lon1Rad;
    
    const a = Math.sin((1 - fraction) * deltaLonRad) / Math.sin(deltaLonRad);
    const b = Math.sin(fraction * deltaLonRad) / Math.sin(deltaLonRad);
    
    const x = a * Math.cos(lat1Rad) * Math.cos(lon1Rad) + 
              b * Math.cos(lat2Rad) * Math.cos(lon2Rad);
    const y = a * Math.cos(lat1Rad) * Math.sin(lon1Rad) + 
              b * Math.cos(lat2Rad) * Math.sin(lon2Rad);
    const z = a * Math.sin(lat1Rad) + b * Math.sin(lat2Rad);
    
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);
    
    return {
        lat: toDegrees(lat),
        lon: toDegrees(lon)
    };
}

/**
 * Рассчитывает общее расстояние для массива точек маршрута
 * @param {Array} waypoints - Массив точек маршрута [{lat, lon, name?}, ...]
 * @param {string} unit - Единица измерения
 * @returns {Object} Результат расчета {totalDistance, segments}
 */
function calculateRouteDistance(waypoints, unit = 'km') {
    if (!Array.isArray(waypoints) || waypoints.length < 2) {
        throw new Error('Waypoints array must contain at least 2 points');
    }
    
    let totalDistance = 0;
    const segments = [];
    
    for (let i = 0; i < waypoints.length - 1; i++) {
        const current = waypoints[i];
        const next = waypoints[i + 1];
        
        if (!current.lat || !current.lon || !next.lat || !next.lon) {
            throw new Error(`Invalid coordinates in waypoint ${i + 1}`);
        }
        
        const distance = calculateDistance(
            current.lat, current.lon,
            next.lat, next.lon,
            unit
        );
        
        const bearing = calculateBearing(
            current.lat, current.lon,
            next.lat, next.lon
        );
        
        totalDistance += distance;
        
        segments.push({
            from: current.name || `WPT${i + 1}`,
            to: next.name || `WPT${i + 2}`,
            distance: Math.round(distance * 1000) / 1000,
            bearing: bearing,
            coordinates: {
                from: { lat: current.lat, lon: current.lon },
                to: { lat: next.lat, lon: next.lon }
            }
        });
    }
    
    return {
        totalDistance: Math.round(totalDistance * 1000) / 1000,
        segments: segments,
        unit: unit
    };
}

/**
 * Конвертирует расстояние между единицами измерения
 * @param {number} distance - Расстояние
 * @param {string} fromUnit - Исходная единица
 * @param {string} toUnit - Целевая единица
 * @returns {number} Конвертированное расстояние
 */
function convertDistance(distance, fromUnit, toUnit) {
    const conversions = {
        'km': { 'nm': 0.539957, 'mi': 0.621371 },
        'nm': { 'km': 1.852, 'mi': 1.15078 },
        'mi': { 'km': 1.60934, 'nm': 0.868976 }
    };
    
    if (fromUnit === toUnit) {
        return distance;
    }
    
    if (!conversions[fromUnit] || !conversions[fromUnit][toUnit]) {
        throw new Error(`Conversion from ${fromUnit} to ${toUnit} not supported`);
    }
    
    return distance * conversions[fromUnit][toUnit];
}

// Экспорт функций
export {
    calculateDistance,
    calculateBearing,
    calculateIntermediatePoint,
    calculateRouteDistance,
    convertDistance,
    validateCoordinates,
    toRadians,
    toDegrees,
    EARTH_RADIUS_KM,
    EARTH_RADIUS_NM,
    EARTH_RADIUS_MI
};

// Экспорт по умолчанию
export default {
    calculateDistance,
    calculateBearing,
    calculateIntermediatePoint,
    calculateRouteDistance,
    convertDistance,
    validateCoordinates,
    toRadians,
    toDegrees,
    constants: {
        EARTH_RADIUS_KM,
        EARTH_RADIUS_NM,
        EARTH_RADIUS_MI
    }
};
