# 🚀 CI/CD Pipeline Documentation

## 📋 Обзор

Полноценный CI/CD pipeline для EFB Calculator проекта с автоматизацией сборки, тестирования, развертывания и мониторинга.

## 🏗️ Архитектура Pipeline

### Основные компоненты
- **🔍 Linting & Code Quality** - проверка качества кода
- **🧪 Testing** - комплексное тестирование
- **🏗️ Build** - сборка приложения
- **🔒 Security** - проверка безопасности
- **🚀 Deployment** - автоматическое развертывание
- **📊 Monitoring** - мониторинг и уведомления

## 📁 Структура Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci-cd-pipeline.yml`)
**Триггеры:**
- Push в `main` и `develop`
- Pull Request в `main` и `develop`
- Manual trigger

**Этапы:**
1. **Linting** - проверка синтаксиса, форматирования, безопасности
2. **Testing** - unit, integration, performance тесты
3. **Build** - сборка и упаковка артефактов
4. **Security** - сканирование безопасности
5. **Deployment** - развертывание в staging/production
6. **Monitoring** - пост-деплой мониторинг

### 2. Testing (`.github/workflows/testing.yml`)
**Триггеры:**
- Push в `main` и `develop`
- Pull Request в `main` и `develop`
- Еженедельно (понедельник, 2:00 AM)

**Этапы:**
1. **Unit Tests** - тестирование отдельных модулей
2. **Integration Tests** - тестирование интеграции
3. **Performance Tests** - тестирование производительности
4. **Security Tests** - тестирование безопасности
5. **Test Summary** - сводка результатов

### 3. Deployment (`.github/workflows/deployment.yml`)
**Триггеры:**
- Push в `main`
- Теги версий (`v*`)
- Manual trigger

**Этапы:**
1. **Pre-deployment** - проверки перед развертыванием
2. **Build** - сборка для продакшена
3. **Deploy Staging** - развертывание в staging
4. **Deploy Production** - развертывание в production
5. **Post-deployment** - мониторинг после развертывания

### 4. Monitoring (`.github/workflows/monitoring.yml`)
**Триггеры:**
- Каждые 6 часов
- После завершения других workflows
- Manual trigger

**Этапы:**
1. **Health Check** - проверка здоровья системы
2. **Performance Monitoring** - мониторинг производительности
3. **Security Monitoring** - мониторинг безопасности
4. **Notifications** - уведомления о статусе

## 🔧 Настройка окружений

### Staging Environment
- **URL**: https://staging.efb-calculator.com
- **Триггер**: Push в `develop`
- **Защита**: Базовая

### Production Environment
- **URL**: https://efb-calculator.com
- **Триггер**: Push в `main` или теги
- **Защита**: Строгая (требует одобрения)

## 📊 Метрики и мониторинг

### Автоматические проверки
- **Code Quality** - ESLint, Prettier, сложность кода
- **Security** - npm audit, поиск секретов
- **Performance** - размер файлов, время загрузки
- **Health** - статус системы, доступность

### Отчеты
- **Test Reports** - результаты тестирования
- **Performance Reports** - метрики производительности
- **Security Reports** - отчеты безопасности
- **Health Reports** - отчеты о здоровье системы

## 🚀 Быстрые команды

### Управление Pipeline
```bash
# Менеджер CI/CD pipeline
./scripts/ci-cd/pipeline-manager.sh

# Проверить статус
gh run list

# Просмотреть логи
gh run view <run-id>

# Запустить workflow
gh workflow run <workflow-name>
```

### Ручное развертывание
```bash
# Развернуть в staging
gh workflow run deployment.yml -f environment=staging

# Развернуть в production
gh workflow run deployment.yml -f environment=production
```

### Мониторинг
```bash
# Проверить статус деплоя
gh run list --workflow=deployment.yml

# Просмотреть метрики
gh run list --workflow=monitoring.yml
```

## 🔒 Безопасность

### Защита веток
- **main**: требует PR, 2 одобрения, CI проверки
- **develop**: требует PR, 1 одобрение, тесты

### Сканирование безопасности
- **Secrets Detection** - поиск секретов в коде
- **Dependency Audit** - проверка уязвимостей
- **File Permissions** - проверка прав доступа
- **Code Security** - анализ безопасности кода

## 📈 Производительность

### Оптимизация сборки
- **Caching** - кеширование зависимостей
- **Parallel Jobs** - параллельное выполнение
- **Artifact Management** - управление артефактами

### Мониторинг производительности
- **Build Time** - время сборки
- **Test Duration** - время тестирования
- **Deployment Speed** - скорость развертывания
- **Resource Usage** - использование ресурсов

## 🚨 Troubleshooting

### Частые проблемы
```bash
# Workflow не запускается
gh run list --status=queued

# Тесты падают
gh run view <run-id> --log

# Деплой не работает
gh run list --workflow=deployment.yml
```

### Отладка
```bash
# Просмотреть логи
gh run view <run-id> --log

# Проверить статус
gh run list --limit=10

# Перезапустить workflow
gh run rerun <run-id>
```

## 📋 Чек-лист настройки

### ✅ Базовая настройка
- [ ] GitHub Actions включены
- [ ] Workflows настроены
- [ ] Окружения созданы
- [ ] Secrets настроены

### ✅ Безопасность
- [ ] Защита веток настроена
- [ ] Secrets сканирование работает
- [ ] Dependency audit настроен
- [ ] File permissions проверены

### ✅ Развертывание
- [ ] Staging environment работает
- [ ] Production environment настроен
- [ ] GitHub Pages подключен
- [ ] Health checks работают

### ✅ Мониторинг
- [ ] Уведомления настроены
- [ ] Метрики собираются
- [ ] Отчеты генерируются
- [ ] Алерты работают

## 🎯 Рекомендации

### Для разработчиков
1. **Проверяйте статус** перед созданием PR
2. **Исправляйте ошибки** CI/CD быстро
3. **Используйте локальные тесты** перед push
4. **Следите за метриками** производительности

### Для DevOps
1. **Мониторьте pipeline** регулярно
2. **Обновляйте зависимости** своевременно
3. **Настройте алерты** для критических ошибок
4. **Ведите логи** изменений

### Для менеджеров
1. **Отслеживайте метрики** качества
2. **Планируйте релизы** заранее
3. **Мониторьте производительность** команды
4. **Анализируйте отчеты** безопасности

## 📚 Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Environment Protection Rules](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 🆘 Поддержка

### Полезные команды
```bash
# Статус всех workflows
gh run list --limit=20

# Логи конкретного run
gh run view <run-id> --log

# Список workflows
gh workflow list

# Запуск workflow
gh workflow run <workflow-name>
```

### Контакты
- **Issues**: [GitHub Issues](https://github.com/digitalmahina/efb-flight-calculator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/digitalmahina/efb-flight-calculator/discussions)
- **Documentation**: [Project Wiki](https://github.com/digitalmahina/efb-flight-calculator/wiki)

---
**🚀 CI/CD Pipeline готов к использованию!**
