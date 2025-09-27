#!/bin/bash

# Скрипт для синхронизации с upstream репозиторием
# Использование: ./scripts/git-workflow/sync-upstream.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Синхронизация с upstream репозиторием${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Проверяем наличие upstream
if ! git remote get-url upstream > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Upstream remote не настроен${NC}"
    echo -e "${YELLOW}💡 Настройте upstream:${NC}"
    echo "  git remote add upstream <upstream-url>"
    echo "  или используйте: ./scripts/git-workflow/add-remote.sh"
    exit 1
fi

# Показываем текущие remote
echo -e "${YELLOW}📋 Текущие remote репозитории:${NC}"
git remote -v

# Проверяем статус
echo ""
echo -e "${YELLOW}📊 Статус перед синхронизацией:${NC}"
git status -sb

# Получаем обновления из upstream
echo ""
echo -e "${YELLOW}📥 Получение обновлений из upstream...${NC}"
if ! git fetch upstream; then
    echo -e "${RED}❌ Ошибка при получении обновлений из upstream${NC}"
    exit 1
fi

# Показываем новые коммиты
echo ""
echo -e "${YELLOW}📈 Новые коммиты в upstream:${NC}"
git log --oneline HEAD..upstream/main 2>/dev/null || echo "Нет новых коммитов в upstream/main"

# Проверяем, есть ли изменения для слияния
if git merge-base --is-ancestor HEAD upstream/main 2>/dev/null; then
    echo -e "${GREEN}✅ Локальная ветка актуальна${NC}"
else
    echo -e "${YELLOW}⚠️  Есть новые изменения в upstream${NC}"
    
    # Спрашиваем, нужно ли слить изменения
    echo ""
    echo -e "${YELLOW}❓ Слить изменения из upstream? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🔄 Слияние изменений из upstream...${NC}"
        
        # Переключаемся на main
        if ! git checkout main; then
            echo -e "${RED}❌ Ошибка при переключении на main${NC}"
            exit 1
        fi
        
        # Сливаем изменения
        if git merge upstream/main; then
            echo -e "${GREEN}✅ Изменения успешно слиты${NC}"
            
            # Отправляем изменения в origin
            echo -e "${YELLOW}📤 Отправка изменений в origin...${NC}"
            if git push origin main; then
                echo -e "${GREEN}✅ Изменения отправлены в origin${NC}"
            else
                echo -e "${RED}❌ Ошибка при отправке в origin${NC}"
            fi
        else
            echo -e "${RED}❌ Ошибка при слиянии${NC}"
            echo -e "${YELLOW}💡 Разрешите конфликты вручную и повторите${NC}"
            exit 1
        fi
    else
        echo -e "${BLUE}ℹ️  Слияние отменено${NC}"
    fi
fi

# Показываем финальный статус
echo ""
echo -e "${YELLOW}📊 Финальный статус:${NC}"
git status -sb

echo ""
echo -e "${GREEN}🎉 Синхронизация завершена!${NC}"

# Полезные команды
echo ""
echo -e "${BLUE}📋 Полезные команды для работы с upstream:${NC}"
echo "  git fetch upstream              - получить обновления из upstream"
echo "  git merge upstream/main         - слить изменения из upstream"
echo "  git push origin main            - отправить изменения в origin"
echo "  git log --oneline upstream/main - посмотреть коммиты upstream"
echo "  git diff upstream/main          - посмотреть различия с upstream"
