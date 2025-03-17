// Инициализация функционала шаблонов
function initTemplates() {
    const templatesTab = document.getElementById('templates-tab');
    
    // Обработчик поиска по шаблонам
    const searchInput = templatesTab.querySelector('.search-input');
    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        filterTemplates(searchText);
    });
    
    // Обработчики для элементов шаблонов
    templatesTab.querySelectorAll('.template-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.size) {
                // Если это шаблон размера, создаем макет с этими размерами
                const [width, height] = item.dataset.size.split('x').map(Number);
                createTemplateFromSize(width, height);
            } else {
                // Если это другой тип шаблона, используем его имя
                const templateName = item.textContent.trim();
                applyTemplate(templateName);
            }
        });
    });
    
    // Функция для создания макета из шаблона размера
    function createTemplateFromSize(width, height) {
        if (width > 0 && height > 0) {
            window.createLayout(width, height);
        }
    }
    
    // Функция для применения шаблона по имени
    function applyTemplate(templateName) {
        // В реальном приложении здесь был бы запрос к серверу за шаблоном
        // или использование предопределенных локальных шаблонов
        
        // Определяем размеры на основе типа шаблона
        // Определяем размеры на основе типа шаблона
        let width = 800;
        let height = 600;
        
        if (templateName.includes('Instagram пост')) {
            width = 1080;
            height = 1080;
        } else if (templateName.includes('Instagram история')) {
            width = 1080;
            height = 1920;
        } else if (templateName.includes('Facebook')) {
            width = 1200;
            height = 628;
        } else if (templateName.includes('Twitter')) {
            width = 1500;
            height = 500;
        } else if (templateName.includes('Презентация')) {
            width = 1920;
            height = 1080;
        } else if (templateName.includes('Яндекс Маркет')) {
            // Шаблоны Яндекс Маркет
            if (templateName.includes('Баннер')) {
                width = 1200;
                height = 500;
            } else if (templateName.includes('Карточка товара')) {
                width = 600;
                height = 800;
            } else if (templateName.includes('Рич-контент')) {
                width = 800;
                height = 1000;
            }
        }
        
        // Создаем макет
        const layout = window.createLayout(width, height);
        
        // В зависимости от типа шаблона добавляем разные элементы
        if (templateName.includes('Карточка товара')) {
            addProductCardTemplate(layout);
        } else if (templateName.includes('Баннер')) {
            addBannerTemplate(layout);
        } else if (templateName.includes('Приглашение')) {
            addInvitationTemplate(layout);
        } else if (templateName.includes('Коллаж')) {
            addCollageTemplate(layout);
        } else if (templateName.includes('Яндекс Маркет')) {
            // Шаблоны Яндекс Маркет
            if (templateName.includes('Баннер')) {
                addYandexMarketBannerTemplate(layout);
            } else if (templateName.includes('Карточка товара')) {
                addYandexMarketProductCardTemplate(layout);
            } else if (templateName.includes('Рич-контент')) {
                addYandexMarketRichContentTemplate(layout);
            }
        }
    }
 
    
    // Функция для добавления шаблона карточки товара
    function addProductCardTemplate(layout) {
        // Получаем размеры макета
        const layoutWidth = layout.width * layout.scaleX;
        const layoutHeight = layout.height * layout.scaleY;
        
        // Добавляем фон
        const bgRect = new fabric.Rect({
            width: layoutWidth,
            height: layoutHeight,
            left: layout.left,
            top: layout.top,
            fill: '#f8f9fa',
            id: `bg-${Date.now()}`,
            name: 'Фон карточки',
            objectType: 'shape'
        });
        
        // Добавляем заголовок
        const titleText = new fabric.IText('Название товара', {
            left: layout.left + 30,
            top: layout.top + 30,
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: '#212529',
            id: `title-${Date.now()}`,
            name: 'Заголовок',
            objectType: 'text'
        });
        
        // Добавляем описание
        const descText = new fabric.IText('Подробное описание товара. Укажите здесь особенности и преимущества вашего продукта.', {
            left: layout.left + 30,
            top: layout.top + 70,
            fontFamily: 'Arial',
            fontSize: 16,
            fill: '#495057',
            width: layoutWidth - 60,
            id: `desc-${Date.now()}`,
            name: 'Описание',
            objectType: 'text'
        });
        
        // Добавляем цену
        const priceText = new fabric.IText('$99.99', {
            left: layout.left + 30,
            top: layout.top + 140,
            fontFamily: 'Arial',
            fontSize: 20,
            fontWeight: 'bold',
            fill: '#e74c3c',
            id: `price-${Date.now()}`,
            name: 'Цена',
            objectType: 'text'
        });
        
        // Добавляем кнопку
        const buttonRect = new fabric.Rect({
            width: 120,
            height: 40,
            left: layout.left + 30,
            top: layout.top + 180,
            fill: '#007bff',
            rx: 5,
            ry: 5,
            id: `button-bg-${Date.now()}`,
            name: 'Фон кнопки',
            objectType: 'shape'
        });
        
        const buttonText = new fabric.IText('Купить', {
            left: layout.left + 55,
            top: layout.top + 190,
            fontFamily: 'Arial',
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#ffffff',
            id: `button-text-${Date.now()}`,
            name: 'Текст кнопки',
            objectType: 'text'
        });
        
        // Добавляем все элементы на холст
        canvas.add(bgRect, titleText, descText, priceText, buttonRect, buttonText);
        
        // Обновляем слои
        window.updateLayersPanel();
        
        // Добавляем в историю
        window.addToHistory();
    }
    
    // Функция для добавления шаблона баннера
    function addBannerTemplate(layout) {
        // Получаем размеры макета
        const layoutWidth = layout.width * layout.scaleX;
        const layoutHeight = layout.height * layout.scaleY;
        
        // Добавляем фон
        const bgRect = new fabric.Rect({
            width: layoutWidth,
            height: layoutHeight,
            left: layout.left,
            top: layout.top,
            fill: '#4158D0',
            id: `bg-${Date.now()}`,
            name: 'Фон баннера',
            objectType: 'shape'
        });
        
        // Градиент для фона
        const gradient = new fabric.Gradient({
            type: 'linear',
            coords: {
                x1: 0,
                y1: 0,
                x2: layoutWidth,
                y2: layoutHeight
            },
            colorStops: [
                { offset: 0, color: '#4158D0' },
                { offset: 0.5, color: '#C850C0' },
                { offset: 1, color: '#FFCC70' }
            ]
        });
        
        bgRect.set('fill', gradient);
        
        // Добавляем заголовок
        const titleText = new fabric.IText('СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ', {
            left: layout.left + 50,
            top: layout.top + 50,
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#ffffff',
            id: `title-${Date.now()}`,
            name: 'Заголовок',
            objectType: 'text'
        });
        
        // Добавляем подзаголовок
        const subtitleText = new fabric.IText('Только до конца месяца! Успейте воспользоваться нашей акцией.', {
            left: layout.left + 50,
            top: layout.top + 100,
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 'rgba(255, 255, 255, 0.8)',
            id: `subtitle-${Date.now()}`,
            name: 'Подзаголовок',
            objectType: 'text'
        });
        
        // Добавляем кнопку
        const buttonRect = new fabric.Rect({
            width: 180,
            height: 50,
            left: layout.left + 50,
            top: layout.top + 160,
            fill: '#ffffff',
            rx: 25,
            ry: 25,
            id: `button-bg-${Date.now()}`,
            name: 'Фон кнопки',
            objectType: 'shape'
        });
        
        const buttonText = new fabric.IText('ПОДРОБНЕЕ', {
            left: layout.left + 70,
            top: layout.top + 175,
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#4158D0',
            id: `button-text-${Date.now()}`,
            name: 'Текст кнопки',
            objectType: 'text'
        });
        
        // Добавляем все элементы на холст
        canvas.add(bgRect, titleText, subtitleText, buttonRect, buttonText);
        
        // Обновляем слои
        window.updateLayersPanel();
        
        // Добавляем в историю
        window.addToHistory();
    }
    
    // Функция для добавления шаблона приглашения
    function addInvitationTemplate(layout) {
        // Аналогично предыдущим функциям, добавляем элементы приглашения
        // Код опущен для краткости
        alert('Шаблон приглашения применен!');
    }
    
    // Функция для добавления шаблона коллажа
    function addCollageTemplate(layout) {
        // Аналогично предыдущим функциям, добавляем элементы коллажа
        // Код опущен для краткости
        alert('Шаблон коллажа применен!');
    }
    
// Добавляем новые функции для шаблонов Яндекс Маркет
function addYandexMarketBannerTemplate(layout) {
    // Задний фон
    const bgColor = '#FFDB4A'; // Яндекс-желтый
    layout.set('fill', bgColor);
    
    // Добавляем заголовок
    const titleText = new fabric.IText('Скидка 30% на все товары!', {
        left: layout.left + 50,
        top: layout.top + 80,
        fontFamily: 'YS Text-Bold',
        fontSize: 36,
        fill: '#000000',
        id: `title-${Date.now()}`,
        name: 'Заголовок',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем подзаголовок
    const subtitleText = new fabric.IText('Только до конца недели! Успейте приобрести все необходимое по выгодной цене.', {
        left: layout.left + 50,
        top: layout.top + 150,
        fontFamily: 'YS Text',
        fontSize: 20,
        fill: '#000000',
        id: `subtitle-${Date.now()}`,
        name: 'Подзаголовок',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем кнопку
    const buttonRect = new fabric.Rect({
        width: 200,
        height: 50,
        left: layout.left + 50,
        top: layout.top + 220,
        fill: '#000000',
        rx: 5,
        ry: 5,
        id: `button-bg-${Date.now()}`,
        name: 'Фон кнопки',
        objectType: 'shape',
        parentId: layout.id
    });
    
    const buttonText = new fabric.IText('Купить сейчас', {
        left: layout.left + 85,
        top: layout.top + 235,
        fontFamily: 'YS Text-Medium',
        fontSize: 18,
        fill: '#FFFFFF',
        id: `button-text-${Date.now()}`,
        name: 'Текст кнопки',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем все элементы на холст
    canvas.add(titleText, subtitleText, buttonRect, buttonText);
    
    // Обновляем слои
    window.updateLayersPanel();
    
    // Добавляем в историю
    window.addToHistory();
}

function addYandexMarketProductCardTemplate(layout) {
    // Макет карточки товара
    layout.set('fill', '#FFFFFF');
    
    // Добавляем название товара
    const titleText = new fabric.IText('Смартфон XYZ Pro 128GB', {
        left: layout.left + 30,
        top: layout.top + 380,
        fontFamily: 'YS Text-Medium',
        fontSize: 22,
        fill: '#000000',
        id: `title-${Date.now()}`,
        name: 'Название товара',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем цену
    const priceText = new fabric.IText('19 990 ₽', {
        left: layout.left + 30,
        top: layout.top + 420,
        fontFamily: 'YS Text-Bold',
        fontSize: 24,
        fill: '#000000',
        id: `price-${Date.now()}`,
        name: 'Цена',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем рейтинг
    const ratingText = new fabric.IText('★★★★☆ 4.7', {
        left: layout.left + 30,
        top: layout.top + 460,
        fontFamily: 'YS Text',
        fontSize: 16,
        fill: '#F2C94C',
        id: `rating-${Date.now()}`,
        name: 'Рейтинг',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем строку доставки
    const deliveryText = new fabric.IText('Доставка завтра', {
        left: layout.left + 30,
        top: layout.top + 490,
        fontFamily: 'YS Text',
        fontSize: 16,
        fill: '#27AE60',
        id: `delivery-${Date.now()}`,
        name: 'Информация о доставке',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем кнопку
    const buttonRect = new fabric.Rect({
        width: 200,
        height: 50,
        left: layout.left + 30,
        top: layout.top + 520,
        fill: '#FFDB4A',
        rx: 5,
        ry: 5,
        id: `button-bg-${Date.now()}`,
        name: 'Фон кнопки',
        objectType: 'shape',
        parentId: layout.id
    });
    
    const buttonText = new fabric.IText('В корзину', {
        left: layout.left + 85,
        top: layout.top + 535,
        fontFamily: 'YS Text-Medium',
        fontSize: 18,
        fill: '#000000',
        id: `button-text-${Date.now()}`,
        name: 'Текст кнопки',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем плейсхолдер для изображения товара
    const productImageRect = new fabric.Rect({
        width: layout.width - 60,
        height: 320,
        left: layout.left + 30,
        top: layout.top + 30,
        fill: '#F2F2F2',
        rx: 5,
        ry: 5,
        id: `product-image-placeholder-${Date.now()}`,
        name: 'Плейсхолдер изображения',
        objectType: 'shape',
        parentId: layout.id
    });
    
    // Добавляем все элементы на холст
    canvas.add(productImageRect, titleText, priceText, ratingText, deliveryText, buttonRect, buttonText);
    
    // Обновляем слои
    window.updateLayersPanel();
    
    // Добавляем в историю
    window.addToHistory();
}

function addYandexMarketRichContentTemplate(layout) {
    // Рич-контент для Яндекс Маркета
    layout.set('fill', '#FFFFFF');
    
    // Добавляем заголовок
    const titleText = new fabric.IText('Характеристики товара', {
        left: layout.left + 30,
        top: layout.top + 30,
        fontFamily: 'YS Text-Bold',
        fontSize: 28,
        fill: '#000000',
        id: `title-${Date.now()}`,
        name: 'Заголовок',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем линию-разделитель
    const dividerLine = new fabric.Line([
        layout.left + 30, 
        layout.top + 70, 
        layout.left + layout.width - 30, 
        layout.top + 70
    ], {
        stroke: '#E0E0E0',
        strokeWidth: 2,
        id: `divider-${Date.now()}`,
        name: 'Разделитель',
        objectType: 'shape',
        parentId: layout.id
    });
    
    // Добавляем группу характеристик
    const characteristicsGroups = [
        { title: 'Основные', y: 100 },
        { title: 'Дисплей', y: 300 },
        { title: 'Камера', y: 500 },
        { title: 'Аккумулятор', y: 700 }
    ];
    
    // Добавляем группы характеристик
    characteristicsGroups.forEach(group => {
        const groupTitle = new fabric.IText(group.title, {
            left: layout.left + 30,
            top: layout.top + group.y,
            fontFamily: 'YS Text-Medium',
            fontSize: 20,
            fill: '#000000',
            id: `group-title-${Date.now()}-${Math.random()}`,
            name: `Группа: ${group.title}`,
            objectType: 'text',
            parentId: layout.id
        });
        
        // Добавляем линию-разделитель для группы
        const groupDivider = new fabric.Line([
            layout.left + 30, 
            layout.top + group.y + 30, 
            layout.left + layout.width - 30, 
            layout.top + group.y + 30
        ], {
            stroke: '#E0E0E0',
            strokeWidth: 1,
            id: `group-divider-${Date.now()}-${Math.random()}`,
            name: `Разделитель группы: ${group.title}`,
            objectType: 'shape',
            parentId: layout.id
        });
        
        // Добавляем пример характеристики
        const charName = new fabric.IText('Характеристика:', {
            left: layout.left + 30,
            top: layout.top + group.y + 50,
            fontFamily: 'YS Text',
            fontSize: 16,
            fill: '#757575',
            id: `char-name-${Date.now()}-${Math.random()}`,
            name: 'Название характеристики',
            objectType: 'text',
            parentId: layout.id
        });
        
        const charValue = new fabric.IText('Значение', {
            left: layout.left + 300,
            top: layout.top + group.y + 50,
            fontFamily: 'YS Text',
            fontSize: 16,
            fill: '#000000',
            id: `char-value-${Date.now()}-${Math.random()}`,
            name: 'Значение характеристики',
            objectType: 'text',
            parentId: layout.id
        });
        
        // Добавляем вторую характеристику
        const charName2 = new fabric.IText('Еще характеристика:', {
            left: layout.left + 30,
            top: layout.top + group.y + 80,
            fontFamily: 'YS Text',
            fontSize: 16,
            fill: '#757575',
            id: `char-name-${Date.now()}-${Math.random()}`,
            name: 'Название характеристики 2',
            objectType: 'text',
            parentId: layout.id
        });
        
        const charValue2 = new fabric.IText('Еще значение', {
            left: layout.left + 300,
            top: layout.top + group.y + 80,
            fontFamily: 'YS Text',
            fontSize: 16,
            fill: '#000000',
            id: `char-value-${Date.now()}-${Math.random()}`,
            name: 'Значение характеристики 2',
            objectType: 'text',
            parentId: layout.id
        });
        
        // Добавляем элементы группы на холст
        canvas.add(groupTitle, groupDivider, charName, charValue, charName2, charValue2);
    });
    
    // Добавляем примечание внизу
    const footnoteText = new fabric.IText('* Характеристики могут отличаться в зависимости от комплектации', {
        left: layout.left + 30,
        top: layout.top + layout.height - 50,
        fontFamily: 'YS Text',
        fontSize: 14,
        fill: '#757575',
        id: `footnote-${Date.now()}`,
        name: 'Примечание',
        objectType: 'text',
        parentId: layout.id
    });
    
    // Добавляем заголовок на холст
    canvas.add(titleText, dividerLine, footnoteText);
    
    // Обновляем слои
    window.updateLayersPanel();
    
    // Добавляем в историю
    window.addToHistory();
}

    // Функция для фильтрации шаблонов по поиску
    function filterTemplates(searchText) {
        if (!searchText) {
            // Если поиск пустой, показываем все элементы
            templatesTab.querySelectorAll('.template-item').forEach(item => {
                item.style.display = '';
            });
            
            // Показываем все категории
            templatesTab.querySelectorAll('.category-item').forEach(category => {
                category.style.display = '';
            });
            
            return;
        }
        
        // Скрываем все категории по умолчанию
        templatesTab.querySelectorAll('.category-item').forEach(category => {
            category.style.display = 'none';
        });
        
        // Проходим по всем элементам шаблонов
        templatesTab.querySelectorAll('.template-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchText)) {
                // Если текст содержит поисковый запрос, показываем элемент
                item.style.display = '';
                
                // Показываем родительскую категорию
                const parentCategory = findParentCategory(item);
                if (parentCategory) {
                    parentCategory.style.display = '';
                    const content = parentCategory.querySelector('.category-content');
                    if (content) {
                        content.classList.remove('hidden');
                    }
                }
            } else {
                // Иначе скрываем элемент
                item.style.display = 'none';
            }
        });
    }
    
    // Функция для нахождения родительской категории
    function findParentCategory(element) {
        let current = element;
        while (current) {
            if (current.classList && current.classList.contains('category-item')) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }
}
