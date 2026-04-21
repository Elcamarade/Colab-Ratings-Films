const API_KEY  = "7d28f3b87848951cca423aee65d14927";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL  = "https://image.tmdb.org/t/p/w500";
const NO_IMG   = "https://via.placeholder.com/500x750/161616/555?text=No+Image";

/* ── DOM refs ── */
const moviesContainer = document.getElementById("movies");
const searchInput     = document.getElementById("search");
const searchClear     = document.getElementById("search-clear");
const modal           = document.getElementById("modal");
const modalBody       = document.getElementById("modal-body");
const closeBtn        = document.getElementById("close");
const countLabel      = document.getElementById("count-label");
const sortSelect      = document.getElementById("sort-select");
const favPanel        = document.getElementById("fav-panel");
const favNavBtn       = document.getElementById("fav-nav-btn");
const favPanelClose   = document.getElementById("fav-panel-close");
const favList         = document.getElementById("fav-list");
const favCountEl      = document.getElementById("fav-count");

/* ── State ── */
let allMoviesSnapshot = [];  
let currentMovies     = [];   
let activeFilter      = "all";
let activeSort        = "popularity";