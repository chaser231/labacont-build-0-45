document.addEventListener("DOMContentLoaded", function () {
    // Tab functionality
    const accountTab = document.getElementById("account-tab");
    const profileTab = document.getElementById("profile-tab");
    const subscriptionTab = document.getElementById("subscription-tab");
  
    const accountSection = document.getElementById("account-settings-section");
    const profileSection = document.getElementById("profile-settings-section");
    const subscriptionSection = document.getElementById(
      "subscription-settings-section",
    );
  
    // Function to set active tab
    function setActiveTab(tab, section) {
      // Reset all tabs
      [accountTab, profileTab, subscriptionTab].forEach((t) => {
        t.setAttribute("aria-selected", "false");
        t.style.backgroundColor = "transparent";
      });
  
      // Reset all sections
      [accountSection, profileSection, subscriptionSection].forEach((s) => {
        s.style.display = "none";
      });
  
      // Set active tab and section
      tab.setAttribute("aria-selected", "true");
      tab.style.backgroundColor = "rgba(242, 241, 241, 1)";
      section.style.display = "block";
    }
  
    // Event listeners for tabs
    accountTab.addEventListener("click", function () {
      setActiveTab(accountTab, accountSection);
    });
  
    profileTab.addEventListener("click", function () {
      setActiveTab(profileTab, profileSection);
    });
  
    subscriptionTab.addEventListener("click", function () {
      setActiveTab(subscriptionTab, subscriptionSection);
    });
  
    // Keyboard navigation for tabs
    [accountTab, profileTab, subscriptionTab].forEach((tab) => {
      tab.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          tab.click();
        }
      });
    });
  
    // Toggle functionality for checkboxes
    const checkboxes = document.querySelectorAll(".checkbox-container");
  
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("click", function () {
        const toggle = this.querySelector(".checkbox-toggle");
  
        if (toggle.style.left === "22px") {
          toggle.style.left = "2px";
          this.style.backgroundColor = "#e5e5e5";
        } else {
          toggle.style.left = "22px";
          this.style.backgroundColor = "#ffdb4a";
        }
      });
  
      // Make checkboxes keyboard accessible
      checkbox.setAttribute("tabindex", "0");
      checkbox.setAttribute("role", "switch");
      checkbox.setAttribute("aria-checked", "false");
  
      checkbox.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
  
          // Update ARIA state
          const isChecked = this.getAttribute("aria-checked") === "true";
          this.setAttribute("aria-checked", !isChecked);
        }
      });
    });
  
    // Dropdown functionality
    const dropdowns = document.querySelectorAll(".dropdown-menu");
  
    dropdowns.forEach((dropdown) => {
      dropdown.addEventListener("click", function () {
        // In a real implementation, this would show a dropdown list
        console.log("Dropdown clicked");
      });
  
      // Make dropdowns keyboard accessible
      dropdown.setAttribute("tabindex", "0");
      dropdown.setAttribute("role", "button");
      dropdown.setAttribute("aria-haspopup", "listbox");
  
      dropdown.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });
  
    // Button functionality
    const buttons = document.querySelectorAll('button:not([role="tab"])');
  
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        // In a real implementation, this would perform the button's action
        console.log("Button clicked:", this.textContent.trim());
      });
    });
  
    // Set initial state
    setActiveTab(accountTab, accountSection);
  });
  