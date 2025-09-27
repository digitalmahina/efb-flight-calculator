#!/usr/bin/env node

/**
 * Validate Structure Script
 * Проверяет структуру проекта на соответствие стандартам
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Ожидаемая структура проекта
const expectedStructure = {
    'src/': 'Основная папка с исходным кодом',
    'src/core/': 'Основные компоненты приложения',
    'src/modules/': 'Модули приложения',
    'src/shared/': 'Общие компоненты',
    'src/assets/': 'Ресурсы (стили, изображения)',
    'src/test/': 'Тесты',
    'src/test/unit/': 'Модульные тесты',
    'src/test/integration/': 'Интеграционные тесты',
    'src/test/weather/': 'Тесты погодных модулей',
    'build/': 'Скрипты сборки',
    'scripts/': 'Утилитарные скрипты',
    'docs/': 'Документация',
    'package.json': 'Конфигурация проекта',
    'README.md': 'Основная документация'
};

// Обязательные файлы
const requiredFiles = [
    'package.json',
    'src/main.js',
    'src/index.html',
    'src/assets/styles.css',
    'src/shared/event-bus.js',
    'src/shared/utils.js',
    'src/shared/constants.js',
    'src/modules/weather-calculations.js'
];

// Запрещенные дублирования
const forbiddenDuplicates = [
    'weather-calculations.js',
    'weather-calculations-test.js',
    'weather-widget.html',
    'weather-widget.css',
    'WEATHER_CALCULATIONS_INTEGRATION_REPORT.md'
];

class StructureValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.duplicates = [];
    }

    validate() {
        console.log('🔍 Validating project structure...\n');

        this.checkDirectories();
        this.checkRequiredFiles();
        this.checkForDuplicates();
        this.checkPackageJson();

        this.reportResults();
        return this.errors.length === 0;
    }

    checkDirectories() {
        console.log('📁 Checking directory structure...');
        
        for (const [dir, description] of Object.entries(expectedStructure)) {
            const fullPath = path.join(projectRoot, dir);
            
            if (fs.existsSync(fullPath)) {
                console.log(`  ✅ ${dir} - ${description}`);
            } else {
                this.errors.push(`Missing directory: ${dir} - ${description}`);
                console.log(`  ❌ ${dir} - ${description}`);
            }
        }
    }

    checkRequiredFiles() {
        console.log('\n📄 Checking required files...');
        
        for (const file of requiredFiles) {
            const fullPath = path.join(projectRoot, file);
            
            if (fs.existsSync(fullPath)) {
                console.log(`  ✅ ${file}`);
            } else {
                this.errors.push(`Missing required file: ${file}`);
                console.log(`  ❌ ${file}`);
            }
        }
    }

    checkForDuplicates() {
        console.log('\n🔍 Checking for duplicate files...');
        
        for (const filename of forbiddenDuplicates) {
            const duplicates = this.findDuplicates(filename);
            
            if (duplicates.length > 1) {
                this.duplicates.push({ filename, paths: duplicates });
                console.log(`  ⚠️  Found ${duplicates.length} copies of ${filename}:`);
                duplicates.forEach(path => console.log(`     - ${path}`));
            } else if (duplicates.length === 1) {
                console.log(`  ✅ ${filename} - single copy found`);
            } else {
                this.warnings.push(`No copies found of ${filename}`);
                console.log(`  ⚠️  No copies found of ${filename}`);
            }
        }
    }

    findDuplicates(filename) {
        const duplicates = [];
        
        const searchInDir = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    searchInDir(fullPath);
                } else if (item === filename) {
                    duplicates.push(path.relative(projectRoot, fullPath));
                }
            }
        };
        
        searchInDir(projectRoot);
        return duplicates;
    }

    checkPackageJson() {
        console.log('\n📦 Checking package.json...');
        
        const packagePath = path.join(projectRoot, 'package.json');
        
        if (!fs.existsSync(packagePath)) {
            this.errors.push('package.json not found');
            return;
        }
        
        try {
            const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Проверяем обязательные поля
            const requiredFields = ['name', 'version', 'main', 'type', 'scripts'];
            for (const field of requiredFields) {
                if (!packageContent[field]) {
                    this.errors.push(`Missing field in package.json: ${field}`);
                } else {
                    console.log(`  ✅ ${field}: ${packageContent[field]}`);
                }
            }
            
            // Проверяем скрипты
            const requiredScripts = ['start', 'test', 'build', 'clean'];
            for (const script of requiredScripts) {
                if (!packageContent.scripts || !packageContent.scripts[script]) {
                    this.warnings.push(`Missing script in package.json: ${script}`);
                } else {
                    console.log(`  ✅ script ${script}: ${packageContent.scripts[script]}`);
                }
            }
            
        } catch (error) {
            this.errors.push(`Invalid package.json: ${error.message}`);
        }
    }

    reportResults() {
        console.log('\n📊 Validation Results:');
        console.log('='.repeat(50));
        
        if (this.errors.length === 0) {
            console.log('✅ All validations passed!');
        } else {
            console.log(`❌ Found ${this.errors.length} errors:`);
            this.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  Found ${this.warnings.length} warnings:`);
            this.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
        
        if (this.duplicates.length > 0) {
            console.log(`\n🔄 Found ${this.duplicates.length} duplicate files:`);
            this.duplicates.forEach(dup => {
                console.log(`   - ${dup.filename}:`);
                dup.paths.forEach(path => console.log(`     * ${path}`));
            });
        }
        
        console.log('\n' + '='.repeat(50));
    }
}

// Запуск валидации
const validator = new StructureValidator();
const isValid = validator.validate();

process.exit(isValid ? 0 : 1);
