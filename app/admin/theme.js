export const ADMIN_THEME_KEY = "maddoxx-admin-theme";

// Runs before the admin UI paints so a stored light theme never flashes dark
// first. Kept as a string because it is injected as an inline script.
export const ADMIN_THEME_SCRIPT = `(function(){try{var k="${ADMIN_THEME_KEY}";var stored=localStorage.getItem(k);var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=theme;}catch(e){}})();`;
