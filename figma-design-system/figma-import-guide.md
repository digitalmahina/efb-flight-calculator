# 🎨 Руководство по импорту в Figma

## Обзор
Это руководство поможет тебе импортировать дизайн-систему EFB Flight Calculator в Figma и создать полноценную библиотеку компонентов.

## 📁 Структура файлов

```
figma-design-system/
├── design-tokens.json      # Основные дизайн-токены
├── figma-colors.json       # Цветовая палитра
├── typography.json         # Типографическая система
├── components.json         # Спецификации компонентов
└── figma-import-guide.md   # Это руководство
```

## 🚀 Пошаговый импорт

### Шаг 1: Создание нового файла Figma

1. Открой Figma
2. Создай новый файл: `EFB Flight Calculator Design System`
3. Создай страницы:
   - `🎨 Design Tokens`
   - `🎯 Components`
   - `📱 Screens`
   - `📋 Documentation`

### Шаг 2: Настройка цветов

1. Перейди в **Design** → **Color Styles**
2. Создай цветовые стили на основе `figma-colors.json`:

#### Основные цвета:
- **Primary Green**: `#00FF00`
- **Background Dark**: `#0A0A0A`
- **Panel Background**: `#141414`
- **Text Primary**: `#00FF00`
- **Text Secondary**: `#FFFFFF`
- **Text Muted**: `#888888`
- **Border Default**: `rgba(0, 255, 0, 0.3)`
- **Border Active**: `rgba(0, 255, 0, 0.8)`
- **Warning**: `#FFAA00`
- **Error**: `#FF0000`
- **Success**: `#00FF00`

#### Градиенты:
- **Primary Gradient**: `135deg, #00FF00 → #00CC00`
- **Background Gradient**: `135deg, #0A0A0A → #1A1A1A`
- **Glass Gradient**: `135deg, rgba(0, 255, 0, 0.1) → transparent`

### Шаг 3: Настройка типографики

1. Перейди в **Design** → **Text Styles**
2. Создай текстовые стили на основе `typography.json`:

#### Основные стили:
- **Header Title**: JetBrains Mono, 32px, Bold, #00FF00
- **Panel Title**: JetBrains Mono, 14px, Semibold, #00FF00, Uppercase
- **Data Value**: JetBrains Mono, 24px, Bold, #00FF00
- **Data Label**: JetBrains Mono, 10px, Regular, #888888, Uppercase
- **Button Text**: JetBrains Mono, 12px, Semibold, #0A0A0A, Uppercase
- **Input Text**: JetBrains Mono, 14px, Regular, #00FF00
- **Status Text**: JetBrains Mono, 12px, Semibold, #FFFFFF, Uppercase

### Шаг 4: Создание компонентов

1. Перейди на страницу `🎯 Components`
2. Создай компоненты на основе `components.json`:

#### Основные компоненты:

**Button Primary**
- Размер: 40px высота, auto ширина
- Фон: #00FF00
- Текст: #0A0A0A, JetBrains Mono, 12px, Semibold, Uppercase
- Границы: 8px radius
- Тень: 0 4px 16px rgba(0, 255, 0, 0.2)

**Button Secondary**
- Размер: 40px высота, auto ширина
- Фон: rgba(255, 255, 255, 0.05)
- Текст: #888888, JetBrains Mono, 12px, Medium, Uppercase
- Границы: 1px solid #888888, 8px radius
- Backdrop filter: blur(10px)

**Panel**
- Фон: rgba(20, 20, 20, 0.95)
- Границы: 1px solid rgba(0, 255, 0, 0.3), 12px radius
- Backdrop filter: blur(15px)
- Тень: 0 8px 32px rgba(0, 0, 0, 0.3)
- Отступы: 16px

**Data Card**
- Фон: rgba(255, 255, 255, 0.05)
- Границы: 1px solid rgba(0, 255, 0, 0.3), 8px radius
- Backdrop filter: blur(5px)
- Отступы: 16px

**Input Field**
- Размер: 40px высота, auto ширина
- Фон: rgba(255, 255, 255, 0.05)
- Границы: 1px solid rgba(0, 255, 0, 0.3), 4px radius
- Текст: #00FF00, JetBrains Mono, 14px, Regular
- Отступы: 8px 16px

**Status Indicator**
- Размер: auto
- Фон: rgba(255, 255, 255, 0.05)
- Границы: 1px solid rgba(0, 255, 0, 0.3), 4px radius
- Отступы: 8px 16px
- Элементы: Dot (8px) + Text

### Шаг 5: Создание макетов экранов

1. Перейди на страницу `📱 Screens`
2. Создай основные экраны:

#### Desktop Layout (1920x1080)
- **Header**: 80px высота
- **Main Content**: Grid 300px | 1fr | 300px | 300px
- **Footer**: 120px высота

#### Mobile Layout (375x812)
- **Header**: 60px высота
- **Main Content**: Column layout
- **Footer**: 80px высота

### Шаг 6: Настройка эффектов

1. Создай эффекты в **Design** → **Effects**:

**Glow Effect**
- Тип: Drop Shadow
- X: 0, Y: 0, Blur: 20px
- Цвет: rgba(0, 255, 0, 0.3)

**Panel Shadow**
- Тип: Drop Shadow
- X: 0, Y: 8px, Blur: 32px
- Цвет: rgba(0, 0, 0, 0.3)

**Button Shadow**
- Тип: Drop Shadow
- X: 0, Y: 4px, Blur: 16px
- Цвет: rgba(0, 255, 0, 0.2)

## 🎯 Создание интерактивных прототипов

### Состояния компонентов

**Button States:**
- Default
- Hover (изменение цвета, тени)
- Active (transform: translateY(1px))
- Disabled (opacity: 0.5)

**Panel States:**
- Default
- Hover (изменение границы)
- Active (усиленное свечение)

**Input States:**
- Default
- Focus (изменение границы, тень)
- Error (красная граница)
- Success (зеленая граница)

### Анимации

**Переходы:**
- Duration: 300ms
- Easing: ease-in-out
- Properties: color, border-color, box-shadow, transform

## 📋 Документация

1. Перейди на страницу `📋 Documentation`
2. Создай документацию:

### Разделы документации:
- **Обзор дизайн-системы**
- **Цветовая палитра**
- **Типографика**
- **Компоненты**
- **Макеты**
- **Руководство по использованию**

## 🔧 Полезные плагины

Рекомендуемые плагины для работы с дизайн-системой:

1. **Design Tokens** - для работы с токенами
2. **Figma to Code** - для экспорта в код
3. **Auto Layout** - для автоматической компоновки
4. **Stark** - для проверки доступности
5. **Figma to HTML** - для быстрого прототипирования

## 📱 Адаптивность

### Breakpoints:
- **Mobile**: 375px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Responsive Components:
- Используй Auto Layout для адаптивных компонентов
- Настрой Constraints для правильного масштабирования
- Создай варианты для разных размеров экрана

## 🎨 Дополнительные ресурсы

### Иконки:
- Используй авиационные иконки
- Стиль: Outline, 24px
- Цвет: #00FF00 для активных, #888888 для неактивных

### Иллюстрации:
- Стиль: Минималистичный, технический
- Цвета: Основная палитра системы
- Формат: SVG для масштабируемости

## ✅ Чек-лист готовности

- [ ] Цветовые стили созданы
- [ ] Текстовые стили настроены
- [ ] Компоненты созданы
- [ ] Макеты экранов готовы
- [ ] Эффекты настроены
- [ ] Интерактивные состояния добавлены
- [ ] Документация создана
- [ ] Библиотека опубликована

## 🚀 Следующие шаги

1. **Тестирование**: Протестируй все компоненты
2. **Итерация**: Улучши на основе обратной связи
3. **Публикация**: Опубликуй библиотеку для команды
4. **Обновления**: Регулярно обновляй дизайн-систему

---

**Готово!** Теперь у тебя есть полноценная дизайн-система в Figma, готовая для создания новых дизайнов и прототипов! 🎉
