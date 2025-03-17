document.addEventListener("DOMContentLoaded", function () {
    // State management
    const state = {
      isDropdownOpen: false,
      isCampaignDropdownOpen: false,
      selectedCampaign: "Выберите кампанию",
      activeTab: "all",
      campaigns: [
        "Все кампании",
        "Faberlic на Главной Маркета",
        "Huawei на MT, VK перформанс",
        "Xiaomi департамент Электроника",
      ],
    };

    // Campaign dropdown functionality
    const campaignButton = document.querySelector(
      ".campaign-dropdown-button",
    );
    const campaignDropdown = document.querySelector(
      ".campaign-dropdown-menu",
    );
    const campaignSelected = document.querySelector(".campaign-selected");
    const campaignOptions = document.querySelectorAll(".campaign-option");

    campaignButton.addEventListener("click", function () {
      state.isCampaignDropdownOpen = !state.isCampaignDropdownOpen;
      campaignButton.setAttribute(
        "aria-expanded",
        state.isCampaignDropdownOpen,
      );
      campaignDropdown.hidden = !state.isCampaignDropdownOpen;
    });

    campaignOptions.forEach((option) => {
      option.addEventListener("click", function () {
        state.selectedCampaign = this.textContent;
        campaignSelected.textContent = state.selectedCampaign;
        state.isCampaignDropdownOpen = false;
        campaignButton.setAttribute("aria-expanded", false);
        campaignDropdown.hidden = true;
      });
    });

    // Tab functionality
    const tabs = document.querySelectorAll(".tab-button");

    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Remove active class from all tabs
        tabs.forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
          t.setAttribute("tabindex", "-1");
        });

        // Add active class to clicked tab
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");
        this.setAttribute("tabindex", "0");

        // Update active tab in state
        state.activeTab = this.id.replace("-tab", "");
      });

      tab.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();

          const tabArray = Array.from(tabs);
          const currentIndex = tabArray.indexOf(this);
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const newIndex =
            (currentIndex + direction + tabArray.length) % tabArray.length;

          tabArray[newIndex].click();
          tabArray[newIndex].focus();
        }
      });
    });
  });