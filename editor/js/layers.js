// Инициализация панели слоев
function initLayers() {
    const layersList = document.querySelector('.layers-list');
    
    // Обработчик кнопки добавления слоя
    document.querySelector('.add-layer-btn').addEventListener('click', () => {
        // В этой упрощенной версии, добавление нового слоя
        // фактически означает создание нового макета
        showCreateLayoutModal();
    });
    
    // Функция для показа модального окна создания макета
    function showCreateLayoutModal() {
        const modal = document.getElementById('create-layout-modal');
        modal.classList.add('show');
    }
    
    // Делегирование событий для списка слоев
    layersList.addEventListener('click', (e) => {
        // Обработка клика по иконке видимости слоя
        if (e.target.classList.contains('layer-visibility')) {
            const layerItem = findParentElement(e.target, 'layer-item');
            toggleLayerVisibility(layerItem, e.target);
            e.stopPropagation();
        }
        
        // Обработка клика по кнопке удаления
        if (e.target.classList.contains('layer-delete-btn')) {
            const layerItem = findParentElement(e.target, 'layer-item');
            deleteLayer(layerItem);
            e.stopPropagation();
        }
    });
    
    // Функция переключения видимости слоя
    function toggleLayerVisibility(layerItem, visibilityIcon) {
        if (!layerItem || !visibilityIcon) return;
        
        const elementId = layerItem.dataset.id;
        const element = document.getElementById(elementId);
        
        if (element) {
            // Переключаем видимость элемента
            if (visibilityIcon.textContent === 'visibility') {
                element.style.display = 'none';
                visibilityIcon.textContent = 'visibility_off';
                visibilityIcon.style.opacity = 0.5;
            } else {
                element.style.display = '';
                visibilityIcon.textContent = 'visibility';
                visibilityIcon.style.opacity = 1;
            }
        }
    }
    
    // Функция удаления слоя
    function deleteLayer(layerItem) {
        if (!layerItem) return;
        
        const elementId = layerItem.dataset.id;
        const element = document.getElementById(elementId);
        
        if (element) {
            // Проверяем, является ли элемент макетом
            const isLayout = element.classList.contains('layout');
            
            if (isLayout) {
                // Если это макет, нужно также удалить все его дочерние элементы
                // из списка слоев и из состояния
                const childLayers = document.querySelectorAll(`.layer-item[data-parent-id="${elementId}"]`);
                childLayers.forEach(childLayer => {
                    childLayer.remove();
                });
                
                // Удаляем макет из состояния
                window.editorState.layouts = window.editorState.layouts.filter(layout => layout.id !== elementId);
            } else {
                // Если это элемент на макете, удаляем его из соответствующего макета в состоянии
                const parentLayoutId = layerItem.dataset.parentId;
                const layoutState = window.editorState.layouts.find(layout => layout.id === parentLayoutId);
                
                if (layoutState) {
                    layoutState.elements = layoutState.elements.filter(el => el.id !== elementId);
                }
            }
            
            // Удаляем элемент из DOM
            element.remove();
            
            // Удаляем слой из списка
            layerItem.remove();
            
            // Если элемент был выбран, очищаем выбор
            if (window.editorState.selectedElements.some(el => el.id === elementId)) {
                window.canvasFunctions.clearSelection();
            }
            
            // Добавляем действие в историю
            window.addToHistory();
        }
    }
    
    // Экспорт функций для использования в других модулях
    window.layerFunctions = {
        updateLayerSelection: updateLayerSelection,
        deleteLayer: deleteLayer
    };
    
    // Функция для обновления выделения в списке слоев
    function updateLayerSelection(elementId) {
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.id === elementId);
        });
    }
    
    // Функция для поиска родительского элемента с заданным классом
    function findParentElement(element, className) {
        let currentElement = element;
        while (currentElement) {
            if (currentElement.classList && currentElement.classList.contains(className)) {
                return currentElement;
            }
            currentElement = currentElement.parentElement;
        }
        return null;
    }
}

// Функция для добавления макета в список слоев
function addLayoutToLayers(layoutId, name) {
    const layersList = document.querySelector('.layers-list');
    const layerItem = document.createElement('div');
    layerItem.classList.add('layer-item');
    layerItem.dataset.id = layoutId;
    layerItem.innerHTML = `
        <span class="material-icons layer-visibility">visibility</span>
        <span class="material-icons layer-type-icon">dashboard</span>
        <span class="layer-name">${name}</span>
        <div class="layer-actions">
            <span class="material-icons layer-delete-btn" title="Удалить">delete</span>
        </div>
    `;
    
    // Добавляем слой в начало списка (верхний слой)
    layersList.prepend(layerItem);
    
    // Добавляем обработчик клика
    layerItem.addEventListener('click', () => {
        const layout = document.getElementById(layoutId);
        if (layout) {
            window.canvasFunctions.clearSelection();
            window.canvasFunctions.selectLayout(layout);
        }
    });
}

// Функция для добавления элемента в список слоев
function addElementToLayers(elementId, name, parentLayoutId) {
    const layersList = document.querySelector('.layers-list');
    const layerItem = document.createElement('div');
    layerItem.classList.add('layer-item');
    layerItem.dataset.id = elementId;
    layerItem.dataset.parentId = parentLayoutId;
    layerItem.innerHTML = `
        <span class="material-icons layer-visibility">visibility</span>
        <span class="material-icons layer-type-icon">
            ${getIconForElementType(name)}
        </span>
        <span class="layer-name">${name}</span>
        <div class="layer-actions">
            <span class="material-icons layer-delete-btn" title="Удалить">delete</span>
        </div>
    `;
    
    // Находим родительский макет в списке и добавляем элемент после него
    const parentLayer = layersList.querySelector(`[data-id="${parentLayoutId}"]`);
    if (parentLayer && parentLayer.nextSibling) {
        layersList.insertBefore(layerItem, parentLayer.nextSibling);
    } else {
        layersList.appendChild(layerItem);
    }
    
    // Добавляем отступ для вложенности
    layerItem.style.paddingLeft = '24px';
    
    // Добавляем обработчик клика
    layerItem.addEventListener('click', () => {
        const element = document.getElementById(elementId);
        if (element) {
            window.canvasFunctions.clearSelection();
            window.canvasFunctions.selectElement(element);
        }
    });
}

// Получение иконки для типа элемента
function getIconForElementType(typeName) {
    if (typeName.startsWith('Текст')) return 'text_fields';
    if (typeName.startsWith('Изображение')) return 'image';
    if (typeName.startsWith('Фигура')) return 'category';
    return 'layers';
}
