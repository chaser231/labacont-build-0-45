// Инициализация мультиредактирования
function initMultiEditFeature() {
    // Отслеживаем изменения объектов
    canvas.on('object:modified', function(opt) {
        if (!window.editorState.multiEditEnabled) return;
        
        const modifiedObject = opt.target;
        
        // Мультиредактирование работает только для элементов, а не для макетов
        if (!modifiedObject || modifiedObject.type === 'layout') return;
        
        // Находим все аналогичные объекты на других макетах
        const similarObjects = findSimilarObjects(modifiedObject);
        
        // Применяем изменения ко всем похожим объектам
        similarObjects.forEach(obj => {
            // Копируем свойства, которые мы хотим синхронизировать
            copyProperties(modifiedObject, obj);
            
            // Обновляем объект
            obj.setCoords();
        });
        
        // Перерисовываем холст
        canvas.renderAll();
        
        // Сохраняем изменения в историю
        window.addToHistory();
    });
    
    // Функция для поиска похожих объектов на других макетах
    function findSimilarObjects(sourceObject) {
        const result = [];
        
        // Получаем все макеты
        const layouts = canvas.getObjects().filter(obj => obj.type === 'layout');
        
        // Для каждого макета находим похожие объекты
        layouts.forEach(layout => {
            // Находим все элементы на этом макете
            const elementsOnLayout = getElementsOnLayout(layout);
            
            // Фильтруем элементы того же типа
            const sameTypeElements = elementsOnLayout.filter(el => 
                el.objectType === sourceObject.objectType || 
                (el.type === sourceObject.type && sourceObject.type !== 'rect') // для обычных фигур
            );
            
            // Находим элементы на той же позиции по порядку
            const sourceIndex = getObjectIndexByType(sourceObject);
            
            sameTypeElements.forEach((el, index) => {
                if (index === sourceIndex && el !== sourceObject) {
                    result.push(el);
                }
            });
        });
        
        return result;
    }
    
    // Получает индекс объекта среди объектов того же типа в его родительском макете
    function getObjectIndexByType(obj) {
        // Находим родительский макет
        const parentLayout = findParentLayout(obj);
        if (!parentLayout) return -1;
        
        // Получаем все элементы на макете
        const elementsOnLayout = getElementsOnLayout(parentLayout);
        
        // Фильтруем элементы того же типа
        const sameTypeElements = elementsOnLayout.filter(el => 
            el.objectType === obj.objectType || 
            (el.type === obj.type && obj.type !== 'rect') // для обычных фигур
        );
        
        // Возвращаем индекс
        return sameTypeElements.indexOf(obj);
    }
    
    // Находит родительский макет для объекта
    function findParentLayout(obj) {
        // Получаем все макеты
        const layouts = canvas.getObjects().filter(o => o.type === 'layout');
        
        // Проверяем, внутри какого макета находится объект
        for (const layout of layouts) {
            if (isObjectInLayout(obj, layout)) {
                return layout;
            }
        }
        
        return null;
    }
    
    // Проверяет, находится ли объект внутри макета
    function isObjectInLayout(obj, layout) {
        // Определяем границы объектов
        const objBounds = obj.getBoundingRect();
        const layoutBounds = layout.getBoundingRect();
        
        // Проверяем, находится ли объект внутри макета
        return (
            objBounds.left >= layoutBounds.left &&
            objBounds.top >= layoutBounds.top &&
            objBounds.left + objBounds.width <= layoutBounds.left + layoutBounds.width &&
            objBounds.top + objBounds.height <= layoutBounds.top + layoutBounds.height
        );
    }
    
    // Получает все элементы на макете
    function getElementsOnLayout(layout) {
        return canvas.getObjects().filter(obj => 
            obj !== layout && 
            obj.type !== 'layout' && 
            isObjectInLayout(obj, layout)
        );
    }
    
    // Копирует свойства с одного объекта на другой
    function copyProperties(source, target) {
        // Общие свойства для всех типов объектов
        const commonProps = [
            'scaleX', 'scaleY', 'angle', 'width', 'height',
            'opacity', 'flipX', 'flipY'
        ];
        
        commonProps.forEach(prop => {
            if (source[prop] !== undefined) {
                target.set(prop, source[prop]);
            }
        });
        
        // Относительное позиционирование
        if (source.left !== undefined && source.top !== undefined) {
            // Находим родительские макеты
            const sourceParent = findParentLayout(source);
            const targetParent = findParentLayout(target);
            
            if (sourceParent && targetParent) {
                // Вычисляем относительное положение внутри макета
                const relativeLeft = source.left - sourceParent.left;
                const relativeTop = source.top - sourceParent.top;
                
                // Применяем то же относительное положение к целевому объекту
                target.set({
                    left: targetParent.left + relativeLeft,
                    top: targetParent.top + relativeTop
                });
            }
        }
        
        // Специфические свойства по типу объекта
        if (source.type === 'i-text' || source.objectType === 'text') {
            // Свойства текста
            const textProps = [
                'fontFamily', 'fontSize', 'fontWeight', 'textAlign',
                'fontStyle', 'lineHeight', 'underline', 'text',
                'charSpacing', 'fill', 'stroke', 'strokeWidth'
            ];
            
            textProps.forEach(prop => {
                if (source[prop] !== undefined) {
                    target.set(prop, source[prop]);
                }
            });
        }
        else if (source.objectType === 'shape' || ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(source.type)) {
            // Свойства фигур
            const shapeProps = [
                'fill', 'stroke', 'strokeWidth', 'rx', 'ry',
                'strokeDashArray', 'strokeLineCap'
            ];
            
            shapeProps.forEach(prop => {
                if (source[prop] !== undefined) {
                    target.set(prop, source[prop]);
                }
            });
        }
        else if (source.objectType === 'image') {
            // Свойства изображений
            const imageProps = ['cropX', 'cropY', 'cropWidth', 'cropHeight'];
            
            imageProps.forEach(prop => {
                if (source[prop] !== undefined) {
                    target.set(prop, source[prop]);
                }
            });
            
            // Если были применены фильтры
            if (source.filters && source.filters.length > 0) {
                target.filters = [...source.filters];
                target.applyFilters();
            }
        }
    }
}
