#!/usr/bin/env node

/**
 * Clean Script
 * Очищает проект от дублированных файлов и временных данных
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Файлы для удаления (дублированные)
const filesToRemove = [
    // Дублированные погодные модули
    'modules/calculations/weather-calculations.js',
    'modules/calculations/weather-calculations-test.js',
    'modules/calculations/weather-widget.html',
    'modules/calculations/weather-widget.css',
    'modules/calculations/WEATHER_CALCULATIONS_INTEGRATION_REPORT.md',
    
    'modules/core-ui/weather-calculations-test.js',
    'modules/core-ui/weather-enhanced-calculations.js',
    'modules/core-ui/weather-widget.html',
    'modules/core-ui/WEATHER_CALCULATIONS_INTEGRATION_REPORT.md',
    
    'modules/integration/weather-calculations.js',
    'modules/integration/weather-calculations-test.js',
    'modules/integration/weather-widget.html',
    'modules/integration/weather-widget.css',
    'modules/integration/WEATHER_CALCULATIONS_INTEGRATION_REPORT.md',
    
    // Дублированные тестовые файлы
    'INTEGRATION_TEST.js',
    'integration-test.html',
    'SYSTEM_TEST.js',
    'system-test.html',
    
    // Дублированные отчеты
    'SYSTEM_READINESS_REPORT.md',
    'SYSTEM_TEST_REPORT.md',
    'WEATHER_INTEGRATION_COMPLETE.md'
];

// Папки для удаления (старая структура)
const directoriesToRemove = [
    'modules/calculations/tests/',
    'modules/calculations/examples/',
    'modules/calculations/weather-calculations-test.html',
    'modules/calculations/test-weather-calculations.html',
    'modules/calculations/test-weather-calculations.js'
];

// Временные файлы
const tempFiles = [
    '*.tmp',
    '*.log',
    '*.cache',
    '.DS_Store',
    'Thumbs.db'
];

class ProjectCleaner {
    constructor() {
        this.removedFiles = [];
        this.removedDirs = [];
        this.errors = [];
    }

    clean() {
        console.log('🧹 Cleaning project...\n');

        this.removeDuplicateFiles();
        this.removeDuplicateDirectories();
        this.removeTempFiles();
        this.cleanupEmptyDirectories();

        this.reportResults();
    }

    removeDuplicateFiles() {
        console.log('📄 Removing duplicate files...');
        
        for (const file of filesToRemove) {
            const fullPath = path.join(projectRoot, file);
            
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    this.removedFiles.push(file);
                    console.log(`  ✅ Removed: ${file}`);
                } catch (error) {
                    this.errors.push(`Failed to remove ${file}: ${error.message}`);
                    console.log(`  ❌ Failed to remove: ${file}`);
                }
            } else {
                console.log(`  ⚠️  Not found: ${file}`);
            }
        }
    }

    removeDuplicateDirectories() {
        console.log('\n📁 Removing duplicate directories...');
        
        for (const dir of directoriesToRemove) {
            const fullPath = path.join(projectRoot, dir);
            
            if (fs.existsSync(fullPath)) {
                try {
                    if (fs.statSync(fullPath).isDirectory()) {
                        fs.rmSync(fullPath, { recursive: true, force: true });
                        this.removedDirs.push(dir);
                        console.log(`  ✅ Removed directory: ${dir}`);
                    } else {
                        fs.unlinkSync(fullPath);
                        this.removedFiles.push(dir);
                        console.log(`  ✅ Removed file: ${dir}`);
                    }
                } catch (error) {
                    this.errors.push(`Failed to remove ${dir}: ${error.message}`);
                    console.log(`  ❌ Failed to remove: ${dir}`);
                }
            } else {
                console.log(`  ⚠️  Not found: ${dir}`);
            }
        }
    }

    removeTempFiles() {
        console.log('\n🗑️  Removing temporary files...');
        
        const removeTempInDir = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    removeTempInDir(fullPath);
                } else {
                    // Проверяем на временные файлы
                    const isTempFile = tempFiles.some(pattern => {
                        if (pattern.includes('*')) {
                            const ext = pattern.replace('*', '');
                            return item.endsWith(ext);
                        }
                        return item === pattern;
                    });
                    
                    if (isTempFile) {
                        try {
                            fs.unlinkSync(fullPath);
                            this.removedFiles.push(path.relative(projectRoot, fullPath));
                            console.log(`  ✅ Removed temp file: ${path.relative(projectRoot, fullPath)}`);
                        } catch (error) {
                            console.log(`  ❌ Failed to remove temp file: ${path.relative(projectRoot, fullPath)}`);
                        }
                    }
                }
            }
        };
        
        removeTempInDir(projectRoot);
    }

    cleanupEmptyDirectories() {
        console.log('\n📂 Cleaning up empty directories...');
        
        const removeEmptyDirs = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            
            // Рекурсивно обрабатываем подпапки
            for (const item of items) {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    removeEmptyDirs(fullPath);
                }
            }
            
            // Проверяем, пуста ли папка после рекурсивной очистки
            const remainingItems = fs.readdirSync(dir);
            if (remainingItems.length === 0 && dir !== projectRoot) {
                try {
                    fs.rmdirSync(dir);
                    this.removedDirs.push(path.relative(projectRoot, dir));
                    console.log(`  ✅ Removed empty directory: ${path.relative(projectRoot, dir)}`);
                } catch (error) {
                    console.log(`  ❌ Failed to remove empty directory: ${path.relative(projectRoot, dir)}`);
                }
            }
        };
        
        removeEmptyDirs(projectRoot);
    }

    reportResults() {
        console.log('\n📊 Cleanup Results:');
        console.log('='.repeat(50));
        
        if (this.removedFiles.length > 0) {
            console.log(`✅ Removed ${this.removedFiles.length} files:`);
            this.removedFiles.forEach(file => console.log(`   - ${file}`));
        }
        
        if (this.removedDirs.length > 0) {
            console.log(`\n✅ Removed ${this.removedDirs.length} directories:`);
            this.removedDirs.forEach(dir => console.log(`   - ${dir}`));
        }
        
        if (this.errors.length > 0) {
            console.log(`\n❌ ${this.errors.length} errors occurred:`);
            this.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (this.removedFiles.length === 0 && this.removedDirs.length === 0 && this.errors.length === 0) {
            console.log('✨ Project is already clean!');
        }
        
        console.log('\n' + '='.repeat(50));
    }
}

// Запуск очистки
const cleaner = new ProjectCleaner();
cleaner.clean();
