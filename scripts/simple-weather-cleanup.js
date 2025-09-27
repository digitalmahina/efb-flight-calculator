#!/usr/bin/env node

/**
 * Simple Weather Cleanup Script
 * Простая очистка погодных файлов
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Файлы для удаления
const filesToRemove = [
    'modules/calculations/weather-enhanced-calculations.js',
    'modules/calculations/calculations-with-weather.js',
    'modules/core-ui/efb-weather-integration.js',
    'modules/core-ui/weather-calculations-test.html',
    'modules/integration/weather-calculations-test.html',
    'modules/mcp-integration/weather-mcp.js',
    'modules/mcp-integration/test-weather.js',
    'modules/mcp-integration/test-weather.html',
    'src/modules/calculations/weather-enhanced-calculations.js',
    'src/modules/calculations/calculations-with-weather.js',
    'src/modules/core-ui/efb-weather-integration.js',
    'src/modules/core-ui/weather-calculations-test.html',
    'src/modules/integration/weather-calculations-test.html',
    'src/modules/mcp-integration/weather-mcp.js',
    'src/modules/mcp-integration/test-weather.js',
    'src/modules/mcp-integration/test-weather.html',
    'src/modules/weather-calculations.js'
];

console.log('🧹 Starting Weather Cleanup...');
console.log('🎯 Target: Remove ' + filesToRemove.length + ' duplicate weather files');

let removedCount = 0;
let errorCount = 0;

for (const file of filesToRemove) {
    const fullPath = path.join(projectRoot, file);
    
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
            removedCount++;
            console.log('  ✅ Removed: ' + file);
        } catch (error) {
            errorCount++;
            console.log('  ❌ Failed to remove: ' + file);
        }
    } else {
        console.log('  ⚠️  Not found: ' + file);
    }
}

console.log('\n📊 Cleanup Results:');
console.log('='.repeat(50));
console.log('✅ Files removed: ' + removedCount);
console.log('❌ Errors: ' + errorCount);
console.log('📁 Weather module now in: src/modules/weather/');
console.log('='.repeat(50));
