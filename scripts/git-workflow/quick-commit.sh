#!/bin/bash

# Скрипт для быстрого коммита с проверками
# Использование: ./scripts/git-workflow/quick-commit.sh "сообщение коммита"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Проверяем аргументы
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Ошибка: Укажите сообщение коммита${NC}"
    echo "Использование: $0 \"сообщение коммита\""
    echo "Пример: $0 \"feat(calculations): добавить расчет топлива\""
    exit 1
fi

COMMIT_MSG="$1"

echo -e "${BLUE}⚡ Быстрый коммит: $COMMIT_MSG${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Проверяем статус
echo -e "${YELLOW}📋 Проверка статуса...${NC}"
git status --porcelain

# Показываем изменения
echo -e "${YELLOW}📝 Изменения для коммита:${NC}"
git diff --stat

# Спрашиваем подтверждение
echo ""
echo -e "${YELLOW}❓ Продолжить коммит? (y/n)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Отменено"
    exit 0
fi

# Добавляем все изменения
echo -e "${YELLOW}📦 Добавление файлов...${NC}"
git add .

# Проверяем, что есть изменения для коммита
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  Нет изменений для коммита${NC}"
    exit 0
fi

# Делаем коммит
echo -e "${YELLOW}💾 Создание коммита...${NC}"
if git commit -m "$COMMIT_MSG"; then
    echo -e "${GREEN}✅ Коммит создан успешно!${NC}"
    
    # Показываем информацию о коммите
    echo -e "${BLUE}📊 Информация о коммите:${NC}"
    git log -1 --pretty=format:"%h - %an, %ar : %s"
    
    # Спрашиваем, отправить ли в удаленный репозиторий
    echo ""
    echo -e "${YELLOW}❓ Отправить в GitHub? (y/n)${NC}"
    read -r push_response
    if [[ "$push_response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}📤 Отправка в GitHub...${NC}"
        if git push; then
            echo -e "${GREEN}✅ Изменения отправлены в GitHub!${NC}"
        else
            echo -e "${RED}❌ Ошибка при отправке в GitHub${NC}"
            echo "Попробуйте: git push origin $(git branch --show-current)"
        fi
    fi
else
    echo -e "${RED}❌ Ошибка при создании коммита${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Готово!${NC}"
echo -e "${BLUE}💡 Полезные команды:${NC}"
echo "  git log --oneline -5         - посмотреть последние коммиты"
echo "  git status                   - проверить статус"
echo "  git diff HEAD~1             - посмотреть изменения последнего коммита"
