#!/bin/bash

# Скрипт для завершения релиза
# Использование: ./scripts/git-workflow/finish-release.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏁 Завершение релиза${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Получаем текущую ветку
CURRENT_BRANCH=$(git branch --show-current)

# Проверяем, что мы на release ветке
if [[ ! "$CURRENT_BRANCH" =~ ^release/ ]]; then
    echo -e "${RED}❌ Ошибка: Не на ветке релиза${NC}"
    echo "Текущая ветка: $CURRENT_BRANCH"
    echo "Переключитесь на ветку релиза (release/*)"
    exit 1
fi

echo -e "${YELLOW}📋 Текущая ветка: $CURRENT_BRANCH${NC}"

# Извлекаем версию из названия ветки
VERSION=$(echo $CURRENT_BRANCH | sed 's/release\///')

# Проверяем статус
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Есть несохраненные изменения${NC}"
    echo "Сохранить изменения? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Введите сообщение коммита:"
        read -r commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="chore(release): финальные изменения для $VERSION"
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

# Отправляем ветку релиза
echo -e "${YELLOW}📤 Отправка ветки релиза в GitHub...${NC}"
if ! git push origin "$CURRENT_BRANCH"; then
    echo -e "${YELLOW}⚠️  Ветка уже существует в удаленном репозитории, обновляем...${NC}"
    git push origin "$CURRENT_BRANCH"
fi

# Показываем статистику
echo -e "${GREEN}📊 Статистика коммитов в релизе:${NC}"
git log --oneline main.."$CURRENT_BRANCH"

echo ""
echo -e "${GREEN}🎉 Релиз готов к слиянию!${NC}"
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Перейдите на GitHub: https://github.com/digitalmahina/efb-flight-calculator"
echo "2. Создайте Pull Request: main ← $CURRENT_BRANCH"
echo "3. Назначьте ревьюеров"
echo "4. После одобрения слейте изменения"
echo "5. Создайте тег: git tag -a $VERSION -m 'Release $VERSION'"
echo "6. Отправьте тег: git push origin $VERSION"
echo "7. Слейте также в develop"
echo "8. Удалите ветку релиза"
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
    
    echo -e "${YELLOW}🔄 Слияние релиза в main...${NC}"
    if git merge --no-ff "$CURRENT_BRANCH" -m "Merge release $VERSION into main"; then
        echo -e "${GREEN}✅ Релиз успешно слит в main${NC}"
        
        # Создаем тег
        echo -e "${YELLOW}🏷️  Создание тега $VERSION...${NC}"
        git tag -a "$VERSION" -m "Release $VERSION"
        
        # Отправляем изменения
        echo -e "${YELLOW}📤 Отправка изменений в GitHub...${NC}"
        git push origin main
        git push origin "$VERSION"
        
        echo -e "${GREEN}✅ Тег $VERSION создан и отправлен${NC}"
        
        # Сливаем в develop
        echo -e "${YELLOW}🔄 Слияние в develop...${NC}"
        git checkout develop
        git pull origin develop
        git merge --no-ff "$CURRENT_BRANCH" -m "Merge release $VERSION into develop"
        git push origin develop
        
        echo -e "${GREEN}✅ Релиз слит в develop${NC}"
        
        # Удаляем ветку релиза
        echo -e "${YELLOW}🗑️  Удаление ветки релиза...${NC}"
        git branch -d "$CURRENT_BRANCH"
        git push origin --delete "$CURRENT_BRANCH"
        
        echo -e "${GREEN}✅ Ветка релиза удалена${NC}"
        
        echo ""
        echo -e "${GREEN}🎉 Релиз $VERSION успешно завершен!${NC}"
        echo -e "${BLUE}📋 Что было сделано:${NC}"
        echo "  ✅ Слит в main"
        echo "  ✅ Создан тег $VERSION"
        echo "  ✅ Слит в develop"
        echo "  ✅ Удалена ветка релиза"
        echo "  ✅ Отправлено в GitHub"
        
    else
        echo -e "${RED}❌ Ошибка при слиянии релиза${NC}"
        echo -e "${YELLOW}💡 Разрешите конфликты вручную и повторите${NC}"
        exit 1
    fi
else
    echo -e "${BLUE}ℹ️  Автоматическое слияние отменено${NC}"
    echo -e "${YELLOW}💡 Выполните слияние вручную:${NC}"
    echo "  git checkout main"
    echo "  git merge --no-ff $CURRENT_BRANCH"
    echo "  git tag -a $VERSION -m 'Release $VERSION'"
    echo "  git push origin main"
    echo "  git push origin $VERSION"
fi

echo ""
echo -e "${BLUE}💡 Полезные команды:${NC}"
echo "  git log --oneline -5         - посмотреть последние коммиты"
echo "  git tag -l                   - посмотреть все теги"
echo "  git checkout develop         - переключиться на develop"
echo "  git status                   - проверить статус"
