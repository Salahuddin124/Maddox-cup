import Logo, { LOGO_STYLES } from "./Logo";

const TITLE = "MADDOXX CUP";

export default function App() {
  return (
    <>
      <style>{STYLES}</style>
      <style>{LOGO_STYLES}</style>

      <div className="maddoxx-page">
        <div className="background" aria-hidden="true">
          <div className="background-dots" />
          <div className="background-blob background-blob-red" />
          <div className="background-blob background-blob-blue" />
          <div className="background-fade" />
        </div>

        <header className="hero">
          <div className="hero-inner">
            <Logo size={76} className="hero-logo" />

            <p className="hero-kicker">Official tournament registration</p>

            <h1 className="hero-title">{TITLE}</h1>

            <p className="hero-subtitle">
              Registration is now closed. Match schedules are coming soon.
            </p>
          </div>
        </header>

        <main className="main">
          <section className="closed-card" aria-labelledby="closed-heading">
            <span className="closed-badge">Registration closed</span>

            <h2 className="closed-heading" id="closed-heading">
              Thanks for the teams.
            </h2>

            <p className="closed-copy">
              Team registration for MADDOXX CUP 2026 has ended. Keep an eye on
              this page for the next update.
            </p>

            <div className="schedule-panel">
              <span className="schedule-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M3 10h18M8 3v4M16 3v4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <div className="schedule-info">
                <span className="schedule-label">Match Schedules</span>
                <span className="schedule-name">Coming soon</span>
              </div>

              <span className="coming-soon-pill">
                <span className="coming-soon-dot" aria-hidden="true" />
                Stay tuned
              </span>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

html,
body {
  margin: 0;
  padding: 0;
  display: block;
  width: 100%;
  overflow-x: hidden;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  background: #f4f5f8;
  color: #14213d;
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

@supports (overflow: clip) {
  body {
    overflow-x: clip;
  }
}

.maddoxx-page {
  position: relative;
  min-height: 100vh;
}

.background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: #f4f5f8;
}

.background-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(20, 33, 61, 0.13) 1px, transparent 1.4px);
  background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse 72% 68% at 50% 42%, #000 30%, transparent 100%);
  mask-image: radial-gradient(ellipse 72% 68% at 50% 42%, #000 30%, transparent 100%);
  opacity: 0.75;
}

.background-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  will-change: transform;
}

.background-blob-red {
  width: min(48vw, 620px);
  aspect-ratio: 1;
  right: -12%;
  top: 10%;
  background: rgba(200, 16, 46, 0.14);
  animation: driftRed 22s ease-in-out infinite alternate;
}

.background-blob-blue {
  width: min(52vw, 700px);
  aspect-ratio: 1;
  left: -16%;
  bottom: -22%;
  background: rgba(30, 58, 138, 0.16);
  animation: driftBlue 28s ease-in-out infinite alternate;
}

.background-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 38vh;
  background: linear-gradient(to bottom, rgba(244, 245, 248, 0), #f4f5f8 78%);
}

.hero {
  position: relative;
  z-index: 1;
  overflow: hidden;
  padding: 0 0 112px;
  color: #ffffff;
  background-color: #14213d;
  background-image:
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0px, rgba(255, 255, 255, 0.035) 1px, transparent 1px, transparent 13px),
    radial-gradient(120% 160% at 88% -10%, rgba(200, 16, 46, 0.18) 0%, transparent 55%),
    linear-gradient(180deg, #172747 0%, #14213d 62%, #101a31 100%);
}

.hero::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 4px;
  background: #c8102e;
  transform: scaleX(0);
  transform-origin: left center;
  animation: drawLine 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s forwards;
}

.hero-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 64px 24px 0;
  position: relative;
}

.hero-logo {
  margin-bottom: 26px;
}

.hero-kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 18px;
  color: #aeb9cf;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1.4;
}

.hero-kicker::before {
  content: '';
  width: 26px;
  height: 2px;
  flex: none;
  border-radius: 2px;
  background: #c8102e;
}

.hero-title {
  margin: 0;
  color: #ffffff;
  font-family: 'Barlow Condensed', 'Arial Narrow', Impact, sans-serif;
  font-size: clamp(58px, 11vw, 108px);
  font-weight: 700;
  line-height: 0.88;
  letter-spacing: 0.015em;
  text-transform: uppercase;
}

.hero-subtitle {
  margin: 18px 0 0;
  max-width: 620px;
  color: #c3cbda;
  font-size: clamp(15px, 2vw, 17px);
  font-weight: 400;
  line-height: 1.6;
}

.main {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: -56px auto 0;
  padding: 0 24px 96px;
}

.closed-card {
  padding: 40px 44px 36px;
  border: 1px solid rgba(20, 33, 61, 0.09);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 30px 70px -40px rgba(15, 26, 49, 0.6),
    0 4px 16px -8px rgba(15, 26, 49, 0.2);
  backdrop-filter: blur(10px);
  animation: cardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
}

.closed-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(200, 16, 46, 0.1);
  color: #a50d27;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.closed-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c8102e;
}

.closed-heading {
  margin: 20px 0 8px;
  color: #14213d;
  font-family: 'Barlow Condensed', 'Arial Narrow', Impact, sans-serif;
  font-size: clamp(34px, 6vw, 50px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.closed-copy {
  max-width: 560px;
  margin: 0;
  color: #5a6780;
  font-size: 15px;
  line-height: 1.65;
}

.schedule-panel {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 30px;
  padding: 20px 22px;
  border: 1px solid rgba(200, 16, 46, 0.14);
  border-left: 3px solid #c8102e;
  border-radius: 12px;
  background: linear-gradient(100deg, rgba(200, 16, 46, 0.07), rgba(200, 16, 46, 0.02));
}

.schedule-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 12px;
  background: #ffffff;
  color: #c8102e;
  box-shadow: 0 6px 18px -10px rgba(200, 16, 46, 0.8);
}

.schedule-icon svg {
  width: 26px;
  height: 26px;
}

.schedule-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.schedule-label {
  color: #6c7890;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.schedule-name {
  color: #14213d;
  font-family: 'Barlow Condensed', 'Arial Narrow', Impact, sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.coming-soon-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding: 7px 12px;
  flex: none;
  border-radius: 999px;
  background: #ffffff;
  color: #6a4a10;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
  box-shadow: inset 0 0 0 1px rgba(180, 130, 40, 0.22);
}

.coming-soon-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e0a326;
  animation: pulseDot 1.8s ease-in-out infinite;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes drawLine {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes pulseDot {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(224, 163, 38, 0.5);
  }
  50% {
    opacity: 0.65;
    box-shadow: 0 0 0 6px rgba(224, 163, 38, 0);
  }
}

@keyframes driftRed {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(-70px, 64px, 0) scale(1.06);
  }
}

@keyframes driftBlue {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(64px, -56px, 0) scale(1.05);
  }
}

@media (max-width: 640px) {
  .hero {
    padding-bottom: 80px;
  }

  .hero-inner {
    padding: 44px 20px 0;
  }

  .hero-kicker {
    margin-bottom: 14px;
    font-size: 12px;
  }

  .hero-subtitle {
    margin-top: 14px;
    max-width: 100%;
  }

  .main {
    margin-top: -40px;
    padding: 0 16px 72px;
  }

  .closed-card {
    padding: 26px 20px 24px;
    border-radius: 12px;
  }

  .closed-heading {
    font-size: 34px;
  }

  .schedule-panel {
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 24px;
    padding: 18px;
  }

  .schedule-name {
    font-size: 24px;
  }

  .coming-soon-pill {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .closed-card,
  .hero::after,
  .background-blob,
  .coming-soon-dot {
    animation: none;
  }
}
`;
