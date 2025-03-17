// Filter dropdown functionality
const filterButton = document.querySelector(".filter-button");
const filterDropdown = document.querySelector(".filter-dropdown");

filterButton.addEventListener("click", () => {
  const isExpanded =
    filterButton.getAttribute("aria-expanded") === "true";
  filterButton.setAttribute("aria-expanded", !isExpanded);
  filterDropdown.hidden = isExpanded;
});

// Close filter dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (
    !filterButton.contains(event.target) &&
    !filterDropdown.contains(event.target)
  ) {
    filterButton.setAttribute("aria-expanded", "false");
    filterDropdown.hidden = true;
  }
});

// Filter option selection
const filterOptions = document.querySelectorAll(".filter-option");
filterOptions.forEach((option) => {
  option.addEventListener("click", () => {
    option.classList.toggle("selected");

    // Count selected filters
    const selectedCount = document.querySelectorAll(
      ".filter-option.selected",
    ).length;
    const filterText = document.querySelector(".filter-text");

    if (selectedCount > 0) {
      filterText.textContent = `фильтрация (${selectedCount})`;
    } else {
      filterText.textContent = "фильтрация";
    }
  });
});

// Search functionality
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");

searchButton.addEventListener("click", () => {
  console.log("Searching for:", searchInput.value);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    console.log("Searching for:", searchInput.value);
  }
});