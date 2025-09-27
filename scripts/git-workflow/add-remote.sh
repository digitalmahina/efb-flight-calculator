#!/bin/bash

# Скрипт для добавления дополнительных remote репозиториев
# Использование: ./scripts/git-workflow/add-remote.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Добавление дополнительных remote репозиториев${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Показываем текущие remote
echo -e "${YELLOW}📋 Текущие remote репозитории:${NC}"
git remote -v

echo ""
echo -e "${BLUE}🔧 Доступные опции:${NC}"
echo "1. Добавить upstream репозиторий (оригинальный проект)"
echo "2. Добавить backup репозиторий"
echo "3. Добавить production репозиторий"
echo "4. Добавить custom репозиторий"
echo "5. Удалить remote репозиторий"
echo "6. Выход"

read -p "Выберите опцию (1-6): " choice

case $choice in
    1)
        echo -e "${YELLOW}📥 Добавление upstream репозитория${NC}"
        read -p "URL upstream репозитория: " upstream_url
        if [ -n "$upstream_url" ]; then
            git remote add upstream "$upstream_url"
            echo -e "${GREEN}✅ Upstream добавлен: $upstream_url${NC}"
            
            # Настраиваем fetch для upstream
            git config remote.upstream.fetch '+refs/heads/*:refs/remotes/upstream/*'
            echo -e "${GREEN}✅ Настроен fetch для upstream${NC}"
        fi
        ;;
    2)
        echo -e "${YELLOW}💾 Добавление backup репозитория${NC}"
        read -p "URL backup репозитория: " backup_url
        if [ -n "$backup_url" ]; then
            git remote add backup "$backup_url"
            echo -e "${GREEN}✅ Backup добавлен: $backup_url${NC}"
        fi
        ;;
    3)
        echo -e "${YELLOW}🚀 Добавление production репозитория${NC}"
        read -p "URL production репозитория: " prod_url
        if [ -n "$prod_url" ]; then
            git remote add production "$prod_url"
            echo -e "${GREEN}✅ Production добавлен: $prod_url${NC}"
        fi
        ;;
    4)
        echo -e "${YELLOW}🔧 Добавление custom репозитория${NC}"
        read -p "Название remote: " remote_name
        read -p "URL репозитория: " remote_url
        if [ -n "$remote_name" ] && [ -n "$remote_url" ]; then
            git remote add "$remote_name" "$remote_url"
            echo -e "${GREEN}✅ $remote_name добавлен: $remote_url${NC}"
        fi
        ;;
    5)
        echo -e "${YELLOW}🗑️  Удаление remote репозитория${NC}"
        echo "Доступные remote:"
        git remote
        read -p "Название remote для удаления: " remote_to_remove
        if [ -n "$remote_to_remove" ]; then
            git remote remove "$remote_to_remove"
            echo -e "${GREEN}✅ $remote_to_remove удален${NC}"
        fi
        ;;
    6)
        echo -e "${BLUE}👋 Выход${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Неверный выбор${NC}"
        exit 1
        ;;
esac

# Показываем обновленный список
echo ""
echo -e "${YELLOW}📋 Обновленные remote репозитории:${NC}"
git remote -v

# Проверяем подключения
echo ""
echo -e "${YELLOW}🔗 Проверка подключений:${NC}"
for remote in $(git remote); do
    if git ls-remote "$remote" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $remote - подключение работает${NC}"
    else
        echo -e "${RED}❌ $remote - ошибка подключения${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 Настройка завершена!${NC}"

# Полезные команды
echo ""
echo -e "${BLUE}📋 Полезные команды для работы с remote:${NC}"
echo "  git remote -v                    - показать все remote"
echo "  git fetch <remote>               - получить изменения из remote"
echo "  git push <remote> <branch>       - отправить ветку в remote"
echo "  git pull <remote> <branch>       - слить изменения из remote"
echo "  git remote show <remote>         - детальная информация о remote"
echo "  git remote remove <remote>       - удалить remote"
echo "  git remote rename <old> <new>    - переименовать remote"
