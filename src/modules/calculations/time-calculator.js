/**
 * ⏰ МОДУЛЬ РАСЧЕТА ВРЕМЕНИ ПОЛЕТА
 * 
 * Отвечает за расчет времени полета, форматирование времени
 * и учет различных факторов, влияющих на продолжительность полета
 */

/**
 * Форматирует время в часах в формат "ч:мм"
 * @param {number} hours - Время в часах
 * @returns {string} Отформатированное время "ч:мм"
 */
function formatTime(hours) {
    if (typeof hours !== 'number' || isNaN(hours) || hours < 0) {
        throw new Error('Invalid hours value');
    }
    
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Парсит время в формате "ч:мм" в часы
 * @param {string} timeString - Время в формате "ч:мм"
 * @returns {number} Время в часах
 */
function parseTime(timeString) {
    if (typeof timeString !== 'string') {
        throw new Error('Time string must be a string');
    }
    
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = timeString.match(timeRegex);
    
    if (!match) {
        throw new Error('Invalid time format. Use HH:MM');
    }
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    
    if (minutes >= 60) {
        throw new Error('Minutes must be less than 60');
    }
    
    return hours + (minutes / 60);
}

/**
 * Рассчитывает время полета на основе расстояния и скорости
 * @param {number} distance - Расстояние в км
 * @param {number} speed - Скорость в км/ч
 * @returns {number} Время полета в часах
 */
function calculateFlightTime(distance, speed) {
    if (typeof distance !== 'number' || typeof speed !== 'number') {
        throw new Error('Distance and speed must be numbers');
    }
    
    if (distance < 0) {
        throw new Error('Distance cannot be negative');
    }
    
    if (speed <= 0) {
        throw new Error('Speed must be positive');
    }
    
    return distance / speed;
}

/**
 * Рассчитывает время полета с учетом ветра
 * @param {number} distance - Расстояние в км
 * @param {number} airspeed - Воздушная скорость в км/ч
 * @param {number} windSpeed - Скорость ветра в км/ч
 * @param {number} windDirection - Направление ветра в градусах
 * @param {number} courseDirection - Направление курса в градусах
 * @returns {Object} Результат расчета {groundSpeed, flightTime, windEffect}
 */
function calculateTimeWithWind(distance, airspeed, windSpeed, windDirection, courseDirection) {
    if (typeof distance !== 'number' || distance < 0) {
        throw new Error('Invalid distance');
    }
    
    if (typeof airspeed !== 'number' || airspeed <= 0) {
        throw new Error('Invalid airspeed');
    }
    
    if (typeof windSpeed !== 'number' || windSpeed < 0) {
        throw new Error('Invalid wind speed');
    }
    
    // Конвертация в радианы
    const windRad = (windDirection * Math.PI) / 180;
    const courseRad = (courseDirection * Math.PI) / 180;
    
    // Расчет угла между ветром и курсом
    const windAngle = windRad - courseRad;
    
    // Расчет путевой скорости
    const windComponent = windSpeed * Math.cos(windAngle);
    const groundSpeed = airspeed + windComponent;
    
    if (groundSpeed <= 0) {
        throw new Error('Ground speed cannot be zero or negative');
    }
    
    const flightTime = distance / groundSpeed;
    const windEffect = windComponent; // Положительное = попутный, отрицательное = встречный
    
    return {
        groundSpeed: Math.round(groundSpeed * 100) / 100,
        flightTime: Math.round(flightTime * 10000) / 10000,
        windEffect: Math.round(windEffect * 100) / 100,
        windComponent: Math.round(windComponent * 100) / 100
    };
}

/**
 * Рассчитывает общее время полета для маршрута
 * @param {Array} segments - Массив сегментов маршрута
 * @param {number} cruiseSpeed - Крейсерская скорость в км/ч
 * @param {Object} windData - Данные о ветре {speed, direction}
 * @returns {Object} Результат расчета времени
 */
function calculateRouteTime(segments, cruiseSpeed, windData = null) {
    if (!Array.isArray(segments) || segments.length === 0) {
        throw new Error('Segments array is required');
    }
    
    if (typeof cruiseSpeed !== 'number' || cruiseSpeed <= 0) {
        throw new Error('Invalid cruise speed');
    }
    
    let totalTime = 0;
    const segmentTimes = [];
    
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        if (!segment.distance || segment.distance <= 0) {
            throw new Error(`Invalid distance in segment ${i + 1}`);
        }
        
        let segmentTime;
        
        if (windData && windData.speed > 0) {
            // Расчет с учетом ветра
            const windResult = calculateTimeWithWind(
                segment.distance,
                cruiseSpeed,
                windData.speed,
                windData.direction,
                segment.bearing || 0
            );
            segmentTime = windResult.flightTime;
        } else {
            // Простой расчет без ветра
            segmentTime = calculateFlightTime(segment.distance, cruiseSpeed);
        }
        
        totalTime += segmentTime;
        
        segmentTimes.push({
            segment: i + 1,
            from: segment.from,
            to: segment.to,
            distance: segment.distance,
            time: Math.round(segmentTime * 10000) / 10000,
            formattedTime: formatTime(segmentTime),
            speed: cruiseSpeed
        });
    }
    
    return {
        totalTime: Math.round(totalTime * 10000) / 10000,
        formattedTotalTime: formatTime(totalTime),
        segments: segmentTimes,
        averageSpeed: cruiseSpeed
    };
}

/**
 * Добавляет время к существующему времени
 * @param {string} baseTime - Базовое время в формате "ч:мм"
 * @param {string} addTime - Добавляемое время в формате "ч:мм"
 * @returns {string} Суммарное время в формате "ч:мм"
 */
function addTime(baseTime, addTime) {
    const baseHours = parseTime(baseTime);
    const addHours = parseTime(addTime);
    const totalHours = baseHours + addHours;
    
    return formatTime(totalHours);
}

/**
 * Вычитает время из существующего времени
 * @param {string} baseTime - Базовое время в формате "ч:мм"
 * @param {string} subtractTime - Вычитаемое время в формате "ч:мм"
 * @returns {string} Разность времени в формате "ч:мм"
 */
function subtractTime(baseTime, subtractTime) {
    const baseHours = parseTime(baseTime);
    const subtractHours = parseTime(subtractTime);
    const resultHours = Math.max(0, baseHours - subtractHours);
    
    return formatTime(resultHours);
}

/**
 * Рассчитывает время прибытия
 * @param {string} departureTime - Время вылета в формате "ч:мм"
 * @param {number} flightTime - Время полета в часах
 * @returns {string} Время прибытия в формате "ч:мм"
 */
function calculateArrivalTime(departureTime, flightTime) {
    const departureHours = parseTime(departureTime);
    const arrivalHours = departureHours + flightTime;
    
    return formatTime(arrivalHours);
}

/**
 * Рассчитывает время вылета
 * @param {string} arrivalTime - Время прибытия в формате "ч:мм"
 * @param {number} flightTime - Время полета в часах
 * @returns {string} Время вылета в формате "ч:мм"
 */
function calculateDepartureTime(arrivalTime, flightTime) {
    const arrivalHours = parseTime(arrivalTime);
    const departureHours = Math.max(0, arrivalHours - flightTime);
    
    return formatTime(departureHours);
}

/**
 * Конвертирует время между единицами измерения
 * @param {number} time - Время
 * @param {string} fromUnit - Исходная единица ('hours', 'minutes', 'seconds')
 * @param {string} toUnit - Целевая единица ('hours', 'minutes', 'seconds')
 * @returns {number} Конвертированное время
 */
function convertTime(time, fromUnit, toUnit) {
    const conversions = {
        'hours': { 'minutes': 60, 'seconds': 3600 },
        'minutes': { 'hours': 1/60, 'seconds': 60 },
        'seconds': { 'hours': 1/3600, 'minutes': 1/60 }
    };
    
    if (fromUnit === toUnit) {
        return time;
    }
    
    if (!conversions[fromUnit] || !conversions[fromUnit][toUnit]) {
        throw new Error(`Conversion from ${fromUnit} to ${toUnit} not supported`);
    }
    
    return time * conversions[fromUnit][toUnit];
}

/**
 * Рассчитывает время с учетом резерва
 * @param {number} baseTime - Базовое время в часах
 * @param {number} reservePercent - Процент резерва (по умолчанию 10%)
 * @returns {Object} Время с резервом {baseTime, reserveTime, totalTime}
 */
function calculateTimeWithReserve(baseTime, reservePercent = 10) {
    if (typeof baseTime !== 'number' || baseTime < 0) {
        throw new Error('Invalid base time');
    }
    
    if (typeof reservePercent !== 'number' || reservePercent < 0) {
        throw new Error('Invalid reserve percentage');
    }
    
    const reserveTime = baseTime * (reservePercent / 100);
    const totalTime = baseTime + reserveTime;
    
    return {
        baseTime: Math.round(baseTime * 10000) / 10000,
        reserveTime: Math.round(reserveTime * 10000) / 10000,
        totalTime: Math.round(totalTime * 10000) / 10000,
        formattedBaseTime: formatTime(baseTime),
        formattedReserveTime: formatTime(reserveTime),
        formattedTotalTime: formatTime(totalTime),
        reservePercent: reservePercent
    };
}

// Экспорт функций
export {
    formatTime,
    parseTime,
    calculateFlightTime,
    calculateTimeWithWind,
    calculateRouteTime,
    addTime,
    subtractTime,
    calculateArrivalTime,
    calculateDepartureTime,
    convertTime,
    calculateTimeWithReserve
};

// Экспорт по умолчанию
export default {
    formatTime,
    parseTime,
    calculateFlightTime,
    calculateTimeWithWind,
    calculateRouteTime,
    addTime,
    subtractTime,
    calculateArrivalTime,
    calculateDepartureTime,
    convertTime,
    calculateTimeWithReserve
};
