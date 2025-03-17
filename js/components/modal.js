export class Modal {
    constructor(options = {}) {
        this.options = {
            id: options.id || `modal-${Date.now()}`,
            title: options.title || '',
            content: options.content || '',
            size: options.size || '',
            onClose: options.onClose || null,
            onConfirm: options.onConfirm || null,
            showFooter: options.showFooter !== undefined ? options.showFooter : true,
            confirmText: options.confirmText || 'Подтвердить',
            cancelText: options.cancelText || 'Отмена'
        };

        this.element = null;
        this.overlay = null;
        this.closeButton = null;
        this.confirmButton = null;
        this.cancelButton = null;

        this.create();
        this.initEvents();
    }

    create() {
        // Создаем оверлей
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';

        // Создаем модальное окно
        this.element = document.createElement('div');
        this.element.className = `modal ${this.options.size}`;
        this.element.setAttribute('role', 'dialog');
        this.element.setAttribute('aria-modal', 'true');
        this.element.setAttribute('aria-labelledby', `${this.options.id}-title`);

        // Создаем заголовок
        const header = document.createElement('div');
        header.className = 'modal-header';

        const title = document.createElement('h2');
        title.className = 'modal-title';
        title.id = `${this.options.id}-title`;
        title.textContent = this.options.title;

        this.closeButton = document.createElement('button');
        this.closeButton.className = 'modal-close';
        this.closeButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        this.closeButton.setAttribute('aria-label', 'Закрыть');

        header.appendChild(title);
        header.appendChild(this.closeButton);

        // Создаем контент
        const content = document.createElement('div');
        content.className = 'modal-content';
        if (typeof this.options.content === 'string') {
            content.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            content.appendChild(this.options.content);
        }

        // Создаем футер
        let footer = null;
        if (this.options.showFooter) {
            footer = document.createElement('div');
            footer.className = 'modal-footer';

            this.cancelButton = document.createElement('button');
            this.cancelButton.className = 'btn btn-secondary';
            this.cancelButton.textContent = this.options.cancelText;

            this.confirmButton = document.createElement('button');
            this.confirmButton.className = 'btn btn-primary';
            this.confirmButton.textContent = this.options.confirmText;

            footer.appendChild(this.cancelButton);
            footer.appendChild(this.confirmButton);
        }

        // Собираем модальное окно
        this.element.appendChild(header);
        this.element.appendChild(content);
        if (footer) {
            this.element.appendChild(footer);
        }

        this.overlay.appendChild(this.element);
    }

    initEvents() {
        // Закрытие по клику на оверлей
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Закрытие по кнопке
        this.closeButton.addEventListener('click', () => this.close());

        // Обработка кнопок в футере
        if (this.options.showFooter) {
            this.cancelButton.addEventListener('click', () => this.close());
            this.confirmButton.addEventListener('click', () => {
                if (this.options.onConfirm) {
                    this.options.onConfirm();
                }
                this.close();
            });
        }

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    open() {
        document.body.appendChild(this.overlay);
        // Даем время для рендеринга
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
        });
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        this.overlay.addEventListener('transitionend', () => {
            if (this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            document.body.style.overflow = '';
            if (this.options.onClose) {
                this.options.onClose();
            }
        }, { once: true });
    }

    isOpen() {
        return this.overlay.classList.contains('active');
    }

    setContent(content) {
        const contentElement = this.element.querySelector('.modal-content');
        if (typeof content === 'string') {
            contentElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentElement.innerHTML = '';
            contentElement.appendChild(content);
        }
    }

    setTitle(title) {
        const titleElement = this.element.querySelector('.modal-title');
        titleElement.textContent = title;
    }
}

// Пример использования:
/*
const modal = new Modal({
    title: 'Подтверждение',
    content: 'Вы уверены, что хотите выполнить это действие?',
    size: 'modal-sm',
    onConfirm: () => {
        console.log('Действие подтверждено');
    },
    onClose: () => {
        console.log('Модальное окно закрыто');
    }
});

modal.open();
*/ 