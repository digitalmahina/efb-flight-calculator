#!/bin/bash

# Скрипт для завершения работы над функцией
# Использование: ./scripts/git-workflow/finish-feature.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏁 Завершение работы над функцией${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Получаем текущую ветку
CURRENT_BRANCH=$(git branch --show-current)

# Проверяем, что мы на feature ветке
if [[ ! "$CURRENT_BRANCH" =~ ^feature/ ]]; then
    echo -e "${RED}❌ Ошибка: Не на ветке функции${NC}"
    echo "Текущая ветка: $CURRENT_BRANCH"
    echo "Переключитесь на ветку функции (feature/*)"
    exit 1
fi

echo -e "${YELLOW}📋 Текущая ветка: $CURRENT_BRANCH${NC}"

# Проверяем статус
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Есть несохраненные изменения${NC}"
    echo "Сохранить изменения? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Введите сообщение коммита:"
        read -r commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="feat: завершение работы над функцией"
        fi
        git add .
        git commit -m "$commit_msg"
    else
        echo "Отменено"
        exit 1
    fi
fi

# Проверяем, что все изменения закоммичены
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Ошибка: Есть несохраненные изменения${NC}"
    exit 1
fi

# Отправляем ветку в удаленный репозиторий
echo -e "${YELLOW}📤 Отправка ветки в GitHub...${NC}"
if ! git push origin "$CURRENT_BRANCH"; then
    echo -e "${YELLOW}⚠️  Ветка уже существует в удаленном репозитории, обновляем...${NC}"
    git push origin "$CURRENT_BRANCH"
fi

# Показываем статистику
echo -e "${GREEN}📊 Статистика коммитов в ветке:${NC}"
git log --oneline main.."$CURRENT_BRANCH"

echo ""
echo -e "${GREEN}🎉 Функция готова к слиянию!${NC}"
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Перейдите на GitHub: https://github.com/digitalmahina/efb-flight-calculator"
echo "2. Создайте Pull Request для ветки: $CURRENT_BRANCH"
echo "3. Назначьте ревьюеров"
echo "4. После одобрения слейте изменения"
echo ""
echo -e "${YELLOW}💡 Команды для локальной работы:${NC}"
echo "  git checkout develop         - переключиться на develop"
echo "  git pull origin develop       - обновить develop"
echo "  git branch -d $CURRENT_BRANCH - удалить локальную ветку (после слияния)"
echo ""
echo -e "${BLUE}🔗 Ссылка для создания PR:${NC}"
echo "https://github.com/digitalmahina/efb-flight-calculator/compare/$CURRENT_BRANCH"
