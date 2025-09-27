// MCP Client - Клиент для работы с MCP серверами
class MCPClient {
    constructor() {
        this.connections = new Map();
        this.tools = new Map();
        this.cache = new Map();
        this.isInitialized = false;
    }
    
    // Инициализация MCP клиента
    async init() {
        if (this.isInitialized) {
            return;
        }
        
        try {
            console.log('Initializing MCP Client...');
            
            // Загружаем конфигурацию
            await this.loadConfig();
            
            // Подключаемся к доступным серверам
            await this.connectToServers();
            
            // Загружаем доступные инструменты
            await this.loadTools();
            
            this.isInitialized = true;
            console.log('MCP Client initialized successfully');
            
            // Уведомляем о готовности
            if (window.EventBus) {
                window.EventBus.emit('mcp-client-ready');
            }
            
        } catch (error) {
            console.error('Failed to initialize MCP Client:', error);
            throw error;
        }
    }
    
    // Загрузка конфигурации
    async loadConfig() {
        this.config = {
            servers: {
                figma: {
                    name: 'Figma MCP',
                    tools: ['get_figma_data', 'download_figma_images']
                },
                svgmaker: {
                    name: 'SVG Maker MCP',
                    tools: ['svgmaker_generate', 'svgmaker_edit', 'svgmaker_convert']
                },
                websearch: {
                    name: 'Web Search MCP',
                    tools: ['web_search']
                },
                weather: {
                    name: 'Weather MCP',
                    tools: [
                        'get_current_weather',
                        'get_weather_forecast',
                        'get_metar_data',
                        'get_taf_data',
                        'get_wind_data',
                        'get_weather_alerts'
                    ]
                }
            },
            cache: {
                enabled: true,
                ttl: 300000 // 5 минут
            },
            retry: {
                attempts: 3,
                delay: 1000
            }
        };
    }
    
    // Подключение к серверам
    async connectToServers() {
        for (const [serverId, serverConfig] of Object.entries(this.config.servers)) {
            try {
                await this.connectToServer(serverId, serverConfig);
            } catch (error) {
                console.warn(`Failed to connect to ${serverId}:`, error);
            }
        }
    }
    
    // Подключение к конкретному серверу
    async connectToServer(serverId, config) {
        console.log(`Connecting to MCP server: ${serverId}`);
        
        // Симуляция подключения (в реальном проекте здесь будет реальное подключение)
        const connection = {
            id: serverId,
            name: config.name,
            status: 'connected',
            tools: config.tools,
            connectedAt: new Date()
        };
        
        this.connections.set(serverId, connection);
        
        // Уведомляем о подключении
        if (window.EventBus) {
            window.EventBus.emit('mcp-connected', connection);
        }
        
        console.log(`Connected to ${serverId} successfully`);
    }
    
    // Загрузка доступных инструментов
    async loadTools() {
        for (const [serverId, connection] of this.connections) {
            for (const toolName of connection.tools) {
                const toolInfo = await this.getToolInfo(serverId, toolName);
                this.tools.set(toolName, {
                    ...toolInfo,
                    serverId,
                    name: toolName
                });
            }
        }
        
        console.log(`Loaded ${this.tools.size} MCP tools`);
    }
    
    // Получение информации об инструменте
    async getToolInfo(serverId, toolName) {
        // Симуляция получения информации об инструменте
        const toolInfoMap = {
            'get_figma_data': {
                description: 'Get comprehensive Figma file data',
                parameters: ['fileKey', 'nodeId', 'depth']
            },
            'download_figma_images': {
                description: 'Download SVG and PNG images from Figma',
                parameters: ['fileKey', 'nodes', 'localPath', 'pngScale']
            },
            'svgmaker_generate': {
                description: 'Generate SVG image from text prompt',
                parameters: ['prompt', 'output_path', 'quality', 'aspectRatio', 'background']
            },
            'svgmaker_edit': {
                description: 'Edit existing image/SVG file',
                parameters: ['input_path', 'prompt', 'output_path', 'quality']
            },
            'svgmaker_convert': {
                description: 'Convert image file to SVG format',
                parameters: ['input_path', 'output_path']
            },
            'web_search': {
                description: 'Search the web for real-time information',
                parameters: ['search_term']
            },
            'get_current_weather': {
                description: 'Get current weather conditions for a location',
                parameters: ['lat', 'lon', 'units', 'lang']
            },
            'get_weather_forecast': {
                description: 'Get weather forecast for a location',
                parameters: ['lat', 'lon', 'days', 'units', 'lang']
            },
            'get_metar_data': {
                description: 'Get METAR aviation weather data for airport',
                parameters: ['icao_code', 'hours']
            },
            'get_taf_data': {
                description: 'Get TAF aviation weather forecast for airport',
                parameters: ['icao_code', 'hours']
            },
            'get_wind_data': {
                description: 'Get detailed wind information for aviation',
                parameters: ['lat', 'lon', 'altitude', 'units']
            },
            'get_weather_alerts': {
                description: 'Get weather alerts and warnings for area',
                parameters: ['lat', 'lon', 'radius', 'severity']
            }
        };
        
        return toolInfoMap[toolName] || {
            description: 'Unknown tool',
            parameters: []
        };
    }
    
    // Вызов MCP инструмента
    async callTool(toolName, parameters = {}) {
        if (!this.isInitialized) {
            throw new Error('MCP Client not initialized');
        }
        
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool ${toolName} not found`);
        }
        
        // Проверяем кэш
        const cacheKey = this.getCacheKey(toolName, parameters);
        if (this.config.cache.enabled && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cache.ttl) {
                console.log(`Using cached result for ${toolName}`);
                return cached.data;
            }
        }
        
        try {
            console.log(`Calling MCP tool: ${toolName}`, parameters);
            
            // Уведомляем о вызове инструмента
            if (window.EventBus) {
                window.EventBus.emit('mcp-tool-call', { toolName, parameters });
            }
            
            // Симуляция вызова инструмента
            const result = await this.simulateToolCall(toolName, parameters);
            
            // Кэшируем результат
            if (this.config.cache.enabled) {
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }
            
            // Уведомляем о результате
            if (window.EventBus) {
                window.EventBus.emit('mcp-tool-result', { toolName, parameters, result });
            }
            
            return result;
            
        } catch (error) {
            console.error(`Error calling MCP tool ${toolName}:`, error);
            
            // Уведомляем об ошибке
            if (window.EventBus) {
                window.EventBus.emit('mcp-error', { toolName, parameters, error });
            }
            
            throw error;
        }
    }
    
    // Симуляция вызова инструмента
    async simulateToolCall(toolName, parameters) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // Симуляция различных результатов в зависимости от инструмента
        switch (toolName) {
            case 'get_figma_data':
                return {
                    success: true,
                    data: {
                        fileKey: parameters.fileKey,
                        nodes: [],
                        metadata: {
                            name: 'Sample Figma File',
                            lastModified: new Date().toISOString()
                        }
                    }
                };
                
            case 'download_figma_images':
                return {
                    success: true,
                    downloaded: parameters.nodes?.length || 0,
                    files: parameters.nodes?.map(node => ({
                        nodeId: node.nodeId,
                        fileName: node.fileName,
                        path: `${parameters.localPath}/${node.fileName}`
                    })) || []
                };
                
            case 'svgmaker_generate':
                return {
                    success: true,
                    outputPath: parameters.output_path,
                    prompt: parameters.prompt,
                    generated: true
                };
                
            case 'web_search':
                return {
                    success: true,
                    query: parameters.search_term,
                    results: [
                        {
                            title: 'Sample Search Result',
                            url: 'https://example.com',
                            snippet: 'This is a sample search result...'
                        }
                    ]
                };
                
            case 'get_current_weather':
                return {
                    success: true,
                    location: {
                        lat: parameters.lat,
                        lon: parameters.lon
                    },
                    current: {
                        temperature: 15 + Math.random() * 20 - 10, // -5 to 25°C
                        humidity: 40 + Math.random() * 40, // 40-80%
                        pressure: 1000 + Math.random() * 50, // 1000-1050 hPa
                        wind: {
                            speed: 5 + Math.random() * 15, // 5-20 m/s
                            direction: Math.random() * 360, // 0-360°
                            gust: 10 + Math.random() * 10 // 10-20 m/s
                        },
                        visibility: 5000 + Math.random() * 10000, // 5-15 km
                        clouds: {
                            base: 1000 + Math.random() * 2000, // 1-3 km
                            coverage: Math.random() * 100 // 0-100%
                        },
                        conditions: ['clear', 'partly_cloudy', 'cloudy', 'overcast'][Math.floor(Math.random() * 4)]
                    },
                    timestamp: new Date().toISOString()
                };
                
            case 'get_weather_forecast':
                const forecast = [];
                for (let i = 0; i < (parameters.days || 3); i++) {
                    forecast.push({
                        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        temperature: {
                            min: 10 + Math.random() * 10,
                            max: 20 + Math.random() * 10
                        },
                        wind: {
                            speed: 5 + Math.random() * 15,
                            direction: Math.random() * 360
                        },
                        precipitation: Math.random() * 10,
                        conditions: ['clear', 'partly_cloudy', 'cloudy', 'rain'][Math.floor(Math.random() * 4)]
                    });
                }
                return {
                    success: true,
                    location: {
                        lat: parameters.lat,
                        lon: parameters.lon
                    },
                    forecast: forecast
                };
                
            case 'get_metar_data':
                return {
                    success: true,
                    icao: parameters.icao_code || 'UUEE',
                    metar: `METAR ${parameters.icao_code || 'UUEE'} ${new Date().toISOString().substr(11, 5).replace(':', '')}Z ${Math.floor(Math.random() * 360).toString().padStart(3, '0')}${Math.floor(5 + Math.random() * 15).toString().padStart(2, '0')}KT 9999 SCT${Math.floor(10 + Math.random() * 20).toString().padStart(2, '0')} ${Math.floor(15 + Math.random() * 10)}/${Math.floor(5 + Math.random() * 10)} Q${Math.floor(1000 + Math.random() * 50)}`,
                    timestamp: new Date().toISOString()
                };
                
            case 'get_taf_data':
                return {
                    success: true,
                    icao: parameters.icao_code || 'UUEE',
                    taf: `TAF ${parameters.icao_code || 'UUEE'} ${new Date().toISOString().substr(11, 5).replace(':', '')}Z ${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substr(11, 5).replace(':', '')}Z ${Math.floor(Math.random() * 360).toString().padStart(3, '0')}${Math.floor(5 + Math.random() * 15).toString().padStart(2, '0')}KT 9999 SCT${Math.floor(10 + Math.random() * 20).toString().padStart(2, '0')}`,
                    timestamp: new Date().toISOString()
                };
                
            case 'get_wind_data':
                return {
                    success: true,
                    location: {
                        lat: parameters.lat,
                        lon: parameters.lon,
                        altitude: parameters.altitude || 0
                    },
                    wind: {
                        speed: 5 + Math.random() * 20, // 5-25 m/s
                        direction: Math.random() * 360, // 0-360°
                        gust: 10 + Math.random() * 15, // 10-25 m/s
                        shear: Math.random() * 5, // 0-5 m/s
                        turbulence: ['light', 'moderate', 'severe'][Math.floor(Math.random() * 3)]
                    },
                    timestamp: new Date().toISOString()
                };
                
            case 'get_weather_alerts':
                return {
                    success: true,
                    location: {
                        lat: parameters.lat,
                        lon: parameters.lon,
                        radius: parameters.radius || 50
                    },
                    alerts: Math.random() > 0.7 ? [{
                        type: 'wind_warning',
                        severity: 'moderate',
                        description: 'Strong winds expected',
                        valid_until: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
                    }] : [],
                    timestamp: new Date().toISOString()
                };
                
            default:
                return {
                    success: true,
                    message: `Tool ${toolName} executed successfully`,
                    parameters
                };
        }
    }
    
    // Получение ключа кэша
    getCacheKey(toolName, parameters) {
        return `${toolName}:${JSON.stringify(parameters)}`;
    }
    
    // Получение списка доступных инструментов
    getAvailableTools() {
        return Array.from(this.tools.values());
    }
    
    // Получение информации о подключениях
    getConnections() {
        return Array.from(this.connections.values());
    }
    
    // Очистка кэша
    clearCache() {
        this.cache.clear();
        console.log('MCP cache cleared');
    }
    
    // Отключение от всех серверов
    async disconnect() {
        for (const [serverId, connection] of this.connections) {
            try {
                console.log(`Disconnecting from ${serverId}`);
                
                // Уведомляем об отключении
                if (window.EventBus) {
                    window.EventBus.emit('mcp-disconnected', connection);
                }
                
            } catch (error) {
                console.error(`Error disconnecting from ${serverId}:`, error);
            }
        }
        
        this.connections.clear();
        this.tools.clear();
        this.isInitialized = false;
        
        console.log('Disconnected from all MCP servers');
    }
    
    // Очистка ресурсов
    async destroy() {
        await this.disconnect();
        this.clearCache();
    }
}

// Создаем глобальный экземпляр
window.MCPClient = new MCPClient();

export default window.MCPClient;
