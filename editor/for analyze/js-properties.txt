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
    if (activeObject.type === 'i-text' || activeObject.objectType === 'text') {
        showTextProperties(activeObject);
    } 
    else if (activeObject.objectType === 'shape' || ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(activeObject.type)) {
        showShapeProperties(activeObject);
    }
    else if (activeObject.objectType === 'image' || activeObject.type === 'image') {
        showImageProperties(activeObject);
    }
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
    
    // Заполняем значения текстовых свойств
    document.getElementById('font-family').value = textObj.fontFamily || 'Arial';
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
