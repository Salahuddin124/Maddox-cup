// Shared admin styles. The dashboard and the login page live on separate
// routes, so the base look is kept in one place to avoid drift.
export const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

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

    --shell-glow: #1f2633;
    --input-bg: #12151b;
    --placeholder: #5a6170;
    --lock-bg: #262e47;
    --lock-ring: rgba(142, 162, 217, 0.22);
    --card-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.65);

    --ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  [data-theme="light"] {
    color-scheme: light;

    --bg: #f1f3f8;
    --surface: #ffffff;
    --surface-2: #eef1f7;
    --border: #d7dce6;
    --border-soft: #e4e8f0;
    --border-strong: #bfc7d5;
    --text: #161b24;
    --text-soft: #414a59;
    --muted: #5c6575;

    --accent: #46578f;
    --accent-hover: #3a4a7d;
    --current: #40548c;
    --peak: #8d6a2c;
    --avg: #33725f;
    --danger: #b23c3c;

    --shell-glow: #e3e9f4;
    --input-bg: #ffffff;
    --placeholder: #8b93a3;
    --lock-bg: #e8edf8;
    --lock-ring: rgba(64, 84, 140, 0.2);
    --card-shadow: 0 30px 60px -34px rgba(23, 32, 50, 0.28);
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    transition: background-color 420ms ease;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .admin-shell {
    position: relative;
    isolation: isolate;
    min-height: 100vh;
    padding: clamp(20px, 4vw, 48px) clamp(16px, 4vw, 40px) 64px;
    background:
      radial-gradient(1100px 480px at 50% -160px, var(--shell-glow) 0%, transparent 70%),
      var(--bg);
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    font-feature-settings: "tnum" 1;
    -webkit-font-smoothing: antialiased;
    transition: background-color 420ms ease, color 420ms ease;
  }

  /* ---------- Animated ambience ---------- */
  .admin-aura {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .admin-aura span {
    position: absolute;
    display: block;
    border-radius: 50%;
    will-change: transform;
  }

  .aura-one {
    top: -24%;
    left: -12%;
    width: 46vmax;
    height: 46vmax;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(96, 116, 186, 0.5),
      transparent 68%
    );
    filter: blur(32px);
    animation: aura-float-one 26s ease-in-out infinite alternate;
  }

  .aura-two {
    top: -14%;
    right: -16%;
    width: 38vmax;
    height: 38vmax;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(210, 178, 122, 0.32),
      transparent 70%
    );
    filter: blur(38px);
    animation: aura-float-two 33s ease-in-out infinite alternate;
  }

  .aura-three {
    bottom: -26%;
    left: 24%;
    width: 42vmax;
    height: 42vmax;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(127, 181, 163, 0.28),
      transparent 70%
    );
    filter: blur(42px);
    animation: aura-float-three 39s ease-in-out infinite alternate;
  }

  .aura-grid {
    inset: -25%;
    width: 150%;
    height: 150%;
    border-radius: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(circle at 50% 26%, #000 0%, transparent 72%);
    -webkit-mask-image: radial-gradient(
      circle at 50% 26%,
      #000 0%,
      transparent 72%
    );
    animation: aura-grid-pan 52s linear infinite;
  }

  [data-theme="light"] .aura-one {
    background: radial-gradient(
      circle at 50% 50%,
      rgba(96, 116, 186, 0.26),
      transparent 68%
    );
  }

  [data-theme="light"] .aura-two {
    background: radial-gradient(
      circle at 50% 50%,
      rgba(198, 158, 86, 0.22),
      transparent 70%
    );
  }

  [data-theme="light"] .aura-three {
    background: radial-gradient(
      circle at 50% 50%,
      rgba(90, 155, 132, 0.2),
      transparent 70%
    );
  }

  [data-theme="light"] .aura-grid {
    background-image:
      linear-gradient(rgba(20, 30, 50, 0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(20, 30, 50, 0.055) 1px, transparent 1px);
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

  /* Smoothly cross-fade the surfaces that change with the theme. */
  .login-card,
  .login-input,
  .btn,
  .summary-card,
  .team-card,
  .chart,
  .empty-state,
  .list-toolbar,
  .dash th,
  .role-chip,
  .team-avatar,
  .skeleton {
    transition:
      background-color 320ms ease,
      border-color 320ms ease,
      color 320ms ease,
      box-shadow 320ms ease;
  }

  @keyframes admin-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }

  @keyframes aura-float-one {
    from { transform: translate3d(0, 0, 0) scale(1); }
    to { transform: translate3d(6vw, 5vh, 0) scale(1.12); }
  }

  @keyframes aura-float-two {
    from { transform: translate3d(0, 0, 0) scale(1.05); }
    to { transform: translate3d(-7vw, 7vh, 0) scale(0.95); }
  }

  @keyframes aura-float-three {
    from { transform: translate3d(0, 0, 0) scale(0.98); }
    to { transform: translate3d(4vw, -6vh, 0) scale(1.1); }
  }

  @keyframes aura-grid-pan {
    from { transform: translate3d(0, 0, 0); }
    to { transform: translate3d(-64px, -64px, 0); }
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
  .login-stack {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
    width: min(420px, 100%);
  }

  .login-card {
    width: 100%;
    padding: 36px 32px 32px;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: var(--surface);
    box-shadow: var(--card-shadow);
    animation: admin-fade-in 600ms var(--ease) both;
  }

  .lock-mark {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    margin-bottom: 20px;
    border-radius: 12px;
    background: var(--lock-bg);
    box-shadow: inset 0 0 0 1px var(--lock-ring);
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
    background: var(--input-bg);
    color: var(--text);
    font: inherit;
    font-size: 15px;
    outline: none;
    transition: border-color 160ms ease, box-shadow 160ms ease,
      background-color 320ms ease, color 320ms ease;
  }

  .login-input::placeholder {
    color: var(--placeholder);
  }

  .login-input:hover {
    border-color: var(--border-strong);
  }

  .login-input:focus {
    border-color: var(--current);
    box-shadow: 0 0 0 3px rgba(142, 162, 217, 0.18);
  }
`;
