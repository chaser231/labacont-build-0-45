document.addEventListener("DOMContentLoaded", function () {
    // State management
    const state = {
      activeTab: "sizes",
      searchText: "",
      isFilterOpen: false,
      isMobileDropdownOpen: false,
      isCategoryDropdownOpen: false,
      isPhotoTypeDropdownOpen: false,
      isCreativeTypeDropdownOpen: false,
      isRecentFilterDropdownOpen: false,
      selectedCategory: "Яндекс Маркет",
      isProfileDropdownOpen: false
    };

    // DOM elements
    const tabs = document.querySelectorAll(".category-tab");
    const mobileTabs = document.querySelectorAll(".mobile-tab");
    const sections = {
      sizes: document.getElementById("sectionSizes"),
      creatives: document.getElementById("sectionCreatives"),
      photos: document.getElementById("sectionPhotos"),
      recent: document.getElementById("sectionRecent")
    };
    const titles = {
      sizes: document.getElementById("titleSizes"),
      creatives: document.getElementById("titleCreatives"),
      photos: document.getElementById("titlePhotos"),
      recent: document.getElementById("titleRecent")
    };

    const mobileCategoryBtn = document.getElementById("mobileCategoryBtn");
    const mobileDropdown = document.getElementById("mobileDropdown");
    const currentCategory = document.getElementById("currentCategory");
    
    const categoryButton = document.getElementById("categoryButton");
    const categoryDropdown = document.getElementById("categoryDropdown");
    const categoryOptions = document.querySelectorAll("#categoryDropdown .filter-option");
    
    const photoTypeButton = document.getElementById("photoTypeButton");
    const photoTypeDropdown = document.getElementById("photoTypeDropdown");
    
    const creativeTypeButton = document.getElementById("creativeTypeButton");
    const creativeTypeDropdown = document.getElementById("creativeTypeDropdown");
    
    const recentFilterButton = document.getElementById("recentFilterButton");
    const recentFilterDropdown = document.getElementById("recentFilterDropdown");
    
    const filterButtons = document.querySelectorAll(".filter-tabs .filter-button");
    
    const searchInputs = document.querySelectorAll(".search-input");
    const searchButtons = document.querySelectorAll(".search-button");
    
    // Профиль пользователя
    const profileButton = document.querySelector('[data-el="button-1"]');
    
    // Initialize tabs
    tabs.forEach(tab => {
      tab.addEventListener("click", function() {
        const tabId = this.getAttribute("data-tab");
        switchTab(tabId);
      });
    });
    
    // Mobile tabs handling
    mobileCategoryBtn.addEventListener("click", function() {
      state.isMobileDropdownOpen = !state.isMobileDropdownOpen;
      mobileDropdown.hidden = !state.isMobileDropdownOpen;
      mobileCategoryBtn.setAttribute("aria-expanded", state.isMobileDropdownOpen);
      
      // Rotate dropdown icon
      const dropdownIcon = mobileCategoryBtn.querySelector(".dropdown-icon");
      dropdownIcon.style.transform = state.isMobileDropdownOpen ? "rotate(180deg)" : "";
    });
    
    mobileTabs.forEach(tab => {
      tab.addEventListener("click", function() {
        const tabId = this.getAttribute("data-tab");
        switchTab(tabId);
        state.isMobileDropdownOpen = false;
        mobileDropdown.hidden = true;
        mobileCategoryBtn.setAttribute("aria-expanded", false);
        currentCategory.textContent = this.textContent;
      });
    });
    
    // Category dropdown
    categoryButton.addEventListener("click", function() {
      state.isCategoryDropdownOpen = !state.isCategoryDropdownOpen;
      categoryDropdown.hidden = !state.isCategoryDropdownOpen;
      categoryButton.setAttribute("aria-expanded", state.isCategoryDropdownOpen);
      
      // Rotate dropdown icon
      const dropdownIcon = categoryButton.querySelector(".filter-icon");
      dropdownIcon.style.transform = state.isCategoryDropdownOpen ? "rotate(180deg)" : "";
    });
    
    categoryOptions.forEach(option => {
      option.addEventListener("click", function() {
        state.selectedCategory = this.getAttribute("data-category");
        categoryButton.querySelector(".filter-text").textContent = state.selectedCategory;
        state.isCategoryDropdownOpen = false;
        categoryDropdown.hidden = true;
        categoryButton.setAttribute("aria-expanded", false);
      });
    });
    
    // Photo type dropdown
    if (photoTypeButton) {
      photoTypeButton.addEventListener("click", function() {
        state.isPhotoTypeDropdownOpen = !state.isPhotoTypeDropdownOpen;
        photoTypeDropdown.hidden = !state.isPhotoTypeDropdownOpen;
        photoTypeButton.setAttribute("aria-expanded", state.isPhotoTypeDropdownOpen);
        
        // Rotate dropdown icon
        const dropdownIcon = photoTypeButton.querySelector(".filter-icon");
        dropdownIcon.style.transform = state.isPhotoTypeDropdownOpen ? "rotate(180deg)" : "";
      });
    }
    
    // Creative type dropdown
    if (creativeTypeButton) {
      creativeTypeButton.addEventListener("click", function() {
        state.isCreativeTypeDropdownOpen = !state.isCreativeTypeDropdownOpen;
        creativeTypeDropdown.hidden = !state.isCreativeTypeDropdownOpen;
        creativeTypeButton.setAttribute("aria-expanded", state.isCreativeTypeDropdownOpen);
        
        // Rotate dropdown icon
        const dropdownIcon = creativeTypeButton.querySelector(".filter-icon");
        dropdownIcon.style.transform = state.isCreativeTypeDropdownOpen ? "rotate(180deg)" : "";
      });
    }
    
    // Recent filter dropdown
    if (recentFilterButton) {
      recentFilterButton.addEventListener("click", function() {
        state.isRecentFilterDropdownOpen = !state.isRecentFilterDropdownOpen;
        recentFilterDropdown.hidden = !state.isRecentFilterDropdownOpen;
        recentFilterButton.setAttribute("aria-expanded", state.isRecentFilterDropdownOpen);
        
        // Rotate dropdown icon
        const dropdownIcon = recentFilterButton.querySelector(".filter-icon");
        dropdownIcon.style.transform = state.isRecentFilterDropdownOpen ? "rotate(180deg)" : "";
      });
    }
    
    // Filter buttons
    filterButtons.forEach(button => {
      button.addEventListener("click", function() {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
      });
    });
    
    // Search functionality
    searchInputs.forEach(input => {
      input.addEventListener("input", function(e) {
        state.searchText = e.target.value;
      });
      
      input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
          handleSearch();
        }
      });
    });
    
    searchButtons.forEach(button => {
      button.addEventListener("click", handleSearch);
    });
    
    function handleSearch() {
      console.log("Searching for:", state.searchText);
      // Implement actual search functionality here
    }
    
    // Profile dropdown
    if (profileButton) {
      profileButton.addEventListener('click', toggleProfileDropdown);
    }
    
    function toggleProfileDropdown() {
      state.isProfileDropdownOpen = !state.isProfileDropdownOpen;
      updateProfileDropdown();
    }
    
    function updateProfileDropdown() {
      const template = document.querySelector('[data-el="show"]');
      if (!template) return;
      
      // Удаляем предыдущий дропдаун, если он есть
      const existingDropdown = document.querySelector('.profile-dropdown');
      if (existingDropdown) {
        existingDropdown.remove();
      }
      
      // Показываем новый дропдаун, если нужно
      if (state.isProfileDropdownOpen) {
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
            toggleProfileDropdown();
          });
        });
        
        // Закрытие дропдауна при клике вне него
        document.addEventListener('click', closeDropdownOutside);
      }
      
      // Обновляем атрибут aria-expanded
      profileButton.setAttribute('aria-expanded', state.isProfileDropdownOpen);
    }
    
    // Закрытие дропдауна при клике вне его области
    function closeDropdownOutside(event) {
      if (!profileButton.contains(event.target) && 
          !document.querySelector('.profile-dropdown')?.contains(event.target)) {
        state.isProfileDropdownOpen = false;
        updateProfileDropdown();
        document.removeEventListener('click', closeDropdownOutside);
      }
    }
    
    // Tab switching
    function switchTab(tabId) {
      state.activeTab = tabId;
      
      // Update tab buttons
      tabs.forEach(tab => {
        const isActive = tab.getAttribute("data-tab") === tabId;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", isActive);
      });
      
      // Show correct section
      Object.keys(sections).forEach(key => {
        sections[key].style.display = key === tabId ? "block" : "none";
      });
      
      // Show correct title
      Object.keys(titles).forEach(key => {
        titles[key].style.display = key === tabId ? "block" : "none";
      });
      
      // Update mobile button text
      if (currentCategory) {
        switch(tabId) {
          case "sizes": currentCategory.textContent = "Размеры"; break;
          case "creatives": currentCategory.textContent = "Креативы"; break;
          case "photos": currentCategory.textContent = "Фото"; break;
          case "recent": currentCategory.textContent = "Последние"; break;
        }
      }
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener("click", function(e) {
      // Category dropdown
      if (state.isCategoryDropdownOpen && !e.target.closest(".filter-menu")) {
        state.isCategoryDropdownOpen = false;
        categoryDropdown.hidden = true;
        categoryButton.setAttribute("aria-expanded", false);
      }
      
      // Mobile dropdown
      if (state.isMobileDropdownOpen && !e.target.closest(".mobile-categories")) {
        state.isMobileDropdownOpen = false;
        mobileDropdown.hidden = true;
        mobileCategoryBtn.setAttribute("aria-expanded", false);
      }
      
      // Photo type dropdown
      if (state.isPhotoTypeDropdownOpen && photoTypeDropdown && !e.target.closest(".filter-menu")) {
        state.isPhotoTypeDropdownOpen = false;
        photoTypeDropdown.hidden = true;
        photoTypeButton.setAttribute("aria-expanded", false);
      }
      
      // Creative type dropdown
      if (state.isCreativeTypeDropdownOpen && creativeTypeDropdown && !e.target.closest(".filter-menu")) {
        state.isCreativeTypeDropdownOpen = false;
        creativeTypeDropdown.hidden = true;
        creativeTypeButton.setAttribute("aria-expanded", false);
      }
      
      // Recent filter dropdown
      if (state.isRecentFilterDropdownOpen && recentFilterDropdown && !e.target.closest(".filter-menu")) {
        state.isRecentFilterDropdownOpen = false;
        recentFilterDropdown.hidden = true;
        recentFilterButton.setAttribute("aria-expanded", false);
      }
    });
    
    // Close dropdowns with Escape key
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        // Close all dropdowns
        state.isCategoryDropdownOpen = false;
        if (categoryDropdown) categoryDropdown.hidden = true;
        if (categoryButton) categoryButton.setAttribute("aria-expanded", false);
        
        state.isMobileDropdownOpen = false;
        if (mobileDropdown) mobileDropdown.hidden = true;
        if (mobileCategoryBtn) mobileCategoryBtn.setAttribute("aria-expanded", false);
        
        state.isPhotoTypeDropdownOpen = false;
        if (photoTypeDropdown) photoTypeDropdown.hidden = true;
        if (photoTypeButton) photoTypeButton.setAttribute("aria-expanded", false);
        
        state.isCreativeTypeDropdownOpen = false;
        if (creativeTypeDropdown) creativeTypeDropdown.hidden = true;
        if (creativeTypeButton) creativeTypeButton.setAttribute("aria-expanded", false);
        
        state.isRecentFilterDropdownOpen = false;
        if (recentFilterDropdown) recentFilterDropdown.hidden = true;
        if (recentFilterButton) recentFilterButton.setAttribute("aria-expanded", false);
      }
    });
  });