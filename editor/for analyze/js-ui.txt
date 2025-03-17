// Инициализация пользовательского интерфейса
function initUI() {
    // Переключение вкладок в боковой панели
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // Удаляем активный класс у всех кнопок и контента
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Активируем нужную вкладку
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Инициализация модальных окон
    initModals();
    
    // Обработчик для кнопки "Создать макет"
    document.getElementById('create-layout').addEventListener('click', () => {
        window.openModal('create-layout-modal');
    });
    
    // Обработчик для кнопки "Текст"
    document.getElementById('add-text').addEventListener('click', () => {
        window.addTextElement();
    });
    
    // Обработчик для кнопки "Фото"
    document.getElementById('add-photo').addEventListener('click', () => {
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
                    window.addImageElement(event.target.result);
                };
                
                reader.readAsDataURL(file);
            }
            
            // Удаляем input после использования
            fileInput.remove();
        });
        
        fileInput.click();
    });
    
    // Обработчик для кнопки "Элементы"
    document.getElementById('add-element').addEventListener('click', () => {
        const elementPicker = document.querySelector('.element-picker');
        elementPicker.classList.toggle('hidden');
    });
    
    // Обработчики для выбора фигур
    document.querySelectorAll('.element-item').forEach(item => {
        item.addEventListener('click', () => {
            const shapeType = item.dataset.element;
            window.addShapeElement(shapeType);
            
            // Скрываем выбор элементов
            document.querySelector('.element-picker').classList.add('hidden');
        });
    });
    
    // Обработчики для категорий шаблонов
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.material-icons');
            
            content.classList.toggle('hidden');
            
            // Меняем иконку
            if (content.classList.contains('hidden')) {
                icon.textContent = 'expand_more';
            } else {
                icon.textContent = 'expand_less';
            }
        });
    });
    
    // Переключатель мультиредактирования
    document.getElementById('multi-edit-checkbox').addEventListener('change', (e) => {
        window.editorState.multiEditEnabled = e.target.checked;
    });
    
    // Инструменты в верхней панели
    document.querySelectorAll('.tool-btn').forEach(button => {
        button.addEventListener('click', () => {
            const toolName = button.dataset.tool;
            
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            button.classList.add('active');
            window.editorState.currentTool = toolName;
            
            // Действия для инструментов
            switch(toolName) {
                case 'select':
                    canvas.isDrawingMode = false;
                    canvas.selection = true;
                    canvas.forEachObject(function(obj) {
                        obj.selectable = true;
                    });
                    break;
                
                case 'hand':
                    canvas.isDrawingMode = false;
                    canvas.selection = false;
                    canvas.forEachObject(function(obj) {
                        obj.selectable = false;
                    });
                    break;
                
                case 'pen':
                    canvas.isDrawingMode = true;
                    canvas.freeDrawingBrush.width = 2;
                    canvas.freeDrawingBrush.color = '#ffffff';
                    break;
                
                case 'text':
                    canvas.isDrawingMode = false;
                    // При клике добавляем текст
                    canvas.on('mouse:down', addTextOnCanvas);
                    // Одноразовый обработчик
                    function addTextOnCanvas(opt) {
                        canvas.off('mouse:down', addTextOnCanvas);
                        
                        const pointer = canvas.getPointer(opt.e);
                        const textObj = new fabric.IText('Кликните для редактирования', {
                            left: pointer.x,
                            top: pointer.y,
                            fontFamily: 'Arial',
                            fontSize: 20,
                            fill: '#000000',
                            id: `text-${Date.now()}`,
                            name: 'Текст',
                            objectType: 'text'
                        });
                        
                        canvas.add(textObj);
                        canvas.setActiveObject(textObj);
                        textObj.enterEditing();
                        canvas.renderAll();
                        
                        // Возвращаем инструмент выделения
                        document.querySelector('[data-tool="select"]').click();
                        
                        // Обновляем панель слоев
                        window.updateLayersPanel();
                        window.addToHistory();
                    }
                    break;
                
                case 'grid':
                    toggleGrid();
                    // Возвращаем предыдущий активный инструмент
                    document.querySelector('[data-tool="select"]').click();
                    break;
            }
        });
    });
    
    // Функция для переключения сетки
    function toggleGrid() {
        const canvasContainer = document.querySelector('.canvas-container');
        
        if (canvasContainer.style.backgroundImage) {
            canvasContainer.style.backgroundImage = '';
        } else {
            canvasContainer.style.backgroundImage = `
                linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `;
            canvasContainer.style.backgroundSize = '20px 20px';
        }
    }
    
    // Кнопки Undo/Redo
    document.querySelector('.undo-btn').addEventListener('click', undo);
    document.querySelector('.redo-btn').addEventListener('click', redo);
    
    // Функция Undo
    function undo() {
        if (window.editorState.history.undoStack.length > 0) {
            // Сохраняем текущее состояние в redoStack
            const currentState = JSON.stringify(canvas.toJSON(['id', 'name', 'type', 'objectType', 'customProps']));
            window.editorState.history.redoStack.push(currentState);
            
            // Восстанавливаем предыдущее состояние
            const prevState = window.editorState.history.undoStack.pop();
            canvas.loadFromJSON(prevState, function() {
                canvas.renderAll();
                window.updateLayersPanel();
            });
            
            // Обновляем состояние кнопок
            document.querySelector('.redo-btn').disabled = false;
            document.querySelector('.undo-btn').disabled = window.editorState.history.undoStack.length === 0;
        }
    }
    
    // Функция Redo
    function redo() {
        if (window.editorState.history.redoStack.length > 0) {
            // Сохраняем текущее состояние в undoStack
            const currentState = JSON.stringify(canvas.toJSON(['id', 'name', 'type', 'objectType', 'customProps']));
            window.editorState.history.undoStack.push(currentState);
            
            // Восстанавливаем следующее состояние
            const nextState = window.editorState.history.redoStack.pop();
            canvas.loadFromJSON(nextState, function() {
                canvas.renderAll();
                window.updateLayersPanel();
            });
            
            // Обновляем состояние кнопок
            document.querySelector('.undo-btn').disabled = false;
            document.querySelector('.redo-btn').disabled = window.editorState.history.redoStack.length === 0;
        }
    }
    
    // Экспорт
    document.querySelector('.export-btn').addEventListener('click', () => {
        const activeObject = canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'layout') {
            alert('Пожалуйста, выберите макет для экспорта');
            return;
        }
        
        // Создаем временный canvas для экспорта только макета
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        
        // Устанавливаем размеры канваса
        tempCanvas.width = activeObject.width * activeObject.scaleX;
        tempCanvas.height = activeObject.height * activeObject.scaleY;
        
        // Заполняем фон белым цветом
        ctx.fillStyle = activeObject.fill;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Находим все объекты, которые находятся внутри макета
        const objectsInsideLayout = canvas.getObjects().filter(obj => {
            if (obj === activeObject) return false;
            
            // Определяем границы объектов
            const objBounds = obj.getBoundingRect();
            const layoutBounds = activeObject.getBoundingRect();
            
            // Проверяем, находится ли объект внутри макета
            return (
                objBounds.left >= layoutBounds.left &&
                objBounds.top >= layoutBounds.top &&
                objBounds.left + objBounds.width <= layoutBounds.left + layoutBounds.width &&
                objBounds.top + objBounds.height <= layoutBounds.top + layoutBounds.height
            );
        });
        
        // Создаем временный canvas с Fabric.js для более точного рендеринга
        const tempFabricCanvas = new fabric.StaticCanvas();
        tempFabricCanvas.setWidth(tempCanvas.width);
        tempFabricCanvas.setHeight(tempCanvas.height);
        
        // Добавляем объекты на временный canvas с корректными координатами
        objectsInsideLayout.forEach(obj => {
            obj.clone(function(cloned) {
                // Пересчитываем координаты относительно макета
                cloned.set({
                    left: obj.left - activeObject.left,
                    top: obj.top - activeObject.top
                });
                
                tempFabricCanvas.add(cloned);
            });
        });
        
        // Генерируем изображение
        const dataURL = tempFabricCanvas.toDataURL({
            format: 'png',
            quality: 1.0
        });
        
        // Создаем ссылку для скачивания
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${activeObject.name || 'макет'}.png`;
        link.click();
    });
    
    // Сохранение
    document.querySelector('.save-btn').addEventListener('click', () => {
        // В реальном приложении здесь был бы запрос к серверу для сохранения проекта
        // Для демонстрации просто сохраняем в localStorage
        
        const projectData = {
            name: 'Мой проект',
            date: new Date().toISOString(),
            canvas: canvas.toJSON(['id', 'name', 'type', 'objectType', 'customProps'])
        };
        
        try {
            localStorage.setItem('savedProject', JSON.stringify(projectData));
            alert('Проект успешно сохранен!');
        } catch (e) {
            console.error('Ошибка при сохранении:', e);
            alert('Ошибка при сохранении проекта. Проверьте консоль для деталей.');
        }
    });
    
    // Инициализация панели выравнивания
    document.querySelectorAll('.alignment-panel button').forEach(btn => {
        btn.addEventListener('click', () => {
            const alignType = btn.dataset.align;
            alignObjects(alignType);
        });
    });
    
    function alignObjects(alignType) {
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
    }
    
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

// Функция для инициализации модальных окон
function initModals() {
    // Получаем все модальные окна
    const modals = document.querySelectorAll('.modal');
    
    // Для каждого модального окна добавляем обработчики
    modals.forEach(modal => {
        // Находим кнопку закрытия
        const closeBtn = modal.querySelector('.close-modal');
        
        if (closeBtn) {
            // Обработчик для кнопки закрытия
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }
        
        // Закрытие по клику на фон
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Функция для открытия модального окна
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            
            // Инициализация специфичных модальных окон
            if (modalId === 'create-layout-modal') {
                initCreateLayoutModal(modal);
            }
        }
    };
    
    // Инициализация модального окна создания макета
    function initCreateLayoutModal(modal) {
        // Предустановленные размеры
        modal.querySelectorAll('.layout-size-item').forEach(item => {
            item.addEventListener('click', () => {
                const width = parseInt(item.dataset.width);
                const height = parseInt(item.dataset.height);
                
                document.getElementById('custom-width').value = width;
                document.getElementById('custom-height').value = height;
            });
        });
        
        // Кнопка создания макета
        const createBtn = modal.querySelector('.create-layout-btn');
        createBtn.onclick = () => {
            const width = parseInt(document.getElementById('custom-width').value);
            const height = parseInt(document.getElementById('custom-height').value);
            
            if (width > 0 && height > 0) {
                window.createLayout(width, height);
                modal.classList.remove('show');
            } else {
                alert('Пожалуйста, укажите корректные размеры макета');
            }
        };
    }
    
    // Обработчик клавиши Escape для закрытия модальных окон
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('show')) {
                    modal.classList.remove('show');
                }
            });
        }
    });
}
