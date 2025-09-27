# ✅ Чек-лист настройки Figma

## 🎯 Подготовка к работе

### Шаг 1: Установка плагинов
- [ ] **Design Tokens** - для импорта токенов
- [ ] **Figma to Code** - для экспорта в код (опционально)
- [ ] **Auto Layout** - для автоматической компоновки (встроен)

### Шаг 2: Создание файла
- [ ] Создан файл: `EFB Flight Calculator Design System`
- [ ] Созданы страницы:
  - [ ] `🎨 Design Tokens`
  - [ ] `🎯 Components`
  - [ ] `📱 Screens`
  - [ ] `📋 Documentation`

## 🎨 Импорт дизайн-токенов

### Шаг 3: Импорт токенов
- [ ] Запущен плагин Design Tokens
- [ ] Импортирован файл `figma-tokens-plugin.json`
- [ ] Созданы стили из токенов
- [ ] Проверены все цветовые стили
- [ ] Проверены все текстовые стили

### Шаг 4: Проверка стилей
- [ ] **Цвета** (16 стилей):
  - [ ] Primary Green (#00FF00)
  - [ ] Background Dark (#0A0A0A)
  - [ ] Text Primary (#00FF00)
  - [ ] Text Secondary (#FFFFFF)
  - [ ] Warning (#FFAA00)
  - [ ] Error (#FF0000)
  - [ ] И другие...

- [ ] **Типографика** (16 стилей):
  - [ ] Header Title (JetBrains Mono, 32px, Bold)
  - [ ] Panel Title (JetBrains Mono, 14px, Semibold)
  - [ ] Data Value (JetBrains Mono, 24px, Bold)
  - [ ] Button Text (JetBrains Mono, 12px, Semibold)
  - [ ] И другие...

## 🧩 Создание компонентов

### Шаг 5: Основные компоненты
- [ ] **Button Primary**
  - [ ] Размер: 40px высота
  - [ ] Фон: #00FF00
  - [ ] Текст: #0A0A0A, JetBrains Mono, 12px, Semibold
  - [ ] Границы: 8px radius
  - [ ] Тень: 0 4px 16px rgba(0, 255, 0, 0.2)

- [ ] **Button Secondary**
  - [ ] Размер: 40px высота
  - [ ] Фон: rgba(255, 255, 255, 0.05)
  - [ ] Текст: #888888, JetBrains Mono, 12px, Medium
  - [ ] Границы: 1px solid #888888, 8px radius

- [ ] **Panel**
  - [ ] Фон: rgba(20, 20, 20, 0.95)
  - [ ] Границы: 1px solid rgba(0, 255, 0, 0.3), 12px radius
  - [ ] Backdrop filter: blur(15px)
  - [ ] Тень: 0 8px 32px rgba(0, 0, 0, 0.3)

- [ ] **Data Card**
  - [ ] Фон: rgba(255, 255, 255, 0.05)
  - [ ] Границы: 1px solid rgba(0, 255, 0, 0.3), 8px radius
  - [ ] Backdrop filter: blur(5px)

- [ ] **Input Field**
  - [ ] Размер: 40px высота
  - [ ] Фон: rgba(255, 255, 255, 0.05)
  - [ ] Границы: 1px solid rgba(0, 255, 0, 0.3), 4px radius
  - [ ] Текст: #00FF00, JetBrains Mono, 14px

- [ ] **Status Indicator**
  - [ ] Dot: 8px, #888888
  - [ ] Text: JetBrains Mono, 12px, Semibold, #FFFFFF
  - [ ] Варианты: Active, Warning, Error

### Шаг 6: Состояния компонентов
- [ ] **Button States**:
  - [ ] Default
  - [ ] Hover (изменение цвета, тени)
  - [ ] Active (transform: translateY(1px))
  - [ ] Disabled (opacity: 0.5)

- [ ] **Panel States**:
  - [ ] Default
  - [ ] Hover (изменение границы)

- [ ] **Input States**:
  - [ ] Default
  - [ ] Focus (изменение границы, тень)
  - [ ] Error (красная граница)
  - [ ] Success (зеленая граница)

## 📱 Создание макетов

### Шаг 7: Desktop Layout (1920x1080)
- [ ] **Header** (80px высота):
  - [ ] Заголовок: "EFB FLIGHT CALCULATOR"
  - [ ] Статусные индикаторы: GPS, NAV, CALC, WX
  - [ ] Отображение времени

- [ ] **Main Content** (Grid 300px | 1fr | 300px | 300px):
  - [ ] Flight Data Panel (левая панель)
  - [ ] Map Panel (центральная панель)
  - [ ] Route Panel (правая панель)
  - [ ] Weather Panel (правая панель)

- [ ] **Footer** (120px высота):
  - [ ] Поля ввода: Cruise Speed, Fuel Flow
  - [ ] Кнопки: Load GPX, Calculate, Clear, Weather

### Шаг 8: Mobile Layout (375x812)
- [ ] **Header** (60px высота):
  - [ ] Компактный заголовок: "EFB"
  - [ ] Статусные индикаторы (компактные)
  - [ ] Время (компактное)

- [ ] **Main Content** (Column layout):
  - [ ] Data Grid (2 колонки)
  - [ ] Map Placeholder
  - [ ] Route List (компактный)

- [ ] **Footer** (80px высота):
  - [ ] Кнопки в ряд: Load, Calc, WX

## 🎯 Настройка эффектов

### Шаг 9: Эффекты
- [ ] **Glow Effect**:
  - [ ] Тип: Drop Shadow
  - [ ] X: 0, Y: 0, Blur: 20px
  - [ ] Цвет: rgba(0, 255, 0, 0.3)

- [ ] **Panel Shadow**:
  - [ ] Тип: Drop Shadow
  - [ ] X: 0, Y: 8px, Blur: 32px
  - [ ] Цвет: rgba(0, 0, 0, 0.3)

- [ ] **Button Shadow**:
  - [ ] Тип: Drop Shadow
  - [ ] X: 0, Y: 4px, Blur: 16px
  - [ ] Цвет: rgba(0, 255, 0, 0.2)

## 🔧 Настройка интерактивности

### Шаг 10: Прототипирование
- [ ] **Button Interactions**:
  - [ ] Hover: изменение цвета, тени
  - [ ] Click: transform translateY(1px)
  - [ ] Переходы: 300ms ease-in-out

- [ ] **Panel Interactions**:
  - [ ] Hover: изменение границы
  - [ ] Переходы: 300ms ease-in-out

- [ ] **Input Interactions**:
  - [ ] Focus: изменение границы, тень
  - [ ] Переходы: 300ms ease-in-out

## 📋 Документация

### Шаг 11: Создание документации
- [ ] **Обзор дизайн-системы**
- [ ] **Цветовая палитра** с описаниями
- [ ] **Типографика** с примерами
- [ ] **Компоненты** с вариантами
- [ ] **Макеты** с описаниями
- [ ] **Руководство по использованию**

## ✅ Финальная проверка

### Шаг 12: Тестирование
- [ ] Все компоненты работают корректно
- [ ] Состояния отображаются правильно
- [ ] Анимации плавные
- [ ] Цвета соответствуют спецификации
- [ ] Типографика читабельна
- [ ] Макеты адаптивны

### Шаг 13: Публикация
- [ ] Библиотека опубликована
- [ ] Команда имеет доступ
- [ ] Документация доступна
- [ ] Обновления настроены

## 🎉 Готово!

Твоя дизайн-система EFB Flight Calculator готова к использованию в Figma!

### Что дальше:
1. **Создавай** новые дизайны используя компоненты
2. **Итерации** - улучшай на основе обратной связи
3. **Обновляй** - добавляй новые компоненты по мере необходимости
4. **Делись** - используй библиотеку в команде

---

**Удачи в создании потрясающих дизайнов!** ✈️🎨
