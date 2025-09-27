#!/bin/bash

# Скрипт для завершения hotfix
# Использование: ./scripts/git-workflow/finish-hotfix.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚨 Завершение hotfix${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Получаем текущую ветку
CURRENT_BRANCH=$(git branch --show-current)

# Проверяем, что мы на hotfix ветке
if [[ ! "$CURRENT_BRANCH" =~ ^hotfix/ ]]; then
    echo -e "${RED}❌ Ошибка: Не на ветке hotfix${NC}"
    echo "Текущая ветка: $CURRENT_BRANCH"
    echo "Переключитесь на ветку hotfix (hotfix/*)"
    exit 1
fi

echo -e "${YELLOW}📋 Текущая ветка: $CURRENT_BRANCH${NC}"

# Извлекаем описание из названия ветки
HOTFIX_DESC=$(echo $CURRENT_BRANCH | sed 's/hotfix\///')

# Проверяем статус
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Есть несохраненные изменения${NC}"
    echo "Сохранить изменения? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Введите сообщение коммита:"
        read -r commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="fix(hotfix): завершение критического исправления $HOTFIX_DESC"
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

# Отправляем ветку hotfix
echo -e "${YELLOW}📤 Отправка ветки hotfix в GitHub...${NC}"
if ! git push origin "$CURRENT_BRANCH"; then
    echo -e "${YELLOW}⚠️  Ветка уже существует в удаленном репозитории, обновляем...${NC}"
    git push origin "$CURRENT_BRANCH"
fi

# Показываем статистику
echo -e "${GREEN}📊 Статистика коммитов в hotfix:${NC}"
git log --oneline main.."$CURRENT_BRANCH"

echo ""
echo -e "${GREEN}🎉 Hotfix готов к слиянию!${NC}"
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Перейдите на GitHub: https://github.com/digitalmahina/efb-flight-calculator"
echo "2. Создайте Pull Request: main ← $CURRENT_BRANCH"
echo "3. Назначьте ревьюеров (критический приоритет)"
echo "4. После одобрения слейте изменения"
echo "5. Создайте тег: git tag -a v1.1.1 -m 'Hotfix v1.1.1'"
echo "6. Отправьте тег: git push origin v1.1.1"
echo "7. Слейте также в develop"
echo "8. Удалите ветку hotfix"
echo ""

# Спрашиваем, нужно ли автоматически слить в main
echo -e "${YELLOW}❓ Автоматически слить в main? (y/n)${NC}"
read -r auto_merge
if [[ "$auto_merge" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🔄 Переключение на main...${NC}"
    if ! git checkout main; then
        echo -e "${RED}❌ Ошибка при переключении на main${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 Обновление main...${NC}"
    git pull origin main
    
    echo -e "${YELLOW}🔄 Слияние hotfix в main...${NC}"
    if git merge --no-ff "$CURRENT_BRANCH" -m "Merge hotfix $HOTFIX_DESC into main"; then
        echo -e "${GREEN}✅ Hotfix успешно слит в main${NC}"
        
        # Получаем текущую версию и увеличиваем patch
        if [ -f "package.json" ]; then
            if command -v jq &> /dev/null; then
                CURRENT_VERSION=$(jq -r '.version' package.json)
                NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{$3++; print $1"."$2"."$3}')
                echo -e "${YELLOW}🏷️  Создание тега $NEW_VERSION...${NC}"
                git tag -a "$NEW_VERSION" -m "Hotfix $NEW_VERSION: $HOTFIX_DESC"
            else
                echo -e "${YELLOW}🏷️  Создание тега hotfix...${NC}"
                git tag -a "hotfix-$(date +%Y%m%d)" -m "Hotfix: $HOTFIX_DESC"
            fi
        else
            echo -e "${YELLOW}🏷️  Создание тега hotfix...${NC}"
            git tag -a "hotfix-$(date +%Y%m%d)" -m "Hotfix: $HOTFIX_DESC"
        fi
        
        # Отправляем изменения
        echo -e "${YELLOW}📤 Отправка изменений в GitHub...${NC}"
        git push origin main
        git push origin --tags
        
        echo -e "${GREEN}✅ Тег создан и отправлен${NC}"
        
        # Сливаем в develop
        echo -e "${YELLOW}🔄 Слияние в develop...${NC}"
        git checkout develop
        git pull origin develop
        git merge --no-ff "$CURRENT_BRANCH" -m "Merge hotfix $HOTFIX_DESC into develop"
        git push origin develop
        
        echo -e "${GREEN}✅ Hotfix слит в develop${NC}"
        
        # Удаляем ветку hotfix
        echo -e "${YELLOW}🗑️  Удаление ветки hotfix...${NC}"
        git branch -d "$CURRENT_BRANCH"
        git push origin --delete "$CURRENT_BRANCH"
        
        echo -e "${GREEN}✅ Ветка hotfix удалена${NC}"
        
        echo ""
        echo -e "${GREEN}🎉 Hotfix $HOTFIX_DESC успешно завершен!${NC}"
        echo -e "${BLUE}📋 Что было сделано:${NC}"
        echo "  ✅ Слит в main"
        echo "  ✅ Создан тег"
        echo "  ✅ Слит в develop"
        echo "  ✅ Удалена ветка hotfix"
        echo "  ✅ Отправлено в GitHub"
        
    else
        echo -e "${RED}❌ Ошибка при слиянии hotfix${NC}"
        echo -e "${YELLOW}💡 Разрешите конфликты вручную и повторите${NC}"
        exit 1
    fi
else
    echo -e "${BLUE}ℹ️  Автоматическое слияние отменено${NC}"
    echo -e "${YELLOW}💡 Выполните слияние вручную:${NC}"
    echo "  git checkout main"
    echo "  git merge --no-ff $CURRENT_BRANCH"
    echo "  git tag -a hotfix-$(date +%Y%m%d) -m 'Hotfix: $HOTFIX_DESC'"
    echo "  git push origin main"
    echo "  git push origin --tags"
fi

echo ""
echo -e "${RED}⚠️  ВАЖНО: Уведомите команду о критическом исправлении!${NC}"
echo -e "${BLUE}💡 Полезные команды:${NC}"
echo "  git log --oneline -5         - посмотреть последние коммиты"
echo "  git tag -l                   - посмотреть все теги"
echo "  git checkout develop         - переключиться на develop"
echo "  git status                   - проверить статус"
