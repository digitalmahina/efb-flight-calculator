# 🚀 Полное руководство по созданию EFB Flight Calculator в Figma

## 📋 Обзор
Это руководство поможет тебе создать **полный интерфейс EFB Flight Calculator** в Figma, используя нашу дизайн-систему и токены.

## 🎯 Что мы создадим
- ✅ **Header** - шапка с логотипом и навигацией
- ✅ **Flight Data Panel** - панель ввода данных полета
- ✅ **Map Panel** - интерактивная карта маршрута
- ✅ **Route Panel** - детали маршрута
- ✅ **Weather Panel** - информация о погоде
- ✅ **Control Buttons** - кнопки управления
- ✅ **Desktop Layout** - основной макет
- ✅ **Mobile Layout** - мобильная версия
- ✅ **Loading/Error States** - состояния загрузки и ошибок

---

## 🛠️ Шаг 1: Подготовка Figma

### 1.1 Создай новый файл
1. Открой Figma
2. Создай новый файл: `EFB Flight Calculator - Complete Interface`
3. Установи размер холста: **1920x1080px** (Desktop)

### 1.2 Импортируй токены (если еще не сделал)
1. Открой плагин **"Tokens Studio for Figma"**
2. Импортируй файлы:
   - `tokens-studio-import.json`
   - `tokens-studio-semantic.json`
3. Нажми **"Apply to document"**

---

## 🎨 Шаг 2: Создание компонентов

### 2.1 Header Component

#### Создай фрейм:
- **Размер**: 1920x80px
- **Фон**: `semantic.color.background.primary`
- **Обводка**: `semantic.border.primary`
- **Отступы**: 24px со всех сторон

#### Добавь элементы:
1. **Логотип "EFB"**:
   - Шрифт: JetBrains Mono, 32px, Bold
   - Цвет: `semantic.color.accent.primary`
   - Позиция: x=24, y=20

2. **Заголовок "Flight Calculator v2.0"**:
   - Шрифт: Inter, 16px, Regular
   - Цвет: `semantic.color.text.secondary`
   - Позиция: x=80, y=25

3. **Кнопка "Settings"**:
   - Размер: 100x40px
   - Фон: `semantic.color.background.secondary`
   - Обводка: `semantic.border.primary`
   - Позиция: x=1796, y=20

### 2.2 Flight Data Panel

#### Создай фрейм:
- **Размер**: 400x600px
- **Фон**: `semantic.color.background.secondary`
- **Обводка**: `semantic.border.primary`
- **Скругление**: `semantic.borderRadius.lg`
- **Отступы**: 24px

#### Добавь элементы:
1. **Заголовок "Flight Data"**:
   - Шрифт: Inter, 20px, SemiBold
   - Цвет: `semantic.color.text.primary`

2. **Поля ввода** (4 штуки):
   - Departure Airport
   - Arrival Airport
   - Aircraft Type
   - Fuel Capacity
   - Размер каждого: 352x60px
   - Фон: `semantic.color.background.tertiary`
   - Обводка: `semantic.border.primary`

3. **Кнопка "Calculate Flight"**:
   - Размер: 352x48px
   - Фон: `semantic.color.accent.primary`
   - Текст: черный, Inter, 16px, SemiBold

4. **Карточки данных** (3 штуки):
   - Distance, Flight Time, Fuel Required
   - Размер каждой: 160x80px
   - Фон: `semantic.color.background.primary`
   - Обводка: `semantic.border.primary`

### 2.3 Map Panel

#### Создай фрейм:
- **Размер**: 600x400px
- **Фон**: `semantic.color.background.tertiary`
- **Обводка**: `semantic.border.primary`
- **Скругление**: `semantic.borderRadius.lg`

#### Добавь элементы:
1. **Заголовок "Route Map"**:
   - Шрифт: Inter, 20px, SemiBold
   - Цвет: `semantic.color.text.primary`
   - Позиция: x=20, y=20

2. **Область карты**:
   - Размер: 560x300px
   - Фон: `semantic.color.background.primary`
   - Обводка: `semantic.border.secondary`
   - Позиция: x=20, y=60

3. **Элементы карты**:
   - Сетка карты (вектор)
   - Линия маршрута (зеленая, 3px)
   - Маркеры waypoints

4. **Контролы карты**:
   - Zoom In/Out, Center
   - Размер каждого: 40x40px
   - Фон: полупрозрачный черный
   - Позиция: x=520, y=20

### 2.4 Route Panel

#### Создай фрейм:
- **Размер**: 400x400px
- **Фон**: `semantic.color.background.secondary`
- **Обводка**: `semantic.border.primary`
- **Скругление**: `semantic.borderRadius.lg`
- **Отступы**: 24px

#### Добавь элементы:
1. **Заголовок "Route Details"**:
   - Шрифт: Inter, 20px, SemiBold
   - Цвет: `semantic.color.text.primary`

2. **Список маршрута**:
   - Waypoint: EDDF - Frankfurt Airport
   - Distance: 0 nm, Bearing: 000°
   - Waypoint: EDDM - Munich Airport
   - Distance: 185 nm, Bearing: 135°

### 2.5 Weather Panel

#### Создай фрейм:
- **Размер**: 400x300px
- **Фон**: `semantic.color.background.secondary`
- **Обводка**: `semantic.border.primary`
- **Скругление**: `semantic.borderRadius.lg`
- **Отступы**: 24px

#### Добавь элементы:
1. **Заголовок "Weather"**:
   - Шрифт: Inter, 20px, SemiBold
   - Цвет: `semantic.color.text.primary`

2. **Карточки погоды**:
   - Current Conditions
   - Route Forecast
   - Размер каждой: 352x80px

### 2.6 Control Buttons

#### Создай фрейм:
- **Размер**: 1920x80px
- **Фон**: `semantic.color.background.primary`
- **Обводка**: `semantic.border.primary`
- **Отступы**: 20px

#### Добавь кнопки:
1. **"Load GPX Route"** - Primary стиль
2. **"Export Data"** - Secondary стиль
3. **"Clear Route"** - Secondary стиль
4. **"Help"** - Secondary стиль

---

## 📱 Шаг 3: Создание экранов

### 3.1 Desktop Layout

#### Создай основной фрейм:
- **Размер**: 1920x1080px
- **Фон**: `semantic.color.background.primary`

#### Расположи компоненты:
1. **Header**: верх, на всю ширину
2. **Flight Data Panel**: левый верх
3. **Map Panel**: центр
4. **Route Panel**: правый верх
5. **Weather Panel**: левый низ
6. **Control Buttons**: низ, на всю ширину

### 3.2 Mobile Layout

#### Создай мобильный фрейм:
- **Размер**: 375x812px
- **Фон**: `semantic.color.background.primary`

#### Расположи компоненты вертикально:
1. Header (60px)
2. Flight Data Panel (300px)
3. Map Panel (250px)
4. Route Panel (200px)
5. Weather Panel (150px)
6. Control Buttons (60px)

### 3.3 Loading State

#### Создай фрейм:
- **Размер**: 1920x1080px
- **Фон**: `semantic.color.background.primary`

#### Добавь элементы:
1. **Спиннер загрузки**:
   - Размер: 60x60px
   - Цвет: `semantic.color.accent.primary`
   - Позиция: центр экрана

2. **Текст "Loading Flight Data..."**:
   - Шрифт: Inter, 18px, Regular
   - Цвет: `semantic.color.text.primary`
   - Позиция: под спиннером

3. **Прогресс-бар**:
   - Размер: 300x8px
   - Прогресс: 75%
   - Позиция: под текстом

### 3.4 Error State

#### Создай фрейм:
- **Размер**: 1920x1080px
- **Фон**: `semantic.color.background.primary`

#### Добавь элементы:
1. **Иконка ошибки**:
   - Размер: 80x80px
   - Цвет: `semantic.color.status.error`
   - Позиция: центр экрана

2. **Заголовок "Error Loading Data"**:
   - Шрифт: Inter, 24px, SemiBold
   - Цвет: `semantic.color.text.primary`

3. **Описание ошибки**:
   - Шрифт: Inter, 16px, Regular
   - Цвет: `semantic.color.text.secondary`

4. **Кнопка "Retry"**:
   - Стиль: Primary
   - Позиция: под описанием

---

## 🎨 Шаг 4: Применение токенов

### 4.1 Используй Inspect
1. Выбери любой элемент
2. Открой страницу **"Inspect"** в Tokens Studio
3. Проверь примененные токены
4. Исправь сломанные ссылки

### 4.2 Применяй токены к элементам
1. Выбери элемент
2. В Tokens Studio найди нужный токен
3. Примени токен к свойству элемента
4. Повтори для всех элементов

---

## 📚 Шаг 5: Создание библиотеки компонентов

### 5.1 Создай компоненты
1. Выбери каждый созданный фрейм
2. Нажми **"Create Component"** (Ctrl+Alt+K)
3. Назови компонент согласно спецификации

### 5.2 Настрой библиотеку
1. Создай **"Components"** страницу
2. Перенеси все компоненты на эту страницу
3. Организуй по категориям:
   - Layout
   - Forms
   - Data Display
   - Navigation
   - Feedback

### 5.3 Создай документацию
1. Добавь описания к каждому компоненту
2. Укажи варианты использования
3. Добавь примеры состояний

---

## ✅ Шаг 6: Финальная проверка

### 6.1 Проверь токены
- [ ] Все цвета применены правильно
- [ ] Типографика соответствует токенам
- [ ] Отступы и размеры корректны
- [ ] Нет сломанных ссылок

### 6.2 Проверь компоненты
- [ ] Все компоненты созданы
- [ ] Варианты работают корректно
- [ ] Состояния отображаются правильно
- [ ] Адаптивность настроена

### 6.3 Проверь экраны
- [ ] Desktop layout корректен
- [ ] Mobile layout адаптивен
- [ ] Loading state работает
- [ ] Error state отображается

---

## 🚀 Готово!

Теперь у тебя есть **полный интерфейс EFB Flight Calculator** в Figma с:
- ✅ Все компоненты
- ✅ Все экраны
- ✅ Примененные токены
- ✅ Адаптивный дизайн
- ✅ Состояния загрузки и ошибок

**Следующий шаг**: Используй этот интерфейс для разработки или презентации! 🎯
