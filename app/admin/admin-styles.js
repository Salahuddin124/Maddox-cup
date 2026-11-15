// Shared admin styles. The dashboard and the login page live on separate
// routes, so the base look is kept in one place to avoid drift.
export const BASE_STYLES = `
  :root {
    color-scheme: dark;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #080e1a;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .admin-shell {
    min-height: 100vh;
    padding: 40px clamp(18px, 4vw, 56px) 64px;
    background:
      radial-gradient(900px 500px at 12% -10%, rgba(79, 140, 255, 0.16), transparent 65%),
      radial-gradient(800px 480px at 92% 0%, rgba(255, 77, 109, 0.12), transparent 60%),
      #080e1a;
    color: #e6edf7;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
  }

  .centered-shell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 24px;
  }

  .status {
    color: #8fa3c0;
    font-size: 15px;
  }

  .eyebrow {
    margin: 0 0 6px;
    color: #7d93b5;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .form-error {
    margin: 14px 0 0;
    padding: 10px 12px;
    border: 1px solid rgba(255, 77, 109, 0.4);
    border-radius: 10px;
    background: rgba(255, 77, 109, 0.1);
    color: #ff9caf;
    font-size: 13px;
  }

  .primary-button {
    width: 100%;
    margin-top: 18px;
    padding: 12px 16px;
    border: 0;
    border-radius: 11px;
    background: linear-gradient(135deg, #ff4d6d, #d61f43);
    color: #fff;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 120ms ease, filter 120ms ease;
  }

  .primary-button:hover:not(:disabled) {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }

  .primary-button:disabled {
    cursor: progress;
    opacity: 0.7;
  }

  @media (max-width: 720px) {
    .admin-shell {
      padding: 28px 14px 48px;
    }
  }
`;

export const LOGIN_STYLES = `
  .login-card {
    width: min(420px, 100%);
    padding: 36px 32px 32px;
    border: 1px solid #223149;
    border-radius: 20px;
    background: rgba(16, 25, 42, 0.9);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(8px);
  }

  .lock-mark {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    margin-bottom: 18px;
    border-radius: 13px;
    background: rgba(255, 77, 109, 0.12);
    color: #ff6b85;
  }

  .lock-mark svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .login-card h1 {
    margin: 0 0 8px;
    font-size: 26px;
    letter-spacing: -0.02em;
  }

  .login-copy {
    margin: 0 0 24px;
    color: #8fa3c0;
    font-size: 14px;
    line-height: 1.55;
  }

  .login-label {
    display: block;
    margin-bottom: 8px;
    color: #a9bbd6;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .login-input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #2a3b58;
    border-radius: 11px;
    background: #0b1424;
    color: #e6edf7;
    font: inherit;
    font-size: 15px;
    outline: none;
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }

  .login-input:focus {
    border-color: #4f8cff;
    box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.18);
  }
`;
