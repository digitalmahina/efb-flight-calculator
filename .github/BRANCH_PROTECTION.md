# Настройка защиты веток GitHub

## Правила защиты для ветки `main`

### Обязательные проверки
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ✅ Require conversation resolution before merging

### Настройки
- **Required status checks**: `test`, `build`
- **Required number of reviewers**: 2
- **Dismiss stale reviews when new commits are pushed**: ✅
- **Restrict pushes that create files**: ✅

## Правила защиты для ветки `develop`

### Обязательные проверки
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### Настройки
- **Required status checks**: `test`
- **Required number of reviewers**: 1
- **Allow force pushes**: ❌
- **Allow deletions**: ❌

## Настройка через GitHub CLI

```bash
# Установка GitHub CLI
brew install gh

# Авторизация
gh auth login

# Настройка защиты для main
gh api repos/digitalmahina/efb-flight-calculator/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false

# Настройка защиты для develop
gh api repos/digitalmahina/efb-flight-calculator/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Настройка через веб-интерфейс GitHub

1. Перейдите в Settings → Branches
2. Нажмите "Add rule"
3. В поле "Branch name pattern" введите `main`
4. Настройте правила:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (2)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history
   - ✅ Require conversation resolution before merging
   - ✅ Restrict pushes that create files

## Правила для feature веток

### Автоматическое удаление
- Feature ветки автоматически удаляются после слияния
- Используйте `git branch -d feature-name` для локального удаления

### Naming convention
- `feature/название-функции`
- `bugfix/описание-исправления`
- `hotfix/критическое-исправление`

## Скрипт для настройки защиты веток

```bash
#!/bin/bash
# scripts/git-workflow/setup-branch-protection.sh

REPO="digitalmahina/efb-flight-calculator"

echo "🔒 Настройка защиты веток для $REPO"

# Проверяем наличие GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI не установлен"
    echo "Установите: brew install gh"
    exit 1
fi

# Настройка защиты для main
echo "📋 Настройка защиты для main..."
gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false

echo "✅ Защита для main настроена"

# Настройка защиты для develop
echo "📋 Настройка защиты для develop..."
gh api repos/$REPO/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false

echo "✅ Защита для develop настроена"
echo "🎉 Настройка завершена!"
```

## Рекомендации

1. **Всегда используйте Pull Requests** для слияния в main/develop
2. **Не делайте force push** в защищенные ветки
3. **Создавайте feature ветки** от develop
4. **Удаляйте feature ветки** после слияния
5. **Используйте семантическое версионирование** для тегов
