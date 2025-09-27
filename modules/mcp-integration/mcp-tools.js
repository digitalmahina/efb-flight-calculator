// MCP Tools - Управление MCP инструментами
class MCPTools {
    constructor(mcpClient) {
        this.client = mcpClient;
        this.toolHandlers = new Map();
        this.setupToolHandlers();
    }
    
    // Настройка обработчиков инструментов
    setupToolHandlers() {
        // Figma инструменты
        this.toolHandlers.set('get_figma_data', this.handleFigmaData.bind(this));
        this.toolHandlers.set('download_figma_images', this.handleFigmaImages.bind(this));
        
        // SVG Maker инструменты
        this.toolHandlers.set('svgmaker_generate', this.handleSVGGenerate.bind(this));
        this.toolHandlers.set('svgmaker_edit', this.handleSVGEdit.bind(this));
        this.toolHandlers.set('svgmaker_convert', this.handleSVGConvert.bind(this));
        
        // Web Search инструменты
        this.toolHandlers.set('web_search', this.handleWebSearch.bind(this));
        
        // Weather инструменты
        this.toolHandlers.set('get_current_weather', this.handleCurrentWeather.bind(this));
        this.toolHandlers.set('get_weather_forecast', this.handleWeatherForecast.bind(this));
        this.toolHandlers.set('get_metar_data', this.handleMETARData.bind(this));
        this.toolHandlers.set('get_taf_data', this.handleTAFData.bind(this));
        this.toolHandlers.set('get_wind_data', this.handleWindData.bind(this));
        this.toolHandlers.set('get_weather_alerts', this.handleWeatherAlerts.bind(this));
    }
    
    // Вызов инструмента с обработкой
    async callTool(toolName, parameters) {
        const handler = this.toolHandlers.get(toolName);
        
        if (handler) {
            // Используем специальный обработчик
            return await handler(parameters);
        } else {
            // Используем стандартный вызов
            return await this.client.callTool(toolName, parameters);
        }
    }
    
    // Обработчик получения данных Figma
    async handleFigmaData(parameters) {
        try {
            const { fileKey, nodeId, depth } = parameters;
            
            // Валидация параметров
            if (!fileKey) {
                throw new Error('fileKey is required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('get_figma_data', {
                fileKey,
                nodeId,
                depth
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о получении данных Figma
                if (window.EventBus) {
                    window.EventBus.emit('figma-data-loaded', result.data);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling Figma data:', error);
            throw error;
        }
    }
    
    // Обработчик загрузки изображений Figma
    async handleFigmaImages(parameters) {
        try {
            const { fileKey, nodes, localPath, pngScale } = parameters;
            
            // Валидация параметров
            if (!fileKey || !nodes || !localPath) {
                throw new Error('fileKey, nodes, and localPath are required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('download_figma_images', {
                fileKey,
                nodes,
                localPath,
                pngScale: pngScale || 2
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о загрузке изображений
                if (window.EventBus) {
                    window.EventBus.emit('figma-images-downloaded', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling Figma images:', error);
            throw error;
        }
    }
    
    // Обработчик генерации SVG
    async handleSVGGenerate(parameters) {
        try {
            const { prompt, output_path, quality, aspectRatio, background } = parameters;
            
            // Валидация параметров
            if (!prompt || !output_path) {
                throw new Error('prompt and output_path are required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('svgmaker_generate', {
                prompt,
                output_path,
                quality: quality || 'medium',
                aspectRatio,
                background: background || 'auto'
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о генерации SVG
                if (window.EventBus) {
                    window.EventBus.emit('svg-generated', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling SVG generation:', error);
            throw error;
        }
    }
    
    // Обработчик редактирования SVG
    async handleSVGEdit(parameters) {
        try {
            const { input_path, prompt, output_path, quality, aspectRatio, background } = parameters;
            
            // Валидация параметров
            if (!input_path || !prompt || !output_path) {
                throw new Error('input_path, prompt, and output_path are required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('svgmaker_edit', {
                input_path,
                prompt,
                output_path,
                quality: quality || 'medium',
                aspectRatio,
                background: background || 'auto'
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о редактировании SVG
                if (window.EventBus) {
                    window.EventBus.emit('svg-edited', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling SVG edit:', error);
            throw error;
        }
    }
    
    // Обработчик конвертации в SVG
    async handleSVGConvert(parameters) {
        try {
            const { input_path, output_path } = parameters;
            
            // Валидация параметров
            if (!input_path || !output_path) {
                throw new Error('input_path and output_path are required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('svgmaker_convert', {
                input_path,
                output_path
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о конвертации
                if (window.EventBus) {
                    window.EventBus.emit('svg-converted', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling SVG conversion:', error);
            throw error;
        }
    }
    
    // Обработчик веб-поиска
    async handleWebSearch(parameters) {
        try {
            const { search_term } = parameters;
            
            // Валидация параметров
            if (!search_term) {
                throw new Error('search_term is required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('web_search', {
                search_term
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о результатах поиска
                if (window.EventBus) {
                    window.EventBus.emit('web-search-complete', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling web search:', error);
            throw error;
        }
    }
    
    // Получение списка доступных инструментов
    getAvailableTools() {
        return this.client.getAvailableTools();
    }
    
    // Получение информации об инструменте
    getToolInfo(toolName) {
        return this.client.tools.get(toolName);
    }
    
    // Проверка доступности инструмента
    isToolAvailable(toolName) {
        return this.client.tools.has(toolName);
    }
    
    // Получение инструментов по категории
    getToolsByCategory(category) {
        const categoryMap = {
            'figma': ['get_figma_data', 'download_figma_images'],
            'svg': ['svgmaker_generate', 'svgmaker_edit', 'svgmaker_convert'],
            'web': ['web_search'],
            'weather': [
                'get_current_weather',
                'get_weather_forecast',
                'get_metar_data',
                'get_taf_data',
                'get_wind_data',
                'get_weather_alerts'
            ]
        };
        
        const tools = categoryMap[category] || [];
        return tools.filter(tool => this.isToolAvailable(tool));
    }
    
    // Обработчик получения текущей погоды
    async handleCurrentWeather(parameters) {
        try {
            const { lat, lon, units, lang } = parameters;
            
            // Валидация параметров
            if (!lat || !lon) {
                throw new Error('lat and lon are required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('get_current_weather', {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                units: units || 'metric',
                lang: lang || 'ru'
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о получении погодных данных
                if (window.EventBus) {
                    window.EventBus.emit('current-weather-loaded', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling current weather:', error);
            throw error;
        }
    }
    
    // Обработчик получения прогноза погоды
    async handleWeatherForecast(parameters) {
        try {
            const { lat, lon, days, units, lang } = parameters;
            
            // Валидация параметров
            if (!lat || !lon) {
                throw new Error('lat and lon are required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('get_weather_forecast', {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                days: parseInt(days) || 3,
                units: units || 'metric',
                lang: lang || 'ru'
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о получении прогноза
                if (window.EventBus) {
                    window.EventBus.emit('weather-forecast-loaded', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling weather forecast:', error);
            throw error;
        }
    }
    
    // Обработчик получения METAR данных
    async handleMETARData(parameters) {
        try {
            const { icao_code, hours } = parameters;
            
            // Валидация параметров
            if (!icao_code) {
                throw new Error('icao_code is required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('get_metar_data', {
                icao_code: icao_code.toUpperCase(),
                hours: parseInt(hours) || 24
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о получении METAR данных
                if (window.EventBus) {
                    window.EventBus.emit('metar-data-loaded', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling METAR data:', error);
            throw error;
        }
    }
    
    // Обработчик получения TAF данных
    async handleTAFData(parameters) {
        try {
            const { icao_code, hours } = parameters;
            
            // Валидация параметров
            if (!icao_code) {
                throw new Error('icao_code is required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('get_taf_data', {
                icao_code: icao_code.toUpperCase(),
                hours: parseInt(hours) || 24
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о получении TAF данных
                if (window.EventBus) {
                    window.EventBus.emit('taf-data-loaded', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling TAF data:', error);
            throw error;
        }
    }
    
    // Обработчик получения данных о ветре
    async handleWindData(parameters) {
        try {
            const { lat, lon, altitude, units } = parameters;
            
            // Валидация параметров
            if (!lat || !lon) {
                throw new Error('lat and lon are required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('get_wind_data', {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                altitude: parseFloat(altitude) || 0,
                units: units || 'metric'
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о получении данных о ветре
                if (window.EventBus) {
                    window.EventBus.emit('wind-data-loaded', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling wind data:', error);
            throw error;
        }
    }
    
    // Обработчик получения погодных предупреждений
    async handleWeatherAlerts(parameters) {
        try {
            const { lat, lon, radius, severity } = parameters;
            
            // Валидация параметров
            if (!lat || !lon) {
                throw new Error('lat and lon are required');
            }
            
            // Вызов MCP инструмента
            const result = await this.client.callTool('get_weather_alerts', {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                radius: parseFloat(radius) || 50,
                severity: severity || 'all'
            });
            
            // Обработка результата
            if (result.success) {
                // Уведомляем о получении предупреждений
                if (window.EventBus) {
                    window.EventBus.emit('weather-alerts-loaded', result);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('Error handling weather alerts:', error);
            throw error;
        }
    }
}

export default MCPTools;
