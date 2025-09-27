#!/bin/bash

# Скрипт для управления CI/CD pipeline
# Использование: ./scripts/ci-cd/pipeline-manager.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CI/CD Pipeline Manager${NC}"

# Проверяем, что мы в Git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Ошибка: Не в Git репозитории${NC}"
    exit 1
fi

# Функция для показа статуса pipeline
show_pipeline_status() {
    echo -e "${YELLOW}📊 Статус CI/CD Pipeline:${NC}"
    echo ""
    
    # Проверяем наличие GitHub CLI
    if command -v gh &> /dev/null; then
        echo -e "${BLUE}🔍 GitHub Actions Status:${NC}"
        
        # Получаем последние workflow runs
        gh run list --limit 5 --json status,conclusion,name,createdAt | jq -r '.[] | "\(.name): \(.status) (\(.conclusion // "running")) - \(.createdAt)"' 2>/dev/null || echo "Не удалось получить статус"
        
        echo ""
        echo -e "${BLUE}📋 Доступные Workflows:${NC}"
        gh workflow list --json name,state | jq -r '.[] | "\(.name): \(.state)"' 2>/dev/null || echo "Не удалось получить список workflows"
        
    else
        echo -e "${YELLOW}⚠️  GitHub CLI не установлен${NC}"
        echo "Установите: brew install gh"
        echo "Авторизуйтесь: gh auth login"
    fi
    
    echo ""
    echo -e "${BLUE}📁 Локальные Workflows:${NC}"
    if [ -d ".github/workflows" ]; then
        ls -la .github/workflows/ | grep -v "^total" | while read line; do
            if [[ $line =~ \.yml$ ]] || [[ $line =~ \.yaml$ ]]; then
                echo "  📄 $(echo $line | awk '{print $NF}')"
            fi
        done
    else
        echo "  ❌ Директория .github/workflows не найдена"
    fi
}

# Функция для запуска workflow
trigger_workflow() {
    echo -e "${YELLOW}🚀 Запуск Workflow${NC}"
    
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI не установлен${NC}"
        echo "Установите: brew install gh"
        exit 1
    fi
    
    echo "Доступные workflows:"
    gh workflow list --json name,id | jq -r '.[] | "\(.name) (\(.id))"' 2>/dev/null || echo "Не удалось получить список workflows"
    
    echo ""
    read -p "Введите название workflow для запуска: " workflow_name
    
    if [ -n "$workflow_name" ]; then
        echo -e "${YELLOW}🚀 Запуск workflow: $workflow_name${NC}"
        gh workflow run "$workflow_name" 2>/dev/null || echo -e "${RED}❌ Ошибка при запуске workflow${NC}"
    else
        echo -e "${YELLOW}⚠️  Название workflow не указано${NC}"
    fi
}

# Функция для просмотра логов
view_logs() {
    echo -e "${YELLOW}📋 Просмотр логов${NC}"
    
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI не установлен${NC}"
        exit 1
    fi
    
    echo "Последние workflow runs:"
    gh run list --limit 10 --json databaseId,status,conclusion,name,createdAt | jq -r '.[] | "\(.databaseId): \(.name) - \(.status) (\(.conclusion // "running"))"' 2>/dev/null || echo "Не удалось получить список runs"
    
    echo ""
    read -p "Введите ID run для просмотра логов: " run_id
    
    if [ -n "$run_id" ]; then
        echo -e "${YELLOW}📋 Логи для run $run_id:${NC}"
        gh run view "$run_id" --log 2>/dev/null || echo -e "${RED}❌ Ошибка при получении логов${NC}"
    else
        echo -e "${YELLOW}⚠️  ID run не указан${NC}"
    fi
}

# Функция для проверки статуса деплоя
check_deployment() {
    echo -e "${YELLOW}🚀 Проверка статуса деплоя${NC}"
    
    # Проверяем GitHub Pages
    echo -e "${BLUE}🌐 GitHub Pages Status:${NC}"
    echo "Production: https://efb-calculator.com"
    echo "Staging: https://staging.efb-calculator.com"
    
    # Проверяем последние деплои
    if command -v gh &> /dev/null; then
        echo ""
        echo -e "${BLUE}📊 Последние деплои:${NC}"
        gh run list --workflow="deployment.yml" --limit 5 --json status,conclusion,createdAt | jq -r '.[] | "\(.createdAt): \(.status) (\(.conclusion // "running"))"' 2>/dev/null || echo "Не удалось получить статус деплоев"
    fi
}

# Функция для настройки окружений
setup_environments() {
    echo -e "${YELLOW}🔧 Настройка окружений${NC}"
    
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI не установлен${NC}"
        exit 1
    fi
    
    echo "Создание окружений..."
    
    # Создаем staging окружение
    echo -e "${YELLOW}📋 Создание staging окружения...${NC}"
    gh api repos/digitalmahina/efb-flight-calculator/environments/staging --method PUT --field protection_rules='[]' 2>/dev/null || echo "Staging окружение уже существует"
    
    # Создаем production окружение
    echo -e "${YELLOW}📋 Создание production окружения...${NC}"
    gh api repos/digitalmahina/efb-flight-calculator/environments/production --method PUT --field protection_rules='[{"type":"required_reviewers","required_reviewers":[{"type":"User","id":1}]}]' 2>/dev/null || echo "Production окружение уже существует"
    
    echo -e "${GREEN}✅ Окружения настроены${NC}"
}

# Функция для очистки артефактов
cleanup_artifacts() {
    echo -e "${YELLOW}🧹 Очистка артефактов${NC}"
    
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI не установлен${NC}"
        exit 1
    fi
    
    echo "Удаление старых артефактов..."
    
    # Получаем список артефактов
    gh api repos/digitalmahina/efb-flight-calculator/actions/artifacts --jq '.artifacts[] | select(.created_at < (now - 7*24*3600 | strftime("%Y-%m-%dT%H:%M:%SZ"))) | .id' | while read artifact_id; do
        if [ -n "$artifact_id" ]; then
            echo "Удаление артефакта: $artifact_id"
            gh api repos/digitalmahina/efb-flight-calculator/actions/artifacts/$artifact_id --method DELETE 2>/dev/null || echo "Не удалось удалить артефакт $artifact_id"
        fi
    done
    
    echo -e "${GREEN}✅ Очистка завершена${NC}"
}

# Основное меню
while true; do
    echo ""
    echo -e "${BLUE}🔧 CI/CD Pipeline Manager:${NC}"
    echo "1. Показать статус pipeline"
    echo "2. Запустить workflow"
    echo "3. Просмотреть логи"
    echo "4. Проверить статус деплоя"
    echo "5. Настроить окружения"
    echo "6. Очистить артефакты"
    echo "7. Показать метрики"
    echo "8. Выход"
    
    read -p "Выберите опцию (1-8): " choice
    
    case $choice in
        1)
            show_pipeline_status
            ;;
        2)
            trigger_workflow
            ;;
        3)
            view_logs
            ;;
        4)
            check_deployment
            ;;
        5)
            setup_environments
            ;;
        6)
            cleanup_artifacts
            ;;
        7)
            echo -e "${YELLOW}📊 Метрики CI/CD:${NC}"
            echo "- Workflows: $(ls .github/workflows/*.yml 2>/dev/null | wc -l)"
            echo "- Последний коммит: $(git log -1 --pretty=format:'%h - %s (%cr)')"
            echo "- Ветка: $(git branch --show-current)"
            echo "- Статус: $(git status --porcelain | wc -l) изменений"
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
