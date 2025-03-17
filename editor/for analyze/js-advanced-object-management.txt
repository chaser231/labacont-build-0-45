// Инициализация расширенных возможностей управления объектами
function initAdvancedObjectManagement() {
    // Функция для группировки выбранных объектов
    window.groupSelectedObjects = function() {
        const activeObject = canvas.getActiveObject();
        
        if (!activeObject || activeObject.type !== 'activeSelection') {
            return;
        }
        
        // Группируем выбранные объекты
        const group = activeObject.toGroup();
        
        // Добавляем ID и имя
        group.id = `group-${Date.now()}`;
        group.name = 'Группа';
        group.type = 'group';
        
        canvas.requestRenderAll();
        
        // Обновляем панель слоев
        window.updateLayersPanel();
        
        // Сохраняем изменения в историю
        window.addToHistory();
    };
    
    // Функция для разгруппировки выбранной группы
    window.ungroupSelectedObjects = function() {
        const activeObject = canvas.getActiveObject();
        
        if (!activeObject || activeObject.type !== 'group') {
            return;
        }
        
        // Разгруппировываем
        const items = activeObject.toActiveSelection();
        
        canvas.requestRenderAll();
        
        // Обновляем панель слоев
        window.updateLayersPanel();
        
        // Сохраняем изменения в историю
        window.addToHistory();
    };
    
    // Добавляем горячие клавиши для группировки
    document.addEventListener('keydown', function(e) {
        // Ctrl + G для группировки
        if (e.ctrlKey && e.key.toLowerCase() === 'g' && !e.shiftKey) {
            e.preventDefault();
            window.groupSelectedObjects();
        }
        // Ctrl + Shift + G для разгруппировки
        else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
            e.preventDefault();
            window.ungroupSelectedObjects();
        }
        // Ctrl + C для копирования
        else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                e.preventDefault();
                activeObject.clone(function(cloned) {
                    window.editorState.clipboard = cloned;
                });
            }
        }
        // Ctrl + V для вставки
        else if (e.ctrlKey && e.key.toLowerCase() === 'v') {
            if (window.editorState.clipboard) {
                e.preventDefault();
                window.editorState.clipboard.clone(function(cloned) {
                    // Смещаем новый объект
                    cloned.set({
                        left: cloned.left + 20,
                        top: cloned.top + 20,
                        id: `object-${Date.now()}`,
                        name: cloned.name ? `${cloned.name} копия` : 'Копия'
                    });
                    
                    canvas.add(cloned);
                    canvas.setActiveObject(cloned);
                    canvas.renderAll();
                    window.updateLayersPanel();
                    window.addToHistory();
                });
            }
        }
        // Ctrl + D для дублирования
        else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                e.preventDefault();
                activeObject.clone(function(cloned) {
                    cloned.set({
                        left: activeObject.left + 20,
                        top: activeObject.top + 20,
                        id: `object-${Date.now()}`,
                        name: activeObject.name ? `${activeObject.name} копия` : 'Копия'
                    });
                    
                    canvas.add(cloned);
                    canvas.setActiveObject(cloned);
                    canvas.renderAll();
                    window.updateLayersPanel();
                    window.addToHistory();
                });
            }
        }
        // Стрелки для перемещения объектов
        else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                e.preventDefault();
                
                const moveStep = e.shiftKey ? 10 : 1; // Больше шаг при зажатом Shift
                
                // Перемещаем объект в зависимости от нажатой стрелки
                switch(e.key) {
                    case 'ArrowUp':
                        activeObject.set('top', activeObject.top - moveStep);
                        break;
                    case 'ArrowDown':
                        activeObject.set('top', activeObject.top + moveStep);
                        break;
                    case 'ArrowLeft':
                        activeObject.set('left', activeObject.left - moveStep);
                        break;
                    case 'ArrowRight':
                        activeObject.set('left', activeObject.left + moveStep);
                        break;
                }
                
                activeObject.setCoords();
                canvas.renderAll();
                
                // Если включено мультиредактирование
                if (window.editorState.multiEditEnabled) {
                    window.applyMultiEdit(activeObject, 'position', { 
                        x: activeObject.left, 
                        y: activeObject.top 
                    });
                }
                
                // Обновляем панель свойств
                updatePropertiesPanel();
                
                // Не добавляем в историю каждое перемещение стрелками,
                // используем debounce для добавления только после паузы
                clearTimeout(window.arrowMoveTimer);
                window.arrowMoveTimer = setTimeout(() => {
                    window.addToHistory();
                }, 500);
            }
        }
    });
    
    // Обработчик для изменения порядка слоев
    window.changeObjectOrder = function(obj, direction) {
        if (!obj) return;
        
        switch(direction) {
            case 'up':
                canvas.bringForward(obj);
                break;
            case 'down':
                canvas.sendBackwards(obj);
                break;
            case 'top':
                canvas.bringToFront(obj);
                break;
            case 'bottom':
                canvas.sendToBack(obj);
                break;
        }
        
        canvas.renderAll();
        window.updateLayersPanel();
        window.addToHistory();
    };
    
    // Обработчик для выравнивания объектов
    window.alignObjects = function(alignType) {
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;
        
        // Если выбран один объект, выравниваем его относительно холста или родителя
        if (activeObj.type !== 'activeSelection' && activeObj.type !== 'group') {
            // Определяем родителя (макет)
            const parentLayout = findParentLayout(activeObj);
            
            if (parentLayout) {
                alignToParent(activeObj, parentLayout, alignType);
            } else {
                alignToCanvas(activeObj, alignType);
            }
        }
        // Если выбрано несколько объектов, выравниваем их относительно друг друга
        else if (activeObj.type === 'activeSelection') {
            alignMultipleObjects(activeObj, alignType);
        }
        
        canvas.renderAll();
        window.addToHistory();
    };
    
    // Найти родительский макет для объекта
    function findParentLayout(obj) {
        // Получаем все макеты
        const layouts = canvas.getObjects().filter(o => o.type === 'layout');
        
        // Проверяем, внутри какого макета находится объект
        for (const layout of layouts) {
            // Определяем границы объектов
            const objBounds = obj.getBoundingRect();
            const layoutBounds = layout.getBoundingRect();
            
            // Проверяем, находится ли объект внутри макета
            if (
                objBounds.left >= layoutBounds.left &&
                objBounds.top >= layoutBounds.top &&
                objBounds.left + objBounds.width <= layoutBounds.left + layoutBounds.width &&
                objBounds.top + objBounds.height <= layoutBounds.top + layoutBounds.height
            ) {
                return layout;
            }
        }
        
        return null;
    }
    
    // Выравнивание объекта относительно родителя
    function alignToParent(obj, parent, alignType) {
        const parentLeft = parent.left;
        const parentTop = parent.top;
        const parentWidth = parent.width * parent.scaleX;
        const parentHeight = parent.height * parent.scaleY;
        const objWidth = obj.width * obj.scaleX;
        const objHeight = obj.height * obj.scaleY;
        
        switch(alignType) {
            case 'left':
                obj.set({ left: parentLeft });
                break;
            case 'center-h':
                obj.set({ left: parentLeft + (parentWidth - objWidth) / 2 });
                break;
            case 'right':
                obj.set({ left: parentLeft + parentWidth - objWidth });
                break;
            case 'top':
                obj.set({ top: parentTop });
                break;
            case 'center-v':
                obj.set({ top: parentTop + (parentHeight - objHeight) / 2 });
                break;
            case 'bottom':
                obj.set({ top: parentTop + parentHeight - objHeight });
                break;
        }
        
        obj.setCoords();
    }
    
    // Выравнивание объекта относительно холста
    function alignToCanvas(obj, alignType) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const objWidth = obj.width * obj.scaleX;
        const objHeight = obj.height * obj.scaleY;
        
        switch(alignType) {
            case 'left':
                obj.set({ left: 0 });
                break;
            case 'center-h':
                obj.set({ left: (canvasWidth - objWidth) / 2 });
                break;
            case 'right':
                obj.set({ left: canvasWidth - objWidth });
                break;
            case 'top':
                obj.set({ top: 0 });
                break;
            case 'center-v':
                obj.set({ top: (canvasHeight - objHeight) / 2 });
                break;
            case 'bottom':
                obj.set({ top: canvasHeight - objHeight });
                break;
        }
        
        obj.setCoords();
    }
    
    // Выравнивание группы объектов
    function alignMultipleObjects(selection, alignType) {
        if (!selection) return;
        
        const objects = selection._objects;
        const bounds = selection.getBoundingRect();
        
        switch(alignType) {
            case 'left':
                objects.forEach(obj => {
                    obj.set({ left: bounds.left });
                    obj.setCoords();
                });
                break;
            case 'center-h':
                objects.forEach(obj => {
                    const objWidth = obj.width * obj.scaleX;
                    obj.set({ left: bounds.left + (bounds.width - objWidth) / 2 });
                    obj.setCoords();
                });
                break;
            case 'right':
                objects.forEach(obj => {
                    const objWidth = obj.width * obj.scaleX;
                    obj.set({ left: bounds.left + bounds.width - objWidth });
                    obj.setCoords();
                });
                break;
            case 'top':
                objects.forEach(obj => {
                    obj.set({ top: bounds.top });
                    obj.setCoords();
                });
                break;
            case 'center-v':
                objects.forEach(obj => {
                    const objHeight = obj.height * obj.scaleY;
                    obj.set({ top: bounds.top + (bounds.height - objHeight) / 2 });
                    obj.setCoords();
                });
                break;
            case 'bottom':
                objects.forEach(obj => {
                    const objHeight = obj.height * obj.scaleY;
                    obj.set({ top: bounds.top + bounds.height - objHeight });
                    obj.setCoords();
                });
                break;
        }
        
        selection.setCoords();
    }
}
