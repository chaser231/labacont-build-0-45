import { Dropdown } from '../components/dropdown.js';

class AnalyticsPage {
    constructor() {
        this.state = {
            selectedCampaign: 'Выберите кампанию',
            activeTab: 'all-data',
            campaigns: [
                'Все кампании',
                'Faberlic на Главной Маркета',
                'Huawei на MT, VK перформанс',
                'Xiaomi департамент Электроника'
            ]
        };

        this.init();
    }

    init() {
        this.initDropdowns();
        this.initTabs();
    }

    initDropdowns() {
        // Профиль пользователя
        this.profileDropdown = new Dropdown({
            button: document.querySelector('[data-el="button-1"]'),
            menu: document.querySelector('.profile-dropdown'),
            onSelect: (item) => {
                if (item.innerText === 'Настройки') {
                    window.location.href = 'settings-dashboard.html';
                }
            }
        });

        // Выбор кампании
        this.campaignDropdown = new Dropdown({
            button: document.querySelector('.campaign-dropdown-button'),
            menu: document.querySelector('.campaign-dropdown-menu'),
            onSelect: (campaign) => {
                this.state.selectedCampaign = campaign;
                this.updateCampaignSelection();
            }
        });
    }

    initTabs() {
        const tabs = document.querySelectorAll('.tab-button');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.setActiveTab(tab);
            });

            tab.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.handleTabNavigation(e.key === 'ArrowRight' ? 1 : -1);
                }
            });
        });
    }

    setActiveTab(tab) {
        const tabs = document.querySelectorAll('.tab-button');
        
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        
        this.state.activeTab = tab.id.replace('-tab', '');
        this.updateChartData();
    }

    handleTabNavigation(direction) {
        const tabs = Array.from(document.querySelectorAll('.tab-button'));
        const currentTab = document.querySelector('[aria-selected="true"]');
        const currentIndex = tabs.indexOf(currentTab);
        const newIndex = (currentIndex + direction + tabs.length) % tabs.length;
        
        this.setActiveTab(tabs[newIndex]);
        tabs[newIndex].focus();
    }

    updateCampaignSelection() {
        const selectedText = document.querySelector('.campaign-selected');
        if (selectedText) {
            selectedText.textContent = this.state.selectedCampaign;
        }
        // Здесь можно добавить обновление графика
        this.updateChartData();
    }

    updateChartData() {
        // Здесь будет логика обновления данных графика
        console.log('Updating chart with:', {
            campaign: this.state.selectedCampaign,
            tab: this.state.activeTab
        });
    }
}

// Инициализация страницы при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsPage();
}); 