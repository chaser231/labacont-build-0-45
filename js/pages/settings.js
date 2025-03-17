import { Tabs } from '../components/tabs.js';

class SettingsPage {
    constructor() {
        this.init();
    }

    init() {
        this.initTabs();
        this.initFormHandlers();
    }

    initTabs() {
        this.tabs = new Tabs({
            container: document.querySelector('.settings-panel'),
            onChange: (tabId) => {
                this.handleTabChange(tabId);
            }
        });
    }

    handleTabChange(tabId) {
        // Сохраняем активную вкладку в URL
        const url = new URL(window.location);
        url.searchParams.set('tab', tabId);
        window.history.pushState({}, '', url);
    }

    initFormHandlers() {
        // Обработчики для чекбоксов
        document.querySelectorAll('.checkbox-container').forEach(checkbox => {
            checkbox.addEventListener('click', () => {
                const toggle = checkbox.querySelector('.checkbox-toggle');
                toggle.classList.toggle('active');
            });
        });

        // Обработчики для кнопок редактирования
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const container = e.target.closest('.input-container');
                const text = container.querySelector('.input-text');
                
                // Создаем input для редактирования
                const input = document.createElement('input');
                input.type = 'text';
                input.value = text.textContent;
                input.className = 'edit-input';
                
                // Заменяем текст на input
                text.replaceWith(input);
                input.focus();

                // Обработчик потери фокуса
                input.addEventListener('blur', () => {
                    const newText = document.createElement('div');
                    newText.className = 'input-text';
                    newText.textContent = input.value;
                    input.replaceWith(newText);
                });

                // Обработчик Enter
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        input.blur();
                    }
                });
            });
        });

        // Обработчики для кнопок действий
        const resetButton = document.querySelector('.reset-button');
        const applyButton = document.querySelector('.apply-button');

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.handleReset();
            });
        }

        if (applyButton) {
            applyButton.addEventListener('click', () => {
                this.handleApply();
            });
        }
    }

    handleReset() {
        // Логика сброса формы
        console.log('Resetting form...');
    }

    handleApply() {
        // Логика применения изменений
        console.log('Applying changes...');
    }
}

// Инициализация страницы при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new SettingsPage();
}); 