// Инициализация панели свойств
function initProperties() {
    // Инициализируем панель свойств
    setupPropertyGroups();
    
    // Обновляем панель свойств при выборе объекта
    canvas.on('selection:created', updatePropertiesPanel);
    canvas.on('selection:updated', updatePropertiesPanel);
    canvas.on('selection:cleared', clearPropertiesPanel);
    
    // Инициализация обработчиков для свойств
    initPropertyHandlers();
}

// Настройка групп свойств
function setupPropertyGroups() {
    // Добавляем обработчики для заголовков групп свойств
    document.querySelectorAll('.property-group h4').forEach(header => {
        header.addEventListener('click', () => {
            const group = header.parentElement;
            group.classList.toggle('expanded');
        });
    });
    
    // По умолчанию разворачиваем группу позиции и размера
    document.getElementById('position-properties').classList.add('expanded');
}

// Функция обновления панели свойств
function updatePropertiesPanel() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
        clearPropertiesPanel();
        return;
    }
    
    // Скрываем все группы свойств
    document.querySelectorAll('.property-group').forEach(group => {
        group.classList.add('hidden');
        group.classList.remove('expanded');
    });
    
    // Показываем группу позиции для всех объектов
    const positionGroup = document.getElementById('position-properties');
    positionGroup.classList.remove('hidden');
    positionGroup.classList.add('expanded');
    
    // Заполняем значения позиции
    document.getElementById('position-x').value = Math.round(activeObject.left);
    document.getElementById('position-y').value = Math.round(activeObject.top);
    
    // Заполняем значения размера
    let objectWidth, objectHeight;
    
    if (activeObject.type === 'activeSelection' || activeObject.type === 'group') {
        // Для группы или выделения используем размеры bounding box
        const boundingRect = activeObject.getBoundingRect();
        objectWidth = boundingRect.width;
        objectHeight = boundingRect.height;
    } else {
        // Для обычных объектов
        objectWidth = activeObject.width * activeObject.scaleX;
        objectHeight = activeObject.height * activeObject.scaleY;
    }
    
    document.getElementById('size-width').value = Math.round(objectWidth);
    document.getElementById('size-height').value = Math.round(objectHeight);
    
    // Заполняем значение поворота
    document.getElementById('rotation').value = Math.round(activeObject.angle);
    
    // Показываем специфичные свойства в зависимости от типа объекта
    if (activeObject.type === 'layout' || activeObject.objectType === 'layout') {
        showLayoutProperties(activeObject);
    }
    else if (activeObject.type === 'i-text' || activeObject.objectType === 'text') {
        showTextProperties(activeObject);
    } 
    else if (activeObject.objectType === 'shape' || ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(activeObject.type)) {
        showShapeProperties(activeObject);
    }
    else if (activeObject.objectType === 'image' || activeObject.type === 'image') {
        showImageProperties(activeObject);
    }
    else if (activeObject.type === 'path') {
        showPathProperties(activeObject);
    }
}
    // И добавим новую функцию для свойств нарисованного
    function showPathProperties(pathObj) {
        const shapeGroup = document.getElementById('shape-properties');
        shapeGroup.classList.remove('hidden');
        shapeGroup.classList.add('expanded');
        
        // Заполняем значения свойств пути
        document.getElementById('fill-color').value = rgbToHex(pathObj.fill || 'transparent');
        document.getElementById('stroke-color').value = rgbToHex(pathObj.stroke || '#000000');
        document.getElementById('stroke-width').value = pathObj.strokeWidth || 1;
    }


// Очистка панели свойств
function clearPropertiesPanel() {
    document.querySelectorAll('.property-group').forEach(group => {
        group.classList.add('hidden');
    });
}

// Показ свойств текста
function showTextProperties(textObj) {
    const textGroup = document.getElementById('text-properties');
    textGroup.classList.remove('hidden');
    textGroup.classList.add('expanded');
    
    // Добавляем YS Text шрифты в селектор
    const fontSelector = document.getElementById('font-family');
    
    // Очищаем существующие опции
    fontSelector.innerHTML = '';
    
    // Добавляем стандартные и YS Text шрифты
    const fonts = [
        { value: 'Arial', label: 'Arial' },
        { value: 'Helvetica', label: 'Helvetica' },
        { value: 'Times New Roman', label: 'Times New Roman' },
        { value: 'YS Text', label: 'YS Text (обычный)' },
        { value: 'YS Text-Thin', label: 'YS Text Thin' },
        { value: 'YS Text-Light', label: 'YS Text Light' },
        { value: 'YS Text-Regular', label: 'YS Text Regular' },
        { value: 'YS Text-Medium', label: 'YS Text Medium' },
        { value: 'YS Text-Bold', label: 'YS Text Bold' }
    ];
    
    fonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font.value;
        option.textContent = font.label;
        fontSelector.appendChild(option);
    });
    
    // Выбираем текущий шрифт
    fontSelector.value = textObj.fontFamily || 'Arial';
    
    // Заполняем другие значения
    document.getElementById('font-size').value = textObj.fontSize || 16;
    document.getElementById('text-color').value = rgbToHex(textObj.fill || '#000000');
    
    // Устанавливаем активное выравнивание
    document.querySelectorAll('.align-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.align === textObj.textAlign);
    });
}

// Показ свойств фигуры
function showShapeProperties(shapeObj) {
    const shapeGroup = document.getElementById('shape-properties');
    shapeGroup.classList.remove('hidden');
    shapeGroup.classList.add('expanded');
    
    // Заполняем значения свойств фигуры
    document.getElementById('fill-color').value = rgbToHex(shapeObj.fill || '#ffffff');
    document.getElementById('stroke-color').value = rgbToHex(shapeObj.stroke || '#000000');
    document.getElementById('stroke-width').value = shapeObj.strokeWidth || 0;
}

// Показ свойств изображения
function showImageProperties(imageObj) {
    const imageGroup = document.getElementById('image-properties');
    imageGroup.classList.remove('hidden');
    imageGroup.classList.add('expanded');
    
    // Заполняем значения свойств изображения
    document.getElementById('image-opacity').value = imageObj.opacity || 1;
}


// Полная функция showLayoutProperties, которая заменяет существующую
function showLayoutProperties(layoutObj) {
    // Создадим и добавим группу свойств макета, если её нет
    if (!document.getElementById('layout-properties')) {
        const propertiesContent = document.querySelector('.properties-content');
        
        const layoutGroup = document.createElement('div');
        layoutGroup.className = 'property-group';
        layoutGroup.id = 'layout-properties';
        
        layoutGroup.innerHTML = `
            <h4>Фон макета</h4>
            <div class="property-group-content">
                <div class="property-row">
                    <label>Цвет фона</label>
                    <input type="color" id="layout-bg-color" value="#ffffff">
                </div>
                <div class="property-row bg-image-controls">

                    <button class="property-btn" id="layout-bg-image">
                        <span class="material-icons">image</span>
                        <span>Фоновое фото</span>
                    </button>
                </div>
                <div class="property-row bg-image-settings hidden" id="bg-image-settings">
                    <div class="bg-image-preview">
                        <div class="preview-container" id="bg-preview-container">
                            <img id="bg-preview-image" src="" alt="Preview">
                        </div>
                        <button class="property-btn small-btn remove-bg-btn" id="layout-bg-remove-image">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                    <div class="bg-image-options">
                        <div class="property-row mini">
                            <label>Тип заливки</label>
                            <select id="bg-image-type">
                                <option value="stretch">Растянуть</option>
                                <option value="cover">Заполнить</option>
                                <option value="contain">Вписать</option>
                                <option value="repeat">Повторить</option>
                            </select>
                        </div>
                        <div class="property-row mini" id="bg-position-control">
                            <label>Позиция</label>
                            <div class="position-controls">
                                <button class="position-btn" data-pos="left top"><span class="material-icons">north_west</span></button>
                                <button class="position-btn" data-pos="center top"><span class="material-icons">north</span></button>
                                <button class="position-btn" data-pos="right top"><span class="material-icons">north_east</span></button>
                                <button class="position-btn" data-pos="left center"><span class="material-icons">west</span></button>
                                <button class="position-btn" data-pos="center center"><span class="material-icons">adjust</span></button>
                                <button class="position-btn" data-pos="right center"><span class="material-icons">east</span></button>
                                <button class="position-btn" data-pos="left bottom"><span class="material-icons">south_west</span></button>
                                <button class="position-btn" data-pos="center bottom"><span class="material-icons">south</span></button>
                                <button class="position-btn" data-pos="right bottom"><span class="material-icons">south_east</span></button>
                            </div>
                        </div>
                        <div class="property-row mini">
                            <label>Прозрачность</label>
                            <div class="opacity-slider">
                                <input type="range" id="bg-image-opacity" min="0" max="1" step="0.05" value="1">
                                <span id="opacity-value">100%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="property-row clipping-controls-row">
                    
                    <div class="clipping-controls">
                        <div class="switch">
                            <input type="checkbox" id="layout-content-clipping">
                            <span class="slider round"></span>
                        </div>
                        <div class="clipping-icon">
                            <span class="material-icons" id="clipping-icon">crop</span>
                        </div>
                    </div>
                    <label>Обрезка содержимого</label>
                </div>
            </div>
        `;
        
        // Добавляем перед группой позиции
        const positionGroup = document.getElementById('position-properties');
        propertiesContent.insertBefore(layoutGroup, positionGroup);
        
        // Добавляем обработчики
        
        // Обработчик для цвета фона
        document.getElementById('layout-bg-color').addEventListener('change', function(e) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && (activeObject.type === 'layout' || activeObject.objectType === 'layout')) {
                activeObject.set('fill', e.target.value);
                canvas.renderAll();
                
                // Если включено мультиредактирование
                if (window.editorState.multiEditEnabled) {
                    applyToAllLayouts(layout => layout.set('fill', e.target.value));
                }
                
                window.addToHistory();
            }
        });
        
        // Обработчик для добавления изображения
        document.getElementById('layout-bg-image').addEventListener('click', function() {
            const activeObject = canvas.getActiveObject();
            if (activeObject && (activeObject.type === 'layout' || activeObject.objectType === 'layout')) {
                // Создаем элемент выбора файла
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        
                        reader.onload = (event) => {
                            // Применяем изображение как фон макета
                            setLayoutBackgroundImage(activeObject, event.target.result);
                        };
                        
                        reader.readAsDataURL(file);
                    }
                    
                    // Удаляем input после использования
                    fileInput.remove();
                });
                
                fileInput.click();
            }
        });
        
        // Обработчик для удаления изображения
        document.getElementById('layout-bg-remove-image').addEventListener('click', function() {
            const activeObject = canvas.getActiveObject();
            if (activeObject && (activeObject.type === 'layout' || activeObject.objectType === 'layout')) {
                // Удаляем фоновое изображение
                activeObject.set({
                    backgroundImage: null,
                    _bgImageSettings: null
                });
                canvas.renderAll();
                
                // Скрываем настройки изображения
                document.getElementById('bg-image-settings').classList.add('hidden');
                
                // Если включено мультиредактирование
                if (window.editorState.multiEditEnabled) {
                    applyToAllLayouts(layout => {
                        layout.set({
                            backgroundImage: null,
                            _bgImageSettings: null
                        });
                    });
                }
                
                window.addToHistory();
            }
        });
        
        // Обработчик для типа заливки
        document.getElementById('bg-image-type').addEventListener('change', function(e) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.backgroundImage) {
                updateBgImageSettings(activeObject, { type: e.target.value });
            }
        });
        
        // Обработчик для прозрачности
        document.getElementById('bg-image-opacity').addEventListener('input', function(e) {
            const opacity = parseFloat(e.target.value);
            document.getElementById('opacity-value').textContent = Math.round(opacity * 100) + '%';
            
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.backgroundImage) {
                updateBgImageSettings(activeObject, { opacity: opacity });
            }
        });
        
        // Обработчики для кнопок позиции
        document.querySelectorAll('.position-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Удаляем активное состояние у всех кнопок
                document.querySelectorAll('.position-btn').forEach(b => b.classList.remove('active'));
                // Добавляем активное состояние нажатой кнопке
                this.classList.add('active');
                
                const position = this.dataset.pos;
                const activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.backgroundImage) {
                    updateBgImageSettings(activeObject, { position: position });
                }
            });
        });
        
        // Обработчик для обрезки содержимого
        document.getElementById('layout-content-clipping').addEventListener('change', function(e) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && (activeObject.type === 'layout' || activeObject.objectType === 'layout')) {
                toggleLayoutClipping(activeObject, e.target.checked);
                
                // Меняем иконку в зависимости от состояния
                const clippingIcon = document.getElementById('clipping-icon');
                clippingIcon.textContent = e.target.checked ? 'crop_free' : 'crop';
                
                // Добавляем класс для активного состояния
                const clippingControls = document.querySelector('.clipping-controls');
                clippingControls.classList.toggle('active', e.target.checked);
            }
        });
    }
    
    // Показываем группу свойств макета
    const layoutGroup = document.getElementById('layout-properties');
    layoutGroup.classList.remove('hidden');
    layoutGroup.classList.add('expanded');
    
    // Обновляем значения элементов управления в соответствии с текущими настройками макета
    document.getElementById('layout-bg-color').value = rgbToHex(layoutObj.fill || '#ffffff');
    
    // Проверяем наличие фонового изображения
    if (layoutObj.backgroundImage) {
        // Показываем настройки изображения
        const bgImageSettings = document.getElementById('bg-image-settings');
        bgImageSettings.classList.remove('hidden');
        
        // Обновляем превью изображения
        const previewImg = document.getElementById('bg-preview-image');
        previewImg.src = layoutObj.backgroundImage.getSrc();
        
        // Обновляем элементы управления в соответствии с сохраненными настройками
        const settings = layoutObj._bgImageSettings || {};
        
        if (settings.type) {
            document.getElementById('bg-image-type').value = settings.type;
        }
        
        document.getElementById('bg-image-opacity').value = settings.opacity !== undefined ? settings.opacity : 1;
        document.getElementById('opacity-value').textContent = Math.round((settings.opacity !== undefined ? settings.opacity : 1) * 100) + '%';
        
        // Обновляем активную кнопку позиции
        document.querySelectorAll('.position-btn').forEach(btn => btn.classList.remove('active'));
        if (settings.position) {
            const posBtn = document.querySelector(`.position-btn[data-pos="${settings.position}"]`);
            if (posBtn) posBtn.classList.add('active');
        } else {
            // По умолчанию - по центру
            const centerBtn = document.querySelector('.position-btn[data-pos="center center"]');
            if (centerBtn) centerBtn.classList.add('active');
        }
        
        // Показываем/скрываем элементы управления позицией в зависимости от типа заливки
        const bgPositionControl = document.getElementById('bg-position-control');
        bgPositionControl.style.display = settings.type === 'repeat' ? 'none' : 'flex';
    } else {
        // Скрываем настройки изображения, если его нет
        const bgImageSettings = document.getElementById('bg-image-settings');
        bgImageSettings.classList.add('hidden');
    }
    
    // Устанавливаем текущее значение переключателя обрезки
    const clippingCheckbox = document.getElementById('layout-content-clipping');
    if (clippingCheckbox) {
        clippingCheckbox.checked = layoutObj.clipChildrenObjects !== false; // По умолчанию true, если не указано явно
        
        // Обновляем иконку
        const clippingIcon = document.getElementById('clipping-icon');
        if (clippingIcon) {
            clippingIcon.textContent = layoutObj.clipChildrenObjects !== false ? 'crop_free' : 'crop';
            
            // Обновляем класс для активного состояния
            const clippingControls = document.querySelector('.clipping-controls');
            if (clippingControls) {
                clippingControls.classList.toggle('active', layoutObj.clipChildrenObjects !== false);
            }
        }
    }
}


// Добавим функцию для включения/выключения обрезки содержимого макета
function toggleLayoutClipping(layout, enabled) {
    // Устанавливаем флаг обрезки
    layout.clipChildrenObjects = enabled;
    
    // Получаем все объекты, принадлежащие макету
    const childObjects = canvas.getObjects().filter(obj => 
        obj !== layout && (
            obj.parentId === layout.id || 
            window.isObjectInsideLayout(obj, layout)
        )
    );
    
    if (enabled) {
        // Для режима обрезки используем clipPath, который более надежен
        
        // Создаем clipPath в виде прямоугольника по размеру макета
        const clipRect = new fabric.Rect({
            left: 0,
            top: 0,
            width: layout.width,
            height: layout.height,
            absolutePositioned: true,
            originX: 'center',
            originY: 'center'
        });
        
        // Устанавливаем визуальную границу для макета, чтобы было видно область обрезки
        layout.set({
            stroke: '#2196F3',
            strokeWidth: 2,
            strokeDashArray: [5, 5]
        });
        
        // Применяем clipPath к каждому дочернему объекту
        childObjects.forEach(obj => {
            // Создаем новый clipPath для каждого объекта, чтобы избежать конфликтов
            const objClipRect = new fabric.Rect({
                left: layout.left,
                top: layout.top,
                width: layout.width * layout.scaleX,
                height: layout.height * layout.scaleY,
                absolutePositioned: true
            });
            
            obj.clipPath = objClipRect;
            
            // Храним оригинальную информацию об объекте для возможности отмены
            obj._originalClipState = {
                hasClipPath: true
            };
        });
    } else {
        // Убираем визуальную границу
        layout.set({
            stroke: layout.stroke === '#2196F3' ? '' : layout.stroke,
            strokeWidth: layout.strokeWidth === 2 ? 0 : layout.strokeWidth,
            strokeDashArray: null
        });
        
        // Удаляем clipPath у каждого дочернего объекта
        childObjects.forEach(obj => {
            obj.clipPath = null;
            
            // Удаляем информацию о состоянии обрезки
            delete obj._originalClipState;
        });
    }
    
    // Обновляем canvas
    canvas.renderAll();
    
    // Если включено мультиредактирование
    if (window.editorState.multiEditEnabled) {
        // Применяем тот же режим обрезки к другим макетам
        const otherLayouts = canvas.getObjects().filter(obj => 
            obj !== layout && (obj.type === 'layout' || obj.objectType === 'layout')
        );
        
        otherLayouts.forEach(otherLayout => {
            // Вызываем ту же функцию для других макетов, но отключаем мультиредактирование временно,
            // чтобы избежать бесконечного цикла
            const originalMultiEdit = window.editorState.multiEditEnabled;
            window.editorState.multiEditEnabled = false;
            toggleLayoutClipping(otherLayout, enabled);
            window.editorState.multiEditEnabled = originalMultiEdit;
        });
    }
    
    // Добавляем изменение в историю
    window.addToHistory();
    
    // Обновляем видимость объектов при изменении размера/положения макета
    updateClipPathsOnLayoutChange(layout);
}

// Добавим функцию для обновления clipPath при изменении размера или положения макета
function updateClipPathsOnLayoutChange(layout) {
    if (!layout.clipChildrenObjects) return;
    
    // Добавляем обработчики событий на изменение макета
    layout.on('moving', updateClipPaths);
    layout.on('scaling', updateClipPaths);
    
    function updateClipPaths() {
        // Получаем все дочерние объекты с clipPath
        const childObjects = canvas.getObjects().filter(obj => 
            obj !== layout && 
            obj._originalClipState && 
            obj._originalClipState.hasClipPath &&
            (obj.parentId === layout.id || window.isObjectInsideLayout(obj, layout))
        );
        
        // Обновляем clipPath для каждого объекта
        childObjects.forEach(obj => {
            if (obj.clipPath) {
                obj.clipPath.set({
                    left: layout.left,
                    top: layout.top,
                    width: layout.width * layout.scaleX,
                    height: layout.height * layout.scaleY
                });
            }
        });
        
        canvas.requestRenderAll();
    }
}

// Вспомогательная функция для поиска макета по id
function findLayoutById(id) {
    return canvas.getObjects().find(obj => 
        obj.id === id && (obj.type === 'layout' || obj.objectType === 'layout')
    );
}

// Функция для установки фонового изображения макета
function setLayoutBackgroundImage(layout, imageUrl) {
    fabric.Image.fromURL(imageUrl, function(img) {
        // Сохраняем настройки по умолчанию
        const defaultSettings = {
            type: 'cover',
            position: 'center center',
            opacity: 1
        };
        
        // Применяем начальные настройки
        layout.set({
            fill: layout.fill, // Сохраняем текущий цвет фона
            _bgImageSettings: defaultSettings
        });
        
        // Применяем изображение и настройки
        applyBgImageWithSettings(layout, img, defaultSettings);
        
        // Обновляем превью и элементы управления
        const previewImg = document.getElementById('bg-preview-image');
        if (previewImg) previewImg.src = imageUrl;
        
        // Показываем настройки изображения
        const bgImageSettings = document.getElementById('bg-image-settings');
        if (bgImageSettings) bgImageSettings.classList.remove('hidden');
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            // Применяем то же изображение к другим макетам
            applyToAllLayouts(otherLayout => {
                if (otherLayout !== layout) {
                    fabric.Image.fromURL(imageUrl, function(otherImg) {
                        otherLayout.set({
                            _bgImageSettings: defaultSettings
                        });
                        applyBgImageWithSettings(otherLayout, otherImg, defaultSettings);
                    });
                }
            });
        }
        
        // Обновляем холст
        canvas.renderAll();
        window.addToHistory();
    });
}

// Функция для обновления настроек фонового изображения
function updateBgImageSettings(layout, newSettings) {
    // Получаем текущие настройки
    const currentSettings = layout._bgImageSettings || {
        type: 'cover',
        position: 'center center',
        opacity: 1
    };
    
    // Обновляем настройки
    const updatedSettings = { ...currentSettings, ...newSettings };
    layout._bgImageSettings = updatedSettings;
    
    // Получаем текущее изображение
    const currentImage = layout.backgroundImage;
    if (currentImage) {
        // Применяем обновленные настройки
        applyBgImageWithSettings(layout, currentImage, updatedSettings);
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            applyToAllLayouts(otherLayout => {
                if (otherLayout !== layout && otherLayout.backgroundImage) {
                    otherLayout._bgImageSettings = updatedSettings;
                    applyBgImageWithSettings(otherLayout, otherLayout.backgroundImage, updatedSettings);
                }
            });
        }
    }
    
    // Обновляем холст
    canvas.renderAll();
    window.addToHistory();
}

// Функция для применения изображения с настройками
function applyBgImageWithSettings(layout, img, settings) {
    // Стандартные настройки, если не указаны
    const type = settings.type || 'cover';
    const position = settings.position || 'center center';
    const opacity = settings.opacity !== undefined ? settings.opacity : 1;
    
    // Подготавливаем изображение в зависимости от типа заливки
    switch (type) {
        case 'stretch':
            // Растягиваем изображение по размеру макета
            img.scaleToWidth(layout.width);
            img.scaleToHeight(layout.height);
            break;
            
        case 'cover':
            // Заполняем макет изображением, сохраняя пропорции
            const scaleX = layout.width / img.width;
            const scaleY = layout.height / img.height;
            const scale = Math.max(scaleX, scaleY);
            img.scale(scale);
            break;
            
        case 'contain':
            // Вписываем изображение в макет, сохраняя пропорции
            const containScaleX = layout.width / img.width;
            const containScaleY = layout.height / img.height;
            const containScale = Math.min(containScaleX, containScaleY);
            img.scale(containScale);
            break;
            
        case 'repeat':
            // Создаем паттерн из изображения
            const patternSourceCanvas = document.createElement('canvas');
            const patternContext = patternSourceCanvas.getContext('2d');
            patternSourceCanvas.width = img.width;
            patternSourceCanvas.height = img.height;
            
            const imgElement = new Image();
            imgElement.src = img.getSrc();
            imgElement.onload = function() {
                patternContext.drawImage(imgElement, 0, 0);
                const pattern = new fabric.Pattern({
                    source: patternSourceCanvas,
                    repeat: 'repeat'
                });
                
                layout.set({
                    fill: pattern
                });
                
                canvas.renderAll();
            };
            return; // Выходим, так как паттерн будет применен в callback
    }
    
    // Позиционируем изображение в зависимости от настройки position
    // Для упрощения реализуем только для cover и contain
    if (type === 'cover' || type === 'contain') {
        // Разбираем позицию на компоненты
        const [hPos, vPos] = position.split(' ');
        
        // Вычисляем смещение по горизонтали
        let offsetX = 0;
        if (type === 'cover') {
            const imgWidth = img.width * img.scaleX;
            const overflow = imgWidth - layout.width;
            
            if (hPos === 'center') offsetX = overflow / 2;
            else if (hPos === 'right') offsetX = overflow;
        } else { // contain
            const imgWidth = img.width * img.scaleX;
            const emptySpace = layout.width - imgWidth;
            
            if (hPos === 'center') offsetX = -emptySpace / 2;
            else if (hPos === 'right') offsetX = -emptySpace;
        }
        
        // Вычисляем смещение по вертикали
        let offsetY = 0;
        if (type === 'cover') {
            const imgHeight = img.height * img.scaleY;
            const overflow = imgHeight - layout.height;
            
            if (vPos === 'center') offsetY = overflow / 2;
            else if (vPos === 'bottom') offsetY = overflow;
        } else { // contain
            const imgHeight = img.height * img.scaleY;
            const emptySpace = layout.height - imgHeight;
            
            if (vPos === 'center') offsetY = -emptySpace / 2;
            else if (vPos === 'bottom') offsetY = -emptySpace;
        }
        
        img.set({
            left: -offsetX,
            top: -offsetY,
            originX: 'left',
            originY: 'top'
        });
    }
    
    // Устанавливаем прозрачность
    img.set({ opacity: opacity });
    
    // Устанавливаем фоновое изображение
    layout.set('backgroundImage', img);
}

// Вспомогательная функция для применения действия ко всем макетам (кроме указанного)
function applyToAllLayouts(action) {
    const layouts = canvas.getObjects().filter(obj => 
        obj.type === 'layout' || obj.objectType === 'layout'
    );
    
    layouts.forEach(layout => {
        action(layout);
    });
    
    canvas.renderAll();
}

// Инициализация обработчиков для свойств
function initPropertyHandlers() {
    // Обработчики для изменения позиции и размера
    document.getElementById('position-x').addEventListener('change', function(e) {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('left', parseInt(e.target.value));
            canvas.renderAll();
            
            // Если включено мультиредактирование
            if (window.editorState.multiEditEnabled) {
                window.applyMultiEdit(activeObject, 'position', { 
                    x: activeObject.left, 
                    y: activeObject.top 
                });
            }
            
            window.addToHistory();
        }
    });
    
    document.getElementById('position-y').addEventListener('change', function(e) {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('top', parseInt(e.target.value));
            canvas.renderAll();
            
            // Если включено мультиредактирование
            if (window.editorState.multiEditEnabled) {
                window.applyMultiEdit(activeObject, 'position', { 
                    x: activeObject.left, 
                    y: activeObject.top 
                });
            }
            
            window.addToHistory();
        }
    });
    
    document.getElementById('size-width').addEventListener('change', function(e) {
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        const newWidth = parseInt(e.target.value);
        
        if (activeObject.type === 'activeSelection' || activeObject.type === 'group') {
            // Для группы масштабируем все элементы пропорционально
            const currentWidth = activeObject.width * activeObject.scaleX;
            const scale = newWidth / currentWidth;
            activeObject.scale(activeObject.scaleX * scale);
        } else {
            activeObject.set('scaleX', newWidth / activeObject.width);
        }
        
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                scaleX: activeObject.scaleX
            });
        }
        
        window.addToHistory();
    });
    
    document.getElementById('size-height').addEventListener('change', function(e) {
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;
        
        const newHeight = parseInt(e.target.value);
        
        if (activeObject.type === 'activeSelection' || activeObject.type === 'group') {
            // Для группы масштабируем все элементы пропорционально
            const currentHeight = activeObject.height * activeObject.scaleY;
            const scale = newHeight / currentHeight;
            activeObject.scale(activeObject.scaleY * scale);
        } else {
            activeObject.set('scaleY', newHeight / activeObject.height);
        }
        
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                scaleY: activeObject.scaleY
            });
    }
    
    window.addToHistory();
});

document.getElementById('rotation').addEventListener('change', function(e) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('angle', parseInt(e.target.value));
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                angle: activeObject.angle
            });
        }
        
        window.addToHistory();
    }
});

// Обработчики для текстовых свойств
document.getElementById('font-family').addEventListener('change', function(e) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'i-text' || activeObject.objectType === 'text')) {
        activeObject.set('fontFamily', e.target.value);
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                fontFamily: e.target.value
            });
        }
        
        window.addToHistory();
    }
});

document.getElementById('font-size').addEventListener('change', function(e) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'i-text' || activeObject.objectType === 'text')) {
        activeObject.set('fontSize', parseInt(e.target.value));
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                fontSize: parseInt(e.target.value)
            });
        }
        
        window.addToHistory();
    }
});

document.getElementById('text-color').addEventListener('change', function(e) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'i-text' || activeObject.objectType === 'text')) {
        activeObject.set('fill', e.target.value);
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                fill: e.target.value
            });
        }
        
        window.addToHistory();
    }
});

// Обработчики для кнопок выравнивания текста
document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'i-text' || activeObject.objectType === 'text')) {
            const alignType = this.dataset.align;
            
            activeObject.set('textAlign', alignType);
            canvas.renderAll();
            
            // Устанавливаем активную кнопку
            document.querySelectorAll('.align-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.align === alignType);
            });
            
            // Если включено мультиредактирование
            if (window.editorState.multiEditEnabled) {
                window.applyMultiEdit(activeObject, 'style', { 
                    textAlign: alignType
                });
            }
            
            window.addToHistory();
        }
    });
});

// Обработчики для свойств фигур
document.getElementById('fill-color').addEventListener('change', function(e) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.objectType === 'shape' || 
        ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(activeObject.type))) {
        
        activeObject.set('fill', e.target.value);
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                fill: e.target.value
            });
        }
        
        window.addToHistory();
    }
});

document.getElementById('stroke-color').addEventListener('change', function(e) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.objectType === 'shape' || 
        ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(activeObject.type))) {
        
        activeObject.set('stroke', e.target.value);
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                stroke: e.target.value
            });
        }
        
        window.addToHistory();
    }
});

document.getElementById('stroke-width').addEventListener('change', function(e) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.objectType === 'shape' || 
        ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(activeObject.type))) {
        
        const width = parseInt(e.target.value);
        activeObject.set('strokeWidth', width);
        
        // Если ширина строки больше 0, устанавливаем стиль строки solid
        if (width > 0) {
            activeObject.set('strokeUniform', true);
        }
        
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                strokeWidth: width,
                strokeUniform: width > 0
            });
        }
        
        window.addToHistory();
    }
});

// Обработчики для свойств изображений
document.getElementById('image-opacity').addEventListener('change', function(e) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.objectType === 'image' || activeObject.type === 'image')) {
        activeObject.set('opacity', parseFloat(e.target.value));
        canvas.renderAll();
        
        // Если включено мультиредактирование
        if (window.editorState.multiEditEnabled) {
            window.applyMultiEdit(activeObject, 'style', { 
                opacity: parseFloat(e.target.value)
            });
        }
        
        window.addToHistory();
    }
});

// Обработчики для кнопок изображения
document.getElementById('crop-image').addEventListener('click', function() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.objectType === 'image' || activeObject.type === 'image')) {
        // Здесь будет функция обрезки
        alert('Функция обрезки будет доступна в будущих версиях.');
    }
});

document.getElementById('remove-bg').addEventListener('click', function() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.objectType === 'image' || activeObject.type === 'image')) {
        // Открываем модальное окно ИИ-инструментов
        window.openModal('ai-tools-modal');
    }
});

// Обработчики для кнопок выравнивания объектов в панели свойств
document.querySelectorAll('.alignment-panel button').forEach(btn => {
    btn.addEventListener('click', function() {
        const alignType = this.dataset.align;
        window.alignObjects(alignType);
    });
});
}

// Преобразование RGB в HEX
function rgbToHex(rgb) {
if (!rgb || rgb === 'transparent') return '#ffffff';

// Проверяем, является ли значение уже hex
if (rgb.startsWith('#')) return rgb;

// Парсим RGB значение
const rgbMatch = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

return '#ffffff';
}
