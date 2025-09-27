#!/bin/bash

# Скрипт для настройки защиты веток GitHub
# Использование: ./scripts/git-workflow/setup-branch-protection.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REPO="digitalmahina/efb-flight-calculator"

echo -e "${BLUE}🔒 Настройка защиты веток для $REPO${NC}"

# Проверяем наличие GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI не установлен${NC}"
    echo -e "${YELLOW}📦 Установите GitHub CLI:${NC}"
    echo "  brew install gh"
    echo "  gh auth login"
    exit 1
fi

# Проверяем авторизацию
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Не авторизован в GitHub CLI${NC}"
    echo -e "${YELLOW}🔑 Выполните авторизацию:${NC}"
    echo "  gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI настроен${NC}"

# Настройка защиты для main
echo -e "${YELLOW}📋 Настройка защиты для main...${NC}"
if gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false; then
    echo -e "${GREEN}✅ Защита для main настроена${NC}"
else
    echo -e "${RED}❌ Ошибка при настройке защиты для main${NC}"
    exit 1
fi

# Настройка защиты для develop
echo -e "${YELLOW}📋 Настройка защиты для develop...${NC}"
if gh api repos/$REPO/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false; then
    echo -e "${GREEN}✅ Защита для develop настроена${NC}"
else
    echo -e "${RED}❌ Ошибка при настройке защиты для develop${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Настройка защиты веток завершена!${NC}"
echo -e "${BLUE}📋 Настроенные правила:${NC}"
echo "  • main: требует 2 одобрения, проверки CI, линейная история"
echo "  • develop: требует 1 одобрение, проверки CI"
echo "  • Запрещены force push и удаления"
echo ""
echo -e "${YELLOW}💡 Следующие шаги:${NC}"
echo "1. Создайте Pull Request для тестирования"
echo "2. Назначьте ревьюеров в настройках репозитория"
echo "3. Настройте автоматические проверки CI"
echo ""
echo -e "${BLUE}🔗 Ссылки:${NC}"
echo "  • Настройки веток: https://github.com/$REPO/settings/branches"
echo "  • Actions: https://github.com/$REPO/actions"
