// EFB System - Electronic Flight Bag
class EFBSystem {
    constructor() {
        this.map = null;
        this.waypoints = [];
        this.initializeSystem();
        this.setupEventListeners();
        this.startClock();
        this.initializeMap();
    }
    
    initializeSystem() {
        this.updateStatus('gps', true);
        this.updateStatus('nav', true);
        this.updateStatus('calc', false);
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
        this.map = L.map('efbMap', {
            zoomControl: false,
            attributionControl: false
        }).setView([68.0, 33.0], 6);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: ''
        }).addTo(this.map);
    }
    
    async loadGPXFile(file) {
        try {
            const gpxText = await file.text();
            this.waypoints = GPXParser.parseGPX(gpxText);
            this.updateStatus('calc', true);
        } catch (error) {
            console.error('Error loading GPX:', error);
        }
    }
    
    updateStatus(system, active) {
        const statusElement = document.getElementById(system + 'Status');
        if (statusElement) {
            statusElement.classList.toggle('active', active);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EFBSystem();
});