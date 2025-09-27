/**
 * ⛽ МОДУЛЬ РАСЧЕТА РАСХОДА ТОПЛИВА
 * 
 * Отвечает за расчет потребления топлива, учет резерва,
 * проверку достаточности топлива и оптимизацию заправки
 */

// Константы для расчетов топлива
const DEFAULT_FUEL_FLOW = 600; // кг/ч по умолчанию
const DEFAULT_RESERVE_PERCENT = 10; // 10% резерва по умолчанию
const MIN_FUEL_RESERVE = 5; // Минимальный резерв 5%
const MAX_FUEL_RESERVE = 50; // Максимальный резерв 50%

/**
 * Рассчитывает потребление топлива на основе времени полета
 * @param {number} flightTime - Время полета в часах
 * @param {number} fuelFlow - Расход топлива в кг/ч
 * @returns {number} Потребление топлива в кг
 */
function calculateFuelConsumption(flightTime, fuelFlow = DEFAULT_FUEL_FLOW) {
    if (typeof flightTime !== 'number' || flightTime < 0) {
        throw new Error('Invalid flight time');
    }
    
    if (typeof fuelFlow !== 'number' || fuelFlow <= 0) {
        throw new Error('Invalid fuel flow rate');
    }
    
    return Math.round(flightTime * fuelFlow * 1000) / 1000;
}

/**
 * Рассчитывает топливо с учетом резерва
 * @param {number} baseFuel - Базовое потребление топлива в кг
 * @param {number} reservePercent - Процент резерва (по умолчанию 10%)
 * @returns {Object} Топливо с резервом
 */
function calculateFuelWithReserve(baseFuel, reservePercent = DEFAULT_RESERVE_PERCENT) {
    if (typeof baseFuel !== 'number' || baseFuel < 0) {
        throw new Error('Invalid base fuel amount');
    }
    
    if (typeof reservePercent !== 'number' || reservePercent < MIN_FUEL_RESERVE || reservePercent > MAX_FUEL_RESERVE) {
        throw new Error(`Reserve percentage must be between ${MIN_FUEL_RESERVE}% and ${MAX_FUEL_RESERVE}%`);
    }
    
    const reserveFuel = baseFuel * (reservePercent / 100);
    const totalFuel = baseFuel + reserveFuel;
    
    return {
        baseFuel: Math.round(baseFuel * 1000) / 1000,
        reserveFuel: Math.round(reserveFuel * 1000) / 1000,
        totalFuel: Math.round(totalFuel * 1000) / 1000,
        reservePercent: reservePercent
    };
}

/**
 * Проверяет достаточность топлива
 * @param {number} requiredFuel - Требуемое количество топлива в кг
 * @param {number} availableFuel - Доступное количество топлива в кг
 * @returns {Object} Результат проверки
 */
function checkFuelSufficiency(requiredFuel, availableFuel) {
    if (typeof requiredFuel !== 'number' || requiredFuel < 0) {
        throw new Error('Invalid required fuel amount');
    }
    
    if (typeof availableFuel !== 'number' || availableFuel < 0) {
        throw new Error('Invalid available fuel amount');
    }
    
    const isSufficient = availableFuel >= requiredFuel;
    const deficit = isSufficient ? 0 : requiredFuel - availableFuel;
    const excess = isSufficient ? availableFuel - requiredFuel : 0;
    
    return {
        isSufficient: isSufficient,
        requiredFuel: Math.round(requiredFuel * 1000) / 1000,
        availableFuel: Math.round(availableFuel * 1000) / 1000,
        deficit: Math.round(deficit * 1000) / 1000,
        excess: Math.round(excess * 1000) / 1000,
        safetyMargin: isSufficient ? Math.round((excess / requiredFuel) * 100 * 100) / 100 : 0
    };
}

/**
 * Рассчитывает расход топлива для маршрута
 * @param {Array} segments - Массив сегментов маршрута с временем полета
 * @param {number} fuelFlow - Расход топлива в кг/ч
 * @param {number} reservePercent - Процент резерва
 * @returns {Object} Результат расчета топлива для маршрута
 */
function calculateRouteFuel(segments, fuelFlow = DEFAULT_FUEL_FLOW, reservePercent = DEFAULT_RESERVE_PERCENT) {
    if (!Array.isArray(segments) || segments.length === 0) {
        throw new Error('Segments array is required');
    }
    
    if (typeof fuelFlow !== 'number' || fuelFlow <= 0) {
        throw new Error('Invalid fuel flow rate');
    }
    
    let totalBaseFuel = 0;
    const segmentFuels = [];
    
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        if (!segment.time || segment.time <= 0) {
            throw new Error(`Invalid flight time in segment ${i + 1}`);
        }
        
        const segmentFuel = calculateFuelConsumption(segment.time, fuelFlow);
        totalBaseFuel += segmentFuel;
        
        segmentFuels.push({
            segment: i + 1,
            from: segment.from,
            to: segment.to,
            time: segment.time,
            fuel: Math.round(segmentFuel * 1000) / 1000,
            fuelFlow: fuelFlow
        });
    }
    
    const fuelWithReserve = calculateFuelWithReserve(totalBaseFuel, reservePercent);
    
    return {
        ...fuelWithReserve,
        segments: segmentFuels,
        fuelFlow: fuelFlow,
        averageFuelPerHour: Math.round((totalBaseFuel / segments.reduce((sum, seg) => sum + seg.time, 0)) * 1000) / 1000
    };
}

/**
 * Рассчитывает топливную эффективность
 * @param {number} fuelConsumed - Потребленное топливо в кг
 * @param {number} distance - Пройденное расстояние в км
 * @returns {Object} Показатели топливной эффективности
 */
function calculateFuelEfficiency(fuelConsumed, distance) {
    if (typeof fuelConsumed !== 'number' || fuelConsumed <= 0) {
        throw new Error('Invalid fuel consumed amount');
    }
    
    if (typeof distance !== 'number' || distance <= 0) {
        throw new Error('Invalid distance');
    }
    
    const fuelPerKm = fuelConsumed / distance;
    const kmPerKg = distance / fuelConsumed;
    
    return {
        fuelPerKm: Math.round(fuelPerKm * 1000) / 1000,
        kmPerKg: Math.round(kmPerKg * 1000) / 1000,
        fuelConsumed: Math.round(fuelConsumed * 1000) / 1000,
        distance: Math.round(distance * 1000) / 1000
    };
}

/**
 * Рассчитывает оптимальную заправку
 * @param {number} requiredFuel - Требуемое топливо в кг
 * @param {number} currentFuel - Текущее топливо в кг
 * @param {number} tankCapacity - Емкость бака в кг
 * @param {number} minFuelLevel - Минимальный уровень топлива в кг
 * @returns {Object} Рекомендации по заправке
 */
function calculateOptimalRefuel(requiredFuel, currentFuel, tankCapacity, minFuelLevel = 0) {
    if (typeof requiredFuel !== 'number' || requiredFuel < 0) {
        throw new Error('Invalid required fuel amount');
    }
    
    if (typeof currentFuel !== 'number' || currentFuel < 0) {
        throw new Error('Invalid current fuel amount');
    }
    
    if (typeof tankCapacity !== 'number' || tankCapacity <= 0) {
        throw new Error('Invalid tank capacity');
    }
    
    if (typeof minFuelLevel !== 'number' || minFuelLevel < 0) {
        throw new Error('Invalid minimum fuel level');
    }
    
    const availableSpace = tankCapacity - currentFuel;
    const fuelNeeded = Math.max(0, requiredFuel - currentFuel);
    const recommendedRefuel = Math.min(fuelNeeded, availableSpace);
    const canCompleteFlight = currentFuel >= requiredFuel;
    const needsRefuel = fuelNeeded > 0;
    
    return {
        canCompleteFlight: canCompleteFlight,
        needsRefuel: needsRefuel,
        fuelNeeded: Math.round(fuelNeeded * 1000) / 1000,
        recommendedRefuel: Math.round(recommendedRefuel * 1000) / 1000,
        availableSpace: Math.round(availableSpace * 1000) / 1000,
        currentFuel: Math.round(currentFuel * 1000) / 1000,
        requiredFuel: Math.round(requiredFuel * 1000) / 1000,
        tankCapacity: Math.round(tankCapacity * 1000) / 1000,
        fuelAfterRefuel: Math.round((currentFuel + recommendedRefuel) * 1000) / 1000
    };
}

/**
 * Рассчитывает расход топлива с учетом высоты полета
 * @param {number} baseFuelFlow - Базовый расход топлива в кг/ч
 * @param {number} altitude - Высота полета в метрах
 * @param {number} standardAltitude - Стандартная высота в метрах (по умолчанию 3000м)
 * @returns {number} Скорректированный расход топлива в кг/ч
 */
function adjustFuelFlowForAltitude(baseFuelFlow, altitude, standardAltitude = 3000) {
    if (typeof baseFuelFlow !== 'number' || baseFuelFlow <= 0) {
        throw new Error('Invalid base fuel flow rate');
    }
    
    if (typeof altitude !== 'number' || altitude < 0) {
        throw new Error('Invalid altitude');
    }
    
    if (typeof standardAltitude !== 'number' || standardAltitude <= 0) {
        throw new Error('Invalid standard altitude');
    }
    
    // Коэффициент коррекции на высоту (примерная формула)
    // На больших высотах расход топлива может увеличиваться
    const altitudeFactor = 1 + ((altitude - standardAltitude) / 10000) * 0.1;
    
    return Math.round(baseFuelFlow * altitudeFactor * 1000) / 1000;
}

/**
 * Рассчитывает расход топлива с учетом веса самолета
 * @param {number} baseFuelFlow - Базовый расход топлива в кг/ч
 * @param {number} currentWeight - Текущий вес самолета в кг
 * @param {number} standardWeight - Стандартный вес самолета в кг
 * @returns {number} Скорректированный расход топлива в кг/ч
 */
function adjustFuelFlowForWeight(baseFuelFlow, currentWeight, standardWeight) {
    if (typeof baseFuelFlow !== 'number' || baseFuelFlow <= 0) {
        throw new Error('Invalid base fuel flow rate');
    }
    
    if (typeof currentWeight !== 'number' || currentWeight <= 0) {
        throw new Error('Invalid current weight');
    }
    
    if (typeof standardWeight !== 'number' || standardWeight <= 0) {
        throw new Error('Invalid standard weight');
    }
    
    // Коэффициент коррекции на вес
    const weightFactor = Math.sqrt(currentWeight / standardWeight);
    
    return Math.round(baseFuelFlow * weightFactor * 1000) / 1000;
}

/**
 * Конвертирует топливо между единицами измерения
 * @param {number} fuel - Количество топлива
 * @param {string} fromUnit - Исходная единица ('kg', 'lbs', 'liters', 'gallons')
 * @param {string} toUnit - Целевая единица ('kg', 'lbs', 'liters', 'gallons')
 * @param {number} density - Плотность топлива в кг/л (по умолчанию 0.8)
 * @returns {number} Конвертированное количество топлива
 */
function convertFuel(fuel, fromUnit, toUnit, density = 0.8) {
    if (typeof fuel !== 'number' || fuel < 0) {
        throw new Error('Invalid fuel amount');
    }
    
    if (typeof density !== 'number' || density <= 0) {
        throw new Error('Invalid fuel density');
    }
    
    const conversions = {
        'kg': { 'lbs': 2.20462, 'liters': 1/density, 'gallons': 1/(density * 3.78541) },
        'lbs': { 'kg': 0.453592, 'liters': 0.453592/density, 'gallons': 0.453592/(density * 3.78541) },
        'liters': { 'kg': density, 'lbs': density * 2.20462, 'gallons': 1/3.78541 },
        'gallons': { 'kg': density * 3.78541, 'lbs': density * 3.78541 * 2.20462, 'liters': 3.78541 }
    };
    
    if (fromUnit === toUnit) {
        return fuel;
    }
    
    if (!conversions[fromUnit] || !conversions[fromUnit][toUnit]) {
        throw new Error(`Conversion from ${fromUnit} to ${toUnit} not supported`);
    }
    
    return Math.round(fuel * conversions[fromUnit][toUnit] * 1000) / 1000;
}

/**
 * Рассчитывает время полета на оставшемся топливе
 * @param {number} remainingFuel - Оставшееся топливо в кг
 * @param {number} fuelFlow - Расход топлива в кг/ч
 * @returns {Object} Время полета на оставшемся топливе
 */
function calculateFlightTimeOnRemainingFuel(remainingFuel, fuelFlow) {
    if (typeof remainingFuel !== 'number' || remainingFuel < 0) {
        throw new Error('Invalid remaining fuel amount');
    }
    
    if (typeof fuelFlow !== 'number' || fuelFlow <= 0) {
        throw new Error('Invalid fuel flow rate');
    }
    
    const flightTime = remainingFuel / fuelFlow;
    
    return {
        flightTime: Math.round(flightTime * 10000) / 10000,
        formattedTime: formatTime(flightTime),
        remainingFuel: Math.round(remainingFuel * 1000) / 1000,
        fuelFlow: fuelFlow
    };
}

// Вспомогательная функция для форматирования времени
function formatTime(hours) {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Экспорт функций
export {
    calculateFuelConsumption,
    calculateFuelWithReserve,
    checkFuelSufficiency,
    calculateRouteFuel,
    calculateFuelEfficiency,
    calculateOptimalRefuel,
    adjustFuelFlowForAltitude,
    adjustFuelFlowForWeight,
    convertFuel,
    calculateFlightTimeOnRemainingFuel,
    DEFAULT_FUEL_FLOW,
    DEFAULT_RESERVE_PERCENT,
    MIN_FUEL_RESERVE,
    MAX_FUEL_RESERVE
};

// Экспорт по умолчанию
export default {
    calculateFuelConsumption,
    calculateFuelWithReserve,
    checkFuelSufficiency,
    calculateRouteFuel,
    calculateFuelEfficiency,
    calculateOptimalRefuel,
    adjustFuelFlowForAltitude,
    adjustFuelFlowForWeight,
    convertFuel,
    calculateFlightTimeOnRemainingFuel,
    constants: {
        DEFAULT_FUEL_FLOW,
        DEFAULT_RESERVE_PERCENT,
        MIN_FUEL_RESERVE,
        MAX_FUEL_RESERVE
    }
};
