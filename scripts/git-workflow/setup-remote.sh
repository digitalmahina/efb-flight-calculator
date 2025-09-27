#!/bin/bash

# Скрипт для настройки удаленного репозитория
# Использование: ./scripts/git-workflow/setup-remote.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Настройка удаленного репозитория${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Текущие настройки
echo -e "${YELLOW}📋 Текущие настройки remote:${NC}"
git remote -v

echo ""
echo -e "${YELLOW}📊 Статус синхронизации:${NC}"
git status -sb

echo ""
echo -e "${YELLOW}🌿 Ветки:${NC}"
echo "Локальные ветки:"
git branch -v
echo ""
echo "Удаленные ветки:"
git branch -r

echo ""
echo -e "${YELLOW}📈 Последние коммиты:${NC}"
git log --oneline -5

# Проверяем подключение к GitHub
echo ""
echo -e "${YELLOW}🔗 Проверка подключения к GitHub...${NC}"
if git ls-remote origin > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Подключение к GitHub работает${NC}"
else
    echo -e "${RED}❌ Ошибка подключения к GitHub${NC}"
    echo "Проверьте:"
    echo "1. Интернет соединение"
    echo "2. Авторизацию в GitHub"
    echo "3. URL репозитория"
    exit 1
fi

# Проверяем настройки пользователя
echo ""
echo -e "${YELLOW}👤 Настройки пользователя:${NC}"
echo "Имя: $(git config user.name)"
echo "Email: $(git config user.email)"

# Проверяем upstream для веток
echo ""
echo -e "${YELLOW}🔄 Настройки upstream:${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "Текущая ветка: $CURRENT_BRANCH"

if git rev-parse --abbrev-ref --symbolic-full-name @{u} > /dev/null 2>&1; then
    UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u})
    echo "Upstream: $UPSTREAM"
else
    echo -e "${YELLOW}⚠️  Upstream не настроен для текущей ветки${NC}"
fi

# Предложения по улучшению
echo ""
echo -e "${BLUE}💡 Рекомендации:${NC}"

# Проверяем, есть ли неотправленные коммиты
if ! git diff --quiet origin/$CURRENT_BRANCH 2>/dev/null; then
    echo -e "${YELLOW}📤 Есть неотправленные коммиты${NC}"
    echo "Выполните: git push origin $CURRENT_BRANCH"
fi

# Проверяем, есть ли обновления
if git fetch origin > /dev/null 2>&1; then
    BEHIND=$(git rev-list --count HEAD..origin/$CURRENT_BRANCH 2>/dev/null || echo "0")
    AHEAD=$(git rev-list --count origin/$CURRENT_BRANCH..HEAD 2>/dev/null || echo "0")
    
    if [ "$BEHIND" -gt 0 ]; then
        echo -e "${YELLOW}📥 Есть обновления в удаленном репозитории ($BEHIND коммитов)${NC}"
        echo "Выполните: git pull origin $CURRENT_BRANCH"
    fi
    
    if [ "$AHEAD" -gt 0 ]; then
        echo -e "${YELLOW}📤 Есть неотправленные коммиты ($AHEAD коммитов)${NC}"
        echo "Выполните: git push origin $CURRENT_BRANCH"
    fi
fi

# Проверяем настройки GitHub
echo ""
echo -e "${BLUE}🔧 Дополнительные настройки:${NC}"

# Проверяем GitHub CLI
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI установлен${NC}"
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅ Авторизован в GitHub CLI${NC}"
    else
        echo -e "${YELLOW}⚠️  Не авторизован в GitHub CLI${NC}"
        echo "Выполните: gh auth login"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI не установлен${NC}"
    echo "Установите: brew install gh"
fi

# Проверяем SSH ключи
if [ -f ~/.ssh/id_rsa.pub ] || [ -f ~/.ssh/id_ed25519.pub ]; then
    echo -e "${GREEN}✅ SSH ключи найдены${NC}"
else
    echo -e "${YELLOW}⚠️  SSH ключи не найдены${NC}"
    echo "Создайте: ssh-keygen -t ed25519 -C 'your.email@example.com'"
fi

echo ""
echo -e "${GREEN}🎉 Проверка завершена!${NC}"

# Полезные команды
echo ""
echo -e "${BLUE}📋 Полезные команды:${NC}"
echo "  git remote -v                    - показать remote репозитории"
echo "  git remote show origin           - детальная информация о origin"
echo "  git fetch origin                 - получить обновления"
echo "  git pull origin main             - слить изменения из main"
echo "  git push origin main             - отправить изменения в main"
echo "  git push -u origin new-branch   - отправить новую ветку"
echo "  git branch -r                   - показать удаленные ветки"
echo "  git status                       - проверить статус"
