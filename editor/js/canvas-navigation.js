// Инициализация навигации по холсту
function initCanvasNavigation() {
    // Текущий масштаб и смещение
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let lastPosX, lastPosY;
    
    // Получаем элементы UI
    const zoomOutBtn = document.querySelector('.zoom-out-btn');
    const zoomInBtn = document.querySelector('.zoom-in-btn');
    const resetZoomBtn = document.querySelector('.reset-zoom-btn');
    const zoomIndicator = document.querySelector('.zoom-indicator');
    
    // Переменные для настройки поведения
    const scrollSpeed = 15; // Скорость скроллинга
    
    // Функция для масштабирования
    function zoomCanvas(factor, point) {
        // Ограничиваем масштаб
        const maxZoom = 5;
        const minZoom = 0.1;
        const oldZoom = zoom;
        zoom = Math.min(maxZoom, Math.max(minZoom, zoom * factor));
        
        // Если масштаб не изменился, выходим
        if (oldZoom === zoom) return;
        
        // Вычисляем новое смещение для сохранения центра масштабирования
        if (point) {
            // Формула для сохранения точки под курсором
            const scaleFactor = zoom / oldZoom;
            panX = point.x - (point.x - panX) * scaleFactor;
            panY = point.y - (point.y - panY) * scaleFactor;
        }
        
        // Применяем масштаб
        applyViewTransform();
    }
    
    // Функция для перемещения холста
    function panCanvas(deltaX, deltaY) {
        panX += deltaX;
        panY += deltaY;
        applyViewTransform();
    }
    
    // Применяем текущие трансформации
    function applyViewTransform() {
        canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);
        canvas.renderAll();
        
        // Обновляем индикатор масштаба
        updateZoomIndicator();
    }
    
    // ИЗМЕНЕНО: Обработчик для колесика мыши теперь делает скроллинг вместо масштабирования
    canvas.on('mouse:wheel', function(opt) {
        opt.e.preventDefault();
        
        // Определяем скорость и направление скроллинга
        const deltaY = opt.e.deltaY * scrollSpeed * 0.1;
        const deltaX = opt.e.deltaX * scrollSpeed * 0.1;
        
        // Если пользователь удерживает Ctrl, то масштабируем (для сохранения такой возможности)
        if (opt.e.ctrlKey) {
            const point = canvas.getPointer(opt.e);
            const factor = opt.e.deltaY > 0 ? 0.9 : 1.1;
            zoomCanvas(factor, point);
        } 
        // В противном случае прокручиваем
        else {
            // Инвертируем направление для более естественного скроллинга
            panCanvas(-deltaX * zoom, -deltaY * zoom);
        }
    });
    
    // Обработчик для начала панорамирования
    canvas.on('mouse:down', function(opt) {
        // Активируем панорамирование только если инструмент "Рука" или средняя кнопка мыши
        if (window.editorState.currentTool === 'hand' || opt.e.button === 1) {
            isPanning = true;
            lastPosX = opt.e.clientX;
            lastPosY = opt.e.clientY;
            canvas.defaultCursor = 'grabbing';
            canvas.selection = false; // Отключаем выделение при перемещении
            opt.e.preventDefault();
        }
    });
    
    // Обработчик для окончания панорамирования
    canvas.on('mouse:up', function() {
        isPanning = false;
        canvas.defaultCursor = window.editorState.currentTool === 'hand' ? 'grab' : 'default';
        canvas.selection = true; // Включаем обратно выделение
    });
    
    // Обработчик для движения при панорамировании
    canvas.on('mouse:move', function(opt) {
        if (isPanning) {
            const e = opt.e;
            const deltaX = e.clientX - lastPosX;
            const deltaY = e.clientY - lastPosY;
            
            if (deltaX !== 0 || deltaY !== 0) {
                panCanvas(deltaX, deltaY);
            }
            
            lastPosX = e.clientX;
            lastPosY = e.clientY;
        }
    });
    
    // Обновление индикатора масштаба
    function updateZoomIndicator() {
        zoomIndicator.textContent = `${Math.round(zoom * 100)}%`;
    }
    
    // Кнопки управления масштабом
    zoomInBtn.addEventListener('click', function() {
        zoomCanvas(1.2, { x: canvas.width / 2, y: canvas.height / 2 });
    });
    
    zoomOutBtn.addEventListener('click', function() {
        zoomCanvas(0.8, { x: canvas.width / 2, y: canvas.height / 2 });
    });
    
    resetZoomBtn.addEventListener('click', function() {
        zoom = 1;
        panX = 0;
        panY = 0;
        applyViewTransform();
    });
    
    // Добавляем горячие клавиши для масштабирования
    document.addEventListener('keydown', function(e) {
        // Ctrl + "+" для увеличения
        if (e.ctrlKey && e.key === '=') {
            e.preventDefault();
            zoomCanvas(1.2, { x: canvas.width / 2, y: canvas.height / 2 });
        }
        // Ctrl + "-" для уменьшения
        else if (e.ctrlKey && e.key === '-') {
            e.preventDefault();
            zoomCanvas(0.8, { x: canvas.width / 2, y: canvas.height / 2 });
        }
        // Ctrl + 0 для сброса
        else if (e.ctrlKey && e.key === '0') {
            e.preventDefault();
            zoom = 1;
            panX = 0;
            panY = 0;
            applyViewTransform();
        }
    });
    
    // Экспортируем функции для использования в других модулях
    window.canvasNavigation = {
        zoom: function(factor) {
            zoomCanvas(factor, { x: canvas.width / 2, y: canvas.height / 2 });
        },
        pan: panCanvas,
        reset: function() {
            zoom = 1;
            panX = 0;
            panY = 0;
            applyViewTransform();
        },
        getCurrentZoom: function() {
            return zoom;
        }
    };
    
    // Инициализируем с масштабом 1
    applyViewTransform();
}
