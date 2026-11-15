// Shared admin styles. The dashboard and the login page live on separate
// routes, so the base look is kept in one place to avoid drift.
export const BASE_STYLES = `
  :root {
    color-scheme: dark;

    --bg: #14171d;
    --surface: #1a1e26;
    --surface-2: #20252f;
    --border: #2a303b;
    --border-soft: #232933;
    --border-strong: #343c4b;
    --text: #e7e9ee;
    --text-soft: #b4bac6;
    --muted: #7f8795;

    --accent: #5566a8;
    --accent-hover: #6274ba;
    --current: #8ea2d9;
    --peak: #d2b27a;
    --avg: #7fb5a3;
    --danger: #e08a8a;

    --ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: var(--bg);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .admin-shell {
    min-height: 100vh;
    padding: clamp(20px, 4vw, 48px) clamp(16px, 4vw, 40px) 64px;
    background:
      radial-gradient(1100px 480px at 50% -160px, #1f2633 0%, transparent 70%),
      var(--bg);
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    font-feature-settings: "tnum" 1;
    -webkit-font-smoothing: antialiased;
  }

  .centered-shell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 24px;
  }

  .status {
    color: var(--muted);
    font-size: 15px;
  }

  .eyebrow {
    margin: 0 0 6px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 500;
  }

  .form-error {
    margin: 14px 0 0;
    padding: 11px 14px;
    border: 1px solid rgba(224, 138, 138, 0.35);
    border-radius: 10px;
    background: rgba(224, 138, 138, 0.08);
    color: var(--danger);
    font-size: 13.5px;
    animation: admin-fade-in 300ms var(--ease) both;
  }

  .primary-button {
    width: 100%;
    margin-top: 18px;
    padding: 12px 16px;
    border: 0;
    border-radius: 10px;
    background: var(--accent);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    color: #fff;
    font: inherit;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 160ms ease, transform 160ms var(--ease);
  }

  .primary-button:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .primary-button:active:not(:disabled) {
    transform: scale(0.985);
  }

  .primary-button:focus-visible {
    outline: 2px solid var(--current);
    outline-offset: 2px;
  }

  .primary-button:disabled {
    cursor: progress;
    opacity: 0.65;
  }

  @keyframes admin-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }

  @media (max-width: 720px) {
    .admin-shell {
      padding: 24px 14px 48px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0ms !important;
      transition-duration: 0.01ms !important;
      transition-delay: 0ms !important;
    }
  }
`;

export const LOGIN_STYLES = `
  .login-card {
    width: min(420px, 100%);
    padding: 36px 32px 32px;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: var(--surface);
    box-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.65);
    animation: admin-fade-in 600ms var(--ease) both;
  }

  .lock-mark {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    margin-bottom: 20px;
    border-radius: 12px;
    background: #262e47;
    box-shadow: inset 0 0 0 1px rgba(142, 162, 217, 0.22);
    color: var(--current);
  }

  .lock-mark svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .login-card h1 {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 650;
    letter-spacing: -0.02em;
  }

  .login-copy {
    margin: 0 0 24px;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.55;
  }

  .login-label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-soft);
    font-size: 13px;
    font-weight: 550;
  }

  .login-input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: #12151b;
    color: var(--text);
    font: inherit;
    font-size: 15px;
    outline: none;
    transition: border-color 160ms ease, box-shadow 160ms ease;
  }

  .login-input::placeholder {
    color: #5a6170;
  }

  .login-input:hover {
    border-color: var(--border-strong);
  }

  .login-input:focus {
    border-color: var(--current);
    box-shadow: 0 0 0 3px rgba(142, 162, 217, 0.18);
  }
`;
