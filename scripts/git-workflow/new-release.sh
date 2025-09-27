#!/bin/bash

# Скрипт для создания ветки релиза
# Использование: ./scripts/git-workflow/new-release.sh v1.1.0

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Проверяем аргументы
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Ошибка: Укажите версию релиза${NC}"
    echo "Использование: $0 v1.1.0"
    echo "Пример: $0 v1.1.0"
    exit 1
fi

VERSION="$1"
RELEASE_BRANCH="release/$VERSION"

echo -e "${BLUE}🚀 Создание ветки релиза: $RELEASE_BRANCH${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Проверяем, что рабочая директория чистая
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Ошибка: Есть несохраненные изменения${NC}"
    echo "Сохраните или отмените изменения перед созданием релиза"
    exit 1
fi

# Переключаемся на develop
echo -e "${YELLOW}📋 Переключение на ветку develop...${NC}"
if ! git checkout develop; then
    echo -e "${RED}❌ Ошибка: Не удалось переключиться на develop${NC}"
    exit 1
fi

# Обновляем develop
echo -e "${YELLOW}🔄 Обновление ветки develop...${NC}"
if ! git pull origin develop; then
    echo -e "${YELLOW}⚠️  Не удалось получить обновления из origin/develop${NC}"
fi

# Проверяем, что ветка релиза не существует
if git show-ref --verify --quiet refs/heads/$RELEASE_BRANCH; then
    echo -e "${RED}❌ Ветка $RELEASE_BRANCH уже существует${NC}"
    echo "Переключиться на существующую ветку? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git checkout $RELEASE_BRANCH
        echo -e "${GREEN}✅ Переключились на ветку $RELEASE_BRANCH${NC}"
    else
        echo "Отменено"
        exit 1
    fi
else
    # Создаем ветку релиза
    echo -e "${YELLOW}🌿 Создание ветки $RELEASE_BRANCH...${NC}"
    git checkout -b $RELEASE_BRANCH
    echo -e "${GREEN}✅ Создана ветка $RELEASE_BRANCH${NC}"
fi

# Создаем файл с описанием релиза
RELEASE_DESC_FILE="RELEASE_$VERSION.md"
cat > "$RELEASE_DESC_FILE" << EOF
# Release $VERSION

## 📋 Описание релиза
Краткое описание изменений в релизе $VERSION.

## 🚀 Новые функции
- [ ] Функция 1
- [ ] Функция 2
- [ ] Функция 3

## 🐛 Исправления
- [ ] Исправление 1
- [ ] Исправление 2
- [ ] Исправление 3

## 🔧 Улучшения
- [ ] Улучшение 1
- [ ] Улучшение 2
- [ ] Улучшение 3

## 🧪 Тестирование
- [ ] Unit тесты пройдены
- [ ] Integration тесты пройдены
- [ ] Manual тестирование завершено
- [ ] Performance тестирование
- [ ] Security тестирование

## 📚 Документация
- [ ] Обновлен README
- [ ] Обновлен CHANGELOG
- [ ] Обновлена API документация
- [ ] Созданы примеры использования

## 🚀 Развертывание
- [ ] Подготовка к продакшену
- [ ] Настройка мониторинга
- [ ] План отката
- [ ] Уведомления пользователей

## 📊 Метрики
- [ ] Измерение производительности
- [ ] Анализ использования
- [ ] Отслеживание ошибок

## 🔗 Связанные issues
- #issue1
- #issue2
- #issue3
EOF

echo -e "${GREEN}📝 Создан файл описания релиза: $RELEASE_DESC_FILE${NC}"

# Обновляем версию в package.json (если существует)
if [ -f "package.json" ]; then
    echo -e "${YELLOW}📦 Обновление версии в package.json...${NC}"
    # Используем sed для обновления версии
    if command -v jq &> /dev/null; then
        # Если jq доступен, используем его
        jq ".version = \"$VERSION\"" package.json > package.json.tmp && mv package.json.tmp package.json
    else
        # Простая замена через sed
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
        rm -f package.json.bak
    fi
    echo -e "${GREEN}✅ Версия обновлена в package.json${NC}"
fi

# Создаем CHANGELOG запись
if [ -f "CHANGELOG.md" ]; then
    echo -e "${YELLOW}📝 Обновление CHANGELOG...${NC}"
    # Добавляем запись в начало файла
    cat > CHANGELOG_NEW.md << EOF
## [$VERSION] - $(date +%Y-%m-%d)

### Added
- Новые функции релиза

### Changed
- Изменения в существующих функциях

### Fixed
- Исправления ошибок

### Security
- Улучшения безопасности

EOF
    cat CHANGELOG.md >> CHANGELOG_NEW.md
    mv CHANGELOG_NEW.md CHANGELOG.md
    echo -e "${GREEN}✅ CHANGELOG обновлен${NC}"
fi

# Добавляем файлы в Git
git add .
git commit -m "chore(release): подготовка релиза $VERSION"

# Отправляем ветку
echo -e "${YELLOW}📤 Отправка ветки релиза...${NC}"
if ! git push -u origin $RELEASE_BRANCH; then
    echo -e "${YELLOW}⚠️  Ветка уже существует в удаленном репозитории, обновляем...${NC}"
    git push origin $RELEASE_BRANCH
fi

echo ""
echo -e "${GREEN}🎉 Ветка релиза $RELEASE_BRANCH создана!${NC}"
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Завершите тестирование и финальные исправления"
echo "2. Обновите документацию"
echo "3. Создайте Pull Request: develop ← $RELEASE_BRANCH"
echo "4. После одобрения слейте в main"
echo "5. Создайте тег: git tag -a $VERSION -m 'Release $VERSION'"
echo "6. Отправьте тег: git push origin $VERSION"
echo ""
echo -e "${YELLOW}💡 Полезные команды:${NC}"
echo "  git status                    - проверить статус"
echo "  git log --oneline -5         - посмотреть последние коммиты"
echo "  git diff develop            - посмотреть изменения"
echo "  git checkout develop         - вернуться на develop"
echo ""
echo -e "${BLUE}🔗 Ссылка для создания PR:${NC}"
echo "https://github.com/digitalmahina/efb-flight-calculator/compare/$RELEASE_BRANCH"
