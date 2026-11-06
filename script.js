const gameCards = document.querySelectorAll(".game-card");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll(".filter-chip");
const favoritesToggle = document.querySelector("#favoritesToggle");
const emptyState = document.querySelector("#emptyState");
const toast = document.querySelector("#toast");

let activeFilter = "all";
let favoritesOnly = false;
let favorites = JSON.parse(localStorage.getItem("neonArcadeFavorites") || "[]");
let toastTimer;

function renderGames() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  gameCards.forEach((card, index) => {
    const title = card.dataset.title.toLowerCase();
    const genre = card.dataset.genre.toLowerCase();
    const description = card.querySelector(".game-description").textContent.toLowerCase();
    const category = card.dataset.category;
    const matchesFilter = activeFilter === "all" || category === activeFilter;
    const matchesSearch = `${title} ${genre} ${description}`.includes(searchTerm);
    const matchesFavorite = !favoritesOnly || favorites.includes(title);

    const isVisible = matchesFilter && matchesSearch && matchesFavorite;
    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount++;
      card.style.animationDelay = `${index * 45}ms`;
    }
  });

  emptyState.hidden = visibleCount > 0;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function updateFavoriteButton(button, isFavorite) {
  button.classList.toggle("is-favorite", isFavorite);
  button.textContent = isFavorite ? "♥" : "♡";
  button.setAttribute("aria-pressed", String(isFavorite));
  const title = button.closest(".game-card").dataset.title;
  button.setAttribute("aria-label", `${isFavorite ? "Remove" : "Add"} ${title} ${isFavorite ? "from" : "to"} favorites`);
}

gameCards.forEach((card) => {
  const title = card.dataset.title.toLowerCase();
  const favoriteButton = card.querySelector("[data-favorite]");
  updateFavoriteButton(favoriteButton, favorites.includes(title));
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderGames();
  });
});

searchInput.addEventListener("input", renderGames);

favoritesToggle.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  favoritesToggle.setAttribute("aria-pressed", String(favoritesOnly));
  favoritesToggle.textContent = favoritesOnly ? "♥ Showing favorites" : "♡ Favorites only";
  renderGames();
});

document.querySelector("#gameGrid").addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  const playButton = event.target.closest("[data-play]");

  if (favoriteButton) {
    const card = favoriteButton.closest(".game-card");
    const title = card.dataset.title.toLowerCase();
    const isFavorite = favorites.includes(title);

    favorites = isFavorite
      ? favorites.filter((item) => item !== title)
      : [...favorites, title];

    localStorage.setItem("neonArcadeFavorites", JSON.stringify(favorites));
    updateFavoriteButton(favoriteButton, !isFavorite);
    renderGames();
    showToast(!isFavorite ? "Added to your favorites! ♥" : "Removed from favorites.");
  }

  if (playButton) {
    const card = playButton.closest(".game-card");
    showToast(`${card.dataset.title} — ${card.dataset.genre}. Ready to play? 🎮`);
  }
});

// Bonus: Ctrl/Cmd + K focuses the search bar.
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

renderGames();
