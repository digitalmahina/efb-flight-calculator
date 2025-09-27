# 🌿 Стратегия веток (Branching Strategy)

## 📋 Обзор стратегии

Мы используем **Git Flow** с модификациями для EFB Calculator проекта. Это обеспечивает стабильную разработку, безопасные релизы и эффективное управление версиями.

## 🏗️ Структура веток

### Основные ветки (Main Branches)

#### 🎯 **main** (Production)
- **Назначение**: Стабильная версия в продакшене
- **Защита**: Строгая (требует PR, 2 одобрения, CI)
- **Слияние**: Только из `release/*` или `hotfix/*`
- **Теги**: Все релизы помечаются тегами (v1.0.0, v1.1.0)

#### 🔧 **develop** (Integration)
- **Назначение**: Интеграция новых функций
- **Защита**: Умеренная (требует PR, 1 одобрение)
- **Слияние**: Из `feature/*` веток
- **Статус**: Всегда готов к следующему релизу

### Вспомогательные ветки (Support Branches)

#### 🚀 **feature/*** (Feature Development)
- **Паттерн**: `feature/название-функции`
- **Источник**: `develop`
- **Назначение**: Разработка новых функций
- **Жизненный цикл**: Создание → Разработка → PR → Слияние → Удаление

#### 🏷️ **release/*** (Release Preparation)
- **Паттерн**: `release/v1.0.0`
- **Источник**: `develop`
- **Назначение**: Подготовка релиза
- **Жизненный цикл**: Создание → Тестирование → Слияние в main → Удаление

#### 🚨 **hotfix/*** (Critical Fixes)
- **Паттерн**: `hotfix/описание-исправления`
- **Источник**: `main`
- **Назначение**: Критические исправления
- **Жизненный цикл**: Создание → Исправление → Слияние в main и develop → Удаление

## 🔄 Workflow процессы

### 1. Разработка новой функции

```bash
# 1. Создать ветку функции
git checkout develop
git pull origin develop
git checkout -b feature/weather-integration

# 2. Разработать функцию
# ... разработка ...

# 3. Зафиксировать изменения
git add .
git commit -m "feat(weather): добавить интеграцию погодных данных"

# 4. Отправить ветку
git push -u origin feature/weather-integration

# 5. Создать Pull Request
# GitHub: develop ← feature/weather-integration

# 6. После слияния удалить ветку
git branch -d feature/weather-integration
git push origin --delete feature/weather-integration
```

### 2. Подготовка релиза

```bash
# 1. Создать ветку релиза
git checkout develop
git checkout -b release/v1.1.0

# 2. Обновить версию
# package.json, CHANGELOG.md, etc.

# 3. Тестирование и финальные исправления
git commit -m "chore(release): подготовка v1.1.0"

# 4. Слияние в main
git checkout main
git merge --no-ff release/v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0"

# 5. Слияние в develop
git checkout develop
git merge --no-ff release/v1.1.0

# 6. Удаление ветки релиза
git branch -d release/v1.1.0
git push origin --delete release/v1.1.0
```

### 3. Критическое исправление

```bash
# 1. Создать ветку hotfix
git checkout main
git checkout -b hotfix/security-fix

# 2. Исправить проблему
# ... исправления ...

# 3. Зафиксировать
git commit -m "fix(security): исправить уязвимость"

# 4. Слияние в main
git checkout main
git merge --no-ff hotfix/security-fix
git tag -a v1.1.1 -m "Hotfix v1.1.1"

# 5. Слияние в develop
git checkout develop
git merge --no-ff hotfix/security-fix

# 6. Удаление ветки hotfix
git branch -d hotfix/security-fix
git push origin --delete hotfix/security-fix
```

## 🛡️ Правила защиты веток

### main
- ✅ **Require pull request reviews** (2 одобрения)
- ✅ **Dismiss stale reviews** when new commits are pushed
- ✅ **Require status checks** to pass before merging
- ✅ **Require branches** to be up to date before merging
- ✅ **Require linear history**
- ✅ **Restrict pushes** that create files
- ❌ **Allow force pushes**
- ❌ **Allow deletions**

### develop
- ✅ **Require pull request reviews** (1 одобрение)
- ✅ **Dismiss stale reviews** when new commits are pushed
- ✅ **Require status checks** to pass before merging
- ✅ **Require branches** to be up to date before merging
- ❌ **Allow force pushes**
- ❌ **Allow deletions**

### feature/*
- ❌ **No protection** (временные ветки)
- ✅ **Auto-delete** after merge

## 📝 Naming Conventions

### Ветки функций
```
feature/weather-integration
feature/ui-improvements
feature/calculations-enhancement
feature/map-viewer
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

### Ветки экспериментов
```
experiment/new-algorithm
experiment/ui-redesign
experiment/performance-optimization
```

## 🔧 Автоматизация

### Скрипты для управления ветками

```bash
# Создать ветку функции
./scripts/git-workflow/new-feature.sh feature-name

# Создать ветку релиза
./scripts/git-workflow/new-release.sh v1.1.0

# Создать ветку hotfix
./scripts/git-workflow/new-hotfix.sh hotfix-description

# Завершить ветку
./scripts/git-workflow/finish-feature.sh
./scripts/git-workflow/finish-release.sh
./scripts/git-workflow/finish-hotfix.sh
```

### GitHub Actions для автоматизации

- **Автоматическое удаление** веток после слияния
- **Автоматическое создание** Pull Request
- **Автоматическое тестирование** при создании веток
- **Автоматическое развертывание** при слиянии в main

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

### Для разработчиков
1. **Всегда создавайте ветки** от актуальной develop
2. **Используйте описательные названия** веток
3. **Делайте частые коммиты** с понятными сообщениями
4. **Синхронизируйтесь** с develop регулярно
5. **Удаляйте ветки** после слияния

### Для менеджеров
1. **Планируйте релизы** заранее
2. **Используйте ветки релизов** для подготовки
3. **Тестируйте** перед слиянием в main
4. **Документируйте** изменения в CHANGELOG

### Для DevOps
1. **Настройте защиту** веток
2. **Автоматизируйте** тестирование
3. **Мониторьте** слияния
4. **Ведите логи** изменений

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

---
**🌿 Стратегия веток настроена и готова к использованию!**
