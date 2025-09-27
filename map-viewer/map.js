class RouteMap {
    constructor() {
        this.map = null;
        this.routeLayer = null;
        this.markersLayer = null;
        this.waypoints = [];
        
        this.initializeMap();
        this.setupEventListeners();
    }
    
    initializeMap() {
        // Инициализация карты с центром на Мурманской области
        this.map = L.map('map').setView([68.0, 33.0], 6);
        
        // Добавление слоя карты
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Создание слоев для маршрута и маркеров
        this.routeLayer = L.layerGroup().addTo(this.map);
        this.markersLayer = L.layerGroup().addTo(this.map);
    }
    
    setupEventListeners() {
        const uploadBtn = document.getElementById('uploadBtn');
        const gpxFile = document.getElementById('gpxFile');
        
        uploadBtn.addEventListener('click', () => {
            gpxFile.click();
        });
        
        gpxFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadGPXFile(e.target.files[0]);
            }
        });
    }
    
    async loadGPXFile(file) {
        try {
            const gpxText = await file.text();
            this.waypoints = GPXParser.parseGPX(gpxText);
            
            if (this.waypoints.length === 0) {
                this.showError('В GPX файле не найдены точки маршрута');
                return;
            }
            
            this.displayRoute();
            this.updateRouteInfo();
            
        } catch (error) {
            this.showError('Ошибка при загрузке файла: ' + error.message);
        }
    }
    
    displayRoute() {
        // Очистка предыдущих слоев
        this.routeLayer.clearLayers();
        this.markersLayer.clearLayers();
        
        if (this.waypoints.length === 0) return;
        
        // Создание маркеров для каждой точки
        this.waypoints.forEach((waypoint, index) => {
            const marker = this.createMarker(waypoint, index);
            this.markersLayer.addLayer(marker);
        });
        
        // Создание линии маршрута
        if (this.waypoints.length > 1) {
            const routeCoordinates = this.waypoints.map(wp => [wp.lat, wp.lon]);
            const routeLine = L.polyline(routeCoordinates, {
                color: '#667eea',
                weight: 4,
                opacity: 0.8,
                smoothFactor: 1
            });
            
            this.routeLayer.addLayer(routeLine);
        }
        
        // Подгонка карты под маршрут
        this.fitMapToRoute();
    }
    
    createMarker(waypoint, index) {
        // Определение цвета маркера в зависимости от типа точки
        let markerColor = '#667eea';
        let iconClass = 'fa-plane';
        
        if (waypoint.type && waypoint.type.toLowerCase().includes('airport')) {
            markerColor = '#e74c3c';
            iconClass = 'fa-building';
        } else if (waypoint.type && waypoint.type.toLowerCase().includes('nav')) {
            markerColor = '#f39c12';
            iconClass = 'fa-crosshairs';
        }
        
        // Создание кастомной иконки
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background-color: ${markerColor};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">${index + 1}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([waypoint.lat, waypoint.lon], {
            icon: customIcon
        });
        
        // Создание всплывающего окна
        const popupContent = this.createPopupContent(waypoint, index);
        marker.bindPopup(popupContent);
        
        return marker;
    }
    
    createPopupContent(waypoint, index) {
        let content = `
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${waypoint.name}</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Точка:</strong> ${index + 1}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Координаты:</strong><br>
                ${waypoint.lat.toFixed(6)}, ${waypoint.lon.toFixed(6)}</p>
        `;
        
        if (waypoint.type) {
            content += `<p style="margin: 5px 0; color: #666;"><strong>Тип:</strong> ${waypoint.type}</p>`;
        }
        
        if (waypoint.description) {
            content += `<p style="margin: 5px 0; color: #666;"><strong>Описание:</strong> ${waypoint.description}</p>`;
        }
        
        content += `</div>`;
        
        return content;
    }
    
    fitMapToRoute() {
        if (this.waypoints.length === 0) return;
        
        const group = new L.featureGroup(this.markersLayer.getLayers());
        this.map.fitBounds(group.getBounds().pad(0.1));
    }
    
    updateRouteInfo() {
        const routeInfo = document.getElementById('routeInfo');
        const stats = GPXParser.calculateRouteStats(this.waypoints);
        
        routeInfo.innerHTML = `
            <div class="route-stats">
                <div class="stat-item">
                    <div class="stat-value">${stats.pointCount}</div>
                    <div class="stat-label">Точек маршрута</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.totalDistance}</div>
                    <div class="stat-label">Общее расстояние (км)</div>
                </div>
            </div>
            <p style="margin-top: 15px; color: #666;">
                Маршрут успешно загружен и отображен на карте. 
                Кликните на маркеры для получения подробной информации о точках.
            </p>
        `;
    }
    
    showError(message) {
        const routeInfo = document.getElementById('routeInfo');
        routeInfo.innerHTML = `
            <div style="color: #e74c3c; background: #fdf2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c;">
                <strong>Ошибка:</strong> ${message}
            </div>
        `;
    }
}

// Инициализация карты при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new RouteMap();
});
