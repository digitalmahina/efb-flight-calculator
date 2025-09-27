#!/bin/bash

# Скрипт для создания новой ветки функции
# Использование: ./scripts/git-workflow/new-feature.sh feature-name

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Проверяем аргументы
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Ошибка: Укажите название функции${NC}"
    echo "Использование: $0 feature-name"
    echo "Пример: $0 weather-integration"
    exit 1
fi

FEATURE_NAME="$1"
FEATURE_BRANCH="feature/$FEATURE_NAME"

echo -e "${BLUE}🚀 Создание новой ветки функции: $FEATURE_BRANCH${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Проверяем, что рабочая директория чистая
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Ошибка: Есть несохраненные изменения${NC}"
    echo "Сохраните или отмените изменения перед созданием новой ветки"
    exit 1
fi

# Переключаемся на develop
echo -e "${YELLOW}📋 Переключение на ветку develop...${NC}"
if ! git checkout develop; then
    echo -e "${YELLOW}⚠️  Ветка develop не существует, создаем от main...${NC}"
    git checkout main
    git checkout -b develop
    git push -u origin develop
fi

# Обновляем develop
echo -e "${YELLOW}🔄 Обновление ветки develop...${NC}"
git pull origin develop

# Создаем новую ветку
echo -e "${YELLOW}🌿 Создание ветки $FEATURE_BRANCH...${NC}"
if git show-ref --verify --quiet refs/heads/$FEATURE_BRANCH; then
    echo -e "${RED}❌ Ветка $FEATURE_BRANCH уже существует${NC}"
    echo "Переключиться на существующую ветку? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git checkout $FEATURE_BRANCH
        echo -e "${GREEN}✅ Переключились на ветку $FEATURE_BRANCH${NC}"
    else
        echo "Отменено"
        exit 1
    fi
else
    git checkout -b $FEATURE_BRANCH
    echo -e "${GREEN}✅ Создана ветка $FEATURE_BRANCH${NC}"
fi

# Создаем файл с описанием функции
FEATURE_DESC_FILE="FEATURE_$FEATURE_NAME.md"
cat > "$FEATURE_DESC_FILE" << EOF
# Feature: $FEATURE_NAME

## Описание
Краткое описание новой функции.

## Задачи
- [ ] Задача 1
- [ ] Задача 2
- [ ] Задача 3

## Тестирование
- [ ] Unit тесты
- [ ] Integration тесты
- [ ] Manual тестирование

## Документация
- [ ] Обновить README
- [ ] Добавить примеры использования
- [ ] Обновить API документацию

## Связанные issues
- #issue1
- #issue2
EOF

echo -e "${GREEN}📝 Создан файл описания: $FEATURE_DESC_FILE${NC}"

# Добавляем файл в Git
git add "$FEATURE_DESC_FILE"
git commit -m "docs: добавить описание функции $FEATURE_NAME"

echo ""
echo -e "${GREEN}🎉 Готово! Ветка $FEATURE_BRANCH создана${NC}"
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Внесите изменения в код"
echo "2. Используйте: git add . && git commit -m 'feat($FEATURE_NAME): описание'"
echo "3. Отправьте ветку: git push -u origin $FEATURE_BRANCH"
echo "4. Создайте Pull Request на GitHub"
echo ""
echo -e "${YELLOW}💡 Полезные команды:${NC}"
echo "  git status                    - проверить статус"
echo "  git log --oneline -5         - посмотреть последние коммиты"
echo "  git diff                     - посмотреть изменения"
echo "  git checkout develop         - вернуться на develop"
