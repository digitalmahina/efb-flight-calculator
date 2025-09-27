# 🚀 Быстрый старт: CI/CD Pipeline

## ⚡ Основные команды

### Управление Pipeline
```bash
# Менеджер CI/CD pipeline
./scripts/ci-cd/pipeline-manager.sh

# Проверить статус workflows
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

# Принудительное развертывание
gh workflow run deployment.yml -f environment=production -f force_deploy=true
```

## 🏗️ Что настроено

### ✅ Workflows
- **CI/CD Pipeline** - полный цикл разработки
- **Testing** - комплексное тестирование
- **Deployment** - автоматическое развертывание
- **Monitoring** - мониторинг и уведомления

### ✅ Окружения
- **Staging** - https://staging.efb-calculator.com
- **Production** - https://efb-calculator.com

### ✅ Автоматизация
- **Linting** - проверка качества кода
- **Testing** - unit, integration, performance тесты
- **Security** - сканирование безопасности
- **Build** - автоматическая сборка
- **Deploy** - развертывание в окружения

## 🔄 Типичный workflow

### 1. Разработка
```bash
# Создать ветку функции
./scripts/git-workflow/new-feature.sh my-feature

# Разработать функцию
# ... код ...

# Коммит (автоматически запустит CI)
git add .
git commit -m "feat: новая функция"
git push
```

### 2. Тестирование
- ✅ **Автоматически** запускается при push
- ✅ **Linting** проверяет качество кода
- ✅ **Tests** проверяют функциональность
- ✅ **Security** сканирует безопасность

### 3. Развертывание
```bash
# Автоматически при push в develop (staging)
# Автоматически при push в main (production)

# Или вручную
gh workflow run deployment.yml -f environment=staging
```

### 4. Мониторинг
- ✅ **Health checks** каждые 6 часов
- ✅ **Performance monitoring** автоматически
- ✅ **Security monitoring** постоянно
- ✅ **Notifications** при проблемах

## 📊 Статус и мониторинг

### Проверка статуса
```bash
# Все workflows
gh run list

# Конкретный workflow
gh run list --workflow=ci-cd-pipeline.yml

# Логи последнего run
gh run view $(gh run list --limit=1 --json databaseId -q '.[0].databaseId')
```

### Метрики
```bash
# Время выполнения
gh run list --json name,createdAt,updatedAt

# Статус деплоев
gh run list --workflow=deployment.yml

# Результаты тестов
gh run list --workflow=testing.yml
```

## 🔧 Настройка

### GitHub CLI
```bash
# Установить GitHub CLI
brew install gh

# Авторизоваться
gh auth login

# Проверить статус
gh auth status
```

### Окружения
```bash
# Создать окружения
gh api repos/digitalmahina/efb-flight-calculator/environments/staging --method PUT
gh api repos/digitalmahina/efb-flight-calculator/environments/production --method PUT
```

### Secrets
```bash
# Добавить secrets (через GitHub UI)
# Settings → Secrets and variables → Actions
```

## 🚨 Troubleshooting

### Workflow не запускается
```bash
# Проверить статус
gh run list --status=queued

# Проверить триггеры
gh workflow list
```

### Тесты падают
```bash
# Просмотреть логи
gh run view <run-id> --log

# Перезапустить
gh run rerun <run-id>
```

### Деплой не работает
```bash
# Проверить статус деплоя
gh run list --workflow=deployment.yml

# Проверить окружения
gh api repos/digitalmahina/efb-flight-calculator/environments
```

## 📋 Чек-лист

### ✅ Перед разработкой
- [ ] GitHub CLI установлен
- [ ] Авторизован в GitHub
- [ ] Workflows настроены
- [ ] Окружения созданы

### ✅ Во время разработки
- [ ] Проверяю статус CI перед push
- [ ] Исправляю ошибки линтера
- [ ] Прохожу все тесты
- [ ] Следую за метриками

### ✅ После разработки
- [ ] Проверяю статус деплоя
- [ ] Мониторю производительность
- [ ] Проверяю уведомления
- [ ] Анализирую отчеты

## 📚 Документация

- [Полный CI/CD Pipeline](CI_CD_PIPELINE.md)
- [Git Workflow](GIT_WORKFLOW.md)
- [Branching Strategy](BRANCHING_STRATEGY.md)
- [Remote Repository Setup](REMOTE_REPOSITORY_SETUP.md)

## 🎯 Рекомендации

1. **Проверяйте статус** перед созданием PR
2. **Исправляйте ошибки** CI/CD быстро
3. **Используйте локальные тесты** перед push
4. **Следите за метриками** производительности
5. **Мониторьте pipeline** регулярно
6. **Обновляйте зависимости** своевременно

---
**🚀 CI/CD Pipeline готов к использованию!**
