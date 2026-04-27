const API_KEY = "7d28f3b87848951cca423aee65d14927";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const NO_IMG = "https://via.placeholder.com/500x750/161616/555?text=No+Image";

/* ── DOM refs ── */
const moviesContainer = document.getElementById("movies");
const searchInput = document.getElementById("search");
const searchClear = document.getElementById("search-clear");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeBtn = document.getElementById("close");
const countLabel = document.getElementById("count-label");
const sortSelect = document.getElementById("sort-select");
const favPanel = document.getElementById("fav-panel");
const favNavBtn = document.getElementById("fav-nav-btn");
const favPanelClose = document.getElementById("fav-panel-close");
const favList = document.getElementById("fav-list");
const favCountEl = document.getElementById("fav-count");

/* ── State ── */
let allMoviesSnapshot = [];
let currentMovies = [];
let activeFilter = "all";
let activeSort = "popularity";

/* ─────────────────────────────────────────────
FETCH
───────────────────────────────────────────── */
async function fetchJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch {
        showError("Eroare de conexiune. Încearcă din nou.");
        return null;
    }
}

async function getPopularMovies() {
    showLoading();
    const data = await fetchJSON(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ro-RO&page=1`
    );
    if (data) {
        allMoviesSnapshot = data.results;
        applyFilterSortAndShow(data.results);
    }
}

async function searchMovies(query) {
    showLoading();
    const data = await fetchJSON(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=ro-RO&query=${encodeURIComponent(query)}`
    );
    if (data) {
        allMoviesSnapshot = data.results;
        applyFilterSortAndShow(data.results);
    }
}

/* ─────────────────────────────────────────────
    FILTER + SORT
───────────────────────────────────────────── */
function applyFilterSortAndShow(movies) {
    let result = [...movies];

    if (activeFilter === "all") {

    } else if (activeFilter === "0") {
        result = result.filter(m => m.vote_average < 5);
    } else {
        result = result.filter(m => m.vote_average >= Number(activeFilter));
    }


    switch (activeSort) {
        case "rating-desc": result.sort((a, b) => b.vote_average - a.vote_average); break;
        case "rating-asc": result.sort((a, b) => a.vote_average - b.vote_average); break;
        case "year-desc": result.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || "")); break;
        case "year-asc": result.sort((a, b) => (a.release_date || "").localeCompare(b.release_date || "")); break;
        default: break;
    }

    showMovies(result);
}
/* ─────────────────────────────────────────────
    UI INFO
───────────────────────────────────────────── */
function getColor(vote) {
    if (vote >= 7) return "green";
    if (vote >= 5) return "orange";
    return "red";
}

function showLoading() {
    moviesContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Se încarcă filmele...</p>
        </div>`;
}

function showError(msg) {
    moviesContainer.innerHTML = `
        <div class="error-msg">
            <span>⚠️</span>
            <p>${msg}</p>
        </div>`;
}

function updateCount(n) {
    if (countLabel) countLabel.textContent = `${n} film${n !== 1 ? "e" : ""}`;
}

/* ─────────────────────────────────────────────
   FAVORITES helpers
───────────────────────────────────────────── */
function getFavs() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavs(favs) {
    localStorage.setItem("favorites", JSON.stringify(favs));
    updateFavCount();
}

function isFavorite(id) {
    return getFavs().some(m => m.id === id);
}

function updateFavCount() {
    const n = getFavs().length;
    if (favCountEl) favCountEl.textContent = n;
}

function toggleFavorite(movie, btn) {
    let favs = getFavs();
    const exists = favs.some(m => m.id === movie.id);

    if (exists) {
        favs = favs.filter(m => m.id !== movie.id);
    } else {
        favs.push(movie);
    }

    saveFavs(favs);
    const saved = !exists;

    if (btn) btn.classList.toggle("active", saved);

    const cardBtn = moviesContainer.querySelector(`.fav-btn[data-id="${movie.id}"]`);
    if (cardBtn) cardBtn.classList.toggle("active", saved);

    if (!favPanel.classList.contains("hidden")) renderFavPanel();
}

/* ─────────────────────────────────────────────
    SHOW MOVIES
───────────────────────────────────────────── */
function showMovies(movies) {
    currentMovies = movies;
    moviesContainer.innerHTML = "";
    updateCount(movies.length);

    if (!movies || movies.length === 0) {
        moviesContainer.innerHTML = `
            <div class="no-results">
                <span>😢</span>
                <p>Nu s-a găsit nimic</p>
            </div>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    movies.forEach((movie, i) => {
        const { title, poster_path, vote_average, release_date, id } = movie;
        const year = release_date ? release_date.slice(0, 4) : "—";
        const fav = isFavorite(id);
        const isTop = vote_average >= 8;

        const el = document.createElement("div");
        el.classList.add("movie");
        el.dataset.id = id;
        el.style.animationDelay = `${Math.min(i * 30, 300)}ms`;

        el.innerHTML = `
            <div class="movie-thumb">
                ${isTop ? `<div class="movie-badge">TOP</div>` : ""}
                <img src="${poster_path ? IMG_URL + poster_path : NO_IMG}"
                    alt="${title}" loading="lazy">
                <div class="movie-overlay"></div>
                <button class="fav-btn ${fav ? "active" : ""}"
                        data-id="${id}" title="${fav ? "Elimină din favorite" : "Adaugă la favorite"}">♥</button>
            </div>
            <div class="movie-info">
                <h3 title="${title}">${title}</h3>
                <div class="rating-row">
                    <span class="rating ${getColor(vote_average)}">★ ${vote_average.toFixed(1)}</span>
                    <span class="year">${year}</span>
                </div>
            </div>
        `;

        el.addEventListener("click", (e) => {
            if (e.target.closest(".fav-btn")) return;
            openMovieDetails(movie);
        });

        el.querySelector(".fav-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(movie, e.currentTarget);
        });

        fragment.appendChild(el);
    });

    moviesContainer.appendChild(fragment);
}