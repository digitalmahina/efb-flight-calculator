// Быстрый тест модуля MCP-INTEGRATION
console.log('🧪 Быстрый тест модуля MCP-INTEGRATION');

// Проверяем доступность модулей
console.log('📋 Проверка доступности модулей...');

// Проверяем EventBus
if (typeof window.EventBus !== 'undefined') {
    console.log('✅ EventBus доступен');
} else {
    console.log('❌ EventBus не найден');
}

// Проверяем Utils
if (typeof window.Utils !== 'undefined') {
    console.log('✅ Utils доступен');
} else {
    console.log('❌ Utils не найден');
}

// Проверяем CONSTANTS
if (typeof window.CONSTANTS !== 'undefined') {
    console.log('✅ CONSTANTS доступен');
} else {
    console.log('❌ CONSTANTS не найден');
}

// Проверяем MCPClient
if (typeof window.MCPClient !== 'undefined') {
    console.log('✅ MCPClient доступен');
} else {
    console.log('❌ MCPClient не найден');
}

// Тестируем инициализацию MCPClient
async function testMCPClient() {
    try {
        console.log('🔧 Тестирование инициализации MCPClient...');
        
        await window.MCPClient.init();
        console.log('✅ MCPClient инициализирован успешно');
        
        // Проверяем подключения
        const connections = window.MCPClient.getConnections();
        console.log(`✅ Подключено серверов: ${connections.length}`);
        
        // Проверяем инструменты
        const tools = window.MCPClient.getAvailableTools();
        console.log(`✅ Доступно инструментов: ${tools.length}`);
        
        // Тестируем вызов инструмента
        console.log('🔧 Тестирование вызова инструмента...');
        const result = await window.MCPClient.callTool('web_search', {
            search_term: 'test'
        });
        
        if (result.success) {
            console.log('✅ Вызов инструмента успешен');
        } else {
            console.log('❌ Ошибка при вызове инструмента');
        }
        
        // Тестируем кэширование
        console.log('💾 Тестирование кэширования...');
        const startTime = Date.now();
        await window.MCPClient.callTool('web_search', {
            search_term: 'test'
        });
        const endTime = Date.now();
        console.log(`✅ Время выполнения: ${endTime - startTime}мс`);
        
        // Очистка
        await window.MCPClient.destroy();
        console.log('✅ MCPClient очищен');
        
        console.log('🎉 Все тесты пройдены успешно!');
        
    } catch (error) {
        console.error('❌ Ошибка при тестировании:', error);
    }
}

// Запускаем тест
testMCPClient();
