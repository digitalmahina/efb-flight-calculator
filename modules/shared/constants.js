// Константы для всех модулей
export const CONSTANTS = {
    // Цвета авиационной палитры
    COLORS: {
        PRIMARY: '#00ff00',           // Основной зеленый
        SECONDARY: '#ffffff',         // Белый
        BACKGROUND: '#0a0a0a',        // Основной фон
        PANEL_BG: 'rgba(20, 20, 20, 0.95)', // Фон панелей
        GLASS: 'rgba(255, 255, 255, 0.05)',  // Стеклянный эффект
        BORDER: 'rgba(0, 255, 0, 0.3)',      // Границы
        BORDER_ACTIVE: 'rgba(0, 255, 0, 0.8)', // Активные границы
        TEXT_PRIMARY: '#00ff00',      // Основной текст
        TEXT_SECONDARY: '#ffffff',    // Вторичный текст
        TEXT_MUTED: '#888888',        // Приглушенный текст
        WARNING: '#ffaa00',           // Предупреждение
        ERROR: '#ff0000',             // Ошибка
        SUCCESS: '#00ff00'            // Успех
    },
    
    // Шрифты
    FONTS: {
        MONO: "'JetBrains Mono', 'Courier New', monospace",
        SANS: "'Inter', 'Arial', sans-serif"
    },
    
    // Размеры
    SIZES: {
        SPACING_XS: '4px',
        SPACING_SM: '8px',
        SPACING_MD: '16px',
        SPACING_LG: '24px',
        SPACING_XL: '32px',
        RADIUS_SM: '4px',
        RADIUS_MD: '8px',
        RADIUS_LG: '12px'
    },
    
    // Параметры полета
    FLIGHT: {
        DEFAULT_SPEED: 200,           // Км/ч
        DEFAULT_FUEL_FLOW: 600,       // Кг/ч
        MIN_SPEED: 100,               // Км/ч
        MAX_SPEED: 2000,              // Км/ч
        MIN_FUEL_FLOW: 100,           // Кг/ч
        MAX_FUEL_FLOW: 5000,          // Кг/ч
        EARTH_RADIUS: 6371            // Км
    },
    
    // Параметры карты
    MAP: {
        DEFAULT_LAT: 68.0,            // Широта по умолчанию (Мурманск)
        DEFAULT_LON: 33.0,            // Долгота по умолчанию
        DEFAULT_ZOOM: 6,              // Масштаб по умолчанию
        MIN_ZOOM: 3,
        MAX_ZOOM: 18,
        TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    
    // Параметры маркеров
    MARKERS: {
        SIZE: 40,                     // Размер маркера
        ICON_SIZE: [40, 40],          // Размер иконки
        ICON_ANCHOR: [20, 20],        // Якорь иконки
        ARROW_SIZE: 16,               // Размер стрелки
        ARROW_ICON_SIZE: [16, 16],    // Размер иконки стрелки
        ARROW_ICON_ANCHOR: [8, 8]     // Якорь иконки стрелки
    },
    
    // Параметры линий маршрута
    ROUTE_LINE: {
        MAIN_WEIGHT: 6,               // Толщина основной линии
        GLOW_WEIGHT: 12,              // Толщина свечения
        OUTER_GLOW_WEIGHT: 18,        // Толщина внешнего свечения
        MAIN_OPACITY: 1.0,            // Непрозрачность основной линии
        GLOW_OPACITY: 0.3,            // Непрозрачность свечения
        OUTER_GLOW_OPACITY: 0.15      // Непрозрачность внешнего свечения
    },
    
    // События
    EVENTS: {
        ROUTE_LOADED: 'route-loaded',
        ROUTE_CLEARED: 'route-cleared',
        CALCULATION_COMPLETE: 'calculation-complete',
        SPEED_CHANGED: 'speed-changed',
        FUEL_FLOW_CHANGED: 'fuel-flow-changed',
        WAYPOINT_SELECTED: 'waypoint-selected',
        MAP_ZOOMED: 'map-zoomed',
        MAP_PANNED: 'map-panned',
        ERROR_OCCURRED: 'error-occurred',
        SUCCESS_MESSAGE: 'success-message'
    },
    
    // Селекторы DOM элементов
    SELECTORS: {
        // Основные контейнеры
        EFB_CONTAINER: '.efb-container',
        EFB_HEADER: '.efb-header',
        EFB_MAIN: '.efb-main',
        EFB_FOOTER: '.efb-footer',
        
        // Панели
        FLIGHT_DATA_PANEL: '.flight-data-panel',
        MAP_PANEL: '.map-panel',
        ROUTE_PANEL: '.route-panel',
        
        // Элементы управления
        LOAD_GPX_BTN: '#loadGpxBtn',
        CALCULATE_BTN: '#calculateBtn',
        CLEAR_ROUTE_BTN: '#clearRouteBtn',
        SPEED_INPUT: '#speedInput',
        FUEL_INPUT: '#fuelInput',
        
        // Данные полета
        CRUISE_SPEED: '#cruiseSpeed',
        FUEL_FLOW: '#fuelFlow',
        TOTAL_DISTANCE: '#totalDistance',
        FLIGHT_TIME: '#flightTime',
        TOTAL_FUEL: '#totalFuel',
        WAYPOINT_COUNT: '#waypointCount',
        
        // Карта
        EFB_MAP: '#efbMap',
        MAP_RANGE: '#mapRange',
        
        // Маршрут
        ROUTE_LIST: '#routeList',
        
        // Статус
        GPS_STATUS: '#gpsStatus',
        NAV_STATUS: '#navStatus',
        CALC_STATUS: '#calcStatus',
        
        // Время
        CURRENT_TIME: '#currentTime',
        CURRENT_DATE: '#currentDate'
    },
    
    // Сообщения
    MESSAGES: {
        NO_ROUTE_LOADED: 'NO ROUTE LOADED',
        LOAD_GPX_TO_DISPLAY: 'Load GPX file to display route',
        ROUTE_LOADED: 'Route loaded successfully',
        ROUTE_CLEARED: 'Route cleared',
        CALCULATION_COMPLETE: 'Calculation complete',
        ERROR_LOADING_GPX: 'Error loading GPX file',
        NO_WAYPOINTS_FOUND: 'No waypoints found in GPX file',
        INVALID_FILE: 'Invalid file format',
        MIN_WAYPOINTS_REQUIRED: 'Route must have at least 2 waypoints'
    },
    
    // Анимации
    ANIMATIONS: {
        DURATION_SHORT: 200,          // Мс
        DURATION_MEDIUM: 300,         // Мс
        DURATION_LONG: 500,           // Мс
        EASING: 'ease-in-out'         // CSS easing
    }
};

// Экспорт для использования в модулях
window.CONSTANTS = CONSTANTS;
export default CONSTANTS;
