export class Toast {
    static defaultOptions = {
        position: 'top-right',
        autoClose: 5000,
        showProgress: true,
        pauseOnHover: true
    };

    static containers = new Map();

    static getContainer(position) {
        if (!this.containers.has(position)) {
            const container = document.createElement('div');
            container.className = `toast-container ${position}`;
            document.body.appendChild(container);
            this.containers.set(position, container);
        }
        return this.containers.get(position);
    }

    static success(message, title = '', options = {}) {
        return new Toast({
            type: 'success',
            message,
            title,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            ...options
        });
    }

    static error(message, title = '', options = {}) {
        return new Toast({
            type: 'error',
            message,
            title,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            ...options
        });
    }

    static warning(message, title = '', options = {}) {
        return new Toast({
            type: 'warning',
            message,
            title,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            ...options
        });
    }

    static info(message, title = '', options = {}) {
        return new Toast({
            type: 'info',
            message,
            title,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            ...options
        });
    }

    constructor(options) {
        this.options = { ...Toast.defaultOptions, ...options };
        this.element = null;
        this.progressBar = null;
        this.progressInterval = null;
        this.timeLeft = this.options.autoClose;
        this.create();
        this.show();
    }

    create() {
        // Создаем элемент уведомления
        this.element = document.createElement('div');
        this.element.className = `toast toast-${this.options.type}`;

        // Добавляем иконку
        if (this.options.icon) {
            const icon = document.createElement('div');
            icon.className = 'toast-icon';
            icon.innerHTML = this.options.icon;
            this.element.appendChild(icon);
        }

        // Добавляем контент
        const content = document.createElement('div');
        content.className = 'toast-content';

        if (this.options.title) {
            const title = document.createElement('div');
            title.className = 'toast-title';
            title.textContent = this.options.title;
            content.appendChild(title);
        }

        const message = document.createElement('div');
        message.className = 'toast-message';
        message.textContent = this.options.message;
        content.appendChild(message);

        this.element.appendChild(content);

        // Добавляем кнопку закрытия
        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeButton.addEventListener('click', () => this.close());
        this.element.appendChild(closeButton);

        // Добавляем индикатор прогресса
        if (this.options.showProgress && this.options.autoClose) {
            this.progressBar = document.createElement('div');
            this.progressBar.className = 'toast-progress';
            this.progressBar.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: var(--color-accent);
                transform-origin: left;
            `;
            this.element.appendChild(this.progressBar);
        }

        // Добавляем обработчики событий
        if (this.options.pauseOnHover && this.options.autoClose) {
            this.element.addEventListener('mouseenter', () => this.pause());
            this.element.addEventListener('mouseleave', () => this.resume());
        }
    }

    show() {
        const container = Toast.getContainer(this.options.position);
        container.appendChild(this.element);

        // Запускаем анимацию
        requestAnimationFrame(() => {
            this.element.classList.add('show');
        });

        // Запускаем автозакрытие
        if (this.options.autoClose) {
            this.startTimer();
        }
    }

    close() {
        this.element.classList.remove('show');
        this.element.addEventListener('transitionend', () => {
            this.element.remove();
            // Удаляем контейнер, если он пустой
            const container = Toast.getContainer(this.options.position);
            if (!container.hasChildNodes()) {
                container.remove();
                Toast.containers.delete(this.options.position);
            }
        }, { once: true });

        this.stopTimer();
    }

    startTimer() {
        if (!this.options.autoClose) return;

        const startTime = Date.now();
        const originalDuration = this.options.autoClose;

        this.progressInterval = setInterval(() => {
            const timeLeft = Math.max(0, this.timeLeft - (Date.now() - startTime));
            if (timeLeft === 0) {
                this.close();
                return;
            }

            if (this.progressBar) {
                const progress = timeLeft / originalDuration;
                this.progressBar.style.transform = `scaleX(${progress})`;
            }

            this.timeLeft = timeLeft;
        }, 10);
    }

    stopTimer() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    pause() {
        this.stopTimer();
    }

    resume() {
        this.startTimer();
    }
}

// Пример использования:
/*
// Успешное уведомление
Toast.success('Операция выполнена успешно', 'Успех');

// Уведомление об ошибке
Toast.error('Произошла ошибка при сохранении', 'Ошибка');

// Предупреждение
Toast.warning('Внимание! Эта операция необратима', 'Предупреждение');

// Информационное уведомление
Toast.info('Новая версия доступна', 'Обновление');

// С дополнительными опциями
Toast.success('Сообщение', 'Заголовок', {
    position: 'bottom-right',
    autoClose: 3000,
    showProgress: true,
    pauseOnHover: true
});
*/ 