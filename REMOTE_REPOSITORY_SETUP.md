# 🌐 Настройка Remote Repository

## 📋 Текущая конфигурация

### Основной remote (origin)
```bash
origin  https://github.com/digitalmahina/efb-flight-calculator.git (fetch)
origin  https://github.com/digitalmahina/efb-flight-calculator.git (push)
```

### Статус синхронизации
- ✅ **main**: синхронизирован с origin/main
- ✅ **develop**: синхронизирован с origin/develop
- ✅ **feature ветки**: все синхронизированы

## 🔧 Скрипты для управления remote

### 1. Проверка настроек
```bash
./scripts/git-workflow/setup-remote.sh
```
**Что делает:**
- Показывает текущие remote репозитории
- Проверяет подключение к GitHub
- Анализирует статус синхронизации
- Проверяет настройки пользователя
- Предлагает рекомендации

### 2. Добавление дополнительных remote
```bash
./scripts/git-workflow/add-remote.sh
```
**Опции:**
- **Upstream** - оригинальный проект (для форков)
- **Backup** - резервный репозиторий
- **Production** - продакшн репозиторий
- **Custom** - пользовательский remote

### 3. Синхронизация с upstream
```bash
./scripts/git-workflow/sync-upstream.sh
```
**Что делает:**
- Получает обновления из upstream
- Показывает новые коммиты
- Предлагает слияние изменений
- Отправляет обновления в origin

## 🚀 Быстрые команды

### Проверка статуса
```bash
# Показать все remote
git remote -v

# Детальная информация о origin
git remote show origin

# Статус синхронизации
git status -sb

# Проверить подключение
git ls-remote origin
```

### Синхронизация
```bash
# Получить обновления
git fetch origin

# Слить изменения
git pull origin main

# Отправить изменения
git push origin main

# Отправить новую ветку
git push -u origin new-branch
```

### Работа с ветками
```bash
# Показать все ветки
git branch -a

# Показать удаленные ветки
git branch -r

# Создать локальную ветку из удаленной
git checkout -b local-branch origin/remote-branch
```

## 🔧 Настройка дополнительных remote

### Upstream репозиторий (для форков)
```bash
# Добавить upstream
git remote add upstream https://github.com/original/repo.git

# Настроить fetch
git config remote.upstream.fetch '+refs/heads/*:refs/remotes/upstream/*'

# Получить обновления
git fetch upstream

# Слить изменения
git merge upstream/main
```

### Backup репозиторий
```bash
# Добавить backup
git remote add backup https://github.com/backup/repo.git

# Отправить в backup
git push backup main
```

### Production репозиторий
```bash
# Добавить production
git remote add production https://github.com/production/repo.git

# Отправить в production
git push production main
```

## 🛡️ Безопасность и аутентификация

### SSH ключи
```bash
# Создать SSH ключ
ssh-keygen -t ed25519 -C "your.email@example.com"

# Добавить в ssh-agent
ssh-add ~/.ssh/id_ed25519

# Скопировать публичный ключ
cat ~/.ssh/id_ed25519.pub
```

### GitHub CLI
```bash
# Установить GitHub CLI
brew install gh

# Авторизоваться
gh auth login

# Проверить статус
gh auth status
```

### Personal Access Token
```bash
# Создать токен на GitHub
# Settings → Developer settings → Personal access tokens

# Использовать токен для аутентификации
git remote set-url origin https://username:token@github.com/user/repo.git
```

## 📊 Мониторинг и диагностика

### Проверка подключений
```bash
# Проверить все remote
for remote in $(git remote); do
    echo "Проверка $remote..."
    if git ls-remote "$remote" > /dev/null 2>&1; then
        echo "✅ $remote - подключение работает"
    else
        echo "❌ $remote - ошибка подключения"
    fi
done
```

### Анализ синхронизации
```bash
# Коммиты в origin, но не в локальной
git log --oneline HEAD..origin/main

# Коммиты в локальной, но не в origin
git log --oneline origin/main..HEAD

# Статистика веток
git for-each-ref --format='%(refname:short) %(committerdate)' refs/remotes/origin
```

### Очистка remote веток
```bash
# Удалить локальные ссылки на удаленные ветки
git remote prune origin

# Удалить удаленные ветки
git push origin --delete branch-name
```

## 🚨 Troubleshooting

### Ошибки подключения
```bash
# Проверить URL
git remote get-url origin

# Изменить URL
git remote set-url origin https://github.com/user/repo.git

# Проверить SSH
ssh -T git@github.com
```

### Конфликты при слиянии
```bash
# Отменить слияние
git merge --abort

# Разрешить конфликты
git status
# Редактировать файлы
git add .
git commit -m "resolve: исправлены конфликты"
```

### Проблемы с аутентификацией
```bash
# Очистить кеш учетных данных
git config --global --unset credential.helper

# Настроить новый helper
git config --global credential.helper osxkeychain
```

## 📋 Чек-лист настройки

### ✅ Базовая настройка
- [ ] Origin remote настроен
- [ ] Подключение к GitHub работает
- [ ] SSH ключи или токены настроены
- [ ] GitHub CLI установлен и авторизован

### ✅ Дополнительные remote
- [ ] Upstream настроен (если нужен)
- [ ] Backup remote добавлен
- [ ] Production remote настроен

### ✅ Автоматизация
- [ ] Скрипты для управления remote
- [ ] Автоматическая синхронизация
- [ ] Мониторинг подключений

### ✅ Безопасность
- [ ] SSH ключи защищены
- [ ] Токены имеют ограниченные права
- [ ] Регулярная ротация ключей

## 🎯 Рекомендации

1. **Используйте SSH** для аутентификации
2. **Настройте upstream** для форков
3. **Регулярно синхронизируйтесь** с origin
4. **Используйте скрипты** для автоматизации
5. **Мониторьте подключения** регулярно
6. **Делайте backup** важных веток
7. **Используйте GitHub CLI** для удобства

---
**🌐 Remote repository настроен и готов к работе!**
