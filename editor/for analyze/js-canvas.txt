// Инициализация канваса и базовых функций
function initCanvas() {
    // Создание функции для создания нового макета
    window.createLayout = function(width, height) {
        // Создаем прямоугольник для макета
        const layout = new fabric.Rect({
            width: width,
            height: height,
            left: (canvas.width - width) / 2,
            top: (canvas.height - height) / 2,
            fill: '#ffffff',
            stroke: '#ddd',
            strokeWidth: 1,
            rx: 0,
            ry: 0,
            selectable: true,
            strokeUniform: true,
            id: `layout-${Date.now()}`,
            name: `Макет ${width}×${height}`,
            type: 'layout',
            objectType: 'layout'
        });
        
        // Добавляем макет на холст
        canvas.add(layout);
        
        // Добавляем макет в состояние приложения
        if (!window.editorState.layouts) {
            window.editorState.layouts = [];
        }
        window.editorState.layouts.push({
            id: layout.id,
            name: layout.name,
            width: width,
            height: height,
            elements: []
        });
        
        // Выбираем макет
        canvas.setActiveObject(layout);
        canvas.renderAll();
        
        // Обновляем панель слоев
        updateLayersPanel();
        
        // Добавляем в историю
        window.addToHistory();
        
        return layout;
    };

    // Функция для добавления текста
    window.addTextElement = function(text = 'Редактируемый текст') {
        // Проверяем наличие выбранного макета
        const activeObject = canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'layout') {
            alert('Пожалуйста, выберите макет для добавления текста');
            return;
        }
        
        // Получаем ID родительского макета
        const parentId = activeObject.id;
        
        // Создаем текстовый объект
        const textObj = new fabric.IText(text, {
            left: activeObject.left + 50,
            top: activeObject.top + 50,
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#000000',
            id: `text-${Date.now()}`,
            name: 'Текст',
            objectType: 'text',
            type: 'i-text',
            parentId: parentId // Сохраняем ID родительского макета
        });
        
        // Добавляем текст на холст
        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        canvas.renderAll();
        
        // Добавляем элемент в состояние приложения
        const layoutState = window.editorState.layouts.find(layout => layout.id === parentId);
        if (layoutState) {
            layoutState.elements.push({
                id: textObj.id,
                name: textObj.name,
                type: 'text'
            });
        }
        
        // Обновляем панель слоев
        updateLayersPanel();
        
        // Добавляем в историю
        window.addToHistory();
        
        return textObj;
    };

    // Функция для добавления изображения
    window.addImageElement = function(imageUrl) {
        // Проверяем наличие выбранного макета
        const activeObject = canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'layout') {
            alert('Пожалуйста, выберите макет для добавления изображения');
            return;
        }
        
        // Получаем ID родительского макета
        const parentId = activeObject.id;
        
        // Загружаем изображение
        fabric.Image.fromURL(imageUrl, function(img) {
            // Ограничиваем размер изображения
            const maxWidth = 300;
            if (img.width > maxWidth) {
                img.scaleToWidth(maxWidth);
            }
            
            // Устанавливаем позицию и свойства
            img.set({
                left: activeObject.left + 50,
                top: activeObject.top + 50,
                id: `image-${Date.now()}`,
                name: 'Изображение',
                objectType: 'image',
                parentId: parentId // Сохраняем ID родительского макета
            });
            
            // Добавляем изображение на холст
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            
            // Добавляем элемент в состояние приложения
            const layoutState = window.editorState.layouts.find(layout => layout.id === parentId);
            if (layoutState) {
                layoutState.elements.push({
                    id: img.id,
                    name: img.name,
                    type: 'image'
                });
            }
            
            // Обновляем панель слоев
            updateLayersPanel();
            
            // Добавляем в историю
            window.addToHistory();
        });
    };

    // Функция для добавления фигуры
    window.addShapeElement = function(shapeType) {
        // Проверяем наличие выбранного макета
        const activeObject = canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'layout') {
            alert('Пожалуйста, выберите макет для добавления фигуры');
            return;
        }
        
        // Получаем ID родительского макета
        const parentId = activeObject.id;
        
        // Создаем фигуру в зависимости от типа
        let shape;
        
        switch(shapeType) {
            case 'rectangle':
                shape = new fabric.Rect({
                    width: 100,
                    height: 80,
                    fill: '#3498db'
                });
                break;
            case 'circle':
                shape = new fabric.Circle({
                    radius: 50,
                    fill: '#e74c3c'
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    width: 100,
                    height: 100,
                    fill: '#2ecc71'
                });
                break;
            case 'line':
                shape = new fabric.Line([0, 0, 100, 0], {
                    stroke: '#f1c40f',
                    strokeWidth: 5
                });
                break;
            case 'star':
                shape = createStar();
                break;
            default:
                shape = new fabric.Rect({
                    width: 100,
                    height: 100,
                    fill: '#3498db'
                });
        }
        
        // Устанавливаем общие свойства фигуры
        shape.set({
            left: activeObject.left + 50,
            top: activeObject.top + 50,
            id: `shape-${Date.now()}`,
            name: `Фигура: ${shapeType}`,
            objectType: 'shape',
            customProps: { shapeType: shapeType },
            parentId: parentId // Сохраняем ID родительского макета
        });
        
        // Добавляем фигуру на холст
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
        
        // Добавляем элемент в состояние приложения
        const layoutState = window.editorState.layouts.find(layout => layout.id === parentId);
        if (layoutState) {
            layoutState.elements.push({
                id: shape.id,
                name: shape.name,
                type: 'shape',
                shapeType: shapeType
            });
        }
        
        // Обновляем панель слоев
        updateLayersPanel();
        
        // Добавляем в историю
        window.addToHistory();
        
        return shape;
    };

    // Функция для создания звезды
    function createStar() {
        const points = [];
        const outerRadius = 50;
        const innerRadius = 25;
        const spikes = 5;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * Math.PI / spikes;
            const x = radius * Math.sin(angle);
            const y = radius * Math.cos(angle);
            points.push({ x, y });
        }
        
        return new fabric.Polygon(points, {
            fill: '#9b59b6',
            left: 0,
            top: 0
        });
    }

    // Обновление панели слоев
    window.updateLayersPanel = function() {
        if (typeof window.layerFunctions !== 'undefined' && 
            typeof window.layerFunctions.updateLayersPanel === 'function') {
            // Используем улучшенную функцию для обновления слоев, если она доступна
            window.layerFunctions.updateLayersPanel();
            return;
        }
        
        // Запасной вариант, если функция из layers.js недоступна
        const layersList = document.querySelector('.layers-list');
        layersList.innerHTML = '';
        
        // Сначала добавляем макеты
        if (window.editorState && window.editorState.layouts) {
            window.editorState.layouts.forEach(layoutData => {
                // Находим объект макета на холсте
                const layoutObj = canvas.getObjects().find(obj => obj.id === layoutData.id);
                if (!layoutObj) return;
                
                // Создаем элемент списка для макета
                const layoutItem = document.createElement('div');
                layoutItem.classList.add('layer-item');
                layoutItem.dataset.id = layoutObj.id;
                
                // Проверка выбранного элемента
                if (canvas.getActiveObject() === layoutObj) {
                    layoutItem.classList.add('selected');
                }
                
                // Содержимое элемента макета
                layoutItem.innerHTML = `
                    <span class="material-icons layer-visibility">visibility</span>
                    <span class="material-icons layer-type-icon">dashboard</span>
                    <span class="layer-name">${layoutObj.name || 'Макет'}</span>
                    <div class="layer-actions">
                        <span class="material-icons layer-delete-btn" title="Удалить">delete</span>
                    </div>
                `;
                
                // Добавляем в список
                layersList.appendChild(layoutItem);
                
                // Обработчик клика
                layoutItem.addEventListener('click', () => {
                    canvas.setActiveObject(layoutObj);
                    canvas.renderAll();
                    updateLayerSelection(layoutObj.id);
                });
                
                // Обработчик видимости
                const visibilityIcon = layoutItem.querySelector('.layer-visibility');
                visibilityIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    layoutObj.visible = !layoutObj.visible;
                    
                    if (layoutObj.visible) {
                        visibilityIcon.textContent = 'visibility';
                    } else {
                        visibilityIcon.textContent = 'visibility_off';
                    }
                    
                    canvas.renderAll();
                });
                
                // Обработчик удаления
                const deleteBtn = layoutItem.querySelector('.layer-delete-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    canvas.remove(layoutObj);
                    
                    // Удаляем макет и его элементы из состояния
                    window.editorState.layouts = window.editorState.layouts.filter(l => l.id !== layoutObj.id);
                    
                    // Удаляем все элементы макета с холста
                    const childObjects = canvas.getObjects().filter(obj => obj.parentId === layoutObj.id);
                    childObjects.forEach(obj => canvas.remove(obj));
                    
                    canvas.renderAll();
                    window.updateLayersPanel();
                    window.addToHistory();
                });
                
                // Добавляем элементы макета с отступом
                if (layoutData.elements && layoutData.elements.length > 0) {
                    layoutData.elements.forEach(elementData => {
                        // Находим объект элемента на холсте
                        const elementObj = canvas.getObjects().find(obj => obj.id === elementData.id);
                        if (!elementObj) return;
                        
                        // Создаем элемент списка для дочернего элемента
                        const elementItem = document.createElement('div');
                        elementItem.classList.add('layer-item', 'nested-layer');
                        elementItem.dataset.id = elementObj.id;
                        elementItem.dataset.parentId = layoutObj.id;
                        
                        // Добавляем отступ для вложенности
                        elementItem.style.paddingLeft = '24px';
                        
                        // Определяем иконку в зависимости от типа
                        let icon = 'layers';
                        if (elementObj.objectType === 'text' || elementObj.type === 'i-text') icon = 'text_fields';
                        else if (elementObj.objectType === 'image') icon = 'image';
                        else if (elementObj.objectType === 'shape') icon = 'category';
                        else if (elementObj.type === 'group') icon = 'group_work';
                        
                        // Проверка выбранного элемента
                        if (canvas.getActiveObject() === elementObj) {
                            elementItem.classList.add('selected');
                        }
                        
                        // Содержимое элемента
                        elementItem.innerHTML = `
                            <span class="material-icons layer-visibility">visibility</span>
                            <span class="material-icons layer-type-icon">${icon}</span>
                            <span class="layer-name">${elementObj.name || 'Элемент'}</span>
                            <div class="layer-actions">
                                <span class="material-icons layer-delete-btn" title="Удалить">delete</span>
                            </div>
                        `;
                        
                        // Добавляем в список после родительского макета
                        layersList.appendChild(elementItem);
                        
                        // Обработчик клика
                        elementItem.addEventListener('click', () => {
                            canvas.setActiveObject(elementObj);
                            canvas.renderAll();
                            updateLayerSelection(elementObj.id);
                        });
                        
                        // Обработчик видимости
                        const elemVisibilityIcon = elementItem.querySelector('.layer-visibility');
                        elemVisibilityIcon.addEventListener('click', (e) => {
                            e.stopPropagation();
                            elementObj.visible = !elementObj.visible;
                            
                            if (elementObj.visible) {
                                elemVisibilityIcon.textContent = 'visibility';
                            } else {
                                elemVisibilityIcon.textContent = 'visibility_off';
                            }
                            
                            canvas.renderAll();
                        });
                        
                        // Обработчик удаления
                        const elemDeleteBtn = elementItem.querySelector('.layer-delete-btn');
                        elemDeleteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            canvas.remove(elementObj);
                            
                            // Удаляем элемент из состояния
                            const layout = window.editorState.layouts.find(l => l.id === layoutObj.id);
                            if (layout) {
                                layout.elements = layout.elements.filter(el => el.id !== elementObj.id);
                            }
                            
                            canvas.renderAll();
                            window.updateLayersPanel();
                            window.addToHistory();
                        });
                    });
                }
            });
        }
        
        // Добавляем стили для вложенных элементов
        if (!document.getElementById('layers-css')) {
            const style = document.createElement('style');
            style.id = 'layers-css';
            style.innerHTML = `
                .nested-layer {
                    position: relative;
                }
                .nested-layer::before {
                    content: '';
                    position: absolute;
                    left: 12px;
                    top: 0;
                    height: 100%;
                    width: 1px;
                    background-color: rgba(255, 255, 255, 0.1);
                }
            `;
            document.head.appendChild(style);
        }
    };

    // Функция для обновления выделения слоев
    function updateLayerSelection(id) {
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.id === id);
        });
        
        // Обновляем панель свойств для выделенного объекта
        if (typeof updatePropertiesPanel === 'function') {
            updatePropertiesPanel();
        }
    }
    
    // Обработчики событий выбора объекта
    canvas.on('selection:created', function(e) {
        updateLayerSelection(e.selected[0].id);
    });
    
    canvas.on('selection:updated', function(e) {
        updateLayerSelection(e.selected[0].id);
    });
    
    canvas.on('selection:cleared', function() {
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('selected');
        });
        if (typeof clearPropertiesPanel === 'function') {
            clearPropertiesPanel();
        }
    });
    
    // Экспортируем функции
    window.canvasFunctions = {
        updateLayerSelection,
        clearSelection: function() {
            canvas.discardActiveObject();
            canvas.renderAll();
        },
        selectLayout: function(layout) {
            canvas.setActiveObject(layout);
            canvas.renderAll();
            updateLayerSelection(layout.id);
        },
        selectElement: function(element) {
            canvas.setActiveObject(element);
            canvas.renderAll();
            updateLayerSelection(element.id);
        },
        updateLayersPanel: function() {
            canvas.renderAll();
        }
    };
    
    // Инициализация завершена
    console.log('Canvas initialized');
}
