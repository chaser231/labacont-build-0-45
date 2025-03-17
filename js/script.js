import { Dropdown } from './modules/dropdown.js';
import { Tabs } from './modules/tabs.js';
import { Slider } from './modules/slider.js';

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация компонентов
    const dropdown = new Dropdown('[data-el="button-1"]');
    const tabs = new Tabs();
    const slider = new Slider('projectsSlider', { scrollAmount: 385 });

    // Отслеживание изменения размера окна
    const state = {
        deviceSize: window.innerWidth <= 768 ? "small" : "large"
    };

    window.addEventListener('resize', () => {
        const newSize = window.innerWidth <= 768 ? "small" : "large";
        if (state.deviceSize !== newSize) {
            state.deviceSize = newSize;
            // Здесь можно добавить обработку изменения размера экрана
        }
    });
});
