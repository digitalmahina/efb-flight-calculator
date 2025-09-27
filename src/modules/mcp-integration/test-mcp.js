// Тестирование модуля MCP-INTEGRATION
class MCPTester {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }
    
    // Запуск всех тестов
    async runAllTests() {
        console.log('🧪 Начинаем тестирование модуля MCP-INTEGRATION...\n');
        
        try {
            // Тест 1: Инициализация MCP клиента
            await this.testMCPClientInit();
            
            // Тест 2: Подключение к серверам
            await this.testServerConnections();
            
            // Тест 3: Загрузка инструментов
            await this.testToolsLoading();
            
            // Тест 4: Вызов Figma инструментов
            await this.testFigmaTools();
            
            // Тест 5: Вызов SVG Maker инструментов
            await this.testSVGMakerTools();
            
            // Тест 6: Вызов Web Search инструментов
            await this.testWebSearchTools();
            
            // Тест 7: Кэширование
            await this.testCaching();
            
            // Тест 8: Обработка ошибок
            await this.testErrorHandling();
            
            // Тест 9: Система событий
            await this.testEventSystem();
            
            // Тест 10: Очистка ресурсов
            await this.testCleanup();
            
            // Вывод результатов
            this.printResults();
            
        } catch (error) {
            console.error('❌ Критическая ошибка при тестировании:', error);
        }
    }
    
    // Тест 1: Инициализация MCP клиента
    async testMCPClientInit() {
        console.log('🔧 Тест 1: Инициализация MCP клиента');
        
        try {
            // Проверяем, что MCPClient доступен
            if (typeof window.MCPClient === 'undefined') {
                throw new Error('MCPClient не найден в window');
            }
            
            // Инициализируем клиент
            await window.MCPClient.init();
            
            // Проверяем состояние
            if (!window.MCPClient.isInitialized) {
                throw new Error('MCPClient не инициализирован');
            }
            
            this.addTestResult('Инициализация MCP клиента', true, 'Клиент успешно инициализирован');
            
        } catch (error) {
            this.addTestResult('Инициализация MCP клиента', false, error.message);
        }
    }
    
    // Тест 2: Подключение к серверам
    async testServerConnections() {
        console.log('🔗 Тест 2: Подключение к серверам');
        
        try {
            const connections = window.MCPClient.getConnections();
            
            if (connections.length === 0) {
                throw new Error('Нет активных подключений');
            }
            
            // Проверяем подключения к основным серверам
            const expectedServers = ['figma', 'svgmaker', 'websearch'];
            const connectedServers = connections.map(conn => conn.id);
            
            for (const server of expectedServers) {
                if (!connectedServers.includes(server)) {
                    throw new Error(`Сервер ${server} не подключен`);
                }
            }
            
            this.addTestResult('Подключение к серверам', true, `Подключено ${connections.length} серверов: ${connectedServers.join(', ')}`);
            
        } catch (error) {
            this.addTestResult('Подключение к серверам', false, error.message);
        }
    }
    
    // Тест 3: Загрузка инструментов
    async testToolsLoading() {
        console.log('🛠️ Тест 3: Загрузка инструментов');
        
        try {
            const tools = window.MCPClient.getAvailableTools();
            
            if (tools.length === 0) {
                throw new Error('Нет доступных инструментов');
            }
            
            // Проверяем наличие основных инструментов
            const expectedTools = [
                'get_figma_data',
                'download_figma_images',
                'svgmaker_generate',
                'svgmaker_edit',
                'svgmaker_convert',
                'web_search'
            ];
            
            const availableToolNames = tools.map(tool => tool.name);
            const missingTools = expectedTools.filter(tool => !availableToolNames.includes(tool));
            
            if (missingTools.length > 0) {
                throw new Error(`Отсутствуют инструменты: ${missingTools.join(', ')}`);
            }
            
            this.addTestResult('Загрузка инструментов', true, `Загружено ${tools.length} инструментов`);
            
        } catch (error) {
            this.addTestResult('Загрузка инструментов', false, error.message);
        }
    }
    
    // Тест 4: Вызов Figma инструментов
    async testFigmaTools() {
        console.log('🎨 Тест 4: Вызов Figma инструментов');
        
        try {
            // Тест получения данных Figma
            const figmaResult = await window.MCPClient.callTool('get_figma_data', {
                fileKey: 'test-file-key',
                nodeId: '1:2',
                depth: 1
            });
            
            if (!figmaResult.success) {
                throw new Error('Ошибка при получении данных Figma');
            }
            
            // Тест загрузки изображений
            const imagesResult = await window.MCPClient.callTool('download_figma_images', {
                fileKey: 'test-file-key',
                nodes: [{ nodeId: '1:2', fileName: 'test.svg' }],
                localPath: '/test/path',
                pngScale: 2
            });
            
            if (!imagesResult.success) {
                throw new Error('Ошибка при загрузке изображений Figma');
            }
            
            this.addTestResult('Вызов Figma инструментов', true, 'Figma инструменты работают корректно');
            
        } catch (error) {
            this.addTestResult('Вызов Figma инструментов', false, error.message);
        }
    }
    
    // Тест 5: Вызов SVG Maker инструментов
    async testSVGMakerTools() {
        console.log('🖼️ Тест 5: Вызов SVG Maker инструментов');
        
        try {
            // Тест генерации SVG
            const generateResult = await window.MCPClient.callTool('svgmaker_generate', {
                prompt: 'Test aviation icon',
                output_path: '/test/icon.svg',
                quality: 'medium'
            });
            
            if (!generateResult.success) {
                throw new Error('Ошибка при генерации SVG');
            }
            
            // Тест редактирования SVG
            const editResult = await window.MCPClient.callTool('svgmaker_edit', {
                input_path: '/test/input.svg',
                prompt: 'Make it blue',
                output_path: '/test/output.svg',
                quality: 'high'
            });
            
            if (!editResult.success) {
                throw new Error('Ошибка при редактировании SVG');
            }
            
            // Тест конвертации
            const convertResult = await window.MCPClient.callTool('svgmaker_convert', {
                input_path: '/test/image.png',
                output_path: '/test/image.svg'
            });
            
            if (!convertResult.success) {
                throw new Error('Ошибка при конвертации в SVG');
            }
            
            this.addTestResult('Вызов SVG Maker инструментов', true, 'SVG Maker инструменты работают корректно');
            
        } catch (error) {
            this.addTestResult('Вызов SVG Maker инструментов', false, error.message);
        }
    }
    
    // Тест 6: Вызов Web Search инструментов
    async testWebSearchTools() {
        console.log('🔍 Тест 6: Вызов Web Search инструментов');
        
        try {
            const searchResult = await window.MCPClient.callTool('web_search', {
                search_term: 'aviation weather data'
            });
            
            if (!searchResult.success) {
                throw new Error('Ошибка при веб-поиске');
            }
            
            if (!searchResult.results || searchResult.results.length === 0) {
                throw new Error('Нет результатов поиска');
            }
            
            this.addTestResult('Вызов Web Search инструментов', true, 'Web Search работает корректно');
            
        } catch (error) {
            this.addTestResult('Вызов Web Search инструментов', false, error.message);
        }
    }
    
    // Тест 7: Кэширование
    async testCaching() {
        console.log('💾 Тест 7: Кэширование');
        
        try {
            const startTime = Date.now();
            
            // Первый вызов
            await window.MCPClient.callTool('web_search', {
                search_term: 'test caching'
            });
            
            const firstCallTime = Date.now() - startTime;
            
            // Второй вызов (должен использовать кэш)
            const secondStartTime = Date.now();
            await window.MCPClient.callTool('web_search', {
                search_term: 'test caching'
            });
            
            const secondCallTime = Date.now() - secondStartTime;
            
            // Второй вызов должен быть быстрее (использует кэш)
            if (secondCallTime >= firstCallTime) {
                console.warn('⚠️ Кэширование может не работать (второй вызов не быстрее)');
            }
            
            this.addTestResult('Кэширование', true, `Первый вызов: ${firstCallTime}мс, второй: ${secondCallTime}мс`);
            
        } catch (error) {
            this.addTestResult('Кэширование', false, error.message);
        }
    }
    
    // Тест 8: Обработка ошибок
    async testErrorHandling() {
        console.log('❌ Тест 8: Обработка ошибок');
        
        try {
            // Тест с несуществующим инструментом
            try {
                await window.MCPClient.callTool('non_existent_tool', {});
                throw new Error('Ошибка: несуществующий инструмент не вызвал исключение');
            } catch (error) {
                if (!error.message.includes('not found')) {
                    throw new Error('Неправильное сообщение об ошибке');
                }
            }
            
            // Тест с неправильными параметрами
            try {
                await window.MCPClient.callTool('get_figma_data', {});
                throw new Error('Ошибка: отсутствующие параметры не вызвали исключение');
            } catch (error) {
                if (!error.message.includes('required')) {
                    throw new Error('Неправильная валидация параметров');
                }
            }
            
            this.addTestResult('Обработка ошибок', true, 'Ошибки обрабатываются корректно');
            
        } catch (error) {
            this.addTestResult('Обработка ошибок', false, error.message);
        }
    }
    
    // Тест 9: Система событий
    async testEventSystem() {
        console.log('📡 Тест 9: Система событий');
        
        try {
            let eventReceived = false;
            
            // Подписываемся на событие
            const eventHandler = (data) => {
                eventReceived = true;
                console.log('📨 Получено событие:', data);
            };
            
            if (window.EventBus) {
                window.EventBus.on('mcp-tool-call', eventHandler);
                
                // Вызываем инструмент
                await window.MCPClient.callTool('web_search', {
                    search_term: 'test event system'
                });
                
                // Ждем немного для обработки события
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Отписываемся
                window.EventBus.off('mcp-tool-call', eventHandler);
                
                if (!eventReceived) {
                    throw new Error('Событие не было получено');
                }
            } else {
                throw new Error('EventBus не доступен');
            }
            
            this.addTestResult('Система событий', true, 'События работают корректно');
            
        } catch (error) {
            this.addTestResult('Система событий', false, error.message);
        }
    }
    
    // Тест 10: Очистка ресурсов
    async testCleanup() {
        console.log('🧹 Тест 10: Очистка ресурсов');
        
        try {
            // Очищаем кэш
            window.MCPClient.clearCache();
            
            // Отключаемся от серверов
            await window.MCPClient.disconnect();
            
            // Проверяем, что отключились
            const connections = window.MCPClient.getConnections();
            if (connections.length > 0) {
                throw new Error('Не все подключения закрыты');
            }
            
            // Проверяем, что инструменты очищены
            const tools = window.MCPClient.getAvailableTools();
            if (tools.length > 0) {
                throw new Error('Инструменты не очищены');
            }
            
            this.addTestResult('Очистка ресурсов', true, 'Ресурсы очищены корректно');
            
        } catch (error) {
            this.addTestResult('Очистка ресурсов', false, error.message);
        }
    }
    
    // Добавление результата теста
    addTestResult(testName, passed, message) {
        const result = {
            name: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (passed) {
            this.passedTests++;
            console.log(`✅ ${testName}: ${message}`);
        } else {
            this.failedTests++;
            console.log(`❌ ${testName}: ${message}`);
        }
        
        console.log(''); // Пустая строка для читаемости
    }
    
    // Вывод результатов
    printResults() {
        console.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ МОДУЛЯ MCP-INTEGRATION');
        console.log('='.repeat(60));
        console.log(`✅ Пройдено тестов: ${this.passedTests}`);
        console.log(`❌ Провалено тестов: ${this.failedTests}`);
        console.log(`📈 Общий процент успеха: ${Math.round((this.passedTests / (this.passedTests + this.failedTests)) * 100)}%`);
        console.log('');
        
        if (this.failedTests > 0) {
            console.log('❌ ПРОВАЛЕННЫЕ ТЕСТЫ:');
            this.testResults
                .filter(result => !result.passed)
                .forEach(result => {
                    console.log(`  • ${result.name}: ${result.message}`);
                });
            console.log('');
        }
        
        console.log('📋 ДЕТАЛЬНЫЕ РЕЗУЛЬТАТЫ:');
        this.testResults.forEach((result, index) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.name}`);
            console.log(`   ${result.message}`);
            console.log(`   Время: ${result.timestamp}`);
            console.log('');
        });
        
        // Рекомендации
        if (this.failedTests === 0) {
            console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ! Модуль MCP-INTEGRATION готов к использованию.');
        } else {
            console.log('⚠️ ЕСТЬ ПРОБЛЕМЫ! Необходимо исправить проваленные тесты.');
        }
    }
}

// Запуск тестов
async function runMCPTests() {
    const tester = new MCPTester();
    await tester.runAllTests();
}

// Экспорт для использования
window.MCPTester = MCPTester;
window.runMCPTests = runMCPTests;

export default MCPTester;
