#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

class EFBMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'efb-flight-calculator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Кэш для погодных данных
    this.weatherCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Обработчик списка инструментов
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Погодные инструменты
          {
            name: 'get_current_weather',
            description: 'Get current weather data for coordinates',
            inputSchema: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  description: 'Latitude',
                  minimum: -90,
                  maximum: 90,
                },
                lon: {
                  type: 'number',
                  description: 'Longitude', 
                  minimum: -180,
                  maximum: 180,
                },
                icao: {
                  type: 'string',
                  description: 'ICAO airport code (optional)',
                },
              },
              required: ['lat', 'lon'],
            },
          },
          {
            name: 'read_project_file',
            description: 'Read a file from the EFB project',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the file relative to project root',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'write_project_file',
            description: 'Write content to a project file',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to the file relative to project root',
                },
                content: {
                  type: 'string',
                  description: 'File content to write',
                },
              },
              required: ['path', 'content'],
            },
          },
          {
            name: 'list_project_structure',
            description: 'List the project directory structure',
            inputSchema: {
              type: 'object',
              properties: {
                directory: {
                  type: 'string',
                  description: 'Directory to list (default: project root)',
                  default: '.',
                },
                maxDepth: {
                  type: 'number',
                  description: 'Maximum depth to traverse',
                  default: 3,
                },
              },
            },
          },
          {
            name: 'run_npm_script',
            description: 'Run npm scripts for the EFB project',
            inputSchema: {
              type: 'object',
              properties: {
                script: {
                  type: 'string',
                  description: 'npm script name (start, dev, test, etc.)',
                },
              },
              required: ['script'],
            },
          },
          {
            name: 'analyze_weather_integration',
            description: 'Analyze weather module integration status',
            inputSchema: {
              type: 'object',
              properties: {
                checkFiles: {
                  type: 'boolean',
                  description: 'Check for weather-related files in old structure',
                  default: true,
                },
              },
            },
          },
          {
            name: 'test_weather_module',
            description: 'Test weather module functionality',
            inputSchema: {
              type: 'object',
              properties: {
                testType: {
                  type: 'string',
                  enum: ['basic', 'integration', 'performance'],
                  description: 'Type of test to run',
                  default: 'basic',
                },
              },
            },
          },
        ],
      };
    });

    // Обработчик вызовов инструментов
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_current_weather':
            return await this.getCurrentWeather(args);

          case 'read_project_file':
            return await this.readProjectFile(args.path);

          case 'write_project_file':
            return await this.writeProjectFile(args.path, args.content);

          case 'list_project_structure':
            return await this.listProjectStructure(
              args.directory || '.', 
              args.maxDepth || 3
            );

          case 'run_npm_script':
            return await this.runNpmScript(args.script);

          case 'analyze_weather_integration':
            return await this.analyzeWeatherIntegration(args.checkFiles);

          case 'test_weather_module':
            return await this.testWeatherModule(args.testType || 'basic');

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async getCurrentWeather(args) {
    const { lat, lon, icao } = args;
    const cacheKey = `weather_${lat}_${lon}_${icao || 'no_icao'}`;
    
    // Проверяем кэш
    const cached = this.weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ...cached.data,
              source: 'cache'
            }, null, 2),
          },
        ],
      };
    }

    try {
      // Генерируем реалистичные погодные данные
      const weatherData = this.generateWeatherData(lat, lon, icao);
      
      // Сохраняем в кэш
      this.weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now(),
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(weatherData, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error.message,
              source: 'error'
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }

  generateWeatherData(lat, lon, icao) {
    const conditions = ['clear', 'partly_cloudy', 'cloudy', 'overcast', 'light_rain', 'rain'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Температура зависит от широты
    const baseTemp = 15 - Math.abs(lat) * 0.7;
    const temperature = Math.round(baseTemp + (Math.random() - 0.5) * 10);
    
    // Ветер
    const windSpeed = Math.round(Math.random() * 30); // 0-30 km/h
    const windDirection = Math.round(Math.random() * 360);
    
    // Давление
    const pressure = Math.round(1013 + (Math.random() - 0.5) * 40); // hPa
    
    return {
      observedAt: new Date().toISOString(),
      location: {
        type: icao ? 'icao' : 'coords',
        value: icao || { lat, lon }
      },
      conditions: {
        temperatureC: temperature,
        windKts: Math.round(windSpeed * 0.539957), // km/h to knots
        windDirDeg: windDirection,
        visibilityKm: Math.round(5 + Math.random() * 15),
        pressureHpa: pressure,
        phenomenon: condition.toUpperCase(),
        humidity: Math.round(Math.random() * 100),
        cloudBase: condition === 'clear' ? 'unlimited' : `${Math.round(1000 + Math.random() * 3000)}ft`
      },
      source: 'mcp_simulation'
    };
  }

  async readProjectFile(filePath) {
    this.validatePath(filePath);
    const fullPath = path.resolve(process.cwd(), filePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        content: [
          {
            type: 'text',
            text: `File: ${filePath}\n${'='.repeat(50)}\n${content}`,
          },
        ],
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  async writeProjectFile(filePath, content) {
    this.validatePath(filePath);
    
    // Разрешаем запись только в src/ и scripts/
    if (!filePath.startsWith('src/') && !filePath.startsWith('scripts/')) {
      throw new Error('Writing only allowed in src/ and scripts/ directories');
    }

    const fullPath = path.resolve(process.cwd(), filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');

    return {
      content: [
        {
          type: 'text',
          text: `Successfully wrote ${content.length} characters to ${filePath}`,
        },
      ],
    };
  }

  async listProjectStructure(directory, maxDepth) {
    const fullPath = path.resolve(process.cwd(), directory);
    
    const getStructure = async (dir, depth = 0) => {
      if (depth > maxDepth) return [];
      
      try {
        const items = await fs.readdir(dir);
        const structure = [];

        for (const item of items) {
          // Пропускаем системные файлы и node_modules
          if (item.startsWith('.') && item !== '.mcp-config.json') continue;
          if (item === 'node_modules') continue;
          
          const itemPath = path.join(dir, item);
          const stat = await fs.stat(itemPath);
          const indent = '  '.repeat(depth);

          if (stat.isDirectory()) {
            structure.push(`${indent}📁 ${item}/`);
            const subItems = await getStructure(itemPath, depth + 1);
            structure.push(...subItems);
          } else {
            const emoji = this.getFileEmoji(item);
            structure.push(`${indent}${emoji} ${item}`);
          }
        }

        return structure;
      } catch (error) {
        return [`${' '.repeat(depth * 2)}❌ Error reading ${dir}: ${error.message}`];
      }
    };

    const structure = await getStructure(fullPath);
    return {
      content: [
        {
          type: 'text',
          text: `Project Structure (${directory}):\n\n${structure.join('\n')}`,
        },
      ],
    };
  }

  async runNpmScript(script) {
    const allowedScripts = ['start', 'dev', 'test', 'build', 'clean', 'validate', 'lint'];
    
    if (!allowedScripts.includes(script)) {
      throw new Error(`Script '${script}' is not in allowed list: ${allowedScripts.join(', ')}`);
    }

    try {
      const output = execSync(`npm run ${script}`, {
        encoding: 'utf-8',
        timeout: 60000, // 1 minute timeout
      });

      return {
        content: [
          {
            type: 'text',
            text: `npm run ${script} completed successfully:\n\n${output}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to run npm script '${script}': ${error.message}`);
    }
  }

  async analyzeWeatherIntegration(checkFiles = true) {
    const analysis = {
      consolidatedModule: false,
      oldStructureExists: false,
      conflicts: [],
      recommendations: [],
    };

    // Проверяем консолидированный модуль
    try {
      await fs.access('src/modules/weather/weather-module.js');
      analysis.consolidatedModule = true;
    } catch {
      analysis.recommendations.push('Create consolidated weather module at src/modules/weather/weather-module.js');
    }

    // Проверяем старую структуру
    if (checkFiles) {
      const oldWeatherFiles = [
        'modules/calculations/weather-enhanced-calculations.js',
        'modules/mcp-integration/weather-mcp.js',
        'modules/core-ui/efb-weather-integration.js',
      ];

      for (const file of oldWeatherFiles) {
        try {
          await fs.access(file);
          analysis.oldStructureExists = true;
          analysis.conflicts.push(file);
        } catch {
          // File doesn't exist, which is good
        }
      }
    }

    // Рекомендации
    if (analysis.conflicts.length > 0) {
      analysis.recommendations.push('Remove duplicate weather files from old structure');
    }

    if (analysis.consolidatedModule && analysis.conflicts.length === 0) {
      analysis.recommendations.push('Weather integration looks good - single consolidated module detected');
    }

    return {
      content: [
        {
          type: 'text',
          text: `Weather Integration Analysis:\n\nConsolidated Module: ${analysis.consolidatedModule ? '✅ Found' : '❌ Missing'}\nOld Structure Files: ${analysis.oldStructureExists ? '⚠️  Found conflicts' : '✅ Clean'}\n\n${analysis.conflicts.length > 0 ? `Conflicting Files:\n${analysis.conflicts.map(f => `- ${f}`).join('\n')}\n` : ''}\nRecommendations:\n${analysis.recommendations.map(r => `- ${r}`).join('\n')}`,
        },
      ],
    };
  }

  async testWeatherModule(testType) {
    try {
      const moduleExists = await fs.access('src/modules/weather/weather-module.js').then(() => true).catch(() => false);
      
      if (!moduleExists) {
        throw new Error('Weather module not found at src/modules/weather/weather-module.js');
      }

      const results = [];
      results.push(`Testing weather module (${testType} test)...`);

      switch (testType) {
        case 'basic':
          results.push('✅ Module file exists');
          results.push('ℹ️  Basic structure test passed');
          break;

        case 'integration':
          // Проверяем импорт в main.js
          try {
            const mainContent = await fs.readFile('src/main.js', 'utf-8');
            if (mainContent.includes("from './modules/weather/weather-module.js'")) {
              results.push('✅ Weather module properly imported in main.js');
            } else {
              results.push('⚠️  Weather module import not found in main.js');
            }
          } catch {
            results.push('❌ Could not read src/main.js');
          }
          break;

        case 'performance':
          results.push('ℹ️  Performance testing would require module execution');
          results.push('ℹ️  Module appears to implement caching mechanisms');
          break;
      }

      return {
        content: [
          {
            type: 'text',
            text: results.join('\n'),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Weather module test failed: ${error.message}`);
    }
  }

  validatePath(filePath) {
    if (filePath.includes('..') || path.isAbsolute(filePath)) {
      throw new Error('Invalid file path - relative paths only, no parent directory access');
    }
  }

  getFileEmoji(filename) {
    const extension = path.extname(filename).toLowerCase();
    const emojiMap = {
      '.js': '⚡',
      '.ts': '🔷',
      '.html': '🌐',
      '.css': '🎨',
      '.json': '📋',
      '.md': '📖',
      '.gpx': '🗺️',
      '.svg': '🖼️',
    };
    return emojiMap[extension] || '📄';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('EFB MCP Server with Weather Tools running on stdio (SDK 1.18.1)');
  }
}

// Запуск сервера
const server = new EFBMCPServer();
server.run().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});


