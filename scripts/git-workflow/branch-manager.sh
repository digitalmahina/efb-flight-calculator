#!/bin/bash

# Скрипт для управления ветками
# Использование: ./scripts/git-workflow/branch-manager.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌿 Менеджер веток${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Функция для показа статуса веток
show_branch_status() {
    echo -e "${YELLOW}📋 Статус веток:${NC}"
    echo ""
    
    # Локальные ветки
    echo -e "${BLUE}🌿 Локальные ветки:${NC}"
    git branch -v | while read line; do
        if [[ $line =~ ^\* ]]; then
            echo -e "${GREEN}  $line${NC}"
        else
            echo "  $line"
        fi
    done
    
    echo ""
    
    # Удаленные ветки
    echo -e "${BLUE}🌐 Удаленные ветки:${NC}"
    git branch -r | while read line; do
        echo "  $line"
    done
    
    echo ""
    
    # Текущая ветка
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "${YELLOW}📍 Текущая ветка: $CURRENT_BRANCH${NC}"
    
    # Статус синхронизации
    if git rev-parse --abbrev-ref --symbolic-full-name @{u} > /dev/null 2>&1; then
        UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u})
        echo -e "${YELLOW}🔄 Upstream: $UPSTREAM${NC}"
        
        # Проверяем статус
        BEHIND=$(git rev-list --count HEAD..$UPSTREAM 2>/dev/null || echo "0")
        AHEAD=$(git rev-list --count $UPSTREAM..HEAD 2>/dev/null || echo "0")
        
        if [ "$BEHIND" -gt 0 ]; then
            echo -e "${YELLOW}📥 Отстает на $BEHIND коммитов${NC}"
        fi
        
        if [ "$AHEAD" -gt 0 ]; then
            echo -e "${YELLOW}📤 Впереди на $AHEAD коммитов${NC}"
        fi
        
        if [ "$BEHIND" -eq 0 ] && [ "$AHEAD" -eq 0 ]; then
            echo -e "${GREEN}✅ Синхронизирован${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Upstream не настроен${NC}"
    fi
}

# Функция для очистки веток
cleanup_branches() {
    echo -e "${YELLOW}🧹 Очистка веток...${NC}"
    
    # Получаем список слитых веток
    MERGED_BRANCHES=$(git branch --merged | grep -v '\*\|main\|develop' | sed 's/^[ ]*//')
    
    if [ -z "$MERGED_BRANCHES" ]; then
        echo -e "${GREEN}✅ Нет веток для удаления${NC}"
        return
    fi
    
    echo -e "${YELLOW}📋 Найденные слитые ветки:${NC}"
    echo "$MERGED_BRANCHES"
    echo ""
    
    echo -e "${YELLOW}❓ Удалить слитые ветки? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "$MERGED_BRANCHES" | while read branch; do
            if [ -n "$branch" ]; then
                echo -e "${YELLOW}🗑️  Удаление ветки: $branch${NC}"
                git branch -d "$branch"
            fi
        done
        echo -e "${GREEN}✅ Очистка завершена${NC}"
    else
        echo -e "${BLUE}ℹ️  Очистка отменена${NC}"
    fi
}

# Функция для синхронизации веток
sync_branches() {
    echo -e "${YELLOW}🔄 Синхронизация веток...${NC}"
    
    # Получаем обновления
    echo -e "${YELLOW}📥 Получение обновлений...${NC}"
    git fetch origin
    
    # Синхронизируем main
    echo -e "${YELLOW}🔄 Синхронизация main...${NC}"
    git checkout main
    git pull origin main
    
    # Синхронизируем develop
    echo -e "${YELLOW}🔄 Синхронизация develop...${NC}"
    git checkout develop
    git pull origin develop
    
    echo -e "${GREEN}✅ Синхронизация завершена${NC}"
}

# Функция для создания ветки
create_branch() {
    echo -e "${YELLOW}🌿 Создание новой ветки...${NC}"
    
    echo "Выберите тип ветки:"
    echo "1. feature/название"
    echo "2. release/версия"
    echo "3. hotfix/описание"
    echo "4. experiment/название"
    echo "5. custom"
    
    read -p "Выберите опцию (1-5): " choice
    
    case $choice in
        1)
            read -p "Название функции: " feature_name
            BRANCH_NAME="feature/$feature_name"
            BASE_BRANCH="develop"
            ;;
        2)
            read -p "Версия релиза (например, v1.1.0): " version
            BRANCH_NAME="release/$version"
            BASE_BRANCH="develop"
            ;;
        3)
            read -p "Описание hotfix: " hotfix_desc
            BRANCH_NAME="hotfix/$hotfix_desc"
            BASE_BRANCH="main"
            ;;
        4)
            read -p "Название эксперимента: " exp_name
            BRANCH_NAME="experiment/$exp_name"
            BASE_BRANCH="develop"
            ;;
        5)
            read -p "Название ветки: " custom_name
            BRANCH_NAME="$custom_name"
            read -p "Базовая ветка (main/develop): " BASE_BRANCH
            ;;
        *)
            echo -e "${RED}❌ Неверный выбор${NC}"
            return
            ;;
    esac
    
    # Создаем ветку
    echo -e "${YELLOW}🌿 Создание ветки $BRANCH_NAME от $BASE_BRANCH...${NC}"
    git checkout "$BASE_BRANCH"
    git pull origin "$BASE_BRANCH"
    git checkout -b "$BRANCH_NAME"
    
    echo -e "${GREEN}✅ Ветка $BRANCH_NAME создана${NC}"
}

# Основное меню
while true; do
    echo ""
    echo -e "${BLUE}🔧 Меню управления ветками:${NC}"
    echo "1. Показать статус веток"
    echo "2. Создать новую ветку"
    echo "3. Синхронизировать ветки"
    echo "4. Очистить слитые ветки"
    echo "5. Переключиться на ветку"
    echo "6. Удалить ветку"
    echo "7. Сравнить ветки"
    echo "8. Выход"
    
    read -p "Выберите опцию (1-8): " choice
    
    case $choice in
        1)
            show_branch_status
            ;;
        2)
            create_branch
            ;;
        3)
            sync_branches
            ;;
        4)
            cleanup_branches
            ;;
        5)
            echo -e "${YELLOW}🌿 Доступные ветки:${NC}"
            git branch
            read -p "Название ветки для переключения: " branch_name
            if git checkout "$branch_name"; then
                echo -e "${GREEN}✅ Переключились на $branch_name${NC}"
            else
                echo -e "${RED}❌ Ошибка при переключении${NC}"
            fi
            ;;
        6)
            echo -e "${YELLOW}🌿 Доступные ветки:${NC}"
            git branch
            read -p "Название ветки для удаления: " branch_name
            if [ "$branch_name" != "main" ] && [ "$branch_name" != "develop" ]; then
                if git branch -d "$branch_name"; then
                    echo -e "${GREEN}✅ Ветка $branch_name удалена${NC}"
                else
                    echo -e "${RED}❌ Ошибка при удалении${NC}"
                fi
            else
                echo -e "${RED}❌ Нельзя удалить основную ветку${NC}"
            fi
            ;;
        7)
            echo -e "${YELLOW}🌿 Доступные ветки:${NC}"
            git branch
            read -p "Первая ветка: " branch1
            read -p "Вторая ветка: " branch2
            echo -e "${YELLOW}📊 Сравнение $branch1 и $branch2:${NC}"
            git log --oneline --graph "$branch1".."$branch2" 2>/dev/null || echo "Нет различий"
            ;;
        8)
            echo -e "${BLUE}👋 Выход${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Неверный выбор${NC}"
            ;;
    esac
done
