export class Dropdown {
    constructor(buttonSelector) {
        this.state = {
            isOpen: false
        };
        
        this.button = document.querySelector(buttonSelector);
        if (this.button) {
            this.init();
        }
    }

    init() {
        this.button.addEventListener('click', () => this.toggle());
        this.button.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    toggle() {
        this.state.isOpen = !this.state.isOpen;
        this.update();
    }

    handleKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.toggle();
        }
    }

    update() {
        const template = document.querySelector('[data-el="show"]');
        if (!template) return;

        // Удаляем предыдущий дропдаун
        const existingDropdown = document.querySelector('.profile-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        // Показываем новый дропдаун
        if (this.state.isOpen) {
            const dropdown = template.content.cloneNode(true);
            template.after(dropdown);

            // Добавляем обработчики для пунктов меню
            document.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.handleItemClick(item.innerText);
                });
            });

            // Закрытие дропдауна при клике вне
            document.addEventListener('click', this.handleOutsideClick.bind(this));
        }

        // Обновляем aria-expanded
        this.button.setAttribute('aria-expanded', this.state.isOpen);
    }

    handleItemClick(text) {
        switch(text) {
            case 'Настройки':
                console.log('Переход на настройки');
                break;
            case 'Выход из аккаунта':
                console.log('Выход из аккаунта');
                break;
        }
        this.toggle();
    }

    handleOutsideClick(event) {
        if (!this.button.contains(event.target) && 
            !document.querySelector('.profile-dropdown')?.contains(event.target)) {
            this.state.isOpen = false;
            this.update();
            document.removeEventListener('click', this.handleOutsideClick.bind(this));
        }
    }
} 