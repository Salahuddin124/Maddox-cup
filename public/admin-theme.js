// Applies the stored admin theme before the page paints. Loaded synchronously
// from the root layout (parser-blocking), so a stored light theme never flashes
// dark first. Keep the storage key in sync with app/admin/theme.js.
(function () {
  try {
    var key = "maddoxx-admin-theme";
    var stored = localStorage.getItem(key);
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";

    document.documentElement.dataset.theme = theme;
  } catch (error) {
    // Storage blocked: the CSS defaults to the dark theme.
  }
})();
