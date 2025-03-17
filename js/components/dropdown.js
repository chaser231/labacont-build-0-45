

document.addEventListener("DOMContentLoaded", function () {
    // State management
    const state = {
      searchText: "",
      isFilterOpen: false,
      selectedFilters: [],
      viewMode: "rows",
    };

    // DOM elements
    const filterButton = document.getElementById("filterButton");
    const filterDropdown = document.getElementById("filterDropdown");
    const filterOptions = document.querySelectorAll(".filter-option");
    const searchInput = document.querySelector(".search-input");
    const searchButton = document.querySelector(".search-button");
    const viewButtons = document.querySelectorAll(".view-button");
    const projectRows = document.querySelector(".project-rows");
    const tilesBlock = document.querySelector(".tiles-block");

    // Профиль пользователя
    const profileButton = document.querySelector('[data-el="button-1"]');
    if (profileButton) {
        profileButton.addEventListener('click', toggleDropdown);
        profileButton.addEventListener('keydown', handleDropdownKeyDown);
    }

    // Toggle filter dropdown
    filterButton.addEventListener("click", function () {
      state.isFilterOpen = !state.isFilterOpen;
      filterDropdown.hidden = !state.isFilterOpen;
      filterButton.setAttribute("aria-expanded", state.isFilterOpen);

      // Update filter count display
      const filterText = filterButton.querySelector(".filter-text");
      if (state.selectedFilters.length > 0) {
        filterText.textContent = `фильтрация (${state.selectedFilters.length})`;
      } else {
        filterText.textContent = "фильтрация";
      }
    });

    // Handle filter selection
    filterOptions.forEach((option) => {
      option.addEventListener("click", function () {
        const filterId = this.dataset.filter;
        const index = state.selectedFilters.indexOf(filterId);

        if (index === -1) {
          state.selectedFilters.push(filterId);
          this.classList.add("selected");
        } else {
          state.selectedFilters.splice(index, 1);
          this.classList.remove("selected");
        }

        // Update filter count display
        const filterText = filterButton.querySelector(".filter-text");
        if (state.selectedFilters.length > 0) {
          filterText.textContent = `фильтрация (${state.selectedFilters.length})`;
        } else {
          filterText.textContent = "фильтрация";
        }
      });
    });

    // Handle search
    searchInput.addEventListener("input", function (e) {
      state.searchText = e.target.value;
    });

    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        handleSearch();
      }
    });
    
    // Функция для переключения состояния выпадающего меню
    function toggleDropdown() {
    state.isDropdownOpen = !state.isDropdownOpen;
    updateDropdown();
}

// Обработка клавиатурных событий для выпадающего меню
function handleDropdownKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDropdown();
    }
}

// Обновление состояния выпадающего меню профиля
function updateDropdown() {
    const template = document.querySelector('[data-el="show"]');
    if (!template) return;

    // Удаляем предыдущий дропдаун, если он есть
    const existingDropdown = document.querySelector('.profile-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }

    // Показываем новый дропдаун, если нужно
    if (state.isDropdownOpen) {
        const dropdown = template.content.cloneNode(true);
        template.after(dropdown);

        // Добавляем обработчики для пунктов меню
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.innerText === 'Настройки') {
                    // Переход на страницу настроек
                    console.log('Переход на настройки');
                } else if (item.innerText === 'Выход из аккаунта') {
                    // Выход из аккаунта
                    console.log('Выход из аккаунта');
                }
                toggleDropdown();
            });
        });

        // Закрытие дропдауна при клике вне него
        document.addEventListener('click', closeDropdownOutside);
    }

    // Обновляем атрибут aria-expanded
    profileButton.setAttribute('aria-expanded', state.isDropdownOpen);
}

// Закрытие дропдауна при клике вне его области
function closeDropdownOutside(event) {
    if (!profileButton.contains(event.target) && 
        !document.querySelector('.profile-dropdown')?.contains(event.target)) {
        state.isDropdownOpen = false;
        updateDropdown();
        document.removeEventListener('click', closeDropdownOutside);
    }
}

    searchButton.addEventListener("click", handleSearch);

    function handleSearch() {
      console.log("Searching for:", state.searchText);
      // Implement actual search functionality here
    }

    // Handle view mode switching
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        viewButtons.forEach((btn) => btn.classList.remove("active-view"));
        this.classList.add("active-view");

        if (this.classList.contains("grid-view")) {
          state.viewMode = "rows";
          projectRows.hidden = false;
          tilesBlock.hidden = true;
        } else {
          state.viewMode = "tiles";
          projectRows.hidden = true;
          tilesBlock.hidden = false;
        }
      });
    });

    // Close filter dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (state.isFilterOpen && !e.target.closest(".filter-menu")) {
        state.isFilterOpen = false;
        filterDropdown.hidden = true;
        filterButton.setAttribute("aria-expanded", false);
      }
    });
  });
  
  // Пример использования:
/*
const profileDropdown = new Dropdown({
    button: document.querySelector('[data-el="button-1"]'),
    menu: document.querySelector('.profile-dropdown'),
    onSelect: (item) => {
        console.log('Selected:', item);
    }
});
*/ 