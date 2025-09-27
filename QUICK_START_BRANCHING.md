# 🌿 Быстрый старт: Стратегия веток

## ⚡ Основные команды

### Создание веток
```bash
# Новая функция
./scripts/git-workflow/new-feature.sh название-функции

# Новый релиз
./scripts/git-workflow/new-release.sh v1.1.0

# Критическое исправление
./scripts/git-workflow/new-hotfix.sh "описание исправления"
```

### Завершение веток
```bash
# Завершить функцию
./scripts/git-workflow/finish-feature.sh

# Завершить релиз
./scripts/git-workflow/finish-release.sh

# Завершить hotfix
./scripts/git-workflow/finish-hotfix.sh
```

### Управление ветками
```bash
# Менеджер веток
./scripts/git-workflow/branch-manager.sh

# Проверить статус
git branch -a
git status
```

## 🏗️ Структура веток

### Основные ветки
- **`main`** - продакшн (защищена)
- **`develop`** - разработка (защищена)

### Вспомогательные ветки
- **`feature/*`** - новые функции
- **`release/*`** - подготовка релизов
- **`hotfix/*`** - критические исправления

## 🔄 Типичный workflow

### 1. Разработка функции
```bash
# Создать ветку функции
./scripts/git-workflow/new-feature.sh weather-integration

# Разработать функцию
# ... код ...

# Завершить функцию
./scripts/git-workflow/finish-feature.sh
```

### 2. Подготовка релиза
```bash
# Создать ветку релиза
./scripts/git-workflow/new-release.sh v1.1.0

# Тестирование и финальные исправления
# ... тестирование ...

# Завершить релиз
./scripts/git-workflow/finish-release.sh
```

### 3. Критическое исправление
```bash
# Создать ветку hotfix
./scripts/git-workflow/new-hotfix.sh "security-patch"

# Исправить проблему
# ... исправления ...

# Завершить hotfix
./scripts/git-workflow/finish-hotfix.sh
```

## 🛡️ Защита веток

### main
- ✅ Требует Pull Request
- ✅ Требует 2 одобрения
- ✅ Требует прохождения CI
- ✅ Запрещен force push
- ✅ Линейная история

### develop
- ✅ Требует Pull Request
- ✅ Требует 1 одобрение
- ✅ Требует прохождения тестов
- ✅ Запрещен force push

## 📋 Naming Conventions

### Ветки функций
```
feature/weather-integration
feature/ui-improvements
feature/calculations-enhancement
```

### Ветки релизов
```
release/v1.0.0
release/v1.1.0
release/v2.0.0-beta
```

### Ветки исправлений
```
hotfix/security-patch
hotfix/critical-bug-fix
hotfix/performance-issue
```

## 🔧 Полезные команды

### Просмотр веток
```bash
# Все ветки
git branch -a

# Только локальные
git branch

# Только удаленные
git branch -r

# График веток
git log --oneline --graph --all
```

### Синхронизация
```bash
# Получить обновления
git fetch origin

# Слить изменения
git pull origin main
git pull origin develop

# Отправить изменения
git push origin main
git push origin develop
```

### Очистка
```bash
# Удалить слитые ветки
git branch --merged | grep -v main | grep -v develop | xargs git branch -d

# Удалить удаленные ветки
git push origin --delete branch-name
```

## 🚨 Troubleshooting

### Конфликты при слиянии
```bash
# Разрешить конфликты
git status
# Редактировать файлы
git add .
git commit -m "resolve: исправлены конфликты"
```

### Откат изменений
```bash
# Отменить последний коммит
git reset --soft HEAD~1

# Отменить слияние
git merge --abort

# Откатить к предыдущему состоянию
git reset --hard HEAD~1
```

### Восстановление ветки
```bash
# Восстановить удаленную ветку
git checkout -b feature-name origin/feature-name

# Восстановить из reflog
git reflog
git checkout -b feature-name <commit-hash>
```

## 📊 Диаграмма workflow

```
main (production)
├── hotfix/security-fix → main → develop
└── release/v1.1.0 → main → develop

develop (integration)
├── feature/weather-integration → develop
├── feature/ui-improvements → develop
└── feature/calculations → develop
```

## 🎯 Рекомендации

1. **Всегда создавайте ветки** от актуальной develop
2. **Используйте описательные названия** веток
3. **Делайте частые коммиты** с понятными сообщениями
4. **Синхронизируйтесь** с develop регулярно
5. **Удаляйте ветки** после слияния
6. **Используйте скрипты** для автоматизации
7. **Следуйте правилам** защиты веток

## 📚 Документация

- [Полная стратегия веток](BRANCHING_STRATEGY.md)
- [Git Workflow](GIT_WORKFLOW.md)
- [Remote Repository Setup](REMOTE_REPOSITORY_SETUP.md)

---
**🌿 Стратегия веток готова к использованию!**
