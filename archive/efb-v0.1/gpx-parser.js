class GPXParser {
    static parseGPX(gpxText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(gpxText, 'text/xml');
        
        const waypoints = [];
        const wptElements = xmlDoc.getElementsByTagName('wpt');
        
        for (let i = 0; i < wptElements.length; i++) {
            const wpt = wptElements[i];
            const lat = parseFloat(wpt.getAttribute('lat'));
            const lon = parseFloat(wpt.getAttribute('lon'));
            
            // Получаем название точки
            const nameElement = wpt.getElementsByTagName('name')[0];
            const name = nameElement ? nameElement.textContent : `Точка ${i + 1}`;
            
            // Получаем описание (если есть)
            const descElement = wpt.getElementsByTagName('desc')[0];
            const description = descElement ? descElement.textContent : '';
            
            // Получаем тип точки (если есть)
            const typeElement = wpt.getElementsByTagName('type')[0];
            const type = typeElement ? typeElement.textContent : 'waypoint';
            
            waypoints.push({
                lat,
                lon,
                name,
                description,
                type,
                index: i + 1
            });
        }
        
        return waypoints;
    }
    
    static calculateRouteStats(waypoints) {
        if (waypoints.length < 2) {
            return {
                totalDistance: 0,
                pointCount: waypoints.length
            };
        }
        
        let totalDistance = 0;
        
        for (let i = 1; i < waypoints.length; i++) {
            const prev = waypoints[i - 1];
            const curr = waypoints[i];
            const distance = this.calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
            totalDistance += distance;
        }
        
        return {
            totalDistance: totalDistance.toFixed(2),
            pointCount: waypoints.length
        };
    }
    
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Радиус Земли в км
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    static toRadians(degrees) {
        return degrees * (Math.PI/180);
    }
}
