// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Создаем объект для хранения состояния приложения
    window.editorState = {
        multiEditEnabled: true,
        currentTool: 'select',
        selectedElements: [],
        layouts: [],
        history: {
            undoStack: [],
            redoStack: []
        },
        clipboard: null,
        theme: 'dark' // Устанавливаем темную тему по умолчанию
    };

    // Инициализация приложения
    initApp();
});

function initApp() {
    // Создаем Canvas с Fabric.js
    window.canvas = new fabric.Canvas('editor-canvas', {
        backgroundColor: '#E0E0E0',
        preserveObjectStacking: true,
        stopContextMenu: false,
        selection: true
    });
    
    // Сериализация объектов в JSON 
    fabric.Object.prototype.toObject = (function(toObject) {
        return function(propertiesToInclude) {
            return fabric.util.object.extend(toObject.call(this, propertiesToInclude), {
                id: this.id,
                name: this.name,
                type: this.type,
                objectType: this.objectType,
                parentId: this.parentId,
                customProps: this.customProps
            });
        };
    })(fabric.Object.prototype.toObject);

    // Устанавливаем размер Canvas
    function resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        canvas.setWidth(containerWidth);
        canvas.setHeight(containerHeight);
        canvas.renderAll();
    }
    
    // Изменяем размер при загрузке и изменении окна
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Инициализируем все модули
    initCanvas();
    initUI();
    initTools();
    initLayers();
    initTemplates();
    initProperties();
    initAITools();
    initCanvasNavigation();
    initMultiEditFeature();
    initAdvancedObjectManagement();
    initContextMenu();
    
    // Применяем темную тему
    applyDarkTheme();
    
    console.log('Редактор инициализирован успешно');
}

// Применение темной темы к элементам интерфейса
function applyDarkTheme() {
    // Устанавливаем цвет фона для контекстного меню
    document.documentElement.style.setProperty('--context-menu-bg', 'var(--secondary-color)');
    document.documentElement.style.setProperty('--context-menu-text', 'var(--text-color)');
    
    // Адаптируем цвет модальных окон
    document.querySelectorAll('.modal-content').forEach(modal => {
        modal.style.backgroundColor = 'var(--secondary-color)';
        modal.style.color = 'var(--text-color)';
    });
    
    // Адаптируем стиль для текстовых полей
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.classList.add('dark-input');
    });
    
    // Адаптируем цвет для svg иконок, если они используются
    document.querySelectorAll('svg').forEach(svg => {
        svg.style.fill = 'currentColor';
    });
}

// Глобальная функция для добавления в историю

window.addToHistory = function() {
    // Ограничиваем размер стека истории
    const maxHistorySize = 50;
    
    // Если стек уже слишком большой, удаляем самое старое состояние
    if (window.editorState.history.undoStack.length >= maxHistorySize) {
        window.editorState.history.undoStack.shift();
    }
    
    // Сохраняем дополнительные свойства, включая clipChildrenObjects
    const json = canvas.toJSON(['id', 'name', 'type', 'objectType', 'customProps', 'parentId', 'clipChildrenObjects']);
    const jsonString = JSON.stringify(json);
    
    // Проверяем, отличается ли новое состояние от последнего сохраненного
    const lastState = window.editorState.history.undoStack.length > 0
        ? window.editorState.history.undoStack[window.editorState.history.undoStack.length - 1]
        : null;
        
    if (lastState !== jsonString) {
        // Добавляем в undoStack
        window.editorState.history.undoStack.push(jsonString);
        window.editorState.history.redoStack = []; // Очищаем стек Redo при новом действии
    }
    
    // Активируем кнопку Undo
    document.querySelector('.undo-btn').disabled = false;
    document.querySelector('.redo-btn').disabled = true;
};


window.isObjectInsideLayout = function(obj, layout) {
    if (!obj || !layout) return false;
    
    try {
        const objBounds = obj.getBoundingRect();
        const layoutBounds = layout.getBoundingRect();
        
        return (
            objBounds.left >= layoutBounds.left &&
            objBounds.top >= layoutBounds.top &&
            objBounds.left + objBounds.width <= layoutBounds.left + layoutBounds.width &&
            objBounds.top + objBounds.height <= layoutBounds.top + layoutBounds.height
        );
    } catch (error) {
        console.error("Ошибка при проверке вложенности объекта:", error);
        return false;
    }
};


// Глобальная функция для поиска объекта по ID
window.findObjectById = function(id) {
    return canvas.getObjects().find(obj => obj.id === id);
};

// Обработчик для клавиш Delete/Backspace
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && 
        document.activeElement.tagName !== 'INPUT' && 
        document.activeElement.tagName !== 'TEXTAREA' &&
        !document.activeElement.isContentEditable) {
        
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            e.preventDefault();
            
            // Если это группа, удаляем все объекты в группе
            if (activeObject.type === 'activeSelection') {
                const items = activeObject._objects;
                canvas.discardActiveObject();
                items.forEach(item => {
                    canvas.remove(item);
                });
            } else {
                canvas.remove(activeObject);
            }
            
            canvas.renderAll();
            updateLayersPanel();
            window.addToHistory();
        }
    }
});

//функция для проверки, находится ли объект внутри макета
window.isObjectInsideLayout = function(obj, layout) {
    if (!obj || !layout) return false;
    
    const objBounds = obj.getBoundingRect();
    const layoutBounds = layout.getBoundingRect();
    
    return (
        objBounds.left >= layoutBounds.left &&
        objBounds.top >= layoutBounds.top &&
        objBounds.left + objBounds.width <= layoutBounds.left + layoutBounds.width &&
        objBounds.top + objBounds.height <= layoutBounds.top + layoutBounds.height
    );
};

// Функции для работы с контекстным меню
function initContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    
    // Скрыть контекстное меню
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }
    
    // Показать контекстное меню
    function showContextMenu(x, y) {
        const activeObject = canvas.getActiveObject();
        
        // Показываем/скрываем пункты в зависимости от выбранного объекта
        const copyItem = contextMenu.querySelector('[data-action="copy"]');
        const pasteItem = contextMenu.querySelector('[data-action="paste"]');
        const duplicateItem = contextMenu.querySelector('[data-action="duplicate"]');
        const groupItem = contextMenu.querySelector('[data-action="group"]');
        const ungroupItem = contextMenu.querySelector('[data-action="ungroup"]');
        const deleteItem = contextMenu.querySelector('[data-action="delete"]');
        
        copyItem.style.display = activeObject ? 'flex' : 'none';
        pasteItem.style.display = window.editorState.clipboard ? 'flex' : 'none';
        duplicateItem.style.display = activeObject ? 'flex' : 'none';
        deleteItem.style.display = activeObject ? 'flex' : 'none';
        
        // Для группировки/разгруппировки
        if (activeObject && activeObject.type === 'activeSelection') {
            groupItem.style.display = 'flex';
            ungroupItem.style.display = 'none';
        } else if (activeObject && activeObject.type === 'group') {
            groupItem.style.display = 'none';
            ungroupItem.style.display = 'flex';
        } else {
            groupItem.style.display = 'none';
            ungroupItem.style.display = 'none';
        }
        
        // Позиционируем меню
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
        
        // Проверяем, не выходит ли меню за пределы экрана
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = `${y - rect.height}px`;
        }
    }
    
    // Обработчик правого клика по холсту
    canvas.upperCanvasEl.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const x = e.clientX;
        const y = e.clientY;
        
        // Если нет выбранных объектов, проверяем объект под курсором
        if (!canvas.getActiveObject()) {
            const pointer = canvas.getPointer(e);
            const objectUnderCursor = canvas.findTarget(e);
            if (objectUnderCursor) {
                canvas.setActiveObject(objectUnderCursor);
                canvas.renderAll();
            }
        }
        
        showContextMenu(x, y);
    });
    
    // Скрываем контекстное меню при клике в другом месте
    document.addEventListener('click', function(e) {
        if (!contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
    
    // Скрываем контекстное меню при прокрутке или изменении размера
    window.addEventListener('scroll', hideContextMenu);
    window.addEventListener('resize', hideContextMenu);
    
    // Обработчики для пунктов меню
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            const activeObject = canvas.getActiveObject();
            
            switch(action) {
                case 'copy':
                    if (activeObject) {
                        // Клонируем объект для буфера обмена
                        activeObject.clone(function(cloned) {
                            window.editorState.clipboard = cloned;
                        });
                    }
                    break;
                
                case 'paste':
                    if (window.editorState.clipboard) {
                        // Клонируем объект из буфера обмена
                        window.editorState.clipboard.clone(function(cloned) {
                            // Смещаем новый объект, чтобы было видно, что это копия
                            cloned.set({
                                left: cloned.left + 20,
                                top: cloned.top + 20,
                                id: `object-${Date.now()}`,
                                name: cloned.name ? `${cloned.name} копия` : 'Копия'
                            });
                            
                            canvas.add(cloned);
                            canvas.setActiveObject(cloned);
                            canvas.renderAll();
                            updateLayersPanel();
                            window.addToHistory();
                        });
                    }
                    break;
                
                case 'duplicate':
                    if (activeObject) {
                        // Дублируем выбранный объект
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
                            updateLayersPanel();
                            window.addToHistory();
                        });
                    }
                    break;
                
                case 'group':
                    if (activeObject && activeObject.type === 'activeSelection') {
                        // Группируем выбранные объекты
                        const group = activeObject.toGroup();
                        group.id = `group-${Date.now()}`;
                        group.name = 'Группа';
                        group.type = 'group';
                        canvas.renderAll();
                        updateLayersPanel();
                        window.addToHistory();
                    }
                    break;
                
                case 'ungroup':
                    if (activeObject && activeObject.type === 'group') {
                        // Разгруппировываем группу
                        const items = activeObject.toActiveSelection();
                        canvas.renderAll();
                        updateLayersPanel();
                        window.addToHistory();
                    }
                    break;
                
                case 'delete':
                    if (activeObject) {
                        // Удаляем выбранный объект
                        if (activeObject.type === 'activeSelection') {
                            const items = activeObject._objects;
                            canvas.discardActiveObject();
                            items.forEach(item => {
                                canvas.remove(item);
                            });
                        } else {
                            canvas.remove(activeObject);
                        }
                        
                        canvas.renderAll();
                        updateLayersPanel();
                        window.addToHistory();
                    }
                    break;
            }
            
            hideContextMenu();
        });
    });
}
