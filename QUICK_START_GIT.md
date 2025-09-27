# 🚀 Быстрый старт с Git Workflow

## ⚡ Основные команды

### Создание новой функции
```bash
./scripts/git-workflow/new-feature.sh название-функции
```

### Быстрый коммит
```bash
./scripts/git-workflow/quick-commit.sh "feat(module): описание изменений"
```

### Завершение функции
```bash
./scripts/git-workflow/finish-feature.sh
```

### Настройка защиты веток
```bash
./scripts/git-workflow/setup-branch-protection.sh
```

## 🔧 Что настроено

### ✅ Git Hooks
- **Pre-commit**: проверка синтаксиса, размера файлов, секретов
- **Commit-msg**: проверка формата сообщений коммитов

### ✅ Скрипты автоматизации
- `new-feature.sh` - создание ветки функции
- `finish-feature.sh` - завершение функции
- `quick-commit.sh` - быстрый коммит
- `setup-branch-protection.sh` - защита веток

### ✅ CI/CD Pipeline
- GitHub Actions для тестирования
- Автоматический деплой на GitHub Pages
- Создание релизов

### ✅ Защита веток
- **main**: требует 2 одобрения, CI проверки
- **develop**: требует 1 одобрение, тесты

## 📋 Типичный workflow

1. **Создать функцию**: `./scripts/git-workflow/new-feature.sh my-feature`
2. **Разработать**: вносите изменения в код
3. **Коммитить**: `./scripts/git-workflow/quick-commit.sh "feat: описание"`
4. **Завершить**: `./scripts/git-workflow/finish-feature.sh`
5. **Создать PR**: на GitHub
6. **Слить**: после одобрения

## 🎯 Следующие шаги

1. **Настройте защиту веток**:
   ```bash
   ./scripts/git-workflow/setup-branch-protection.sh
   ```

2. **Создайте первую функцию**:
   ```bash
   ./scripts/git-workflow/new-feature.sh test-feature
   ```

3. **Протестируйте workflow**:
   ```bash
   echo "console.log('test');" > test.js
   ./scripts/git-workflow/quick-commit.sh "test: добавить тестовый файл"
   ```

## 📚 Документация

- [Полный Git Workflow](GIT_WORKFLOW.md)
- [Защита веток](.github/BRANCH_PROTECTION.md)
- [CI/CD Pipeline](.github/workflows/)

## 🆘 Помощь

```bash
# Проверить статус
git status

# Посмотреть ветки
git branch -a

# Посмотреть историю
git log --oneline -5

# Синхронизироваться
git pull origin main
```

---
**🎉 Git workflow готов к использованию!**
