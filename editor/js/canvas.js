// Инициализация канваса и базовых функций
function initCanvas() {
    // Создание функции для создания нового макета
    window.createLayout = function(width, height) {
        // Находим существующие макеты для определения позиции нового
        const existingLayouts = canvas.getObjects().filter(obj => obj.type === 'layout');
        let left = (canvas.width - width) / 2;
        let top = (canvas.height - height) / 2;
        
        // Если есть существующие макеты, размещаем новый с отступом от последнего
        if (existingLayouts.length > 0) {
            const lastLayout = existingLayouts[existingLayouts.length - 1];
            left = lastLayout.left + lastLayout.width * lastLayout.scaleX + 30; // 30px отступ
            
            // Если выходит за пределы холста, начинаем новый ряд
            if (left + width > canvas.width) {
                left = 30; // начальный отступ слева
                top = Math.max(...existingLayouts.map(l => l.top + l.height * l.scaleY)) + 30;
            }
        }
        
        // Создаем прямоугольник для макета
        const layout = new fabric.Rect({
            width: width,
            height: height,
            left: left,
            top: top,
            fill: '#ffffff',
            stroke: '#2196F3',           // Синяя рамка для обозначения обрезки
            strokeWidth: 2,              // Более заметная рамка
            strokeDashArray: [5, 5],     // Пунктирная линия для обозначения обрезки
            rx: 0,
            ry: 0,
            selectable: true,
            strokeUniform: true,
            id: `layout-${Date.now()}`,
            name: `Макет ${width}×${height}`,
            type: 'layout',
            objectType: 'layout',
            clipChildrenObjects: true    // Включаем обрезку по умолчанию
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
        
        // Инициализируем обработчики для обновления clipPath
        updateClipPathsOnLayoutChange(layout);
        
        return layout;
    };
    
    // Добавим новую вспомогательную функцию в js/canvas.js
    function applyClipPathToObject(obj, parentLayout) {
        // Проверяем, включена ли обрезка у родительского макета
        if (parentLayout && parentLayout.clipChildrenObjects) {
            // Создаем clipPath в виде прямоугольника по размеру макета
            const clipRect = new fabric.Rect({
                left: parentLayout.left,
                top: parentLayout.top,
                width: parentLayout.width * parentLayout.scaleX,
                height: parentLayout.height * parentLayout.scaleY,
                absolutePositioned: true
            });
            
            // Применяем clipPath к объекту
            obj.clipPath = clipRect;
            obj._originalClipState = { hasClipPath: true };
        }
    }


    // Функция для добавления текста
    // Проверим и модифицируем функцию addTextElement
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
            parentId: parentId
        });
        
        // Применяем clipPath, если у родительского макета включена обрезка
        applyClipPathToObject(textObj, activeObject);
        
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
                type: 'text',
            });
        }
        
        // Обновляем панель слоев
        updateLayersPanel();
        
        // Добавляем в историю
        window.addToHistory();
        
        return textObj;
    };


    // Функция для добавления изображения
    // Проверим и модифицируем функцию addImageElement
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
            
            // Устанавливаем позицию и свойства, явно включая parentId
            img.set({
                left: activeObject.left + 50,
                top: activeObject.top + 50,
                id: `image-${Date.now()}`,
                name: 'Изображение',
                objectType: 'image',
                parentId: parentId // Убедимся, что это свойство явно установлено
            });
            
            // Применяем clipPath, если у родительского макета включена обрезка
            applyClipPathToObject(img, activeObject);

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
                    type: 'image',
                });
            }
            
            // Обновляем панель слоев
            updateLayersPanel();
            
            // Добавляем в историю
            window.addToHistory();
        });
    };


    // Функция для добавления фигуры
    // Проверим и модифицируем функцию addShapeElement
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
        
        // Устанавливаем общие свойства фигуры, явно включая parentId
        shape.set({
            left: activeObject.left + 50,
            top: activeObject.top + 50,
            id: `shape-${Date.now()}`,
            name: `Фигура: ${shapeType}`,
            objectType: 'shape',
            customProps: { shapeType: shapeType },
            parentId: parentId // Убедимся, что это свойство явно установлено
        });
        
        // Применяем clipPath, если у родительского макета включена обрезка
        applyClipPathToObject(shape, activeObject);

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
                shapeType: shapeType,
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
        const layersList = document.querySelector('.layers-list');
        layersList.innerHTML = '';
        
        // Получаем все объекты с холста
        const allObjects = canvas.getObjects();
        
        // Сначала добавляем макеты
        const layouts = allObjects.filter(obj => obj.type === 'layout');
        layouts.forEach(layoutObj => {
            // Добавляем макет в список
            const layoutItem = createLayerItem(layoutObj);
            layersList.appendChild(layoutItem);
            
            // Находим и добавляем дочерние объекты этого макета
            const childObjects = allObjects.filter(obj => 
                obj.parentId === layoutObj.id || 
                (obj !== layoutObj && isObjectInsideLayout(obj, layoutObj))
            );
            
            childObjects.forEach(childObj => {
                const childItem = createLayerItem(childObj, true);
                layersList.appendChild(childItem);
            });
        });
        
        // Добавляем объекты, не принадлежащие ни одному макету
        const topLevelObjects = allObjects.filter(obj => 
            obj.type !== 'layout' && 
            !obj.parentId && 
            !layouts.some(layout => isObjectInsideLayout(obj, layout))
        );
        
        topLevelObjects.forEach(obj => {
            const objItem = createLayerItem(obj);
            layersList.appendChild(objItem);
        });
        
        // Функция для создания элемента слоя
        function createLayerItem(obj, isChild = false) {
            const item = document.createElement('div');
            item.classList.add('layer-item');
            item.dataset.id = obj.id;
            
            if (isChild) {
                item.classList.add('nested-layer');
                item.style.paddingLeft = '24px';
                
                // Если у объекта есть parentId, сохраняем его
                if (obj.parentId) {
                    item.dataset.parentId = obj.parentId;
                }
            }
            
            // Проверка выбранного элемента
            if (canvas.getActiveObject() === obj) {
                item.classList.add('selected');
            }
            
            // Определяем иконку в зависимости от типа
            let icon = 'layers';
            if (obj.type === 'layout') icon = 'dashboard';
            else if (obj.type === 'i-text' || obj.objectType === 'text') icon = 'text_fields';
            else if (obj.type === 'image' || obj.objectType === 'image') icon = 'image';
            else if (obj.type === 'path') icon = 'brush';
            else if (obj.type === 'group') icon = 'group_work';
            else if (obj.objectType === 'shape' || ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(obj.type)) icon = 'category';
            
            // Содержимое элемента
            item.innerHTML = `
                <span class="material-icons layer-visibility">${obj.visible === false ? 'visibility_off' : 'visibility'}</span>
                <span class="material-icons layer-type-icon">${icon}</span>
                <span class="layer-name">${obj.name || getDefaultName(obj)}</span>
                <div class="layer-actions">
                    <span class="material-icons layer-delete-btn" title="Удалить">delete</span>
                </div>
            `;
            
            // Обработчик клика
            item.addEventListener('click', () => {
                canvas.setActiveObject(obj);
                canvas.renderAll();
                updateLayerSelection(obj.id);
            });
            
            // Обработчик видимости
            const visibilityIcon = item.querySelector('.layer-visibility');
            visibilityIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                obj.visible = !obj.visible;
                
                if (obj.visible) {
                    visibilityIcon.textContent = 'visibility';
                } else {
                    visibilityIcon.textContent = 'visibility_off';
                }
                
                canvas.renderAll();
            });
            
            // Обработчик удаления
            const deleteBtn = item.querySelector('.layer-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeObject(obj);
            });
            
            return item;
        }
        
        // Функция для удаления объекта
        function removeObject(obj) {
            canvas.remove(obj);
            
            // Если это макет, удаляем также все его дочерние элементы
            if (obj.type === 'layout') {
                const childObjects = allObjects.filter(child => 
                    child.parentId === obj.id || 
                    isObjectInsideLayout(child, obj)
                );
                childObjects.forEach(child => canvas.remove(child));
                
                // Удаляем макет из состояния
                if (window.editorState && window.editorState.layouts) {
                    window.editorState.layouts = window.editorState.layouts.filter(l => l.id !== obj.id);
                }
            } 
            // Если это обычный объект внутри макета
            else if (obj.parentId) {
                // Удаляем элемент из состояния макета
                if (window.editorState && window.editorState.layouts) {
                    const parentLayout = window.editorState.layouts.find(l => l.id === obj.parentId);
                    if (parentLayout && parentLayout.elements) {
                        parentLayout.elements = parentLayout.elements.filter(el => el.id !== obj.id);
                    }
                }
            }
            
            canvas.renderAll();
            window.updateLayersPanel();
            window.addToHistory();
        }
        
        // Функция для определения, находится ли объект внутри макета
        function isObjectInsideLayout(obj, layout) {
            if (!obj || !layout) return false;
            
            const objBounds = obj.getBoundingRect();
            const layoutBounds = layout.getBoundingRect();
            
            return (
                objBounds.left >= layoutBounds.left &&
                objBounds.top >= layoutBounds.top &&
                objBounds.left + objBounds.width <= layoutBounds.left + layoutBounds.width &&
                objBounds.top + objBounds.height <= layoutBounds.top + layoutBounds.height
            );
        }
        
        // Функция для получения имени по умолчанию
        function getDefaultName(obj) {
            if (obj.type === 'i-text') return 'Текст';
            if (obj.type === 'image') return 'Изображение';
            if (obj.type === 'path') return 'Нарисованное';
            if (obj.type === 'group') return 'Группа';
            if (obj.type === 'rect') return 'Прямоугольник';
            if (obj.type === 'circle') return 'Круг';
            if (obj.type === 'triangle') return 'Треугольник';
            if (obj.type === 'polygon') return 'Многоугольник';
            if (obj.type === 'line') return 'Линия';
            return 'Элемент';
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
    
    // Добавить в функцию initCanvas после инициализации слушателей событий
    canvas.on('object:moving', function(e) {
        const movedObject = e.target;
        
        // Если перемещается макет, перемещаем все его дочерние элементы
        if (movedObject.type === 'layout') {
            const allObjects = canvas.getObjects();
            
            // Вычисляем разницу позиций для определения сдвига
            const deltaX = e.target.left - e.target._oldLeft;
            const deltaY = e.target.top - e.target._oldTop;
            
            // Запоминаем текущую позицию для следующего перемещения
            e.target._oldLeft = e.target.left;
            e.target._oldTop = e.target.top;
            
            // Перемещаем все дочерние элементы
            allObjects.forEach(obj => {
                if (obj !== movedObject && (obj.parentId === movedObject.id || isObjectInsideLayout(obj, movedObject))) {
                    obj.set({
                        left: obj.left + deltaX,
                        top: obj.top + deltaY
                    });
                    obj.setCoords();
                }
            });
        }
    });

        // Сохраняем начальную позицию при начале перемещения
        canvas.on('object:moving:before', function(e) {
            e.target._oldLeft = e.target.left;
            e.target._oldTop = e.target.top;
        });

        // Функция для определения, находится ли объект внутри макета
        function isObjectInsideLayout(obj, layout) {
            if (!obj || !layout) return false;
            
            const objBounds = obj.getBoundingRect();
            const layoutBounds = layout.getBoundingRect();
            
            return (
                objBounds.left >= layoutBounds.left &&
                objBounds.top >= layoutBounds.top &&
                objBounds.left + objBounds.width <= layoutBounds.left + layoutBounds.width &&
                objBounds.top + objBounds.height <= layoutBounds.top + layoutBounds.height
            );
        }


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
