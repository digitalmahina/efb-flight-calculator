// EFB System - Electronic Flight Bag
class EFBSystem {
    constructor() {
        this.map = null;
        this.routeLayer = null;
        this.markersLayer = null;
        this.waypoints = [];
        this.routeData = [];
        
        this.initializeSystem();
        this.setupEventListeners();
        this.startClock();
        this.initializeMap();
    }
    
    initializeSystem() {
        this.updateStatus('gps', true);
        this.updateStatus('nav', true);
        this.updateStatus('calc', false);
        this.updateFlightData();
    }

    setupEventListeners() {
        const loadGpxBtn = document.getElementById('loadGpxBtn');
        const hiddenFileInput = document.getElementById('hiddenFileInput');
        
        loadGpxBtn.addEventListener('click', () => {
            hiddenFileInput.click();
        });
        
        hiddenFileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadGPXFile(e.target.files[0]);
            }
        });
        
        // Calculate button
        const calculateBtn = document.getElementById('calculateBtn');
        calculateBtn.addEventListener('click', () => {
            this.calculateRoute();
        });
        
        // Input controls
        const speedInput = document.getElementById('speedInput');
        const fuelInput = document.getElementById('fuelInput');
        
        speedInput.addEventListener('input', () => {
            this.updateFlightData();
        });
        
        fuelInput.addEventListener('input', () => {
            this.updateFlightData();
        });
        
        // Map controls
        const loadRouteBtn = document.getElementById('loadRouteBtn');
        const clearRouteBtn = document.getElementById('clearRouteBtn');
        
        loadRouteBtn.addEventListener('click', () => {
            hiddenFileInput.click();
        });
        
        clearRouteBtn.addEventListener('click', () => {
            this.clearRoute();
        });
    }
    
    startClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-GB', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).toUpperCase();
            
            document.getElementById('currentTime').textContent = timeString;
            document.getElementById('currentDate').textContent = dateString;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    initializeMap() {
        // Initialize map with aviation-style tiles
        this.map = L.map('efbMap', {
            zoomControl: false,
            attributionControl: false
        }).setView([68.0, 33.0], 6);
        
        // Add custom tile layer with aviation styling
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: ''
        }).addTo(this.map);
        
        // Create layers
        this.routeLayer = L.layerGroup().addTo(this.map);
        this.markersLayer = L.layerGroup().addTo(this.map);
        
        // Add custom zoom controls
        this.addCustomControls();
    }
    
    addCustomControls() {
        const zoomIn = L.control({position: 'topright'});
        zoomIn.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'custom-zoom-control');
            div.innerHTML = '<button class="zoom-btn">+</button>';
            div.firstChild.onclick = () => map.zoomIn();
            return div;
        };
        zoomIn.addTo(this.map);
        
        const zoomOut = L.control({position: 'topright'});
        zoomOut.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'custom-zoom-control');
            div.innerHTML = '<button class="zoom-btn">-</button>';
            div.firstChild.onclick = () => map.zoomOut();
            return div;
        };
        zoomOut.addTo(this.map);
    }
    
    async loadGPXFile(file) {
        try {
            this.updateStatus('calc', false);
            this.showLoading(true);
            
            const gpxText = await file.text();
            this.waypoints = GPXParser.parseGPX(gpxText);
            
            if (this.waypoints.length === 0) {
                this.showError('No waypoints found in GPX file');
                this.showLoading(false);
                return;
            }
            
            // Display route on map
            this.displayRoute();
            
            // Update route list panel
            this.updateRouteList();
            
            // Update flight data with route statistics
            this.updateFlightDataFromRoute();
            
            // Auto-calculate route if we have waypoints
            if (this.waypoints.length >= 2) {
                this.calculateRoute();
            }
            
            this.updateStatus('calc', true);
            this.showLoading(false);
            this.showSuccess(`Route loaded: ${this.waypoints.length} waypoints`);
            
        } catch (error) {
            this.showError('Error loading GPX file: ' + error.message);
            this.showLoading(false);
            this.updateStatus('calc', false);
        }
    }
    
    displayRoute() {
        // Clear existing layers
        this.routeLayer.clearLayers();
        this.markersLayer.clearLayers();
        
        if (this.waypoints.length === 0) return;
        
        // Create route line with more expressive styling
        if (this.waypoints.length > 1) {
            const routeCoordinates = this.waypoints.map(wp => [wp.lat, wp.lon]);
            
            // Create main route line with bright green color
            const routeLine = L.polyline(routeCoordinates, {
                color: '#00ff00',
                weight: 6,
                opacity: 1.0,
                lineCap: 'round',
                lineJoin: 'round'
            });
            this.routeLayer.addLayer(routeLine);
            
            // Add glow effect with wider line
            const glowLine = L.polyline(routeCoordinates, {
                color: '#00ff00',
                weight: 12,
                opacity: 0.3,
                lineCap: 'round',
                lineJoin: 'round'
            });
            this.routeLayer.addLayer(glowLine);
            
            // Add outer glow effect
            const outerGlow = L.polyline(routeCoordinates, {
                color: '#00ff00',
                weight: 18,
                opacity: 0.15,
                lineCap: 'round',
                lineJoin: 'round'
            });
            this.routeLayer.addLayer(outerGlow);
            
            // Add arrow markers to show direction
            this.addDirectionArrows(routeCoordinates);
        }
        
        // Create waypoint markers
        this.waypoints.forEach((waypoint, index) => {
            const marker = this.createAviationMarker(waypoint, index);
            this.markersLayer.addLayer(marker);
        });
        
        // Fit map to route
        this.fitMapToRoute();
    }
    
    createAviationMarker(waypoint, index) {
        // Create aviation-style marker with waypoint name
        const markerIcon = L.divIcon({
            className: 'aviation-marker',
            html: `
                <div class="marker-container">
                    <div class="marker-circle">
                        <div class="marker-name">${this.getShortName(waypoint.name)}</div>
                    </div>
                    <div class="marker-triangle"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        const marker = L.marker([waypoint.lat, waypoint.lon], {
            icon: markerIcon
        });
        
        // Create popup with aviation data
        const popupContent = this.createAviationPopup(waypoint, index);
        marker.bindPopup(popupContent);
        
        return marker;
    }
    
    getShortName(name) {
        // Get short name for marker display
        if (!name || name === '') return 'WPT';
        
        // If name is too long, take first 3-4 characters
        if (name.length > 4) {
            return name.substring(0, 4).toUpperCase();
        }
        
        return name.toUpperCase();
    }
    
    addDirectionArrows(routeCoordinates) {
        // Add direction arrows along the route
        for (let i = 0; i < routeCoordinates.length - 1; i++) {
            const start = routeCoordinates[i];
            const end = routeCoordinates[i + 1];
            
            // Calculate midpoint
            const midLat = (start[0] + end[0]) / 2;
            const midLon = (start[1] + end[1]) / 2;
            
            // Calculate bearing
            const bearing = this.calculateBearing(start[0], start[1], end[0], end[1]);
            
            // Create arrow marker
            const arrowIcon = L.divIcon({
                className: 'direction-arrow',
                html: `
                    <div class="arrow-container" style="transform: rotate(${bearing}deg);">
                        <div class="arrow-head"></div>
                    </div>
                `,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            
            const arrowMarker = L.marker([midLat, midLon], {
                icon: arrowIcon
            });
            
            this.routeLayer.addLayer(arrowMarker);
        }
    }
    
    calculateBearing(lat1, lon1, lat2, lon2) {
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
    
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    
    createAviationPopup(waypoint, index) {
        return `
            <div class="aviation-popup">
                <div class="popup-header">
                    <span class="popup-title">WPT ${(index + 1).toString().padStart(2, '0')}</span>
                    <span class="popup-type">${waypoint.type || 'WAYPOINT'}</span>
                </div>
                <div class="popup-content">
                    <div class="popup-item">
                        <span class="popup-label">NAME:</span>
                        <span class="popup-value">${waypoint.name}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">LAT:</span>
                        <span class="popup-value">${waypoint.lat.toFixed(6)}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">LON:</span>
                        <span class="popup-value">${waypoint.lon.toFixed(6)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    fitMapToRoute() {
        if (this.waypoints.length === 0) return;
        
        const group = new L.featureGroup(this.markersLayer.getLayers());
        this.map.fitBounds(group.getBounds().pad(0.1));
    }
    
    updateRouteList() {
        const routeList = document.getElementById('routeList');
        
        if (this.waypoints.length === 0) {
            routeList.innerHTML = `
                <div class="no-route">
                    <div class="no-route-icon">📋</div>
                    <div class="no-route-text">NO ROUTE LOADED</div>
                    <div class="no-route-subtext">Load GPX file to display route</div>
                </div>
            `;
            return;
        }
        
        let routeHTML = '';
        this.waypoints.forEach((waypoint, index) => {
            const distance = index > 0 ? this.calculateDistance(
                this.waypoints[index - 1].lat,
                this.waypoints[index - 1].lon,
                waypoint.lat,
                waypoint.lon
            ) : 0;
            
            routeHTML += `
                <div class="route-item">
                    <div class="route-item-header">
                        <span class="route-number">${(index + 1).toString().padStart(2, '0')}</span>
                        <span class="route-name">${waypoint.name}</span>
                    </div>
                    <div class="route-item-details">
                        <div class="route-coords">
                            ${waypoint.lat.toFixed(4)}, ${waypoint.lon.toFixed(4)}
                        </div>
                        ${index > 0 ? `<div class="route-distance">${distance.toFixed(1)} KM</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        routeList.innerHTML = routeHTML;
    }
    
    updateFlightDataFromRoute() {
        // Update waypoint count
        document.getElementById('waypointCount').textContent = this.waypoints.length;
        
        // Calculate total distance
        let totalDistance = 0;
        if (this.waypoints.length > 1) {
            for (let i = 1; i < this.waypoints.length; i++) {
                totalDistance += this.calculateDistance(
                    this.waypoints[i - 1].lat,
                    this.waypoints[i - 1].lon,
                    this.waypoints[i].lat,
                    this.waypoints[i].lon
                );
            }
        }
        
        document.getElementById('totalDistance').textContent = totalDistance.toFixed(2);
    }
    
    calculateRoute() {
        if (this.waypoints.length < 2) {
            this.showError('Route must have at least 2 waypoints');
            return;
        }
        
        const cruiseSpeed = parseFloat(document.getElementById('speedInput').value);
        const fuelFlow = parseFloat(document.getElementById('fuelInput').value);
        
        let totalDistance = 0;
        let totalTime = 0;
        let totalFuel = 0;
        
        // Calculate distances and times
        for (let i = 1; i < this.waypoints.length; i++) {
            const distance = this.calculateDistance(
                this.waypoints[i - 1].lat,
                this.waypoints[i - 1].lon,
                this.waypoints[i].lat,
                this.waypoints[i].lon
            );
            totalDistance += distance;
        }
        
        totalTime = totalDistance / cruiseSpeed;
        totalFuel = totalTime * fuelFlow;
        
        // Update flight data display
        this.updateFlightDataDisplay(totalDistance, totalTime, totalFuel);
        
        // Update route data for detailed calculations
        this.calculateDetailedRoute(cruiseSpeed, fuelFlow);
        
        this.showSuccess(`Route calculated: ${this.formatTime(totalTime)} flight time`);
    }
    
    calculateDetailedRoute(cruiseSpeed, fuelFlow) {
        this.routeData = [];
        let cumulativeDistance = 0;
        let cumulativeTime = 0;
        let cumulativeFuel = 0;
        
        this.waypoints.forEach((waypoint, index) => {
            let distanceFromPrevious = 0;
            let timeFromPrevious = 0;
            let fuelFromPrevious = 0;
            
            if (index > 0) {
                distanceFromPrevious = this.calculateDistance(
                    this.waypoints[index - 1].lat,
                    this.waypoints[index - 1].lon,
                    waypoint.lat,
                    waypoint.lon
                );
                timeFromPrevious = distanceFromPrevious / cruiseSpeed;
                fuelFromPrevious = timeFromPrevious * fuelFlow;
                
                cumulativeDistance += distanceFromPrevious;
                cumulativeTime += timeFromPrevious;
                cumulativeFuel += fuelFromPrevious;
            }
            
            this.routeData.push({
                waypoint: waypoint,
                index: index + 1,
                distanceFromPrevious: distanceFromPrevious,
                timeFromPrevious: timeFromPrevious,
                fuelFromPrevious: fuelFromPrevious,
                cumulativeDistance: cumulativeDistance,
                cumulativeTime: cumulativeTime,
                cumulativeFuel: cumulativeFuel
            });
        });
    }
    
    updateFlightDataDisplay(totalDistance, totalTime, totalFuel) {
        document.getElementById('totalDistance').textContent = totalDistance.toFixed(2);
        document.getElementById('flightTime').textContent = this.formatTime(totalTime);
        document.getElementById('totalFuel').textContent = totalFuel.toFixed(1);
        document.getElementById('waypointCount').textContent = this.waypoints.length;
    }
    
    updateFlightData() {
        const cruiseSpeed = document.getElementById('speedInput').value;
        const fuelFlow = document.getElementById('fuelInput').value;
        
        document.getElementById('cruiseSpeed').textContent = cruiseSpeed;
        document.getElementById('fuelFlow').textContent = fuelFlow;
    }
    
    formatTime(hours) {
        const totalMinutes = Math.round(hours * 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    toRadians(degrees) {
        return degrees * (Math.PI/180);
    }
    
    updateStatus(system, active) {
        const statusElement = document.getElementById(system + 'Status');
        if (statusElement) {
            statusElement.classList.toggle('active', active);
        }
    }
    
    showLoading(show) {
        const loadGpxBtn = document.getElementById('loadGpxBtn');
        if (show) {
            loadGpxBtn.textContent = 'LOADING...';
            loadGpxBtn.disabled = true;
            } else {
            loadGpxBtn.textContent = 'LOAD GPX';
            loadGpxBtn.disabled = false;
        }
    }
    
    showError(message) {
        console.error('EFB Error:', message);
        // Create temporary error notification
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        console.log('EFB Success:', message);
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `efb-notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'error') {
            notification.style.background = '#ff0000';
            notification.style.color = '#ffffff';
            notification.style.border = '1px solid #ff0000';
        } else if (type === 'success') {
            notification.style.background = '#00ff00';
            notification.style.color = '#000000';
            notification.style.border = '1px solid #00ff00';
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    clearRoute() {
        this.waypoints = [];
        this.routeData = [];
        this.routeLayer.clearLayers();
        this.markersLayer.clearLayers();
        this.updateRouteList();
        this.updateFlightDataDisplay(0, 0, 0);
        this.updateStatus('calc', false);
        this.showSuccess('Route cleared');
    }
}

// Initialize EFB System when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EFBSystem();
});

// Add custom styles for aviation markers and notifications
const style = document.createElement('style');
style.textContent = `
    .aviation-marker {
        background: transparent !important;
        border: none !important;
    }
    
    .marker-container {
        position: relative;
        width: 40px;
        height: 40px;
    }
    
    .marker-circle {
        width: 32px;
        height: 32px;
        background: #00ff00;
        border: 3px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px rgba(0, 255, 0, 0.7);
    }
    
    .marker-name {
        font-family: 'JetBrains Mono', monospace;
        font-size: 8px;
        font-weight: 700;
        color: #000000;
        text-align: center;
        line-height: 1;
    }
    
    .marker-triangle {
        position: absolute;
        bottom: -3px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #00ff00;
    }
    
    .direction-arrow {
        background: transparent !important;
        border: none !important;
    }
    
    .arrow-container {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .arrow-head {
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 8px solid #00ff00;
        filter: drop-shadow(0 0 4px rgba(0, 255, 0, 0.8));
    }
    
    .aviation-popup {
        font-family: 'JetBrains Mono', monospace;
        background: #1a1a1a;
        border: 1px solid #00ff00;
        border-radius: 4px;
        color: #ffffff;
        min-width: 200px;
    }
    
    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background: rgba(0, 255, 0, 0.1);
        border-bottom: 1px solid #00ff00;
    }
    
    .popup-title {
        font-weight: 700;
        color: #00ff00;
    }
    
    .popup-type {
        font-size: 10px;
        color: #888888;
        text-transform: uppercase;
    }
    
    .popup-content {
        padding: 8px;
    }
    
    .popup-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 11px;
    }
    
    .popup-label {
        color: #888888;
        text-transform: uppercase;
    }
    
    .popup-value {
        color: #ffffff;
        font-weight: 600;
    }
    
    .route-item {
        background: rgba(0, 255, 0, 0.02);
        border: 1px solid rgba(0, 255, 0, 0.2);
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 8px;
    }
    
    .route-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }
    
    .route-number {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        color: #00ff00;
        font-size: 12px;
    }
    
    .route-name {
        font-weight: 600;
        color: #ffffff;
        font-size: 12px;
    }
    
    .route-item-details {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: #888888;
    }
    
    .route-coords {
        font-family: 'JetBrains Mono', monospace;
    }
    
    .route-distance {
        color: #00ff00;
        font-weight: 600;
    }
    
    .custom-zoom-control {
        background: rgba(20, 20, 20, 0.9);
        border: 1px solid #00ff00;
        border-radius: 4px;
        margin: 2px;
    }
    
    .zoom-btn {
        background: transparent;
        border: none;
        color: #00ff00;
        font-family: 'JetBrains Mono', monospace;
        font-size: 16px;
        font-weight: 700;
        width: 30px;
        height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .zoom-btn:hover {
        background: #00ff00;
        color: #000000;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* Route line enhancements */
    .leaflet-interactive {
        filter: drop-shadow(0 0 8px rgba(0, 255, 0, 0.6)) !important;
    }
    
    .leaflet-polyline {
        filter: drop-shadow(0 0 6px rgba(0, 255, 0, 0.8)) !important;
    }
`;
document.head.appendChild(style);