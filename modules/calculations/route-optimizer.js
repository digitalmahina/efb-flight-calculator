/**
 * 🛣️ МОДУЛЬ ОПТИМИЗАЦИИ МАРШРУТА
 * 
 * Отвечает за оптимизацию маршрутов, анализ статистики,
 * поиск кратчайших путей и расчет эффективности полета
 */

import { calculateDistance, calculateBearing } from './distance-calculator.js';
import { calculateFlightTime } from './time-calculator.js';
import { calculateFuelConsumption } from './fuel-calculator.js';

/**
 * Анализирует статистику маршрута
 * @param {Array} segments - Массив сегментов маршрута
 * @returns {Object} Статистика маршрута
 */
function analyzeRouteStatistics(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
        throw new Error('Segments array is required');
    }
    
    const distances = segments.map(seg => seg.distance);
    const bearings = segments.map(seg => seg.bearing || 0);
    
    const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
    const averageDistance = totalDistance / segments.length;
    const longestSegment = Math.max(...distances);
    const shortestSegment = Math.min(...distances);
    
    // Анализ направлений
    const bearingChanges = [];
    for (let i = 1; i < bearings.length; i++) {
        const change = Math.abs(bearings[i] - bearings[i-1]);
        bearingChanges.push(change > 180 ? 360 - change : change);
    }
    
    const averageBearingChange = bearingChanges.length > 0 
        ? bearingChanges.reduce((sum, change) => sum + change, 0) / bearingChanges.length 
        : 0;
    
    // Расчет прямолинейности маршрута
    const directDistance = calculateDirectDistance(segments);
    const efficiency = directDistance > 0 ? (directDistance / totalDistance) * 100 : 100;
    
    return {
        totalDistance: Math.round(totalDistance * 1000) / 1000,
        segmentCount: segments.length,
        averageDistance: Math.round(averageDistance * 1000) / 1000,
        longestSegment: Math.round(longestSegment * 1000) / 1000,
        shortestSegment: Math.round(shortestSegment * 1000) / 1000,
        averageBearingChange: Math.round(averageBearingChange * 100) / 100,
        routeEfficiency: Math.round(efficiency * 100) / 100,
        directDistance: Math.round(directDistance * 1000) / 1000
    };
}

/**
 * Рассчитывает прямое расстояние от начала до конца маршрута
 * @param {Array} segments - Массив сегментов маршрута
 * @returns {number} Прямое расстояние в км
 */
function calculateDirectDistance(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
        return 0;
    }
    
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    
    if (!firstSegment.coordinates || !lastSegment.coordinates) {
        return 0;
    }
    
    return calculateDistance(
        firstSegment.coordinates.from.lat,
        firstSegment.coordinates.from.lon,
        lastSegment.coordinates.to.lat,
        lastSegment.coordinates.to.lon
    );
}

/**
 * Оптимизирует маршрут по расстоянию (алгоритм ближайшего соседа)
 * @param {Array} waypoints - Массив точек маршрута
 * @param {Object} startPoint - Начальная точка {lat, lon}
 * @returns {Array} Оптимизированный маршрут
 */
function optimizeRouteByDistance(waypoints, startPoint) {
    if (!Array.isArray(waypoints) || waypoints.length === 0) {
        throw new Error('Waypoints array is required');
    }
    
    if (!startPoint || !startPoint.lat || !startPoint.lon) {
        throw new Error('Start point is required');
    }
    
    const optimizedRoute = [];
    const remainingWaypoints = [...waypoints];
    let currentPoint = startPoint;
    
    while (remainingWaypoints.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = calculateDistance(
            currentPoint.lat, currentPoint.lon,
            remainingWaypoints[0].lat, remainingWaypoints[0].lon
        );
        
        // Поиск ближайшей точки
        for (let i = 1; i < remainingWaypoints.length; i++) {
            const distance = calculateDistance(
                currentPoint.lat, currentPoint.lon,
                remainingWaypoints[i].lat, remainingWaypoints[i].lon
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }
        
        const nearestWaypoint = remainingWaypoints[nearestIndex];
        optimizedRoute.push({
            ...nearestWaypoint,
            distanceFromPrevious: nearestDistance
        });
        
        currentPoint = nearestWaypoint;
        remainingWaypoints.splice(nearestIndex, 1);
    }
    
    return optimizedRoute;
}

/**
 * Оптимизирует маршрут по времени полета
 * @param {Array} waypoints - Массив точек маршрута
 * @param {Object} startPoint - Начальная точка
 * @param {number} cruiseSpeed - Крейсерская скорость в км/ч
 * @returns {Array} Оптимизированный маршрут с временными данными
 */
function optimizeRouteByTime(waypoints, startPoint, cruiseSpeed) {
    if (typeof cruiseSpeed !== 'number' || cruiseSpeed <= 0) {
        throw new Error('Invalid cruise speed');
    }
    
    const optimizedRoute = optimizeRouteByDistance(waypoints, startPoint);
    
    // Добавление временных данных
    return optimizedRoute.map((waypoint, index) => {
        const flightTime = calculateFlightTime(waypoint.distanceFromPrevious, cruiseSpeed);
        return {
            ...waypoint,
            flightTime: Math.round(flightTime * 10000) / 10000,
            cumulativeTime: index === 0 ? flightTime : 
                optimizedRoute.slice(0, index).reduce((sum, wp) => sum + wp.flightTime, 0) + flightTime
        };
    });
}

/**
 * Оптимизирует маршрут по расходу топлива
 * @param {Array} waypoints - Массив точек маршрута
 * @param {Object} startPoint - Начальная точка
 * @param {number} cruiseSpeed - Крейсерская скорость в км/ч
 * @param {number} fuelFlow - Расход топлива в кг/ч
 * @returns {Array} Оптимизированный маршрут с топливными данными
 */
function optimizeRouteByFuel(waypoints, startPoint, cruiseSpeed, fuelFlow) {
    if (typeof fuelFlow !== 'number' || fuelFlow <= 0) {
        throw new Error('Invalid fuel flow rate');
    }
    
    const optimizedRoute = optimizeRouteByTime(waypoints, startPoint, cruiseSpeed);
    
    // Добавление топливных данных
    return optimizedRoute.map((waypoint, index) => {
        const fuelConsumption = calculateFuelConsumption(waypoint.flightTime, fuelFlow);
        return {
            ...waypoint,
            fuelConsumption: Math.round(fuelConsumption * 1000) / 1000,
            cumulativeFuel: index === 0 ? fuelConsumption : 
                optimizedRoute.slice(0, index).reduce((sum, wp) => sum + wp.fuelConsumption, 0) + fuelConsumption
        };
    });
}

/**
 * Сравнивает несколько вариантов маршрута
 * @param {Array} routes - Массив маршрутов для сравнения
 * @param {Object} params - Параметры сравнения {cruiseSpeed, fuelFlow}
 * @returns {Object} Результат сравнения маршрутов
 */
function compareRoutes(routes, params) {
    if (!Array.isArray(routes) || routes.length < 2) {
        throw new Error('At least 2 routes required for comparison');
    }
    
    const { cruiseSpeed = 200, fuelFlow = 600 } = params;
    
    const routeComparisons = routes.map((route, index) => {
        const totalDistance = route.reduce((sum, segment) => sum + segment.distance, 0);
        const totalTime = route.reduce((sum, segment) => sum + segment.time, 0);
        const totalFuel = route.reduce((sum, segment) => sum + segment.fuel, 0);
        
        return {
            routeIndex: index,
            totalDistance: Math.round(totalDistance * 1000) / 1000,
            totalTime: Math.round(totalTime * 10000) / 10000,
            totalFuel: Math.round(totalFuel * 1000) / 1000,
            efficiency: totalDistance > 0 ? Math.round((totalDistance / totalTime) * 100) / 100 : 0,
            fuelEfficiency: totalDistance > 0 ? Math.round((totalFuel / totalDistance) * 1000) / 1000 : 0
        };
    });
    
    // Сортировка по различным критериям
    const byDistance = [...routeComparisons].sort((a, b) => a.totalDistance - b.totalDistance);
    const byTime = [...routeComparisons].sort((a, b) => a.totalTime - b.totalTime);
    const byFuel = [...routeComparisons].sort((a, b) => a.totalFuel - b.totalFuel);
    const byEfficiency = [...routeComparisons].sort((a, b) => b.efficiency - a.efficiency);
    
    return {
        routes: routeComparisons,
        bestByDistance: byDistance[0],
        bestByTime: byTime[0],
        bestByFuel: byFuel[0],
        bestByEfficiency: byEfficiency[0],
        comparison: {
            distanceRange: Math.round((byDistance[byDistance.length - 1].totalDistance - byDistance[0].totalDistance) * 1000) / 1000,
            timeRange: Math.round((byTime[byTime.length - 1].totalTime - byTime[0].totalTime) * 10000) / 10000,
            fuelRange: Math.round((byFuel[byFuel.length - 1].totalFuel - byFuel[0].totalFuel) * 1000) / 1000
        }
    };
}

/**
 * Находит альтернативные маршруты
 * @param {Array} waypoints - Массив точек маршрута
 * @param {Object} startPoint - Начальная точка
 * @param {Object} endPoint - Конечная точка
 * @param {number} maxDeviation - Максимальное отклонение от прямого маршрута в км
 * @returns {Array} Массив альтернативных маршрутов
 */
function findAlternativeRoutes(waypoints, startPoint, endPoint, maxDeviation = 50) {
    if (!startPoint || !endPoint) {
        throw new Error('Start and end points are required');
    }
    
    const directDistance = calculateDistance(
        startPoint.lat, startPoint.lon,
        endPoint.lat, endPoint.lon
    );
    
    // Фильтрация точек в пределах допустимого отклонения
    const validWaypoints = waypoints.filter(waypoint => {
        const distanceToStart = calculateDistance(
            startPoint.lat, startPoint.lon,
            waypoint.lat, waypoint.lon
        );
        const distanceToEnd = calculateDistance(
            waypoint.lat, waypoint.lon,
            endPoint.lat, endPoint.lon
        );
        
        return (distanceToStart + distanceToEnd) <= (directDistance + maxDeviation);
    });
    
    // Генерация различных комбинаций маршрутов
    const alternativeRoutes = [];
    
    // Маршрут 1: Прямой
    alternativeRoutes.push([
        { ...startPoint, name: 'START' },
        { ...endPoint, name: 'END' }
    ]);
    
    // Маршрут 2: Через одну промежуточную точку
    validWaypoints.forEach(waypoint => {
        alternativeRoutes.push([
            { ...startPoint, name: 'START' },
            { ...waypoint },
            { ...endPoint, name: 'END' }
        ]);
    });
    
    // Маршрут 3: Через две промежуточные точки (если есть достаточно точек)
    if (validWaypoints.length >= 2) {
        for (let i = 0; i < validWaypoints.length - 1; i++) {
            for (let j = i + 1; j < validWaypoints.length; j++) {
                alternativeRoutes.push([
                    { ...startPoint, name: 'START' },
                    { ...validWaypoints[i] },
                    { ...validWaypoints[j] },
                    { ...endPoint, name: 'END' }
                ]);
            }
        }
    }
    
    return alternativeRoutes;
}

/**
 * Рассчитывает оптимальную высоту полета
 * @param {number} distance - Расстояние полета в км
 * @param {number} aircraftType - Тип самолета (1: легкий, 2: средний, 3: тяжелый)
 * @returns {Object} Рекомендации по высоте полета
 */
function calculateOptimalAltitude(distance, aircraftType = 2) {
    if (typeof distance !== 'number' || distance <= 0) {
        throw new Error('Invalid distance');
    }
    
    if (aircraftType < 1 || aircraftType > 3) {
        throw new Error('Aircraft type must be 1, 2, or 3');
    }
    
    const altitudeRanges = {
        1: { min: 1000, max: 3000, optimal: 2000 }, // Легкий самолет
        2: { min: 2000, max: 6000, optimal: 4000 }, // Средний самолет
        3: { min: 3000, max: 12000, optimal: 8000 } // Тяжелый самолет
    };
    
    const range = altitudeRanges[aircraftType];
    
    // Корректировка высоты в зависимости от расстояния
    let recommendedAltitude = range.optimal;
    
    if (distance < 100) {
        recommendedAltitude = range.min;
    } else if (distance > 1000) {
        recommendedAltitude = range.max;
    } else {
        // Линейная интерполяция
        const factor = (distance - 100) / 900;
        recommendedAltitude = range.min + (range.max - range.min) * factor;
    }
    
    return {
        recommendedAltitude: Math.round(recommendedAltitude),
        minAltitude: range.min,
        maxAltitude: range.max,
        distance: distance,
        aircraftType: aircraftType
    };
}

/**
 * Проверяет безопасность маршрута
 * @param {Array} segments - Массив сегментов маршрута
 * @param {Object} constraints - Ограничения безопасности
 * @returns {Object} Результат проверки безопасности
 */
function checkRouteSafety(segments, constraints = {}) {
    const {
        maxSegmentDistance = 500, // Максимальное расстояние сегмента в км
        maxBearingChange = 90,    // Максимальное изменение курса в градусах
        minDistanceFromObstacles = 10 // Минимальное расстояние от препятствий в км
    } = constraints;
    
    const warnings = [];
    const errors = [];
    
    segments.forEach((segment, index) => {
        // Проверка расстояния сегмента
        if (segment.distance > maxSegmentDistance) {
            warnings.push(`Segment ${index + 1}: Distance ${segment.distance}km exceeds maximum ${maxSegmentDistance}km`);
        }
        
        // Проверка изменения курса
        if (index > 0) {
            const bearingChange = Math.abs(segment.bearing - segments[index - 1].bearing);
            const actualChange = bearingChange > 180 ? 360 - bearingChange : bearingChange;
            
            if (actualChange > maxBearingChange) {
                warnings.push(`Segment ${index + 1}: Bearing change ${actualChange}° exceeds maximum ${maxBearingChange}°`);
            }
        }
    });
    
    return {
        isSafe: errors.length === 0,
        warnings: warnings,
        errors: errors,
        segmentCount: segments.length,
        totalDistance: segments.reduce((sum, seg) => sum + seg.distance, 0)
    };
}

// Экспорт функций
export {
    analyzeRouteStatistics,
    calculateDirectDistance,
    optimizeRouteByDistance,
    optimizeRouteByTime,
    optimizeRouteByFuel,
    compareRoutes,
    findAlternativeRoutes,
    calculateOptimalAltitude,
    checkRouteSafety
};

// Экспорт по умолчанию
export default {
    analyzeRouteStatistics,
    calculateDirectDistance,
    optimizeRouteByDistance,
    optimizeRouteByTime,
    optimizeRouteByFuel,
    compareRoutes,
    findAlternativeRoutes,
    calculateOptimalAltitude,
    checkRouteSafety
};
