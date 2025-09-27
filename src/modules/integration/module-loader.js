// Module Loader - Загрузчик и интегратор модулей
class ModuleLoader {
    constructor() {
        this.modules = new Map();
        this.loadedModules = new Set();
        this.dependencies = new Map();
    }
    
    // Регистрация модуля
    register(name, module, dependencies = []) {
        this.modules.set(name, module);
        this.dependencies.set(name, dependencies);
    }
    
    // Загрузка модуля
    async loadModule(name) {
        if (this.loadedModules.has(name)) {
            return this.modules.get(name);
        }
        
        const dependencies = this.dependencies.get(name) || [];
        
        // Загружаем зависимости
        for (const dep of dependencies) {
            await this.loadModule(dep);
        }
        
        const module = this.modules.get(name);
        if (!module) {
            throw new Error(`Module ${name} not found`);
        }
        
        // Инициализируем модуль
        if (module.init) {
            await module.init();
        }
        
        this.loadedModules.add(name);
        console.log(`Module ${name} loaded successfully`);
        
        return module;
    }
    
    // Загрузка всех модулей
    async loadAll() {
        const moduleNames = Array.from(this.modules.keys());
        
        for (const name of moduleNames) {
            try {
                await this.loadModule(name);
            } catch (error) {
                console.error(`Failed to load module ${name}:`, error);
            }
        }
    }
    
    // Получение модуля
    getModule(name) {
        return this.modules.get(name);
    }
    
    // Проверка загружен ли модуль
    isLoaded(name) {
        return this.loadedModules.has(name);
    }
    
    // Очистка всех модулей
    async destroy() {
        for (const [name, module] of this.modules) {
            if (module.destroy) {
                try {
                    await module.destroy();
                } catch (error) {
                    console.error(`Error destroying module ${name}:`, error);
                }
            }
        }
        
        this.modules.clear();
        this.loadedModules.clear();
        this.dependencies.clear();
    }
    
    // Обновление состояния всех модулей
    updateAll(data) {
        for (const [name, module] of this.modules) {
            if (module.update && this.loadedModules.has(name)) {
                try {
                    module.update(data);
                } catch (error) {
                    console.error(`Error updating module ${name}:`, error);
                }
            }
        }
    }
    
    // Получение состояния всех модулей
    getAllStates() {
        const states = {};
        
        for (const [name, module] of this.modules) {
            if (module.getState && this.loadedModules.has(name)) {
                try {
                    states[name] = module.getState();
                } catch (error) {
                    console.error(`Error getting state from module ${name}:`, error);
                }
            }
        }
        
        return states;
    }
}

// Создаем глобальный экземпляр
window.ModuleLoader = new ModuleLoader();

export default window.ModuleLoader;
