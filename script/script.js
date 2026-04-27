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
        case "rating-asc":  result.sort((a, b) => a.vote_average - b.vote_average); break;
        case "year-desc":   result.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || "")); break;
        case "year-asc":    result.sort((a, b) => (a.release_date || "").localeCompare(b.release_date || "")); break;
        default: break; 
    }

    showMovies(result);
}