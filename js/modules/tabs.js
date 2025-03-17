export class Tabs {
    constructor() {
        this.state = {
            activeTab: "sizes"
        };
        
        this.tabs = document.querySelectorAll('[role="tab"]');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        if (this.tabs.length && this.tabContents.length) {
            this.init();
        }
    }

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });

            tab.addEventListener('keydown', (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    const tabId = tab.getAttribute('data-tab');
                    this.switchTab(tabId);
                }
            });
        });
    }

    switchTab(tabId) {
        this.state.activeTab = tabId;
        
        // Обновляем классы активности для вкладок
        this.tabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
            
            if (isActive) {
                tab.style.backgroundColor = '#404040';
                tab.style.color = '#ffffff';
            } else {
                tab.style.backgroundColor = 'transparent';
                tab.style.color = '#404040';
            }
        });
        
        // Показываем/скрываем соответствующий контент
        this.tabContents.forEach(content => {
            content.style.display = content.id === `${tabId}-content` ? 'block' : 'none';
        });
    }
} 