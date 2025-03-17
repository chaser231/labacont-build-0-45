// Инициализация ИИ-инструментов
function initAITools() {
    // Получаем элементы модального окна
    const aiToolsModal = document.getElementById('ai-tools-modal');
    const generateBtn = document.querySelector('.generate-btn');
    const removeBackgroundBtn = document.getElementById('remove-background-btn');
    const expandImageBtn = document.getElementById('expand-image-btn');
    const generativeFillBtn = document.getElementById('generative-fill-btn');
    
    // Обработчик для кнопки генерации изображения
    generateBtn.addEventListener('click', () => {
        const promptInput = document.querySelector('.ai-input');
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Пожалуйста, введите описание для генерации изображения');
            return;
        }
        
        // Закрываем модальное окно
        aiToolsModal.classList.remove('show');
        
        // Запускаем процесс генерации
        generateImage(prompt);
    });
    
    // Обработчик для кнопки удаления фона
    removeBackgroundBtn.addEventListener('click', () => {
        const activeObject = canvas.getActiveObject();
        
        if (!activeObject || (activeObject.type !== 'image' && activeObject.objectType !== 'image')) {
            alert('Пожалуйста, выберите изображение для удаления фона');
            return;
        }
        
        // Закрываем модальное окно
        aiToolsModal.classList.remove('show');
        
        // Запускаем процесс удаления фона
        removeBackground(activeObject);
    });
    
    // Обработчик для кнопки расширения изображения
    expandImageBtn.addEventListener('click', () => {
        const activeObject = canvas.getActiveObject();
        
        if (!activeObject || (activeObject.type !== 'image' && activeObject.objectType !== 'image')) {
            alert('Пожалуйста, выберите изображение для расширения');
            return;
        }
        
        // Закрываем модальное окно
        aiToolsModal.classList.remove('show');
        
        // Показываем диалог выбора направления
        showDirectionDialog(activeObject);
    });
    
    // Обработчик для кнопки генеративной заливки
    generativeFillBtn.addEventListener('click', () => {
        const promptInput = document.querySelectorAll('.ai-input')[1];
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Пожалуйста, введите описание для генерации текстуры');
            return;
        }
        
        const activeObject = canvas.getActiveObject();
        
        if (!activeObject) {
            alert('Пожалуйста, выберите объект для применения заливки');
            return;
        }
        
        // Закрываем модальное окно
        aiToolsModal.classList.remove('show');
        
        // Запускаем процесс генеративной заливки
        generativeFill(activeObject, prompt);
    });
    
    // Функция для генерации изображения
    function generateImage(prompt) {
        showLoadingIndicator('Генерация изображения...');
        
        // В реальном приложении здесь был бы запрос к API
        // Имитируем задержку для демонстрации
        setTimeout(() => {
            // Генерируем случайное изображение placeholder
            const width = 512, height = 512;
            const placeholderUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
            
            // Создаем новый макет или используем существующий
            let targetLayout;
            const activeObject = canvas.getActiveObject();
            
            if (activeObject && activeObject.type === 'layout') {
                targetLayout = activeObject;
            } else {
                targetLayout = window.createLayout(width, height);
            }
            
            // Добавляем изображение
            fabric.Image.fromURL(placeholderUrl, function(img) {
                img.set({
                    left: targetLayout.left + 10,
                    top: targetLayout.top + 10,
                    id: `image-${Date.now()}`,
                    name: `Сгенерированное изображение: ${prompt.substring(0, 20)}`,
                    objectType: 'image'
                });
                
                // Масштабируем изображение, чтобы оно поместилось в макет
                const maxWidth = targetLayout.width * targetLayout.scaleX - 20;
                const maxHeight = targetLayout.height * targetLayout.scaleY - 20;
                
                if (img.width > maxWidth || img.height > maxHeight) {
                    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
                    img.scale(scale);
                }
                
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                
                // Обновляем панель слоев
                window.updateLayersPanel();
                
                // Добавляем в историю
                window.addToHistory();
                
                hideLoadingIndicator();
                
                // Показываем сообщение пользователю
                alert(`Изображение по запросу "${prompt}" создано!\n\nВ реальной версии здесь было бы изображение, сгенерированное ИИ.`);
            });
        }, 2000);
    }
    
    // Функция для удаления фона
    function removeBackground(imageObject) {
        showLoadingIndicator('Удаление фона...');
        
        // В реальном приложении здесь был бы запрос к API
        // Имитируем задержку для демонстрации
        setTimeout(() => {
            // В демо-версии просто показываем другое изображение
            const width = Math.round(imageObject.width * imageObject.scaleX);
            const height = Math.round(imageObject.height * imageObject.scaleY);
            const placeholderUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
            
            // Обновляем изображение
            fabric.Image.fromURL(placeholderUrl, function(img) {
                img.set({
                    left: imageObject.left,
                    top: imageObject.top,
                    scaleX: imageObject.scaleX,
                    scaleY: imageObject.scaleY,
                    angle: imageObject.angle,
                    id: imageObject.id || `image-${Date.now()}`,
                    name: imageObject.name || 'Изображение без фона',
                    objectType: 'image'
                });
                
                // Удаляем старое изображение
                canvas.remove(imageObject);
                
                // Добавляем новое изображение
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                
                // Обновляем панель слоев
                window.updateLayersPanel();
                
                // Добавляем в историю
                window.addToHistory();
                
                hideLoadingIndicator();
                
                // Показываем сообщение пользователю
                alert('Фон изображения удален!\n\nВ реальной версии здесь было бы изображение с удаленным фоном.');
            });
        }, 2000);
    }
    
    // Функция для показа диалога выбора направления расширения
    function showDirectionDialog(imageObject) {
        const dialog = document.createElement('div');
        dialog.className = 'direction-dialog';
        dialog.innerHTML = `
            <div class="direction-dialog-content">
                <h3>Выберите направление расширения</h3>
                <div class="direction-buttons">
                    <button data-direction="up">
                        <span class="material-icons">keyboard_arrow_up</span>
                        <span>Вверх</span>
                    </button>
                    <button data-direction="right">
                        <span class="material-icons">keyboard_arrow_right</span>
                        <span>Вправо</span>
                    </button>
                    <button data-direction="down">
                        <span class="material-icons">keyboard_arrow_down</span>
                        <span>Вниз</span>
                    </button>
                    <button data-direction="left">
                        <span class="material-icons">keyboard_arrow_left</span>
                        <span>Влево</span>
                    </button>
                </div>
                <button class="cancel-btn">Отмена</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Обработчики для кнопок направления
        dialog.querySelectorAll('.direction-buttons button').forEach(btn => {
            btn.addEventListener('click', function() {
                const direction = this.dataset.direction;
                dialog.remove();
                expandImage(imageObject, direction);
            });
        });
        
        // Обработчик для кнопки отмены
        dialog.querySelector('.cancel-btn').addEventListener('click', function() {
            dialog.remove();
        });
    }
    
    // Функция для расширения изображения
    function expandImage(imageObject, direction) {
        showLoadingIndicator('Расширение изображения...');
        
        // В реальном приложении здесь был бы запрос к API
        // Имитируем задержку для демонстрации
        setTimeout(() => {
            // Вычисляем новые размеры в зависимости от направления
            let newWidth = imageObject.width * imageObject.scaleX;
            let newHeight = imageObject.height * imageObject.scaleY;
            let newLeft = imageObject.left;
            let newTop = imageObject.top;
            
            // Определяем, насколько увеличиваем
            const expansionFactor = 1.5;
            
            switch(direction) {
                case 'up':
                    newHeight *= expansionFactor;
                    newTop -= (newHeight - (imageObject.height * imageObject.scaleY)) / 2;
                    break;
                case 'right':
                    newWidth *= expansionFactor;
                    break;
                case 'down':
                    newHeight *= expansionFactor;
                    break;
                case 'left':
                    newWidth *= expansionFactor;
                    newLeft -= (newWidth - (imageObject.width * imageObject.scaleX)) / 2;
                    break;
            }
            
            // Генерируем новое изображение с новыми размерами
            const placeholderUrl = `https://picsum.photos/${Math.round(newWidth)}/${Math.round(newHeight)}?random=${Date.now()}`;
            
            // Обновляем изображение
            fabric.Image.fromURL(placeholderUrl, function(img) {
                img.set({
                    left: newLeft,
                    top: newTop,
                    id: imageObject.id || `image-${Date.now()}`,
                    name: imageObject.name || 'Расширенное изображение',
                    objectType: 'image'
                });
                
                // Удаляем старое изображение
                canvas.remove(imageObject);
                
                // Добавляем новое изображение
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                
                // Обновляем панель слоев
                window.updateLayersPanel();
                
                // Добавляем в историю
                window.addToHistory();
                
                hideLoadingIndicator();
                
                // Показываем сообщение пользователю
                alert(`Изображение расширено в направлении "${direction}"!\n\nВ реальной версии здесь было бы изображение, расширенное ИИ.`);
            });
        }, 2000);
    }
    
    // Функция для генеративной заливки
    function generativeFill(object, prompt) {
        showLoadingIndicator('Генерация текстуры...');
        
        // В реальном приложении здесь был бы запрос к API
        // Имитируем задержку для демонстрации
        setTimeout(() => {
            // Для демонстрации просто используем случайные градиенты
            const colors = [
                ['#FF6B6B', '#4ECDC4', '#45B7D1'],
                ['#F9ED69', '#F08A5D', '#B83B5E'],
                ['#3A0088', '#930077', '#E61C5D'],
                ['#FFCDB2', '#FFB4A2', '#E5989B'],
                ['#051E3E', '#251E3E', '#451E3E']
            ];
            
            // Выбираем случайный набор цветов
            const randomColors = colors[Math.floor(Math.random() * colors.length)];
            
            // Создаем градиент
            const gradient = new fabric.Gradient({
                type: 'linear',
                coords: {
                    x1: 0,
                    y1: 0,
                    x2: object.width,
                    y2: object.height
                },
                colorStops: [
                    { offset: 0, color: randomColors[0] },
                    { offset: 0.5, color: randomColors[1] },
                    { offset: 1, color: randomColors[2] }
                ]
            });
            
            // Применяем градиент к объекту
            object.set('fill', gradient);
            canvas.renderAll();
            
            // Если включено мультиредактирование
            if (window.editorState.multiEditEnabled) {
                // В случае с градиентом нельзя просто скопировать fill, 
                // поэтому найдем похожие объекты и создадим для них такие же градиенты
                const similarObjects = findSimilarObjects(object);
                
                similarObjects.forEach(obj => {
                    const customGradient = new fabric.Gradient({
                        type: 'linear',
                        coords: {
                            x1: 0,
                            y1: 0,
                            x2: obj.width,
                            y2: obj.height
                        },
                        colorStops: [
                            { offset: 0, color: randomColors[0] },
                            { offset: 0.5, color: randomColors[1] },
                            { offset: 1, color: randomColors[2] }
                        ]
                    });
                    
                    obj.set('fill', customGradient);
                });
                
                canvas.renderAll();
            }
            
            // Добавляем в историю
            window.addToHistory();
            
            hideLoadingIndicator();
            
            // Показываем сообщение пользователю
            alert(`Текстура по запросу "${prompt}" применена!\n\nВ реальной версии здесь была бы текстура, сгенерированная ИИ.`);
        }, 2000);
    }
    
    // Найти похожие объекты для мультиредактирования
    function findSimilarObjects(sourceObject) {
        // В этой демо-версии возвращаем пустой массив
        // В реальном приложении здесь был бы поиск похожих объектов
        return [];
    }
    
    // Функция для отображения индикатора загрузки
    function showLoadingIndicator(message = 'Загрузка...') {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="spinner"></div>
            <p>${message}</p>
        `;
        document.body.appendChild(loadingIndicator);
    }
    
    // Функция для скрытия индикатора загрузки
    function hideLoadingIndicator() {
        const loadingIndicator = document.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }
}
