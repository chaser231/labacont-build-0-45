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
            
            // Сначала удаляем панель настроек пера, если она существует
            const penSettingsPanel = document.querySelector('.pen-settings-panel');
            if (penSettingsPanel) {
                penSettingsPanel.remove();
                // Удаляем обработчик path:created, если был выбран другой инструмент
                if (toolName !== 'pen') {
                    canvas.off('path:created');
                }
            }
            
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

                // Действия для Пера
                case 'pen':
                    canvas.isDrawingMode = true;
                    canvas.freeDrawingBrush.width = 2;
                    canvas.freeDrawingBrush.color = '#000000';
                    
                    // Добавляем обработчик для созданных путей, если его еще нет
                    if (!canvas._hasPathCreatedHandler) {
                        canvas.on('path:created', function(e) {
                            const path = e.path;
                            path.id = `path-${Date.now()}`;
                            path.name = 'Нарисованный объект';
                            path.objectType = 'path';
                            
                            // Проверяем, находится ли нарисованный объект внутри какого-либо макета
                            const layouts = canvas.getObjects().filter(obj => obj.type === 'layout');
                            for (const layout of layouts) {
                                if (window.isObjectInsideLayout(path, layout)) {
                                    // Если нарисованный объект находится внутри макета, устанавливаем parentId
                                    path.parentId = layout.id;
                                    
                                    // Применяем clipPath, если у макета включена обрезка
                                    applyClipPathToObject(path, layout);
                                    
                                    // Остальной код без изменений...
                                    break;
                                }
                            }
                            
                            // Обновляем панель слоев
                            window.updateLayersPanel();
                            window.addToHistory();
                        });
                        canvas._hasPathCreatedHandler = true;
                    }
                    
                    // Если панели настроек пера еще нет, создаем её
                    if (!document.querySelector('.pen-settings-panel')) {
                        const penSettingsPanel = document.createElement('div');
                        penSettingsPanel.className = 'pen-settings-panel';
                        penSettingsPanel.innerHTML = `
                            <div class="pen-setting">
                                <label>Толщина:</label>
                                <input type="range" id="pen-width" min="1" max="50" value="2">
                                <span id="pen-width-value">2px</span>
                            </div>
                            <div class="pen-setting">
                                <label>Цвет:</label>
                                <input type="color" id="pen-color" value="#000000">
                            </div>
                        `;
                        
                        // Добавляем панель в header-center после инструментов
                        document.querySelector('.header-center').appendChild(penSettingsPanel);
                        
                        // Обработчики для изменения свойств пера
                        document.getElementById('pen-width').addEventListener('input', function(e) {
                            const width = parseInt(e.target.value);
                            canvas.freeDrawingBrush.width = width;
                            document.getElementById('pen-width-value').textContent = width + 'px';
                        });
                        
                        document.getElementById('pen-color').addEventListener('input', function(e) {
                            canvas.freeDrawingBrush.color = e.target.value;
                        });
                    }
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
            console.log("Выполняю Undo...");
            
            // Сохраняем текущее состояние в redoStack
            const currentState = JSON.stringify(canvas.toJSON(['id', 'name', 'type', 'objectType', 'customProps', 'parentId']));
            window.editorState.history.redoStack.push(currentState);
            
            // Восстанавливаем предыдущее состояние
            const prevState = window.editorState.history.undoStack.pop();
            
            try {
                // Очищаем canvas перед загрузкой нового состояния
                canvas.clear();
                
                // Парсим JSON состояния
                const jsonState = JSON.parse(prevState);
                
                canvas.loadFromJSON(jsonState, function() {
                    // После загрузки обязательно восстанавливаем состояние приложения
                    rebuildAppState();
                    
                    canvas.renderAll();
                    window.updateLayersPanel();
                    
                    // Обновляем состояние кнопок
                    document.querySelector('.redo-btn').disabled = false;
                    document.querySelector('.undo-btn').disabled = window.editorState.history.undoStack.length === 0;
                });
            } catch (error) {
                console.error("Ошибка при выполнении Undo:", error);
            }
        }
    }


    // Функция Redo
    function redo() {
        if (window.editorState.history.redoStack.length > 0) {
            console.log("Выполняю Redo...");
            
            // Сохраняем текущее состояние в undoStack
            const currentState = JSON.stringify(canvas.toJSON(['id', 'name', 'type', 'objectType', 'customProps', 'parentId']));
            window.editorState.history.undoStack.push(currentState);
            
            // Восстанавливаем следующее состояние
            const nextState = window.editorState.history.redoStack.pop();
            
            try {
                // Очищаем canvas перед загрузкой нового состояния
                canvas.clear();
                
                // Парсим JSON состояния
                const jsonState = JSON.parse(nextState);
                
                canvas.loadFromJSON(jsonState, function() {
                    // После загрузки обязательно восстанавливаем состояние приложения
                    rebuildAppState();
                    
                    canvas.renderAll();
                    window.updateLayersPanel();
                    
                    // Обновляем состояние кнопок
                    document.querySelector('.undo-btn').disabled = false;
                    document.querySelector('.redo-btn').disabled = window.editorState.history.redoStack.length === 0;
                });
            } catch (error) {
                console.error("Ошибка при выполнении Redo:", error);
            }
        }
    }

    // Функция для перестроения состояния приложения после загрузки из JSON

    function rebuildAppState() {
        // Очищаем текущее состояние layouts
        window.editorState.layouts = [];
        
        // Находим все макеты на canvas
        const layouts = canvas.getObjects().filter(obj => obj.type === 'layout' || obj.objectType === 'layout');
        
        // Перестраиваем состояние для каждого макета
        layouts.forEach(layout => {
            const layoutState = {
                id: layout.id,
                name: layout.name || 'Макет',
                width: layout.width * (layout.scaleX || 1),
                height: layout.height * (layout.scaleY || 1),
                elements: []
            };
            
            // Сохраняем старую позицию для обработки событий перемещения
            layout._oldLeft = layout.left;
            layout._oldTop = layout.top;
            
            // Находим все объекты, принадлежащие этому макету
            const childObjects = canvas.getObjects().filter(obj => 
                obj !== layout && (
                    obj.parentId === layout.id || 
                    window.isObjectInsideLayout(obj, layout)
                )
            );
            
            // Добавляем объекты в состояние макета
            childObjects.forEach(child => {
                // Если объект не имеет parentId, устанавливаем его
                if (!child.parentId) {
                    child.parentId = layout.id;
                }
                
                // Добавляем в состояние
                layoutState.elements.push({
                    id: child.id,
                    name: child.name || getObjectDefaultName(child),
                    type: child.objectType || child.type,
                    parentId: layout.id
                });
            });
            
            // Добавляем макет в общее состояние
            window.editorState.layouts.push(layoutState);
            
            // Восстанавливаем состояние обрезки, если оно было активно
            if (layout.clipChildrenObjects) {
                // Восстанавливаем визуальную индикацию
                layout.set({
                    stroke: '#2196F3',
                    strokeWidth: 2,
                    strokeDashArray: [5, 5]
                });
                
                // Восстанавливаем clipPath для дочерних объектов
                childObjects.forEach(obj => {
                    const objClipRect = new fabric.Rect({
                        left: layout.left,
                        top: layout.top,
                        width: layout.width * layout.scaleX,
                        height: layout.height * layout.scaleY,
                        absolutePositioned: true
                    });
                    
                    obj.clipPath = objClipRect;
                    obj._originalClipState = { hasClipPath: true };
                });
                
                // Восстанавливаем обработчики событий для обновления clipPath
                updateClipPathsOnLayoutChange(layout);
            }
        });
        
        // Служебная функция для получения имени по умолчанию
        function getObjectDefaultName(obj) {
            if (obj.type === 'i-text') return 'Текст';
            if (obj.type === 'image') return 'Изображение';
            if (obj.type === 'path') return 'Нарисованный объект';
            if (obj.type === 'group') return 'Группа';
            if (obj.type === 'rect') return 'Прямоугольник';
            if (obj.type === 'circle') return 'Круг';
            if (obj.type === 'triangle') return 'Треугольник';
            if (obj.type === 'polygon') return 'Многоугольник';
            if (obj.type === 'line') return 'Линия';
            return 'Элемент';
        }
        
        console.log("Состояние приложения перестроено:", window.editorState.layouts);
    }

    // Добавляем функцию для обновления clipPath при изменении размера или положения макета
    function updateClipPathsOnLayoutChange(layout) {
        if (!layout.clipChildrenObjects) return;
        
        // Удаляем старые обработчики, чтобы избежать дублирования
        layout.off('moving');
        layout.off('scaling');
        
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

    // Обработчик для кнопки "Помощь"
    document.querySelector('.help-btn').addEventListener('click', showOnboarding);

    // Функция для отображения онбординга
    function showOnboarding() {
        // Создаем контейнер для онбординга
        const onboardingContainer = document.createElement('div');
        onboardingContainer.className = 'onboarding-container';
        
        // Создаем содержимое онбординга
        onboardingContainer.innerHTML = `
            <div class="onboarding-content">
                <h2>Добро пожаловать в Labacont Editor!</h2>
                <p>Давайте познакомимся с основными возможностями редактора.</p>
                
                <div class="onboarding-steps">
                    <div class="onboarding-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Создание макета</h3>
                            <p>Начните с создания макета, выбрав пункт "Макет" в левой панели, или выберите готовый шаблон.</p>
                        </div>
                    </div>
                    
                    <div class="onboarding-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h3>Добавление элементов</h3>
                            <p>Добавляйте текст, изображения и фигуры на макет с помощью соответствующих кнопок в левой панели.</p>
                        </div>
                    </div>
                    
                    <div class="onboarding-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h3>Редактирование свойств</h3>
                            <p>Выберите любой элемент на холсте, чтобы изменить его свойства в правой панели.</p>
                        </div>
                    </div>
                    
                    <div class="onboarding-step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h3>Мультиредактирование</h3>
                            <p>Включите мультиредактирование, чтобы применять изменения сразу к нескольким похожим элементам.</p>
                        </div>
                    </div>
                    
                    <div class="onboarding-step">
                        <div class="step-number">5</div>
                        <div class="step-content">
                            <h3>ИИ-инструменты</h3>
                            <p>Используйте ИИ-инструменты для генерации изображений и удаления фона.</p>
                        </div>
                    </div>
                    
                    <div class="onboarding-step">
                        <div class="step-number">6</div>
                        <div class="step-content">
                            <h3>Экспорт результата</h3>
                            <p>Когда работа будет готова, нажмите кнопку "Экспорт" или "Сохранить" в верхней панели.</p>
                        </div>
                    </div>
                </div>
                
                <div class="onboarding-controls">
                    <button class="primary-btn" id="onboarding-close-btn">Начать работу</button>
                </div>
            </div>
        `;
        
        // Добавляем на страницу
        document.body.appendChild(onboardingContainer);
        
        // Добавляем обработчик для закрытия
        document.getElementById('onboarding-close-btn').addEventListener('click', function() {
            onboardingContainer.classList.add('closing');
            setTimeout(() => {
                onboardingContainer.remove();
            }, 500);
        });
        
        // Анимируем появление
        setTimeout(() => {
            onboardingContainer.classList.add('visible');
        }, 50);
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
        // Добавить в функцию initUI() перед закрывающей скобкой
        document.querySelector('.ai-tools-btn').addEventListener('click', () => {
        window.openModal('ai-tools-modal');
    });
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
