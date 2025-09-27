#!/bin/bash

# Скрипт для создания ветки hotfix
# Использование: ./scripts/git-workflow/new-hotfix.sh "описание исправления"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Проверяем аргументы
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Ошибка: Укажите описание исправления${NC}"
    echo "Использование: $0 \"описание исправления\""
    echo "Пример: $0 \"security-patch\""
    exit 1
fi

HOTFIX_DESC="$1"
HOTFIX_BRANCH="hotfix/$HOTFIX_DESC"

echo -e "${BLUE}🚨 Создание ветки hotfix: $HOTFIX_BRANCH${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Проверяем, что рабочая директория чистая
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Ошибка: Есть несохраненные изменения${NC}"
    echo "Сохраните или отмените изменения перед созданием hotfix"
    exit 1
fi

# Переключаемся на main
echo -e "${YELLOW}📋 Переключение на ветку main...${NC}"
if ! git checkout main; then
    echo -e "${RED}❌ Ошибка: Не удалось переключиться на main${NC}"
    exit 1
fi

# Обновляем main
echo -e "${YELLOW}🔄 Обновление ветки main...${NC}"
if ! git pull origin main; then
    echo -e "${YELLOW}⚠️  Не удалось получить обновления из origin/main${NC}"
fi

# Проверяем, что ветка hotfix не существует
if git show-ref --verify --quiet refs/heads/$HOTFIX_BRANCH; then
    echo -e "${RED}❌ Ветка $HOTFIX_BRANCH уже существует${NC}"
    echo "Переключиться на существующую ветку? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git checkout $HOTFIX_BRANCH
        echo -e "${GREEN}✅ Переключились на ветку $HOTFIX_BRANCH${NC}"
    else
        echo "Отменено"
        exit 1
    fi
else
    # Создаем ветку hotfix
    echo -e "${YELLOW}🌿 Создание ветки $HOTFIX_BRANCH...${NC}"
    git checkout -b $HOTFIX_BRANCH
    echo -e "${GREEN}✅ Создана ветка $HOTFIX_BRANCH${NC}"
fi

# Создаем файл с описанием hotfix
HOTFIX_DESC_FILE="HOTFIX_$HOTFIX_DESC.md"
cat > "$HOTFIX_DESC_FILE" << EOF
# Hotfix: $HOTFIX_DESC

## 🚨 Критическое исправление
Описание критической проблемы, требующей немедленного исправления.

## 🔍 Проблема
- **Тип**: Security/Bug/Performance
- **Приоритет**: Critical/High/Medium
- **Влияние**: Описание влияния на пользователей
- **Воспроизведение**: Шаги для воспроизведения

## 🔧 Решение
- [ ] Анализ проблемы
- [ ] Разработка исправления
- [ ] Тестирование исправления
- [ ] Проверка совместимости

## 🧪 Тестирование
- [ ] Unit тесты
- [ ] Integration тесты
- [ ] Manual тестирование
- [ ] Regression тестирование
- [ ] Security тестирование

## 📋 Чек-лист
- [ ] Исправление протестировано
- [ ] Не нарушена обратная совместимость
- [ ] Обновлена документация
- [ ] Создан план отката
- [ ] Уведомлены заинтересованные стороны

## 🚀 Развертывание
- [ ] Готово к продакшену
- [ ] План развертывания
- [ ] Мониторинг после развертывания
- [ ] План отката при проблемах

## 📊 Метрики
- [ ] Измерение влияния исправления
- [ ] Мониторинг производительности
- [ ] Отслеживание ошибок

## 🔗 Связанные issues
- #issue1
- #issue2
- #issue3

## 📝 Примечания
Дополнительные заметки по исправлению.
EOF

echo -e "${GREEN}📝 Создан файл описания hotfix: $HOTFIX_DESC_FILE${NC}"

# Обновляем версию в package.json (patch версия)
if [ -f "package.json" ]; then
    echo -e "${YELLOW}📦 Обновление patch версии в package.json...${NC}"
    if command -v jq &> /dev/null; then
        # Получаем текущую версию
        CURRENT_VERSION=$(jq -r '.version' package.json)
        # Увеличиваем patch версию
        NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{$3++; print $1"."$2"."$3}')
        jq ".version = \"$NEW_VERSION\"" package.json > package.json.tmp && mv package.json.tmp package.json
        echo -e "${GREEN}✅ Версия обновлена с $CURRENT_VERSION на $NEW_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️  jq не установлен, обновите версию вручную${NC}"
    fi
fi

# Создаем CHANGELOG запись
if [ -f "CHANGELOG.md" ]; then
    echo -e "${YELLOW}📝 Обновление CHANGELOG...${NC}"
    # Добавляем запись в начало файла
    cat > CHANGELOG_NEW.md << EOF
## [Unreleased] - Hotfix

### Fixed
- $HOTFIX_DESC

EOF
    cat CHANGELOG.md >> CHANGELOG_NEW.md
    mv CHANGELOG_NEW.md CHANGELOG.md
    echo -e "${GREEN}✅ CHANGELOG обновлен${NC}"
fi

# Добавляем файлы в Git
git add .
git commit -m "chore(hotfix): подготовка критического исправления $HOTFIX_DESC"

# Отправляем ветку
echo -e "${YELLOW}📤 Отправка ветки hotfix...${NC}"
if ! git push -u origin $HOTFIX_BRANCH; then
    echo -e "${YELLOW}⚠️  Ветка уже существует в удаленном репозитории, обновляем...${NC}"
    git push origin $HOTFIX_BRANCH
fi

echo ""
echo -e "${GREEN}🎉 Ветка hotfix $HOTFIX_BRANCH создана!${NC}"
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Немедленно исправьте критическую проблему"
echo "2. Протестируйте исправление"
echo "3. Создайте Pull Request: main ← $HOTFIX_BRANCH"
echo "4. После одобрения слейте в main"
echo "5. Слейте также в develop"
echo "6. Создайте тег: git tag -a v1.1.1 -m 'Hotfix v1.1.1'"
echo "7. Отправьте тег: git push origin v1.1.1"
echo ""
echo -e "${YELLOW}💡 Полезные команды:${NC}"
echo "  git status                    - проверить статус"
echo "  git log --oneline -5         - посмотреть последние коммиты"
echo "  git diff main                - посмотреть изменения"
echo "  git checkout main             - вернуться на main"
echo ""
echo -e "${RED}⚠️  ВАЖНО: Hotfix требует немедленного внимания!${NC}"
echo -e "${BLUE}🔗 Ссылка для создания PR:${NC}"
echo "https://github.com/digitalmahina/efb-flight-calculator/compare/$HOTFIX_BRANCH"
