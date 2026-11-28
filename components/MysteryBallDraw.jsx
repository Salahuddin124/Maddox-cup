"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const MADDOXX_DRAW_STYLES = "/* ==========================================================================\r\n   MADDOXX CUP — MYSTERY BALL DRAW (DROP-IN NEXT.JS / REACT MODULE)\r\n   Scoped with .mxd-* classes & inherits https://maddox-cup.vercel.app/admin tokens\r\n   Supports Dark + Light [data-theme=\"light\"] automatically\r\n   ========================================================================== */\r\n\r\n.mxd-root {\r\n  --mxd-bg: var(--bg, #14171d);\r\n  --mxd-surface: var(--surface, #1a1e26);\r\n  --mxd-surface-2: var(--surface-2, #20252f);\r\n  --mxd-surface-3: #262c38;\r\n  --mxd-border: var(--border, #2a303b);\r\n  --mxd-border-soft: var(--border-soft, #232933);\r\n  --mxd-border-strong: var(--border-strong, #343c4b);\r\n\r\n  --mxd-text: var(--text, #e7e9ee);\r\n  --mxd-text-soft: var(--text-soft, #b4bac6);\r\n  --mxd-muted: var(--muted, #7f8795);\r\n\r\n  --mxd-accent: var(--accent, #5566a8);\r\n  --mxd-accent-hover: var(--accent-hover, #6274ba);\r\n  --mxd-current: var(--current, #8ea2d9);\r\n  --mxd-peak: var(--peak, #d2b27a);\r\n  --mxd-avg: var(--avg, #7fb5a3);\r\n  --mxd-danger: var(--danger, #e08a8a);\r\n  --mxd-crimson: #c8102e;\r\n\r\n  --mxd-shell-glow: var(--shell-glow, #1f2633);\r\n  --mxd-shadow: var(--card-shadow, 0 24px 60px -28px rgba(0, 0, 0, 0.68));\r\n  --mxd-ease: cubic-bezier(0.22, 1, 0.36, 1);\r\n\r\n  --mxd-font-ui: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;\r\n  --mxd-font-display: 'Barlow Condensed', 'Arial Narrow', Impact, sans-serif;\r\n\r\n  position: relative;\r\n  isolation: isolate;\r\n  color: var(--mxd-text);\r\n  font-family: var(--mxd-font-ui);\r\n  font-feature-settings: 'tnum' 1;\r\n  -webkit-font-smoothing: antialiased;\r\n}\r\n\r\n[data-theme='light'] .mxd-root {\r\n  --mxd-bg: var(--bg, #f1f3f8);\r\n  --mxd-surface: var(--surface, #ffffff);\r\n  --mxd-surface-2: var(--surface-2, #eef1f7);\r\n  --mxd-surface-3: #e3e8f2;\r\n  --mxd-border: var(--border, #d7dce6);\r\n  --mxd-border-soft: var(--border-soft, #e4e8f0);\r\n  --mxd-border-strong: var(--border-strong, #bfc7d5);\r\n\r\n  --mxd-text: var(--text, #161b24);\r\n  --mxd-text-soft: var(--text-soft, #414a59);\r\n  --mxd-muted: var(--muted, #5c6575);\r\n\r\n  --mxd-accent: var(--accent, #46578f);\r\n  --mxd-accent-hover: var(--accent-hover, #3a4a7d);\r\n  --mxd-current: var(--current, #40548c);\r\n  --mxd-peak: var(--peak, #8d6a2c);\r\n  --mxd-avg: var(--avg, #33725f);\r\n  --mxd-danger: var(--danger, #b23c3c);\r\n  --mxd-shell-glow: var(--shell-glow, #e3e9f4);\r\n  --mxd-shadow: var(--card-shadow, 0 24px 52px -30px rgba(23, 32, 50, 0.24));\r\n}\r\n\r\n.mxd-root *,\r\n.mxd-root *::before,\r\n.mxd-root *::after {\r\n  box-sizing: border-box;\r\n}\r\n\r\n.mxd-root button {\r\n  font-family: inherit;\r\n  cursor: pointer;\r\n}\r\n\r\n.mxd-root button:focus-visible {\r\n  outline: 2px solid var(--mxd-current);\r\n  outline-offset: 2px;\r\n}\r\n\r\n/* Standalone page wrapper (omitted when embed={true}) */\r\n.mxd-shell {\r\n  min-height: 100vh;\r\n  padding: clamp(18px, 3vw, 34px) clamp(14px, 3vw, 36px) 56px;\r\n  background:\r\n    radial-gradient(1100px 480px at 50% -160px, var(--mxd-shell-glow) 0%, transparent 70%),\r\n    var(--mxd-bg);\r\n  transition: background-color 360ms ease, color 360ms ease;\r\n}\r\n\r\n.mxd-aura {\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: 0;\r\n  overflow: hidden;\r\n  pointer-events: none;\r\n}\r\n\r\n.mxd-aura span {\r\n  position: absolute;\r\n  display: block;\r\n  border-radius: 50%;\r\n  will-change: transform;\r\n}\r\n\r\n.mxd-aura-one {\r\n  top: -24%;\r\n  left: -12%;\r\n  width: 46vmax;\r\n  height: 46vmax;\r\n  background: radial-gradient(circle at 50% 50%, rgba(96, 116, 186, 0.44), transparent 68%);\r\n  filter: blur(36px);\r\n  animation: mxdFloatOne 26s ease-in-out infinite alternate;\r\n}\r\n\r\n.mxd-aura-two {\r\n  top: -14%;\r\n  right: -16%;\r\n  width: 38vmax;\r\n  height: 38vmax;\r\n  background: radial-gradient(circle at 50% 50%, rgba(210, 178, 122, 0.28), transparent 70%);\r\n  filter: blur(40px);\r\n  animation: mxdFloatTwo 33s ease-in-out infinite alternate;\r\n}\r\n\r\n.mxd-aura-three {\r\n  bottom: -26%;\r\n  left: 24%;\r\n  width: 42vmax;\r\n  height: 42vmax;\r\n  background: radial-gradient(circle at 50% 50%, rgba(127, 181, 163, 0.24), transparent 70%);\r\n  filter: blur(44px);\r\n  animation: mxdFloatThree 39s ease-in-out infinite alternate;\r\n}\r\n\r\n[data-theme='light'] .mxd-aura-one {\r\n  background: radial-gradient(circle at 50% 50%, rgba(96, 116, 186, 0.22), transparent 68%);\r\n}\r\n[data-theme='light'] .mxd-aura-two {\r\n  background: radial-gradient(circle at 50% 50%, rgba(198, 158, 86, 0.18), transparent 70%);\r\n}\r\n[data-theme='light'] .mxd-aura-three {\r\n  background: radial-gradient(circle at 50% 50%, rgba(90, 155, 132, 0.16), transparent 70%);\r\n}\r\n\r\n@keyframes mxdFloatOne {\r\n  from { transform: translate3d(0, 0, 0) scale(1); }\r\n  to { transform: translate3d(6vw, 5vh, 0) scale(1.12); }\r\n}\r\n@keyframes mxdFloatTwo {\r\n  from { transform: translate3d(0, 0, 0) scale(1.05); }\r\n  to { transform: translate3d(-7vw, 7vh, 0) scale(0.95); }\r\n}\r\n@keyframes mxdFloatThree {\r\n  from { transform: translate3d(0, 0, 0) scale(0.98); }\r\n  to { transform: translate3d(4vw, -6vh, 0) scale(1.1); }\r\n}\r\n\r\n.mxd-particle-canvas {\r\n  position: fixed;\r\n  inset: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  pointer-events: none;\r\n  z-index: 2;\r\n}\r\n\r\n.mxd-inner {\r\n  position: relative;\r\n  z-index: 3;\r\n  max-width: 1200px;\r\n  margin: 0 auto;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 20px;\r\n}\r\n\r\n/* ==========================================================================\r\n   OFFICIAL MADDOXX CUP LOGO BADGE (WITH SIGNATURE RADIANT HALO)\r\n   ========================================================================== */\r\n\r\n.mxd-logo-badge {\r\n  position: relative;\r\n  display: inline-flex;\r\n  flex: none;\r\n  width: var(--logo-size, 48px);\r\n  height: var(--logo-size, 48px);\r\n  border-radius: 50%;\r\n  background: #0b0e13;\r\n  box-shadow:\r\n    0 0 0 1px rgba(255, 255, 255, 0.16),\r\n    0 8px 22px rgba(0, 0, 0, 0.35);\r\n  isolation: isolate;\r\n}\r\n\r\n.mxd-logo-badge::after {\r\n  content: '';\r\n  position: absolute;\r\n  inset: -24%;\r\n  z-index: -1;\r\n  border-radius: 50%;\r\n  background: radial-gradient(\r\n    circle at 50% 50%,\r\n    rgba(126, 158, 255, 0.78) 0%,\r\n    rgba(180, 130, 255, 0.48) 40%,\r\n    rgba(255, 190, 120, 0.32) 62%,\r\n    transparent 74%\r\n  );\r\n  opacity: 0;\r\n  filter: blur(10px);\r\n  transform: scale(0.88);\r\n  transition: opacity 320ms ease, transform 320ms ease;\r\n  pointer-events: none;\r\n}\r\n\r\n.mxd-logo-badge:hover::after {\r\n  opacity: 1;\r\n  transform: scale(1.08);\r\n}\r\n\r\n.mxd-logo-img {\r\n  display: block;\r\n  width: 100%;\r\n  height: 100%;\r\n  object-fit: cover;\r\n  border-radius: 50%;\r\n  user-select: none;\r\n  -webkit-user-drag: none;\r\n}\r\n\r\n/* ==========================================================================\r\n   TOPBAR, BUTTONS & SEGMENTED TABS\r\n   ========================================================================== */\r\n\r\n.mxd-topbar {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  gap: 16px;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n}\r\n\r\n.mxd-brand {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 14px;\r\n}\r\n\r\n.mxd-brand-name {\r\n  margin: 0 0 2px;\r\n  color: var(--mxd-muted);\r\n  font-size: 13px;\r\n  font-weight: 500;\r\n}\r\n\r\n.mxd-brand-heading {\r\n  margin: 0;\r\n  font-size: clamp(22px, 2.8vw, 28px);\r\n  font-weight: 650;\r\n  letter-spacing: -0.02em;\r\n  line-height: 1.1;\r\n  color: var(--mxd-text);\r\n}\r\n\r\n.mxd-actions {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  flex-wrap: wrap;\r\n}\r\n\r\n.mxd-btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 7px;\r\n  padding: 8px 14px;\r\n  border: 1px solid var(--mxd-border);\r\n  border-radius: 9px;\r\n  background: var(--mxd-surface);\r\n  color: var(--mxd-text-soft);\r\n  font: inherit;\r\n  font-size: 13px;\r\n  font-weight: 550;\r\n  white-space: nowrap;\r\n  transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms var(--mxd-ease);\r\n}\r\n\r\n.mxd-btn:hover:not(:disabled) {\r\n  border-color: var(--mxd-border-strong);\r\n  background: var(--mxd-surface-2);\r\n  color: var(--mxd-text);\r\n}\r\n\r\n.mxd-btn:active:not(:disabled) {\r\n  transform: scale(0.975);\r\n}\r\n\r\n.mxd-btn:disabled {\r\n  opacity: 0.42;\r\n  cursor: not-allowed;\r\n}\r\n\r\n.mxd-btn-primary {\r\n  border-color: transparent;\r\n  background: var(--mxd-accent);\r\n  color: #ffffff;\r\n  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 22px -10px rgba(85, 102, 168, 0.7);\r\n}\r\n\r\n.mxd-btn-primary:hover:not(:disabled) {\r\n  background: var(--mxd-accent-hover);\r\n  color: #ffffff;\r\n  border-color: transparent;\r\n}\r\n\r\n.mxd-btn-crimson {\r\n  border-color: rgba(200, 16, 46, 0.45);\r\n  background: var(--mxd-crimson);\r\n  color: #ffffff;\r\n}\r\n\r\n.mxd-btn-crimson:hover:not(:disabled) {\r\n  background: #de1738;\r\n  color: #ffffff;\r\n  border-color: rgba(255, 130, 150, 0.5);\r\n}\r\n\r\n.mxd-btn-gold {\r\n  border-color: rgba(210, 178, 122, 0.45);\r\n  background: linear-gradient(180deg, #d7b881 0%, #b38e52 100%);\r\n  color: #14171d;\r\n  font-weight: 650;\r\n}\r\n\r\n.mxd-btn-gold:hover:not(:disabled) {\r\n  background: linear-gradient(180deg, #e2c693 0%, #c19b5c 100%);\r\n  color: #0e1116;\r\n}\r\n\r\n.mxd-btn-hero {\r\n  padding: 12px 28px;\r\n  font-size: 14px;\r\n  font-weight: 650;\r\n  letter-spacing: 0.04em;\r\n  border-radius: 10px;\r\n}\r\n\r\n.mxd-btn-sound.is-on {\r\n  color: var(--mxd-avg);\r\n  border-color: rgba(127, 181, 163, 0.35);\r\n}\r\n\r\n.mxd-btn-sound.is-off {\r\n  color: var(--mxd-danger);\r\n  border-color: rgba(224, 138, 138, 0.35);\r\n}\r\n\r\n.mxd-tabs-bar {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  flex-wrap: wrap;\r\n  gap: 12px;\r\n}\r\n\r\n.mxd-tabs {\r\n  display: inline-flex;\r\n  gap: 4px;\r\n  padding: 4px;\r\n  border: 1px solid var(--mxd-border-soft);\r\n  border-radius: 12px;\r\n  background: var(--mxd-surface);\r\n}\r\n\r\n.mxd-tab {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 7px;\r\n  padding: 8px 16px;\r\n  border: 0;\r\n  border-radius: 8px;\r\n  background: transparent;\r\n  color: var(--mxd-muted);\r\n  font: inherit;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  white-space: nowrap;\r\n  transition: background 180ms ease, color 180ms ease, box-shadow 180ms ease;\r\n}\r\n\r\n.mxd-tab:hover {\r\n  color: var(--mxd-text);\r\n}\r\n\r\n.mxd-tab.is-active {\r\n  background: var(--mxd-surface-2);\r\n  color: var(--mxd-text);\r\n  box-shadow: inset 0 0 0 1px var(--mxd-border);\r\n}\r\n\r\n.mxd-tab-count {\r\n  padding: 1px 6px;\r\n  border-radius: 999px;\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  background: var(--mxd-surface-3);\r\n  color: var(--mxd-current);\r\n}\r\n\r\n.mxd-status-pill {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 9px;\r\n  padding: 7px 14px;\r\n  border-radius: 999px;\r\n  border: 1px solid var(--mxd-border);\r\n  background: var(--mxd-surface);\r\n  font-size: 13px;\r\n  font-weight: 550;\r\n  color: var(--mxd-text-soft);\r\n}\r\n\r\n.mxd-status-dot {\r\n  width: 8px;\r\n  height: 8px;\r\n  border-radius: 50%;\r\n  background: var(--mxd-avg);\r\n  box-shadow: 0 0 10px rgba(127, 181, 163, 0.75);\r\n}\r\n\r\n.mxd-status-dot.is-live {\r\n  background: var(--mxd-crimson);\r\n  box-shadow: 0 0 10px rgba(200, 16, 46, 0.8);\r\n  animation: mxdPulseDot 1.6s ease-in-out infinite;\r\n}\r\n\r\n@keyframes mxdPulseDot {\r\n  0%, 100% { opacity: 1; transform: scale(1); }\r\n  50% { opacity: 0.45; transform: scale(0.8); }\r\n}\r\n\r\n/* ==========================================================================\r\n   SUMMARY METRIC ROW (MATCHING MADDOXX CUP ADMIN CARDS)\r\n   ========================================================================== */\r\n\r\n.mxd-summary-row {\r\n  display: grid;\r\n  grid-template-columns: repeat(4, minmax(0, 1fr));\r\n  gap: 14px;\r\n}\r\n\r\n.mxd-summary-card {\r\n  padding: 18px 20px;\r\n  border: 1px solid var(--mxd-border);\r\n  border-radius: 14px;\r\n  background: var(--mxd-surface);\r\n  box-shadow: var(--mxd-shadow);\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 4px;\r\n}\r\n\r\n.mxd-summary-value {\r\n  font-size: 28px;\r\n  font-weight: 700;\r\n  letter-spacing: -0.025em;\r\n  line-height: 1.1;\r\n  color: var(--mxd-text);\r\n}\r\n\r\n.mxd-summary-value .mxd-denom {\r\n  font-size: 16px;\r\n  font-weight: 500;\r\n  color: var(--mxd-muted);\r\n}\r\n\r\n.mxd-summary-value.is-peak { color: var(--mxd-peak); }\r\n.mxd-summary-value.is-current { color: var(--mxd-current); }\r\n.mxd-summary-value.is-avg { color: var(--mxd-avg); }\r\n\r\n.mxd-summary-label {\r\n  font-size: 12.5px;\r\n  font-weight: 500;\r\n  color: var(--mxd-muted);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 8px;\r\n}\r\n\r\n.mxd-progress-dots {\r\n  display: inline-flex;\r\n  gap: 4px;\r\n}\r\n\r\n.mxd-p-dot {\r\n  width: 7px;\r\n  height: 7px;\r\n  border-radius: 50%;\r\n  background: var(--mxd-border-strong);\r\n  transition: background 240ms ease, transform 240ms ease;\r\n}\r\n\r\n.mxd-p-dot.is-filled { background: var(--mxd-current); }\r\n.mxd-p-dot.is-active { background: var(--mxd-peak); transform: scale(1.2); }\r\n\r\n/* ==========================================================================\r\n   CEREMONY STAGE: CRYSTAL VESSEL + LIVE OPENING FIXTURES\r\n   ========================================================================== */\r\n\r\n.mxd-ceremony-grid {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1.38fr) minmax(330px, 0.92fr);\r\n  gap: 18px;\r\n  align-items: start;\r\n}\r\n\r\n.mxd-card {\r\n  position: relative;\r\n  border: 1px solid var(--mxd-border);\r\n  border-radius: 16px;\r\n  background: var(--mxd-surface);\r\n  box-shadow: var(--mxd-shadow);\r\n  overflow: hidden;\r\n}\r\n\r\n.mxd-card::before {\r\n  content: '';\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  right: 0;\r\n  height: 1px;\r\n  background: linear-gradient(90deg, transparent 5%, rgba(142, 162, 217, 0.55) 38%, rgba(210, 178, 122, 0.38) 70%, transparent 95%);\r\n  pointer-events: none;\r\n}\r\n\r\n.mxd-bowl-stage {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  padding: 24px 24px 22px;\r\n  min-height: 600px;\r\n  background:\r\n    radial-gradient(ellipse 70% 52% at 50% 8%, rgba(85, 102, 168, 0.14) 0%, transparent 66%),\r\n    radial-gradient(ellipse 65% 40% at 50% 92%, rgba(210, 178, 122, 0.08) 0%, transparent 70%),\r\n    var(--mxd-surface);\r\n}\r\n\r\n.mxd-stage-header {\r\n  text-align: center;\r\n  margin-bottom: 6px;\r\n  z-index: 2;\r\n}\r\n\r\n.mxd-stage-heading {\r\n  margin: 0;\r\n  font-family: var(--mxd-font-display);\r\n  font-size: clamp(26px, 3.2vw, 36px);\r\n  font-weight: 700;\r\n  letter-spacing: 0.03em;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-text);\r\n  line-height: 1.05;\r\n}\r\n\r\n.mxd-stage-copy {\r\n  margin: 6px auto 0;\r\n  font-size: 13.5px;\r\n  color: var(--mxd-muted);\r\n  max-width: 56ch;\r\n  line-height: 1.5;\r\n}\r\n\r\n.mxd-active-pair {\r\n  width: 100%;\r\n  max-width: 580px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 12px;\r\n  margin: 12px 0 4px;\r\n  padding: 11px 16px;\r\n  border-radius: 12px;\r\n  border: 1px solid var(--mxd-border-strong);\r\n  background: var(--mxd-surface-2);\r\n  z-index: 3;\r\n  animation: mxdFadeInUp 300ms var(--mxd-ease);\r\n}\r\n\r\n.mxd-pair-col {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 2px;\r\n  min-width: 0;\r\n}\r\n\r\n.mxd-pair-col.is-right {\r\n  text-align: right;\r\n  align-items: flex-end;\r\n}\r\n\r\n.mxd-pair-meta {\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  letter-spacing: 0.08em;\r\n  text-transform: uppercase;\r\n}\r\n\r\n.mxd-pair-meta.is-radiant { color: var(--mxd-avg); }\r\n.mxd-pair-meta.is-dire { color: var(--mxd-danger); }\r\n\r\n.mxd-pair-team {\r\n  font-size: 16px;\r\n  font-weight: 650;\r\n  color: var(--mxd-text);\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n}\r\n\r\n.mxd-pair-team.is-waiting {\r\n  color: var(--mxd-muted);\r\n  font-weight: 500;\r\n  font-style: italic;\r\n}\r\n\r\n.mxd-pair-vs {\r\n  font-family: var(--mxd-font-display);\r\n  font-size: 16px;\r\n  font-weight: 700;\r\n  letter-spacing: 0.06em;\r\n  padding: 4px 10px;\r\n  border-radius: 8px;\r\n  border: 1px solid var(--mxd-border);\r\n  background: var(--mxd-surface);\r\n  color: var(--mxd-peak);\r\n  flex-shrink: 0;\r\n}\r\n\r\n/* ==========================================================================\r\n   SMOKED-CRYSTAL DRAW VESSEL & PRECISION CAPSULES\r\n   ========================================================================== */\r\n\r\n.mxd-bowl-viewport {\r\n  position: relative;\r\n  width: 100%;\r\n  max-width: 540px;\r\n  height: 368px;\r\n  margin: 6px auto 8px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  user-select: none;\r\n  z-index: 2;\r\n}\r\n\r\n.mxd-orbital-ring {\r\n  position: absolute;\r\n  width: 390px;\r\n  height: 390px;\r\n  top: 47%;\r\n  left: 50%;\r\n  transform: translate(-50%, -50%);\r\n  opacity: 0.24;\r\n  pointer-events: none;\r\n  animation: mxdSlowSpin 78s linear infinite;\r\n}\r\n\r\n@keyframes mxdSlowSpin {\r\n  from { transform: translate(-50%, -50%) rotate(0deg); }\r\n  to { transform: translate(-50%, -50%) rotate(360deg); }\r\n}\r\n\r\n.mxd-bowl-shell {\r\n  position: relative;\r\n  width: 480px;\r\n  max-width: 100%;\r\n  height: 360px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n}\r\n\r\n.mxd-bowl-back,\r\n.mxd-bowl-front {\r\n  position: absolute;\r\n  inset: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  pointer-events: none;\r\n}\r\n\r\n.mxd-bowl-back { z-index: 1; }\r\n.mxd-bowl-front { z-index: 4; }\r\n\r\n.mxd-balls-layer {\r\n  position: absolute;\r\n  inset: 0;\r\n  z-index: 3;\r\n}\r\n\r\n.mxd-ball {\r\n  position: absolute;\r\n  width: 80px;\r\n  height: 80px;\r\n  border-radius: 50%;\r\n  border: none;\r\n  padding: 0;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background:\r\n    radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.85) 0%, rgba(190, 210, 255, 0.2) 18%, transparent 34%),\r\n    radial-gradient(circle at 72% 78%, rgba(85, 102, 168, 0.62) 0%, rgba(20, 33, 61, 0.2) 40%, transparent 62%),\r\n    radial-gradient(circle at 26% 74%, rgba(210, 178, 122, 0.26) 0%, transparent 42%),\r\n    radial-gradient(circle at 46% 44%, #2c3549 0%, #181e2a 52%, #0c1018 86%, #07090e 100%);\r\n  box-shadow:\r\n    0 16px 26px rgba(0, 0, 0, 0.65),\r\n    0 4px 10px rgba(0, 0, 0, 0.45),\r\n    inset 0 0 0 1.5px rgba(142, 162, 217, 0.48),\r\n    inset 0 -9px 15px rgba(0, 0, 0, 0.72),\r\n    inset 0 3px 6px rgba(255, 255, 255, 0.26);\r\n  transform: translate(-50%, -50%);\r\n  transition: transform 240ms var(--mxd-ease), box-shadow 240ms ease, filter 240ms ease, opacity 320ms ease;\r\n  overflow: hidden;\r\n  animation: mxdOrbRest 5.4s ease-in-out infinite;\r\n}\r\n\r\n.mxd-ball::before {\r\n  content: '';\r\n  position: absolute;\r\n  left: -4px;\r\n  right: -4px;\r\n  top: 50%;\r\n  height: 3.5px;\r\n  transform: translateY(-50%) rotate(-10deg);\r\n  background: linear-gradient(\r\n    90deg,\r\n    rgba(130, 104, 62, 0.45) 0%,\r\n    rgba(210, 178, 122, 0.92) 30%,\r\n    rgba(255, 246, 224, 0.96) 50%,\r\n    rgba(210, 178, 122, 0.88) 72%,\r\n    rgba(130, 104, 62, 0.45) 100%\r\n  );\r\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);\r\n  pointer-events: none;\r\n}\r\n\r\n.mxd-ball::after {\r\n  content: '';\r\n  position: absolute;\r\n  top: 7px;\r\n  left: 14px;\r\n  width: 26px;\r\n  height: 12px;\r\n  border-radius: 50%;\r\n  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 100%);\r\n  transform: rotate(-26deg);\r\n  pointer-events: none;\r\n}\r\n\r\n.mxd-ball-medallion {\r\n  position: relative;\r\n  z-index: 2;\r\n  width: 36px;\r\n  height: 36px;\r\n  border-radius: 50%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background: radial-gradient(circle at 35% 30%, #232a3a 0%, #11151e 80%);\r\n  border: 1.5px solid #d2b27a;\r\n  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.72), inset 0 1px 2px rgba(255, 246, 224, 0.35);\r\n  pointer-events: none;\r\n}\r\n\r\n.mxd-ball-num {\r\n  font-family: var(--mxd-font-display);\r\n  font-size: 21px;\r\n  font-weight: 700;\r\n  line-height: 1;\r\n  color: #f4ebd8;\r\n  pointer-events: none;\r\n}\r\n\r\n.mxd-ball:hover:not(:disabled) {\r\n  transform: translate(-50%, -62%) scale(1.13);\r\n  filter: brightness(1.1);\r\n  box-shadow:\r\n    0 22px 34px rgba(0, 0, 0, 0.76),\r\n    0 0 26px rgba(142, 162, 217, 0.55),\r\n    inset 0 0 0 2px #d2b27a,\r\n    inset 0 -8px 14px rgba(0, 0, 0, 0.65);\r\n  z-index: 12;\r\n}\r\n\r\n.mxd-ball:disabled { cursor: default; }\r\n.mxd-ball.is-sealed { opacity: 0.78; filter: saturate(0.8); }\r\n.mxd-ball.is-drawn { opacity: 0; pointer-events: none; transform: translate(-50%, -50%) scale(0.45); }\r\n\r\n.mxd-ball.is-extracting {\r\n  z-index: 22;\r\n  animation: mxdBallLift 700ms var(--mxd-ease) forwards;\r\n  box-shadow:\r\n    0 26px 52px rgba(0, 0, 0, 0.8),\r\n    0 0 40px rgba(56, 189, 248, 0.6),\r\n    inset 0 0 0 2px #f4ebd8;\r\n}\r\n\r\n@keyframes mxdOrbRest {\r\n  0%, 100% { margin-top: 0px; }\r\n  50% { margin-top: -3px; }\r\n}\r\n\r\n@keyframes mxdBallLift {\r\n  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }\r\n  45% { transform: translate(-50%, -205%) scale(1.24); opacity: 1; }\r\n  100% { left: 50%; top: 26%; transform: translate(-50%, -50%) scale(1.48); opacity: 1; }\r\n}\r\n\r\n/* ==========================================================================\r\n   COUNTDOWN CRUCIBLE & TEAM REVEAL OVERLAY\r\n   ========================================================================== */\r\n\r\n.mxd-crucible {\r\n  position: absolute;\r\n  inset: 0;\r\n  z-index: 18;\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 24px;\r\n  background: rgba(16, 20, 28, 0.94);\r\n  backdrop-filter: blur(10px);\r\n  animation: mxdFadeIn 200ms ease;\r\n}\r\n\r\n[data-theme='light'] .mxd-crucible {\r\n  background: rgba(241, 243, 248, 0.94);\r\n}\r\n\r\n.mxd-orb-wrap {\r\n  position: relative;\r\n  width: 220px;\r\n  height: 220px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n}\r\n\r\n.mxd-ring-1 {\r\n  position: absolute;\r\n  inset: 0;\r\n  border-radius: 50%;\r\n  border: 1.5px solid var(--mxd-current);\r\n  opacity: 0.65;\r\n  animation: mxdShockwave 820ms var(--mxd-ease) infinite;\r\n}\r\n\r\n.mxd-ring-2 {\r\n  position: absolute;\r\n  inset: 16px;\r\n  border-radius: 50%;\r\n  border: 1px dashed var(--mxd-peak);\r\n  animation: mxdSpinRing 5s linear infinite;\r\n}\r\n\r\n@keyframes mxdShockwave {\r\n  0% { transform: scale(0.76); opacity: 0.92; }\r\n  100% { transform: scale(1.48); opacity: 0; }\r\n}\r\n\r\n@keyframes mxdSpinRing {\r\n  from { transform: rotate(0deg); }\r\n  to { transform: rotate(360deg); }\r\n}\r\n\r\n.mxd-countdown-orb {\r\n  position: relative;\r\n  width: 150px;\r\n  height: 150px;\r\n  border-radius: 50%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  background:\r\n    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.45) 0%, transparent 32%),\r\n    radial-gradient(circle at 50% 54%, #25355a 0%, #141b2c 64%, #0b0e16 100%);\r\n  box-shadow:\r\n    0 24px 60px rgba(0, 0, 0, 0.72),\r\n    0 0 44px rgba(85, 102, 168, 0.6),\r\n    inset 0 0 0 2px var(--mxd-peak);\r\n  animation: mxdTremble 140ms ease-in-out infinite alternate;\r\n  overflow: hidden;\r\n}\r\n\r\n.mxd-countdown-orb::before {\r\n  content: '';\r\n  position: absolute;\r\n  left: -8px;\r\n  right: -8px;\r\n  top: 50%;\r\n  height: 4px;\r\n  transform: translateY(-50%) rotate(-8deg);\r\n  background: linear-gradient(90deg, transparent 0%, #d2b27a 32%, #ffffff 50%, #d2b27a 68%, transparent 100%);\r\n  box-shadow: 0 0 18px #38bdf8, 0 0 24px #d2b27a;\r\n}\r\n\r\n@keyframes mxdTremble {\r\n  from { transform: scale(1) rotate(-1.5deg); }\r\n  to { transform: scale(1.04) rotate(1.5deg); }\r\n}\r\n\r\n.mxd-countdown-digit {\r\n  position: relative;\r\n  z-index: 2;\r\n  font-family: var(--mxd-font-display);\r\n  font-size: 74px;\r\n  font-weight: 700;\r\n  line-height: 1;\r\n  color: #ffffff;\r\n  text-shadow: 0 6px 24px rgba(0, 0, 0, 0.7), 0 0 24px rgba(56, 189, 248, 0.75);\r\n  animation: mxdDigitPop 480ms var(--mxd-ease);\r\n}\r\n\r\n@keyframes mxdDigitPop {\r\n  0% { transform: scale(1.7); opacity: 0.15; }\r\n  100% { transform: scale(1); opacity: 1; }\r\n}\r\n\r\n.mxd-crucible-caption {\r\n  margin-top: 22px;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  letter-spacing: 0.14em;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-text-soft);\r\n}\r\n\r\n.mxd-reveal-card {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  text-align: center;\r\n  max-width: 520px;\r\n  width: 100%;\r\n  padding: 30px 28px 26px;\r\n  border-radius: 18px;\r\n  border: 1px solid var(--mxd-border-strong);\r\n  background: var(--mxd-surface);\r\n  box-shadow: 0 30px 70px -24px rgba(0, 0, 0, 0.78);\r\n  animation: mxdRevealBurst 440ms var(--mxd-ease);\r\n}\r\n\r\n.mxd-reveal-card.is-radiant { border-color: rgba(127, 181, 163, 0.55); }\r\n.mxd-reveal-card.is-dire { border-color: rgba(200, 16, 46, 0.55); }\r\n\r\n@keyframes mxdRevealBurst {\r\n  0% { transform: scale(0.84); opacity: 0; filter: blur(6px); }\r\n  100% { transform: scale(1); opacity: 1; filter: blur(0); }\r\n}\r\n\r\n.mxd-reveal-pill {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  padding: 5px 12px;\r\n  border-radius: 999px;\r\n  font-size: 11.5px;\r\n  font-weight: 600;\r\n  letter-spacing: 0.1em;\r\n  text-transform: uppercase;\r\n  background: var(--mxd-surface-2);\r\n  border: 1px solid var(--mxd-border);\r\n  color: var(--mxd-peak);\r\n}\r\n\r\n.mxd-reveal-name {\r\n  margin: 16px 0 6px;\r\n  font-family: var(--mxd-font-display);\r\n  font-size: clamp(34px, 4.4vw, 52px);\r\n  font-weight: 700;\r\n  line-height: 1;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.02em;\r\n  color: var(--mxd-text);\r\n}\r\n\r\n.mxd-reveal-stats {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  flex-wrap: wrap;\r\n  gap: 8px 16px;\r\n  margin: 6px 0 18px;\r\n  font-size: 13px;\r\n  color: var(--mxd-muted);\r\n}\r\n\r\n.mxd-reveal-stats strong { color: var(--mxd-text); font-weight: 600; }\r\n\r\n.mxd-reveal-slot {\r\n  margin: 0 0 20px;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  letter-spacing: 0.08em;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-current);\r\n}\r\n\r\n.mxd-auto-final {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 9px;\r\n  padding: 10px 16px;\r\n  border-radius: 10px;\r\n  background: var(--mxd-surface-2);\r\n  border: 1px solid rgba(210, 178, 122, 0.45);\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  color: var(--mxd-peak);\r\n}\r\n\r\n/* Presenter Dock */\r\n.mxd-dock {\r\n  width: 100%;\r\n  margin-top: auto;\r\n  padding-top: 14px;\r\n  border-top: 1px solid var(--mxd-border-soft);\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  gap: 10px;\r\n  z-index: 3;\r\n}\r\n\r\n.mxd-picker-row {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  flex-wrap: wrap;\r\n  gap: 7px;\r\n}\r\n\r\n.mxd-picker-label {\r\n  font-size: 12px;\r\n  font-weight: 600;\r\n  letter-spacing: 0.06em;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-muted);\r\n  margin-right: 4px;\r\n}\r\n\r\n.mxd-pill-btn {\r\n  width: 38px;\r\n  height: 36px;\r\n  border-radius: 9px;\r\n  border: 1px solid var(--mxd-border);\r\n  background: var(--mxd-surface-2);\r\n  color: var(--mxd-text);\r\n  font-size: 14px;\r\n  font-weight: 650;\r\n  transition: transform 150ms var(--mxd-ease), background 150ms ease, border-color 150ms ease;\r\n}\r\n\r\n.mxd-pill-btn:hover:not(:disabled) {\r\n  background: var(--mxd-accent);\r\n  border-color: var(--mxd-accent);\r\n  color: #ffffff;\r\n  transform: translateY(-2px);\r\n}\r\n\r\n.mxd-pill-btn.is-used {\r\n  opacity: 0.34;\r\n  text-decoration: line-through;\r\n  cursor: not-allowed;\r\n}\r\n\r\n/* ==========================================================================\r\n   RIGHT PANEL: LIVE OPENING FIXTURES + REGISTERED TEAMS\r\n   ========================================================================== */\r\n\r\n.mxd-sidebar {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 16px;\r\n}\r\n\r\n.mxd-panel-inner { padding: 18px; }\r\n\r\n.mxd-panel-head {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 8px;\r\n  margin-bottom: 14px;\r\n}\r\n\r\n.mxd-panel-title {\r\n  margin: 0;\r\n  font-size: 15px;\r\n  font-weight: 650;\r\n  letter-spacing: -0.01em;\r\n  color: var(--mxd-text);\r\n}\r\n\r\n.mxd-panel-sub {\r\n  font-size: 12px;\r\n  font-weight: 600;\r\n  color: var(--mxd-muted);\r\n}\r\n\r\n.mxd-matches-list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 10px;\r\n}\r\n\r\n.mxd-match-card {\r\n  padding: 11px 12px;\r\n  border-radius: 12px;\r\n  border: 1px solid var(--mxd-border-soft);\r\n  background: var(--mxd-surface-2);\r\n  transition: border-color 220ms ease, box-shadow 220ms ease;\r\n}\r\n\r\n.mxd-match-card.is-active {\r\n  border-color: var(--mxd-current);\r\n  box-shadow: 0 0 0 1px rgba(142, 162, 217, 0.25);\r\n}\r\n\r\n.mxd-match-card.is-complete {\r\n  border-color: rgba(127, 181, 163, 0.42);\r\n}\r\n\r\n.mxd-match-head {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  margin-bottom: 8px;\r\n}\r\n\r\n.mxd-match-label {\r\n  font-size: 11.5px;\r\n  font-weight: 650;\r\n  letter-spacing: 0.08em;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-peak);\r\n}\r\n\r\n.mxd-match-state {\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  color: var(--mxd-muted);\r\n}\r\n\r\n.mxd-match-state.is-locked { color: var(--mxd-avg); }\r\n\r\n.mxd-match-pair {\r\n  display: grid;\r\n  grid-template-columns: 1fr auto 1fr;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.mxd-slot {\r\n  padding: 8px 10px;\r\n  border-radius: 9px;\r\n  border: 1px solid var(--mxd-border);\r\n  background: var(--mxd-surface);\r\n  min-width: 0;\r\n}\r\n\r\n.mxd-slot.is-a {\r\n  border-color: rgba(127, 181, 163, 0.45);\r\n  animation: mxdFadeInUp 280ms var(--mxd-ease);\r\n}\r\n\r\n.mxd-slot.is-b {\r\n  border-color: rgba(224, 138, 138, 0.45);\r\n  animation: mxdFadeInUp 280ms var(--mxd-ease);\r\n}\r\n\r\n.mxd-slot-team {\r\n  font-size: 13.5px;\r\n  font-weight: 650;\r\n  color: var(--mxd-text);\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n}\r\n\r\n.mxd-slot-team.is-hidden {\r\n  color: var(--mxd-muted);\r\n  font-weight: 500;\r\n  font-size: 12.5px;\r\n}\r\n\r\n.mxd-slot-meta {\r\n  margin-top: 2px;\r\n  font-size: 11px;\r\n  color: var(--mxd-muted);\r\n}\r\n\r\n.mxd-slot.is-a .mxd-slot-meta { color: var(--mxd-avg); }\r\n.mxd-slot.is-b .mxd-slot-meta { color: var(--mxd-danger); }\r\n\r\n.mxd-slot-vs {\r\n  font-family: var(--mxd-font-display);\r\n  font-size: 13px;\r\n  font-weight: 700;\r\n  color: var(--mxd-muted);\r\n}\r\n\r\n.mxd-roster-list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 7px;\r\n}\r\n\r\n.mxd-roster-row {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  padding: 8px 10px;\r\n  border-radius: 10px;\r\n  border: 1px solid var(--mxd-border-soft);\r\n  background: var(--mxd-surface-2);\r\n  transition: opacity 240ms ease;\r\n}\r\n\r\n.mxd-roster-row.is-drawn { opacity: 0.54; }\r\n\r\n.mxd-avatar {\r\n  width: 30px;\r\n  height: 30px;\r\n  border-radius: 8px;\r\n  display: grid;\r\n  place-items: center;\r\n  background: rgba(85, 102, 168, 0.2);\r\n  border: 1px solid rgba(142, 162, 217, 0.25);\r\n  color: var(--mxd-current);\r\n  font-size: 13px;\r\n  font-weight: 700;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.mxd-roster-info { min-width: 0; flex: 1; }\r\n\r\n.mxd-roster-name {\r\n  font-size: 13.5px;\r\n  font-weight: 600;\r\n  color: var(--mxd-text);\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n}\r\n\r\n.mxd-roster-mmr { font-size: 11.5px; color: var(--mxd-muted); }\r\n\r\n.mxd-roster-tag {\r\n  font-size: 11px;\r\n  font-weight: 650;\r\n  letter-spacing: 0.06em;\r\n  text-transform: uppercase;\r\n  padding: 3px 8px;\r\n  border-radius: 999px;\r\n  background: var(--mxd-surface);\r\n  border: 1px solid var(--mxd-border);\r\n  color: var(--mxd-peak);\r\n  flex-shrink: 0;\r\n}\r\n\r\n.mxd-roster-row.is-drawn .mxd-roster-tag {\r\n  color: var(--mxd-avg);\r\n  border-color: rgba(127, 181, 163, 0.35);\r\n}\r\n\r\n/* ==========================================================================\r\n   MATCH ANNOUNCEMENT SPOTLIGHT OVERLAY\r\n   ========================================================================== */\r\n\r\n.mxd-overlay {\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: 60;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 24px;\r\n  background: rgba(10, 12, 18, 0.88);\r\n  backdrop-filter: blur(12px);\r\n  animation: mxdFadeIn 220ms ease;\r\n  overflow-y: auto;\r\n}\r\n\r\n.mxd-beams {\r\n  position: fixed;\r\n  inset: 0;\r\n  pointer-events: none;\r\n  overflow: hidden;\r\n}\r\n\r\n.mxd-beam {\r\n  position: absolute;\r\n  top: -15%;\r\n  width: 42vw;\r\n  height: 130vh;\r\n  opacity: 0.24;\r\n  filter: blur(36px);\r\n}\r\n\r\n.mxd-beam.is-left {\r\n  left: -8%;\r\n  background: linear-gradient(160deg, rgba(127, 181, 163, 0.65) 0%, rgba(142, 162, 217, 0.2) 55%, transparent 80%);\r\n  transform: rotate(-14deg);\r\n  animation: mxdSweepLeft 4s ease-in-out infinite alternate;\r\n}\r\n\r\n.mxd-beam.is-right {\r\n  right: -8%;\r\n  background: linear-gradient(200deg, rgba(200, 16, 46, 0.65) 0%, rgba(210, 178, 122, 0.2) 55%, transparent 80%);\r\n  transform: rotate(14deg);\r\n  animation: mxdSweepRight 4s ease-in-out infinite alternate;\r\n}\r\n\r\n@keyframes mxdSweepLeft {\r\n  from { transform: rotate(-18deg) translateX(-18px); }\r\n  to { transform: rotate(-9deg) translateX(22px); }\r\n}\r\n\r\n@keyframes mxdSweepRight {\r\n  from { transform: rotate(18deg) translateX(18px); }\r\n  to { transform: rotate(9deg) translateX(-22px); }\r\n}\r\n\r\n.mxd-announce-card {\r\n  position: relative;\r\n  width: 100%;\r\n  max-width: 920px;\r\n  padding: 38px 34px 34px;\r\n  border-radius: 20px;\r\n  border: 1px solid var(--mxd-border-strong);\r\n  background: var(--mxd-surface);\r\n  box-shadow: 0 36px 96px rgba(0, 0, 0, 0.72);\r\n  text-align: center;\r\n  animation: mxdAnnounceScale 440ms var(--mxd-ease);\r\n  overflow: hidden;\r\n}\r\n\r\n@keyframes mxdAnnounceScale {\r\n  0% { transform: scale(0.88); opacity: 0; }\r\n  100% { transform: scale(1); opacity: 1; }\r\n}\r\n\r\n.mxd-announce-heading {\r\n  margin: 0;\r\n  font-family: var(--mxd-font-display);\r\n  font-size: clamp(32px, 4.8vw, 52px);\r\n  font-weight: 700;\r\n  letter-spacing: 0.04em;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-text);\r\n  line-height: 1;\r\n}\r\n\r\n.mxd-announce-sub {\r\n  margin: 8px 0 0;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  letter-spacing: 0.12em;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-peak);\r\n}\r\n\r\n.mxd-clash {\r\n  margin: 28px 0 30px;\r\n  display: grid;\r\n  grid-template-columns: 1fr auto 1fr;\r\n  align-items: center;\r\n  gap: 18px;\r\n}\r\n\r\n.mxd-clash-panel {\r\n  padding: 24px 20px;\r\n  border-radius: 14px;\r\n  border: 1px solid var(--mxd-border);\r\n  background: var(--mxd-surface-2);\r\n}\r\n\r\n.mxd-clash-panel.is-radiant {\r\n  border-color: rgba(127, 181, 163, 0.5);\r\n  animation: mxdSlideLeft 500ms var(--mxd-ease);\r\n}\r\n\r\n.mxd-clash-panel.is-dire {\r\n  border-color: rgba(200, 16, 46, 0.5);\r\n  animation: mxdSlideRight 500ms var(--mxd-ease);\r\n}\r\n\r\n@keyframes mxdSlideLeft {\r\n  0% { transform: translateX(-48px); opacity: 0; }\r\n  100% { transform: translateX(0); opacity: 1; }\r\n}\r\n\r\n@keyframes mxdSlideRight {\r\n  0% { transform: translateX(48px); opacity: 0; }\r\n  100% { transform: translateX(0); opacity: 1; }\r\n}\r\n\r\n.mxd-clash-side {\r\n  font-size: 11.5px;\r\n  font-weight: 650;\r\n  letter-spacing: 0.14em;\r\n  text-transform: uppercase;\r\n  margin-bottom: 8px;\r\n}\r\n\r\n.mxd-clash-panel.is-radiant .mxd-clash-side { color: var(--mxd-avg); }\r\n.mxd-clash-panel.is-dire .mxd-clash-side { color: var(--mxd-danger); }\r\n\r\n.mxd-clash-name {\r\n  margin: 0;\r\n  font-family: var(--mxd-font-display);\r\n  font-size: clamp(26px, 3.2vw, 38px);\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-text);\r\n  line-height: 1.08;\r\n}\r\n\r\n.mxd-clash-sub {\r\n  margin-top: 8px;\r\n  font-size: 13px;\r\n  color: var(--mxd-muted);\r\n}\r\n\r\n.mxd-clash-sub strong { color: var(--mxd-peak); font-weight: 600; }\r\n\r\n.mxd-clash-vs {\r\n  width: 72px;\r\n  height: 72px;\r\n  border-radius: 50%;\r\n  border: 1.5px solid var(--mxd-peak);\r\n  background: var(--mxd-bg);\r\n  display: grid;\r\n  place-items: center;\r\n  font-family: var(--mxd-font-display);\r\n  font-size: 28px;\r\n  font-weight: 700;\r\n  color: var(--mxd-peak);\r\n  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);\r\n  animation: mxdVsSlam 520ms var(--mxd-ease);\r\n}\r\n\r\n@keyframes mxdVsSlam {\r\n  0% { transform: scale(2.1) rotate(-12deg); opacity: 0; }\r\n  65% { transform: scale(0.92) rotate(3deg); opacity: 1; }\r\n  100% { transform: scale(1) rotate(0deg); opacity: 1; }\r\n}\r\n\r\n.mxd-announce-actions {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 12px;\r\n  flex-wrap: wrap;\r\n}\r\n\r\n/* ==========================================================================\r\n   FINAL FIXTURES BROADCAST POSTER VIEW\r\n   ========================================================================== */\r\n\r\n.mxd-fixtures-stage {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 18px;\r\n}\r\n\r\n.mxd-poster { padding: 32px 30px; }\r\n\r\n.mxd-poster-header {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  text-align: center;\r\n  gap: 8px;\r\n  margin-bottom: 26px;\r\n}\r\n\r\n.mxd-poster-title {\r\n  margin: 0;\r\n  font-family: var(--mxd-font-display);\r\n  font-size: clamp(32px, 4vw, 46px);\r\n  font-weight: 700;\r\n  letter-spacing: 0.04em;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-text);\r\n  line-height: 1;\r\n}\r\n\r\n.mxd-poster-sub {\r\n  margin: 0;\r\n  font-size: 14px;\r\n  color: var(--mxd-muted);\r\n}\r\n\r\n.mxd-poster-grid {\r\n  display: grid;\r\n  grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  gap: 16px;\r\n}\r\n\r\n.mxd-poster-card {\r\n  padding: 18px 20px;\r\n  border-radius: 14px;\r\n  border: 1px solid var(--mxd-border);\r\n  background: var(--mxd-surface-2);\r\n  animation: mxdFixtureReveal 560ms var(--mxd-ease) backwards;\r\n}\r\n\r\n@keyframes mxdFixtureReveal {\r\n  0% { opacity: 0; transform: translateY(18px) scale(0.97); }\r\n  100% { opacity: 1; transform: translateY(0) scale(1); }\r\n}\r\n\r\n.mxd-poster-card-head {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  margin-bottom: 14px;\r\n  font-size: 11.5px;\r\n  font-weight: 650;\r\n  letter-spacing: 0.1em;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-peak);\r\n}\r\n\r\n.mxd-poster-card-body {\r\n  display: grid;\r\n  grid-template-columns: 1fr auto 1fr;\r\n  align-items: center;\r\n  gap: 14px;\r\n}\r\n\r\n.mxd-poster-team { min-width: 0; }\r\n.mxd-poster-team.is-right { text-align: right; }\r\n\r\n.mxd-poster-name {\r\n  font-family: var(--mxd-font-display);\r\n  font-size: 24px;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  color: var(--mxd-text);\r\n  line-height: 1.1;\r\n}\r\n\r\n.mxd-poster-meta {\r\n  margin-top: 4px;\r\n  font-size: 12px;\r\n  font-weight: 550;\r\n}\r\n\r\n.mxd-poster-meta.is-radiant { color: var(--mxd-avg); }\r\n.mxd-poster-meta.is-dire { color: var(--mxd-danger); }\r\n\r\n.mxd-poster-vs {\r\n  font-family: var(--mxd-font-display);\r\n  font-size: 18px;\r\n  font-weight: 700;\r\n  padding: 5px 10px;\r\n  border-radius: 8px;\r\n  border: 1px solid var(--mxd-border);\r\n  background: var(--mxd-surface);\r\n  color: var(--mxd-current);\r\n}\r\n\r\n/* ==========================================================================\r\n   CONFIRMATION MODAL & EMPTY STATE\r\n   ========================================================================== */\r\n\r\n.mxd-modal-backdrop {\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: 80;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 20px;\r\n  background: rgba(10, 12, 18, 0.78);\r\n  backdrop-filter: blur(8px);\r\n  animation: mxdFadeIn 180ms ease;\r\n}\r\n\r\n.mxd-modal-box {\r\n  width: 100%;\r\n  max-width: 440px;\r\n  padding: 26px 24px 22px;\r\n  border-radius: 16px;\r\n  border: 1px solid var(--mxd-border-strong);\r\n  background: var(--mxd-surface);\r\n  box-shadow: var(--mxd-shadow);\r\n}\r\n\r\n.mxd-modal-title {\r\n  margin: 0 0 8px;\r\n  font-size: 19px;\r\n  font-weight: 650;\r\n  color: var(--mxd-text);\r\n}\r\n\r\n.mxd-modal-body {\r\n  margin: 0 0 22px;\r\n  font-size: 14px;\r\n  line-height: 1.55;\r\n  color: var(--mxd-muted);\r\n}\r\n\r\n.mxd-modal-actions {\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  gap: 8px;\r\n}\r\n\r\n.mxd-empty {\r\n  text-align: center;\r\n  padding: 44px 24px;\r\n}\r\n\r\n.mxd-empty p {\r\n  margin: 10px auto 20px;\r\n  max-width: 52ch;\r\n  color: var(--mxd-muted);\r\n  font-size: 14px;\r\n  line-height: 1.55;\r\n}\r\n\r\n@keyframes mxdFadeIn {\r\n  from { opacity: 0; }\r\n  to { opacity: 1; }\r\n}\r\n\r\n@keyframes mxdFadeInUp {\r\n  from { opacity: 0; transform: translateY(8px); }\r\n  to { opacity: 1; transform: translateY(0); }\r\n}\r\n\r\n@media (max-width: 1060px) {\r\n  .mxd-summary-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }\r\n  .mxd-ceremony-grid,\r\n  .mxd-poster-grid { grid-template-columns: 1fr; }\r\n}\r\n\r\n@media (max-width: 720px) {\r\n  .mxd-shell { padding: 16px 14px 44px; }\r\n  .mxd-bowl-stage { padding: 18px 14px; min-height: 520px; }\r\n  .mxd-bowl-viewport { height: 300px; }\r\n  .mxd-bowl-shell { width: 340px; height: 285px; }\r\n  .mxd-ball { width: 60px; height: 60px; }\r\n  .mxd-ball-medallion { width: 28px; height: 28px; }\r\n  .mxd-ball-num { font-size: 16px; }\r\n  .mxd-clash { grid-template-columns: 1fr; }\r\n  .mxd-clash-vs { margin: 0 auto; width: 56px; height: 56px; font-size: 22px; }\r\n  .mxd-poster-card-body { grid-template-columns: 1fr; text-align: center; }\r\n  .mxd-poster-team.is-right { text-align: center; }\r\n  .mxd-poster-vs { justify-self: center; }\r\n}\r\n\r\n@media (prefers-reduced-motion: reduce) {\r\n  .mxd-root *,\r\n  .mxd-root *::before,\r\n  .mxd-root *::after {\r\n    animation-duration: 0.01ms !important;\r\n    animation-iteration-count: 1 !important;\r\n    transition-duration: 0.01ms !important;\r\n  }\r\n}\r\n\r\n@media print {\r\n  .mxd-aura,\r\n  .mxd-particle-canvas,\r\n  .mxd-actions,\r\n  .mxd-tabs-bar,\r\n  .mxd-dock,\r\n  .mxd-announce-actions,\r\n  .mxd-btn {\r\n    display: none !important;\r\n  }\r\n\r\n  .mxd-shell {\r\n    background: #ffffff !important;\r\n    color: #14213d !important;\r\n  }\r\n\r\n  .mxd-card,\r\n  .mxd-summary-card,\r\n  .mxd-poster-card {\r\n    background: #ffffff !important;\r\n    color: #14213d !important;\r\n    border-color: #cbd5e1 !important;\r\n    box-shadow: none !important;\r\n  }\r\n}\r\n";

const MADDOXX_LOGO_DATA_URL = "data:image/jpeg;base64,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";


// Web Audio API procedural sound synthesizer — Dota 2 / The International broadcast aesthetic
// Strictly user-gesture initialized; never autoplays without user interaction.

class DotaSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = null;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.enabled ? 0.65 : 0.0, now, 0.03);
    }
  }

  _ensureContext() {
    if (!this.enabled) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.65;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  _noiseBuffer(ctx, duration) {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Ceremonial gong/horn when starting the draw
  playCeremonyStart() {
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Deep Ancient war horn (D2 + A2 + D3)
    const freqs = [73.42, 110.0, 146.83, 220.0];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = idx < 2 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f * 0.985, now);
      osc.frequency.exponentialRampToValueAtTime(f, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);
      filter.frequency.exponentialRampToValueAtTime(1100, now + 0.55);
      filter.frequency.exponentialRampToValueAtTime(320, now + 1.9);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(idx === 0 ? 0.22 : 0.12, now + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.05);
    });
  }

  // Ball selection: crystal chime + stone resonance
  playBallSelect() {
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low crystal thud
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(58, now + 0.24);
    subGain.gain.setValueAtTime(0.32, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.3);

    // Crystal shimmer ping
    [587.33, 880.0, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.001, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.11 / (i + 1), now + i * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.55);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.6);
    });
  }

  // Suspense countdown: 3 -> 2 -> 1 escalating war drum & tension tone
  playCountdown(step) {
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // step is 3, 2, or 1 (pitch rises as step gets closer to 1)
    const urgency = 4 - step; // 1, 2, 3

    // War drum boom
    const drum = ctx.createOscillator();
    const drumGain = ctx.createGain();
    drum.type = 'triangle';
    drum.frequency.setValueAtTime(95 + urgency * 18, now);
    drum.frequency.exponentialRampToValueAtTime(38, now + 0.35);
    drumGain.gain.setValueAtTime(0.45, now);
    drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    drum.connect(drumGain);
    drumGain.connect(this.masterGain);
    drum.start(now);
    drum.stop(now + 0.45);

    // Rising tension metallic bell
    const bellFreq = step === 3 ? 293.66 : step === 2 ? 329.63 : 440.0;
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(bellFreq, now);
    bellGain.gain.setValueAtTime(0.001, now);
    bellGain.gain.linearRampToValueAtTime(0.18 + urgency * 0.03, now + 0.02);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    bell.connect(bellGain);
    bellGain.connect(this.masterGain);
    bell.start(now);
    bell.stop(now + 0.6);
  }

  // Team reveal: Dota-style dramatic horn & radiant crystalline chord
  playTeamReveal() {
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Impact punch
    const impact = ctx.createOscillator();
    const impGain = ctx.createGain();
    impact.type = 'sine';
    impact.frequency.setValueAtTime(135, now);
    impact.frequency.exponentialRampToValueAtTime(34, now + 0.5);
    impGain.gain.setValueAtTime(0.55, now);
    impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    impact.connect(impGain);
    impGain.connect(this.masterGain);
    impact.start(now);
    impact.stop(now + 0.6);

    // Heroic fifth + octave brass chord (D3, A3, D4, F#4)
    [146.83, 220.0, 293.66, 369.99, 587.33].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = i < 3 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.02);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2800, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(900, now + 1.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14 / (1 + i * 0.18), now + 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.5);
    });
  }

  // Match announcement: epic clash + brass fanfare + warm stadium crowd roar
  playMatchAnnounce() {
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Deep war horn bass
    [73.42, 110.0, 146.83, 220.0, 293.66, 440.0].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = i < 3 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(700, now + 2.1);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15 / (1 + i * 0.22), now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.25);
    });

    // Stadium crowd swell (filtered pink-ish noise envelope)
    const noise = ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(ctx, 2.4);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(750, now);
    bp.frequency.linearRampToValueAtTime(1250, now + 0.7);
    bp.frequency.linearRampToValueAtTime(650, now + 2.3);
    bp.Q.value = 0.85;

    const crowdGain = ctx.createGain();
    crowdGain.gain.setValueAtTime(0.001, now + 0.08);
    crowdGain.gain.linearRampToValueAtTime(0.16, now + 0.55);
    crowdGain.gain.exponentialRampToValueAtTime(0.001, now + 2.35);

    noise.connect(bp);
    bp.connect(crowdGain);
    crowdGain.connect(this.masterGain);
    noise.start(now + 0.05);
    noise.stop(now + 2.4);
  }

  // Final draw reveal & champion celebration fanfare
  playFinalCelebration() {
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Ascending triumphant fanfare motif (D4 -> F#4 -> A4 -> D5)
    const notes = [
      { f: 293.66, t: 0.0, d: 0.4 },
      { f: 369.99, t: 0.16, d: 0.4 },
      { f: 440.0, t: 0.32, d: 0.5 },
      { f: 587.33, t: 0.5, d: 1.8 },
    ];

    notes.forEach(({ f, t, d }) => {
      [1, 0.5].forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f * mult, now + t);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now + t);
        filter.frequency.exponentialRampToValueAtTime(800, now + t + d);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.14 : 0.11, now + t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });
    });

    // Celebratory crowd cheer
    const noise = ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(ctx, 2.6);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(900, now + 0.35);
    bp.frequency.linearRampToValueAtTime(1400, now + 1.0);
    bp.Q.value = 0.7;

    const crowdGain = ctx.createGain();
    crowdGain.gain.setValueAtTime(0.001, now + 0.35);
    crowdGain.gain.linearRampToValueAtTime(0.15, now + 0.9);
    crowdGain.gain.exponentialRampToValueAtTime(0.001, now + 2.55);

    noise.connect(bp);
    bp.connect(crowdGain);
    crowdGain.connect(this.masterGain);
    noise.start(now + 0.35);
    noise.stop(now + 2.6);
  }

  // Crisp subtle click for bracket winner selection
  playBracketLock() {
    const ctx = this._ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.26);
  }
}

const soundEngine = new DotaSoundEngine();


// MADDOXX CUP — Official Registered Teams & Fair Mystery Ball Deck
// Synchronized with https://maddox-cup.vercel.app/admin (8 Teams · 40 Players · 3,621 Avg MMR)

const DEFAULT_MADDOXX_TEAMS = [
  {
    name: 'The Boys & Theekra',
    code: 'MC-B7B1417A92',
    avgMmr: 3721,
    peakMmr: 4160,
    players: 5,
  },
  {
    name: 'Banana Gang',
    code: 'MC-5F4DC4DE45',
    avgMmr: 3448,
    peakMmr: 3799,
    players: 5,
  },
  {
    name: 'Sunset Runtz',
    code: 'MC-F59968D31F',
    avgMmr: 3600,
    peakMmr: 4200,
    players: 5,
  },
  {
    name: '109 + boosters',
    code: 'MC-17B06F8320',
    avgMmr: 3501,
    peakMmr: 3539,
    players: 5,
  },
  {
    name: 'Meepo enjoyers',
    code: 'MC-B1D2FF214D',
    avgMmr: 3900,
    peakMmr: 4500,
    players: 5,
  },
  {
    name: 'GameZone',
    code: 'MC-2AB076264E',
    avgMmr: 3265,
    peakMmr: 3330,
    players: 5,
  },
  {
    name: 'Team Dandy',
    code: 'MC-D0DC679396',
    avgMmr: 3670,
    peakMmr: 4040,
    players: 5,
  },
  {
    name: 'Team UT',
    code: 'MC-BD2BA3673D',
    avgMmr: 3863,
    peakMmr: 4201,
    players: 5,
  },
];

// Accepts either Maddoxx Cup registration objects or plain team name strings
function normalizeTeams(inputTeams) {
  const source = Array.isArray(inputTeams) && inputTeams.length === 8 ? inputTeams : DEFAULT_MADDOXX_TEAMS;
  return source.map((entry, idx) => {
    if (typeof entry === 'string') {
      const clean = entry.replace(/^\*\*|\*\*$/g, '').trim();
      return {
        name: clean,
        code: `MC-TEAM-${idx + 1}`,
        initial: (clean[0] || String(idx + 1)).toUpperCase(),
        avgMmr: null,
        peakMmr: null,
        players: 5,
      };
    }
    const rawName = entry.name || entry.teamName || `Team ${idx + 1}`;
    const clean = String(rawName).replace(/^\*\*|\*\*$/g, '').trim();
    const playersCount = Array.isArray(entry.players)
      ? entry.players.length
      : typeof entry.players === 'number'
        ? entry.players
        : 5;
    return {
      name: clean,
      code: entry.code || entry.registrationCode || entry.id || `MC-TEAM-${idx + 1}`,
      initial: (clean[0] || String(idx + 1)).toUpperCase(),
      avgMmr: typeof entry.avgMmr === 'number' ? entry.avgMmr : typeof entry.avgCurrent === 'number' ? entry.avgCurrent : null,
      peakMmr: typeof entry.peakMmr === 'number' ? entry.peakMmr : typeof entry.avgPeak === 'number' ? entry.avgPeak : null,
      players: playersCount,
    };
  });
}

// Unbiased Fisher-Yates shuffle using crypto.getRandomValues when available
function secureShuffle(items) {
  const arr = [...items];
  const randomFloat = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return buf[0] / 4294967296;
    }
    return Math.random();
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomFloat() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Secret randomized ball assignment mapping balls #1..#8 -> 8 teams
function createMysteryBallDeck(normalizedTeams) {
  const shuffled = secureShuffle(normalizedTeams);
  return shuffled.map((teamObj, idx) => ({
    ballNumber: idx + 1,
    team: teamObj.name,
  }));
}

// Rebuilds the hidden ball mapping from a saved draw. Revealed balls keep their
// saved team; unrevealed balls get the remaining teams in registration order.
function buildDeckFromPicks(picks, normalizedTeams) {
  const usedNumbers = new Set(picks.map((p) => Number(p.ballNumber)));
  const usedTeams = new Set(picks.map((p) => String(p.team).trim().toLowerCase()));
  const remaining = normalizedTeams.filter(
    (team) => !usedTeams.has(team.name.trim().toLowerCase()),
  );

  const deck = picks.map((pick) => ({
    ballNumber: Number(pick.ballNumber),
    team: pick.team,
  }));

  let next = 0;
  for (let ballNumber = 1; ballNumber <= 8; ballNumber += 1) {
    if (usedNumbers.has(ballNumber)) continue;
    deck.push({
      ballNumber,
      team: remaining[next]?.name ?? `Team ${ballNumber}`,
    });
    next += 1;
  }

  return deck;
}


// MADDOXX CUP High-Resolution Opening Fixtures PNG Exporter

function exportFixturesToPNG(drawMatches, teamByName = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Maddoxx Cup Slate-Obsidian background
  const bg = ctx.createRadialGradient(800, 120, 60, 800, 480, 980);
  bg.addColorStop(0, '#1f2633');
  bg.addColorStop(0.55, '#14171d');
  bg.addColorStop(1, '#0e1116');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1600, 960);

  // Subtle Maddoxx Cup periwinkle & champagne glows
  const g1 = ctx.createRadialGradient(220, 140, 20, 220, 140, 520);
  g1.addColorStop(0, 'rgba(96, 116, 186, 0.22)');
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, 1600, 960);

  const g2 = ctx.createRadialGradient(1380, 140, 20, 1380, 140, 520);
  g2.addColorStop(0, 'rgba(210, 178, 122, 0.16)');
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, 1600, 960);

  // Top crimson bar matching Maddoxx Cup hero line
  ctx.fillStyle = '#c8102e';
  ctx.fillRect(0, 0, 1600, 4);

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d2b27a';
  ctx.font = '700 18px "Segoe UI", sans-serif';
  ctx.fillText('MADDOXX CUP 2026 · OFFICIAL OPENING DRAW', 800, 82);

  ctx.fillStyle = '#e7e9ee';
  ctx.font = '700 54px "Barlow Condensed", "Segoe UI", sans-serif';
  ctx.fillText('OFFICIAL OPENING FIXTURES', 800, 142);

  ctx.fillStyle = '#7f8795';
  ctx.font = '500 18px "Segoe UI", sans-serif';
  ctx.fillText('8-Team Double Elimination · Upper Bracket Round 1', 800, 178);

  // Four match cards
  drawMatches.forEach((m, idx) => {
    const y = 224 + idx * 160;
    const h = 132;
    const x = 110;
    const w = 1380;

    ctx.fillStyle = '#1a1e26';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#2a303b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    const hl = ctx.createLinearGradient(x, y, x + w, y);
    hl.addColorStop(0, 'rgba(142, 162, 217, 0.45)');
    hl.addColorStop(0.5, 'rgba(210, 178, 122, 0.35)');
    hl.addColorStop(1, 'rgba(200, 16, 46, 0.45)');
    ctx.fillStyle = hl;
    ctx.fillRect(x, y, w, 2);

    ctx.fillStyle = '#d2b27a';
    ctx.font = '700 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`UPPER BRACKET · MATCH ${idx + 1}`, 800, y + 32);

    ctx.fillStyle = '#8ea2d9';
    ctx.font = '700 32px "Barlow Condensed", "Segoe UI", sans-serif';
    ctx.fillText('VS', 800, y + 88);

    const metaA = m.teamA ? teamByName[m.teamA.team] : null;
    const metaB = m.teamB ? teamByName[m.teamB.team] : null;

    ctx.textAlign = 'right';
    ctx.fillStyle = '#e7e9ee';
    ctx.font = '700 36px "Segoe UI", sans-serif';
    ctx.fillText(m.teamA ? m.teamA.team : 'TBD', 735, y + 84);
    ctx.fillStyle = '#7fb5a3';
    ctx.font = '600 15px "Segoe UI", sans-serif';
    ctx.fillText(
      m.teamA
        ? `RADIANT · BALL #${m.teamA.ballNumber}${metaA && metaA.avgMmr ? ` · AVG ${metaA.avgMmr.toLocaleString()} MMR` : ''}`
        : 'RADIANT',
      735,
      y + 112
    );

    ctx.textAlign = 'left';
    ctx.fillStyle = '#e7e9ee';
    ctx.font = '700 36px "Segoe UI", sans-serif';
    ctx.fillText(m.teamB ? m.teamB.team : 'TBD', 865, y + 84);
    ctx.fillStyle = '#e08a8a';
    ctx.font = '600 15px "Segoe UI", sans-serif';
    ctx.fillText(
      m.teamB
        ? `DIRE · BALL #${m.teamB.ballNumber}${metaB && metaB.avgMmr ? ` · AVG ${metaB.avgMmr.toLocaleString()} MMR` : ''}`
        : 'DIRE',
      865,
      y + 112
    );
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7f8795';
  ctx.font = '500 15px "Segoe UI", sans-serif';
  ctx.fillText('MADDOXX CUP · maddox-cup.vercel.app · OFFICIAL MYSTERY BALL DRAW', 800, 912);

  const link = document.createElement('a');
  link.download = 'maddoxx-cup-opening-fixtures.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}






const BALL_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Balanced positions (%) for the 8 sealed capsules inside the smoked-crystal vessel
const BALL_POSITIONS = [
  { left: 25, top: 47, delay: '0s' },
  { left: 41.5, top: 45, delay: '0.6s' },
  { left: 58.5, top: 45, delay: '1.2s' },
  { left: 75, top: 47, delay: '1.8s' },
  { left: 30, top: 66, delay: '0.9s' },
  { left: 43.5, top: 70, delay: '1.5s' },
  { left: 57, top: 70, delay: '0.3s' },
  { left: 70.5, top: 66, delay: '2.1s' },
];

function ParticleStage({ burstSignal }) {
  const canvasRef = useRef(null);
  const burstRef = useRef([]);

  useEffect(() => {
    if (!burstSignal) return;
    const cx = window.innerWidth * 0.5;
    const cy = window.innerHeight * 0.44;
    const colors = ['#8ea2d9', '#d2b27a', '#7fb5a3', '#c8102e', '#e7e9ee'];
    for (let i = 0; i < 70; i++) {
      const angle = (Math.PI * 2 * i) / 70 + (Math.random() - 0.5) * 0.25;
      const speed = 2.4 + Math.random() * 6.8;
      burstRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 1.8 + Math.random() * 3.4,
        alpha: 1,
        decay: 0.013 + Math.random() * 0.014,
        color: colors[i % colors.length],
      });
    }
  }, [burstSignal]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (burstRef.current.length > 0) {
        const alive = [];
        for (const b of burstRef.current) {
          b.x += b.vx;
          b.y += b.vy;
          b.vy += 0.085;
          b.vx *= 0.985;
          b.alpha -= b.decay;
          if (b.alpha > 0.02) {
            ctx.globalAlpha = b.alpha;
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.fill();
            alive.push(b);
          }
        }
        burstRef.current = alive;
      }
      ctx.globalAlpha = 1;
      animId = window.requestAnimationFrame(loop);
    };

    animId = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mxd-particle-canvas" aria-hidden="true" />;
}

function CrystalBowlBack() {
  return (
    <svg className="mxd-bowl-back" viewBox="0 0 480 360" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="mcVesselInterior" cx="50%" cy="38%" r="58%">
          <stop offset="0%" stopColor="rgba(142, 162, 217, 0.16)" />
          <stop offset="52%" stopColor="rgba(26, 30, 38, 0.56)" />
          <stop offset="100%" stopColor="rgba(12, 15, 22, 0.84)" />
        </radialGradient>
        <linearGradient id="mcPlinthMetal" x1="110" y1="292" x2="370" y2="344" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a303b" />
          <stop offset="30%" stopColor="#6b7899" />
          <stop offset="50%" stopColor="#d2b27a" />
          <stop offset="70%" stopColor="#6b7899" />
          <stop offset="100%" stopColor="#2a303b" />
        </linearGradient>
        <radialGradient id="mcFloorGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(85, 102, 168, 0.36)" />
          <stop offset="60%" stopColor="rgba(210, 178, 122, 0.1)" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
        </radialGradient>
      </defs>

      <ellipse cx="240" cy="340" rx="188" ry="18" fill="url(#mcFloorGlow)" />
      <ellipse cx="240" cy="339" rx="136" ry="10" fill="rgba(0,0,0,0.68)" />

      <path d="M166 296 L186 284 L294 284 L314 296 Z" fill="url(#mcPlinthMetal)" opacity="0.85" />
      <path d="M140 324 L162 296 L318 296 L340 324 Z" fill="#181d26" stroke="url(#mcPlinthMetal)" strokeWidth="1.4" />
      <path d="M124 336 L134 324 L346 324 L356 336 Z" fill="#12161e" stroke="url(#mcPlinthMetal)" strokeWidth="1.2" />
      <rect x="210" y="308" width="60" height="3" rx="1.5" fill="#c8102e" opacity="0.9" />

      <path
        d="M 52 90 C 46 218, 114 290, 240 290 C 366 290, 434 218, 428 90 Z"
        fill="url(#mcVesselInterior)"
        stroke="rgba(142, 162, 217, 0.28)"
        strokeWidth="1.4"
      />
      <ellipse cx="240" cy="260" rx="112" ry="18" fill="rgba(0, 0, 0, 0.48)" />
      <ellipse
        cx="240"
        cy="90"
        rx="188"
        ry="27"
        fill="rgba(142, 162, 217, 0.05)"
        stroke="rgba(142, 162, 217, 0.34)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CrystalBowlFront() {
  return (
    <svg className="mxd-bowl-front" viewBox="0 0 480 360" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="mcGlassLeft" x1="66" y1="108" x2="148" y2="262" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
          <stop offset="40%" stopColor="rgba(190, 210, 255, 0.1)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>
        <linearGradient id="mcGlassRight" x1="412" y1="114" x2="348" y2="250" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(210, 178, 122, 0.24)" />
          <stop offset="100%" stopColor="rgba(210, 178, 122, 0)" />
        </linearGradient>
        <linearGradient id="mcRim" x1="52" y1="90" x2="428" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4a587a" />
          <stop offset="28%" stopColor="#8ea2d9" />
          <stop offset="50%" stopColor="#f4ebd8" />
          <stop offset="72%" stopColor="#d2b27a" />
          <stop offset="100%" stopColor="#4a587a" />
        </linearGradient>
      </defs>

      <path d="M 68 114 C 74 194, 116 258, 178 274 C 132 246, 100 188, 94 118 Z" fill="url(#mcGlassLeft)" />
      <path d="M 412 118 C 406 190, 370 246, 318 270 C 358 240, 384 186, 392 122 Z" fill="url(#mcGlassRight)" />
      <path
        d="M 52 90 C 46 218, 114 290, 240 290 C 366 290, 434 218, 428 90"
        stroke="rgba(215, 226, 250, 0.34)"
        strokeWidth="2"
        fill="none"
      />
      <path d="M 52 90 A 188 27 0 0 0 428 90" stroke="url(#mcRim)" strokeWidth="2.8" fill="none" />
    </svg>
  );
}

/**
 * Drop-in Maddoxx Cup Mystery Ball Draw Component (Draw Ceremony + Final Fixtures).
 *
 * Integration Props (all optional):
 * - teams: Array of 8 team objects ({ name, code, avgMmr, peakMmr, players }) or 8 strings.
 * - logoSrc: URL to Maddoxx Cup logo (defaults to embedded official emblem).
 * - embed: Set true when rendering inside maddox-cup.vercel.app/admin as a tab (hides standalone topbar/background).
 * - onDrawComplete(fixtures, orderedTeamNames): Called automatically when all 4 fixtures are drawn so you can
 *   feed Round 1 directly into Maddoxx Cup's existing Match Schemes bracket!
 * - onApplyToBracket(orderedTeamNames, fixtures): Optional button handler on Final Fixtures to jump to Match Schemes.
 */
function MysteryBallDrawInner({
  teams,
  logoSrc = MADDOXX_LOGO_DATA_URL,
  embed = false,
  initialPicks = [],
  onDrawComplete,
  onApplyToBracket,
  onDrawChange,
  onResetDraw,
  applyLabel = 'Send to Match Schemes',
} = {}) {
  const normalizedTeams = useMemo(() => normalizeTeams(teams), [teams]);
  const teamByName = useMemo(
    () => Object.fromEntries(normalizedTeams.map((t) => [t.name, t])),
    [normalizedTeams]
  );

  const tournamentSummary = useMemo(() => {
    const playersCount = normalizedTeams.reduce((s, t) => s + (t.players || 5), 0);
    const mmrs = normalizedTeams.map((t) => t.avgMmr).filter((n) => typeof n === 'number');
    const averageMmr = mmrs.length > 0 ? Math.round(mmrs.reduce((a, b) => a + b, 0) / mmrs.length) : null;
    return { teamsCount: normalizedTeams.length, playersCount, averageMmr };
  }, [normalizedTeams]);

  const [theme, setTheme] = useState('dark');
  const [activeView, setActiveView] = useState('ceremony'); // 'ceremony' | 'fixtures'
  const [soundOn, setSoundOn] = useState(true);

  const [ballDeck, setBallDeck] = useState(() => createMysteryBallDeck(normalizedTeams));
  // The numbered capsules and the roster order are re-shuffled for every
  // ceremony so the same ball never sits in the same visible spot twice.
  const [ballOrder, setBallOrder] = useState(() => secureShuffle(BALL_NUMBERS));
  const [displayTeams, setDisplayTeams] = useState(() => secureShuffle(normalizedTeams));
  const [revealedPicks, setRevealedPicks] = useState([]);
  const [phase, setPhase] = useState('idle');

  const [activeBallNum, setActiveBallNum] = useState(null);
  const [countdownVal, setCountdownVal] = useState(null);
  const [latestReveal, setLatestReveal] = useState(null);
  const [announcedMatchIndex, setAnnouncedMatchIndex] = useState(null);
  const [autoFinalPending, setAutoFinalPending] = useState(false);
  const [copiedFixtures, setCopiedFixtures] = useState(false);

  const [burstSignal, setBurstSignal] = useState(0);
  const [fixturesAnimKey, setFixturesAnimKey] = useState(0);
  const [confirmModal, setConfirmModal] = useState(null);

  const timersRef = useRef([]);
  const hydrationKeyRef = useRef(null);
  const emittedPicksKeyRef = useRef(null);

  useEffect(() => {
    if (!embed) {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme, embed]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearAllTimers, [clearAllTimers]);

  // Restores a saved draw. The ball mapping is rebuilt so continuing a partial
  // draw does not silently reassign the already revealed ball numbers.
  useEffect(() => {
    const saved = Array.isArray(initialPicks) ? initialPicks : [];
    const key = JSON.stringify(saved);
    // A pick change emitted by this component comes back through initialPicks.
    // Treating it as a fresh hydration would clear the lift-out/countdown
    // timers and break the ceremony animation.
    if (key === hydrationKeyRef.current || key === emittedPicksKeyRef.current) return;
    hydrationKeyRef.current = key;

    clearAllTimers();
    setBallOrder(secureShuffle(BALL_NUMBERS));
    setDisplayTeams(secureShuffle(normalizedTeams));
    setBallDeck(buildDeckFromPicks(saved, normalizedTeams));
    setRevealedPicks(saved);
    setPhase(saved.length === 8 ? 'complete' : saved.length > 0 ? 'selecting' : 'idle');
    setActiveView(saved.length === 8 ? 'fixtures' : 'ceremony');
    setActiveBallNum(null);
    setCountdownVal(null);
    setLatestReveal(null);
    setAnnouncedMatchIndex(null);
    setAutoFinalPending(false);
    if (saved.length === 8) {
      setFixturesAnimKey((k) => k + 1);
      setConfirmModal(null);
    }
  }, [initialPicks, normalizedTeams, clearAllTimers]);

  useEffect(() => {
    emittedPicksKeyRef.current = JSON.stringify(revealedPicks);
    if (typeof onDrawChange === 'function') onDrawChange(revealedPicks);
  }, [revealedPicks, onDrawChange]);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const triggerBurst = useCallback(() => setBurstSignal((n) => n + 1), []);

  const randomizePresentation = useCallback(() => {
    setBallOrder(secureShuffle(BALL_NUMBERS));
    setDisplayTeams(secureShuffle(normalizedTeams));
  }, [normalizedTeams]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEngine.setEnabled(next);
    if (next) soundEngine.playBracketLock();
  };

  const drawMatches = useMemo(
    () =>
      [0, 1, 2, 3].map((matchIndex) => ({
        matchNumber: matchIndex + 1,
        teamA: revealedPicks[matchIndex * 2] || null,
        teamB: revealedPicks[matchIndex * 2 + 1] || null,
      })),
    [revealedPicks]
  );

  const drawnBallNumbers = useMemo(
    () => new Set(revealedPicks.map((p) => p.ballNumber)),
    [revealedPicks]
  );

  const drawnTeamMap = useMemo(() => {
    const map = {};
    revealedPicks.forEach((p, idx) => {
      map[p.team] = { matchNumber: Math.floor(idx / 2) + 1, ballNumber: p.ballNumber };
    });
    return map;
  }, [revealedPicks]);

  const ballsRemaining = 8 - revealedPicks.length;
  const teamsRevealedCount = revealedPicks.length;
  const matchesCompletedCount = Math.floor(revealedPicks.length / 2);
  const drawIsComplete = revealedPicks.length === 8 && phase === 'complete';
  const drawHasStarted = phase !== 'idle' || revealedPicks.length > 0;

  const currentMatchIndex = Math.min(3, Math.floor(revealedPicks.length / 2));
  const awaitingDireOpponent = revealedPicks.length % 2 === 1;
  const currentPairRadiant = awaitingDireOpponent ? revealedPicks[revealedPicks.length - 1] : null;

  const currentStageText = useMemo(() => {
    if (phase === 'idle') return 'Standby · Press Start The Draw';
    if (phase === 'complete') return 'Draw Complete · 4 Matches Set';
    if (phase === 'match_announce' && announcedMatchIndex !== null) {
      return `Match ${announcedMatchIndex + 1} Confirmed`;
    }
    if (autoFinalPending) return 'Auto-Drawing Final Ball #8...';
    if (phase === 'extracting' || phase === 'countdown') {
      return `Unsealing Ball #${activeBallNum} · Match ${currentMatchIndex + 1}`;
    }
    if (phase === 'revealed' && latestReveal) {
      return `Match ${latestReveal.matchIndex + 1} · ${latestReveal.side === 'a' ? 'Radiant' : 'Dire'} Revealed`;
    }
    return `Match ${currentMatchIndex + 1} · Select ${awaitingDireOpponent ? 'Dire Opponent' : 'Radiant Team'}`;
  }, [phase, announcedMatchIndex, autoFinalPending, activeBallNum, currentMatchIndex, latestReveal, awaitingDireOpponent]);

  const handleStartDraw = () => {
    clearAllTimers();
    soundEngine.playCeremonyStart();
    triggerBurst();
    // A fresh ceremony always gets a fresh hidden mapping and visible order.
    setBallDeck(createMysteryBallDeck(normalizedTeams));
    randomizePresentation();
    setPhase('selecting');
    setActiveView('ceremony');
  };

  // Manual click for balls 1..7; the 8th & final remaining ball auto-draws automatically!
  const runBallExtractionSequence = useCallback(
    (ballNumber, existingPicks) => {
      const secretEntry = ballDeck.find((entry) => entry.ballNumber === ballNumber);
      if (!secretEntry) return;
      if (existingPicks.some((p) => p.ballNumber === ballNumber || p.team === secretEntry.team)) {
        return;
      }

      clearAllTimers();
      setAutoFinalPending(false);
      setActiveBallNum(ballNumber);
      setPhase('extracting');
      soundEngine.playBallSelect();

      const pickIndex = existingPicks.length;
      const matchIndex = Math.floor(pickIndex / 2);
      const side = pickIndex % 2 === 0 ? 'a' : 'b';

      schedule(() => {
        setPhase('countdown');
        setCountdownVal(3);
        soundEngine.playCountdown(3);
      }, 680);

      schedule(() => {
        setCountdownVal(2);
        soundEngine.playCountdown(2);
      }, 1480);

      schedule(() => {
        setCountdownVal(1);
        soundEngine.playCountdown(1);
      }, 2280);

      schedule(() => {
        setCountdownVal(null);
        const nextPicks = [...existingPicks, { ballNumber: secretEntry.ballNumber, team: secretEntry.team }];
        const revealedObj = {
          ballNumber: secretEntry.ballNumber,
          team: secretEntry.team,
          matchIndex,
          side,
        };
        setRevealedPicks(nextPicks);
        setLatestReveal(revealedObj);
        setPhase('revealed');
        soundEngine.playTeamReveal();
        triggerBurst();

        if (side === 'b') {
          schedule(() => {
            setAnnouncedMatchIndex(matchIndex);
            setPhase('match_announce');
            soundEngine.playMatchAnnounce();
            triggerBurst();
          }, 1250);
        } else if (nextPicks.length === 7) {
          // Only 1 ball remains — automatically extract & reveal the 8th and final team!
          const drawnSet = new Set(nextPicks.map((p) => p.ballNumber));
          const lastEntry = ballDeck.find((entry) => !drawnSet.has(entry.ballNumber));
          if (lastEntry) {
            setAutoFinalPending(true);
            schedule(() => {
              runBallExtractionSequence(lastEntry.ballNumber, nextPicks);
            }, 1550);
          }
        }
      }, 3080);
    },
    [ballDeck, clearAllTimers, schedule, triggerBurst]
  );

  const handleSelectBall = (ballNumber) => {
    if (phase !== 'selecting') return;
    if (drawnBallNumbers.has(ballNumber)) return;
    runBallExtractionSequence(ballNumber, revealedPicks);
  };

  const handleProceedToOpponentPick = () => {
    if (phase !== 'revealed' || autoFinalPending) return;
    setActiveBallNum(null);
    setPhase('selecting');
  };

  const handleContinueDraw = () => {
    if (phase !== 'match_announce') return;
    const finishedAll = revealedPicks.length >= 8;
    setActiveBallNum(null);
    setLatestReveal(null);
    setAnnouncedMatchIndex(null);
    setAutoFinalPending(false);

    if (finishedAll) {
      setPhase('complete');
      setFixturesAnimKey((k) => k + 1);
      setActiveView('fixtures');
      soundEngine.playFinalCelebration();
      triggerBurst();
      if (typeof onDrawComplete === 'function') {
        const orderedNames = revealedPicks.map((p) => p.team);
        onDrawComplete(drawMatches, orderedNames);
      }
    } else {
      setPhase('selecting');
    }
  };

  const executeResetDraw = () => {
    clearAllTimers();
    setBallDeck(createMysteryBallDeck(normalizedTeams));
    randomizePresentation();
    setRevealedPicks([]);
    setPhase('idle');
    setActiveBallNum(null);
    setCountdownVal(null);
    setLatestReveal(null);
    setAnnouncedMatchIndex(null);
    setAutoFinalPending(false);
    setActiveView('ceremony');
    setConfirmModal(null);
    if (typeof onResetDraw === 'function') onResetDraw();
  };

  const executeReshuffleDraw = () => {
    clearAllTimers();
    setBallDeck(createMysteryBallDeck(normalizedTeams));
    randomizePresentation();
    setRevealedPicks([]);
    setPhase('selecting');
    setActiveBallNum(null);
    setCountdownVal(null);
    setLatestReveal(null);
    setAnnouncedMatchIndex(null);
    setAutoFinalPending(false);
    setActiveView('ceremony');
    setConfirmModal(null);
    soundEngine.playCeremonyStart();
    triggerBurst();
    if (typeof onResetDraw === 'function') onResetDraw();
  };

  const requestReset = () => {
    if (drawHasStarted) setConfirmModal({ type: 'reset' });
    else executeResetDraw();
  };

  const requestReshuffle = () => {
    if (drawHasStarted) setConfirmModal({ type: 'reshuffle' });
    else executeReshuffleDraw();
  };

  const handleCopyFixtures = () => {
    if (revealedPicks.length < 8) return;
    const lines = [
      'MADDOXX CUP — OFFICIAL OPENING FIXTURES',
      ...drawMatches.map(
        (m) => `Match ${m.matchNumber}: ${m.teamA.team} vs ${m.teamB.team}`
      ),
    ].join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lines).then(() => {
        setCopiedFixtures(true);
        setTimeout(() => setCopiedFixtures(false), 2200);
      }).catch(() => {});
    }
  };

  const announcedMatch = announcedMatchIndex !== null ? drawMatches[announcedMatchIndex] : null;
  const latestMeta = latestReveal ? teamByName[latestReveal.team] : null;

  return (
    <div className={`mxd-root ${embed ? '' : 'mxd-shell'} ${confirmModal ? 'mxd-modal-open' : ''}`}>
      {!embed && (
        <div className="mxd-aura" aria-hidden="true">
          <span className="mxd-aura-one" />
          <span className="mxd-aura-two" />
          <span className="mxd-aura-three" />
        </div>
      )}

      <ParticleStage burstSignal={burstSignal} />

      <div className="mxd-inner">
        {!embed && (
          <header className="mxd-topbar">
            <div className="mxd-brand">
              <span className="mxd-logo-badge" style={{ '--logo-size': '48px' }}>
                <img
                  className="mxd-logo-img"
                  src={logoSrc}
                  alt="Maddoxx Cup emblem"
                  width="48"
                  height="48"
                  draggable="false"
                />
              </span>
              <div>
                <p className="mxd-brand-name">Maddoxx Cup</p>
                <h1 className="mxd-brand-heading">Mystery Ball Draw</h1>
              </div>
            </div>

            <div className="mxd-actions">
              <button
                type="button"
                className="mxd-btn"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              >
                {theme === 'dark' ? 'Dark' : 'Light'}
              </button>

              <button
                type="button"
                className={`mxd-btn mxd-btn-sound ${soundOn ? 'is-on' : 'is-off'}`}
                onClick={toggleSound}
                aria-pressed={soundOn}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  {soundOn ? (
                    <>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </>
                  ) : (
                    <>
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </>
                  )}
                </svg>
                <span>{soundOn ? 'Sound ON' : 'Sound OFF'}</span>
              </button>

              <button type="button" className="mxd-btn" onClick={requestReshuffle}>
                Reshuffle
              </button>

              <button type="button" className="mxd-btn" onClick={requestReset}>
                Reset
              </button>
            </div>
          </header>
        )}

        {/* TABS (DRAW CEREMONY + FINAL FIXTURES ONLY) & LIVE STATUS */}
        <div className="mxd-tabs-bar">
          <nav className="mxd-tabs" role="tablist" aria-label="Draw views">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'ceremony'}
              className={`mxd-tab ${activeView === 'ceremony' ? 'is-active' : ''}`}
              onClick={() => setActiveView('ceremony')}
            >
              <span>Draw Ceremony</span>
              <span className="mxd-tab-count">{teamsRevealedCount}/8</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'fixtures'}
              className={`mxd-tab ${activeView === 'fixtures' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveView('fixtures');
                if (drawIsComplete) setFixturesAnimKey((k) => k + 1);
              }}
            >
              <span>Final Fixtures</span>
              <span className="mxd-tab-count">{matchesCompletedCount}/4</span>
            </button>
          </nav>

          <div className="mxd-actions">
            {embed && (
              <>
                <button
                  type="button"
                  className={`mxd-btn mxd-btn-sound ${soundOn ? 'is-on' : 'is-off'}`}
                  onClick={toggleSound}
                >
                  {soundOn ? 'Sound ON' : 'Sound OFF'}
                </button>
                <button type="button" className="mxd-btn" onClick={requestReshuffle}>
                  Reshuffle
                </button>
                <button type="button" className="mxd-btn" onClick={requestReset}>
                  Reset
                </button>
              </>
            )}
            <div className="mxd-status-pill" aria-live="polite">
              <span className={`mxd-status-dot ${phase !== 'idle' && phase !== 'complete' ? 'is-live' : ''}`} />
              <span>{currentStageText}</span>
            </div>
          </div>
        </div>

        {/* SUMMARY METRIC CARDS */}
        <section className="mxd-summary-row" aria-label="Live draw summary">
          <div className="mxd-summary-card">
            <div className="mxd-summary-value is-current">
              {ballsRemaining}
              <span className="mxd-denom"> / 8</span>
            </div>
            <div className="mxd-summary-label">
              <span>Balls remaining</span>
              <span className="mxd-progress-dots" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <span
                    key={i}
                    className={`mxd-p-dot ${i < teamsRevealedCount ? 'is-filled' : ''} ${
                      i === teamsRevealedCount && phase !== 'idle' && phase !== 'complete' ? 'is-active' : ''
                    }`}
                  />
                ))}
              </span>
            </div>
          </div>

          <div className="mxd-summary-card">
            <div className="mxd-summary-value is-peak">
              {teamsRevealedCount}
              <span className="mxd-denom"> / 8</span>
            </div>
            <div className="mxd-summary-label">
              <span>Teams revealed</span>
              <span>{tournamentSummary.playersCount} Players</span>
            </div>
          </div>

          <div className="mxd-summary-card">
            <div className="mxd-summary-value is-avg">
              {matchesCompletedCount}
              <span className="mxd-denom"> / 4</span>
            </div>
            <div className="mxd-summary-label">
              <span>Opening matches</span>
              <span>Round 1</span>
            </div>
          </div>

          <div className="mxd-summary-card">
            <div className="mxd-summary-value">
              {tournamentSummary.averageMmr ? tournamentSummary.averageMmr.toLocaleString() : tournamentSummary.teamsCount}
            </div>
            <div className="mxd-summary-label">
              <span>{tournamentSummary.averageMmr ? 'Average MMR' : 'Registered Teams'}</span>
              <span>{tournamentSummary.teamsCount} Teams</span>
            </div>
          </div>
        </section>

        {/* ==============================================================
            VIEW 1: MYSTERY BALL DRAW CEREMONY
           ============================================================== */}
        {activeView === 'ceremony' && (
          <div className="mxd-ceremony-grid">
            <section className="mxd-card mxd-bowl-stage" aria-label="Mystery Ball Draw Chamber">
              <div className="mxd-stage-header">
                <h2 className="mxd-stage-heading">
                  {phase === 'idle'
                    ? 'Official Draw Vessel'
                    : phase === 'complete'
                      ? 'Opening Draw Complete'
                      : `Quarter-Final Match ${currentMatchIndex + 1}`}
                </h2>
                <p className="mxd-stage-copy">
                  {phase === 'idle'
                    ? 'Eight sealed mystery capsules hold the 8 Maddoxx Cup teams in fair randomized order.'
                    : phase === 'complete'
                      ? 'All four opening matchups have been drawn and are ready for broadcast.'
                      : awaitingDireOpponent
                        ? `Select one remaining capsule to reveal the Dire opponent for ${currentPairRadiant.team}.`
                        : 'Select one capsule from the crystal vessel. The 8th and final ball draws automatically.'}
                </p>
              </div>

              {currentPairRadiant && phase !== 'complete' && (
                <div className="mxd-active-pair" aria-live="polite">
                  <div className="mxd-pair-col">
                    <span className="mxd-pair-meta is-radiant">
                      Match {currentMatchIndex + 1} · Radiant · Ball #{currentPairRadiant.ballNumber}
                    </span>
                    <span className="mxd-pair-team">{currentPairRadiant.team}</span>
                  </div>
                  <span className="mxd-pair-vs">VS</span>
                  <div className="mxd-pair-col is-right">
                    <span className="mxd-pair-meta is-dire">Match {currentMatchIndex + 1} · Dire</span>
                    <span className="mxd-pair-team is-waiting">
                      {autoFinalPending ? 'Auto-drawing final capsule...' : 'Select next ball...'}
                    </span>
                  </div>
                </div>
              )}

              <div className="mxd-bowl-viewport">
                <svg className="mxd-orbital-ring" viewBox="0 0 380 380" fill="none" aria-hidden="true">
                  <circle cx="190" cy="190" r="182" stroke="#8ea2d9" strokeWidth="1" strokeDasharray="12 10" />
                  <circle cx="190" cy="190" r="154" stroke="#d2b27a" strokeWidth="0.9" strokeDasharray="3 14" />
                </svg>

                <div className="mxd-bowl-shell">
                  <CrystalBowlBack />

                  <div className="mxd-balls-layer">
                    {BALL_POSITIONS.map((pos, idx) => {
                      const num = ballOrder[idx];
                      const isDrawn = drawnBallNumbers.has(num);
                      const isExtracting = activeBallNum === num && phase === 'extracting';
                      const canSelect = phase === 'selecting' && !isDrawn;

                      return (
                        <button
                          key={num}
                          type="button"
                          className={`mxd-ball ${phase === 'idle' ? 'is-sealed' : ''} ${
                            isDrawn ? 'is-drawn' : ''
                          } ${isExtracting ? 'is-extracting' : ''}`}
                          style={{
                            left: `${pos.left}%`,
                            top: `${pos.top}%`,
                            animationDelay: pos.delay,
                          }}
                          disabled={!canSelect}
                          onClick={() => handleSelectBall(num)}
                          aria-label={isDrawn ? `Ball ${num} already drawn` : `Select Mystery Ball ${num}`}
                        >
                          <span className="mxd-ball-medallion">
                            <span className="mxd-ball-num">{num}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <CrystalBowlFront />
                </div>
              </div>

              <div className="mxd-dock">
                {phase === 'idle' && (
                  <button type="button" className="mxd-btn mxd-btn-primary mxd-btn-hero" onClick={handleStartDraw}>
                    Start The Draw
                  </button>
                )}

                {phase === 'selecting' && (
                  <div className="mxd-picker-row" role="group" aria-label="Select Mystery Ball by number">
                    <span className="mxd-picker-label">Select ball:</span>
                    {ballOrder.map((num) => {
                      const used = drawnBallNumbers.has(num);
                      return (
                        <button
                          key={num}
                          type="button"
                          className={`mxd-pill-btn ${used ? 'is-used' : ''}`}
                          disabled={used}
                          onClick={() => handleSelectBall(num)}
                          aria-label={`Select Ball ${num}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                )}

                {phase === 'complete' && (
                  <div className="mxd-announce-actions">
                    <button
                      type="button"
                      className="mxd-btn mxd-btn-primary mxd-btn-hero"
                      onClick={() => {
                        setFixturesAnimKey((k) => k + 1);
                        setActiveView('fixtures');
                      }}
                    >
                      View Final Fixtures
                    </button>
                    {typeof onApplyToBracket === 'function' && (
                      <button
                        type="button"
                        className="mxd-btn mxd-btn-gold mxd-btn-hero"
                        onClick={() => onApplyToBracket(revealedPicks.map((p) => p.team), drawMatches)}
                      >
                        {applyLabel}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Countdown (3..2..1) & Team Reveal Crucible */}
              {(phase === 'countdown' || phase === 'revealed') && (
                <div className="mxd-crucible" aria-live="assertive">
                  {phase === 'countdown' && (
                    <>
                      <div className="mxd-orb-wrap">
                        <span className="mxd-ring-1" />
                        <span className="mxd-ring-2" />
                        <div className="mxd-countdown-orb">
                          <span key={countdownVal} className="mxd-countdown-digit">
                            {countdownVal}
                          </span>
                        </div>
                      </div>
                      <div className="mxd-crucible-caption">Opening Capsule #{activeBallNum}</div>
                    </>
                  )}

                  {phase === 'revealed' && latestReveal && (
                    <div
                      className={`mxd-reveal-card ${
                        latestReveal.side === 'a' ? 'is-radiant' : 'is-dire'
                      }`}
                    >
                      <span className="mxd-reveal-pill">
                        Ball #{latestReveal.ballNumber} · {latestMeta ? latestMeta.code : 'CONFIRMED'}
                      </span>
                      <h3 className="mxd-reveal-name">{latestReveal.team}</h3>
                      {latestMeta && latestMeta.avgMmr && (
                        <div className="mxd-reveal-stats">
                          <span>
                            Avg Current <strong>{latestMeta.avgMmr.toLocaleString()}</strong>
                          </span>
                          {latestMeta.peakMmr && (
                            <span>
                              Avg Peak <strong>{latestMeta.peakMmr.toLocaleString()}</strong>
                            </span>
                          )}
                          <span>
                            Roster <strong>{latestMeta.players} Players</strong>
                          </span>
                        </div>
                      )}
                      <p className="mxd-reveal-slot">
                        Match {latestReveal.matchIndex + 1} ·{' '}
                        {latestReveal.side === 'a' ? 'Radiant Side' : 'Dire Opponent'}
                      </p>

                      {latestReveal.side === 'a' ? (
                        autoFinalPending ? (
                          <div className="mxd-auto-final">
                            Final Capsule Remaining · Auto-Drawing Match 4 Opponent...
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="mxd-btn mxd-btn-primary mxd-btn-hero"
                            onClick={handleProceedToOpponentPick}
                          >
                            Select Opponent Ball
                          </button>
                        )
                      ) : (
                        <div className="mxd-crucible-caption" style={{ marginTop: 0 }}>
                          Locking Match {latestReveal.matchIndex + 1}...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* RIGHT SIDEBAR: LIVE MATCH SLOTS + REGISTERED TEAMS */}
            <aside className="mxd-sidebar">
              <div className="mxd-card mxd-panel-inner">
                <div className="mxd-panel-head">
                  <h2 className="mxd-panel-title">Opening Fixtures</h2>
                  <span className="mxd-panel-sub">{matchesCompletedCount} of 4 set</span>
                </div>

                <div className="mxd-matches-list">
                  {drawMatches.map((m, idx) => {
                    const isActive =
                      phase !== 'idle' && phase !== 'complete' && idx === currentMatchIndex;
                    const isComplete = Boolean(m.teamA && m.teamB);
                    return (
                      <div
                        key={m.matchNumber}
                        className={`mxd-match-card ${isActive ? 'is-active' : ''} ${
                          isComplete ? 'is-complete' : ''
                        }`}
                      >
                        <div className="mxd-match-head">
                          <span className="mxd-match-label">Match {m.matchNumber}</span>
                          <span className={`mxd-match-state ${isComplete ? 'is-locked' : ''}`}>
                            {isComplete ? 'Confirmed' : isActive ? 'Drawing' : 'Pending'}
                          </span>
                        </div>
                        <div className="mxd-match-pair">
                          <div className={`mxd-slot ${m.teamA ? 'is-a' : ''}`}>
                            <div className={`mxd-slot-team ${!m.teamA ? 'is-hidden' : ''}`}>
                              {m.teamA ? m.teamA.team : 'Hidden'}
                            </div>
                            <div className="mxd-slot-meta">
                              {m.teamA ? `Ball #${m.teamA.ballNumber}` : 'Radiant'}
                            </div>
                          </div>
                          <span className="mxd-slot-vs">VS</span>
                          <div className={`mxd-slot ${m.teamB ? 'is-b' : ''}`}>
                            <div className={`mxd-slot-team ${!m.teamB ? 'is-hidden' : ''}`}>
                              {m.teamB ? m.teamB.team : 'Hidden'}
                            </div>
                            <div className="mxd-slot-meta">
                              {m.teamB ? `Ball #${m.teamB.ballNumber}` : 'Dire'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mxd-card mxd-panel-inner">
                <div className="mxd-panel-head">
                  <h2 className="mxd-panel-title">Registered Teams</h2>
                  <span className="mxd-panel-sub">{ballsRemaining} in vessel</span>
                </div>
                <div className="mxd-roster-list">
                  {displayTeams.map((t) => {
                    const drawnInfo = drawnTeamMap[t.name];
                    return (
                      <div key={t.code} className={`mxd-roster-row ${drawnInfo ? 'is-drawn' : ''}`}>
                        <span className="mxd-avatar">{t.initial}</span>
                        <div className="mxd-roster-info">
                          <div className="mxd-roster-name">{t.name}</div>
                          <div className="mxd-roster-mmr">
                            {t.players} players{t.avgMmr ? ` · avg ${t.avgMmr.toLocaleString()} MMR` : ''}
                          </div>
                        </div>
                        <span className="mxd-roster-tag">
                          {drawnInfo ? `Match ${drawnInfo.matchNumber}` : 'In Pot'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ==============================================================
            VIEW 2: FINAL FIXTURES BROADCAST POSTER
           ============================================================== */}
        {activeView === 'fixtures' && (
          <section className="mxd-fixtures-stage" aria-label="Final Opening Fixtures">
            {revealedPicks.length < 8 ? (
              <div className="mxd-card mxd-empty">
                <h2 className="mxd-stage-heading">Final Fixtures Sealed</h2>
                <p>
                  Complete the Mystery Ball Draw to unveil all four opening Upper Bracket Round 1
                  fixtures. Currently {teamsRevealedCount} of 8 teams have been revealed.
                </p>
                <button
                  type="button"
                  className="mxd-btn mxd-btn-primary mxd-btn-hero"
                  onClick={() => setActiveView('ceremony')}
                >
                  Return to Draw Ceremony
                </button>
              </div>
            ) : (
              <>
                <div className="mxd-card mxd-poster" key={fixturesAnimKey}>
                  <div className="mxd-poster-header">
                    <span className="mxd-logo-badge" style={{ '--logo-size': '56px' }}>
                      <img
                        className="mxd-logo-img"
                        src={logoSrc}
                        alt="Maddoxx Cup emblem"
                        width="56"
                        height="56"
                        draggable="false"
                      />
                    </span>
                    <h2 className="mxd-poster-title">MADDOXX CUP — OPENING FIXTURES</h2>
                    <p className="mxd-poster-sub">
                      8-Team Double Elimination · Upper Bracket Round 1
                    </p>
                  </div>

                  <div className="mxd-poster-grid">
                    {drawMatches.map((m, idx) => {
                      const metaA = teamByName[m.teamA.team];
                      const metaB = teamByName[m.teamB.team];
                      return (
                        <article
                          key={m.matchNumber}
                          className="mxd-poster-card"
                          style={{ animationDelay: `${idx * 150}ms` }}
                        >
                          <div className="mxd-poster-card-head">
                            <span>Match {m.matchNumber}</span>
                            <span>Upper Bracket Round 1</span>
                          </div>
                          <div className="mxd-poster-card-body">
                            <div className="mxd-poster-team">
                              <div className="mxd-poster-name">{m.teamA.team}</div>
                              <div className="mxd-poster-meta is-radiant">
                                Ball #{m.teamA.ballNumber}
                                {metaA && metaA.avgMmr ? ` · ${metaA.avgMmr.toLocaleString()} MMR` : ' · Radiant'}
                              </div>
                            </div>
                            <span className="mxd-poster-vs">VS</span>
                            <div className="mxd-poster-team is-right">
                              <div className="mxd-poster-name">{m.teamB.team}</div>
                              <div className="mxd-poster-meta is-dire">
                                Ball #{m.teamB.ballNumber}
                                {metaB && metaB.avgMmr ? ` · ${metaB.avgMmr.toLocaleString()} MMR` : ' · Dire'}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <div className="mxd-announce-actions">
                  <button
                    type="button"
                    className="mxd-btn mxd-btn-primary"
                    onClick={() => exportFixturesToPNG(drawMatches, teamByName)}
                  >
                    Download Fixtures (PNG)
                  </button>
                  <button type="button" className="mxd-btn" onClick={handleCopyFixtures}>
                    {copiedFixtures ? 'Copied Fixtures!' : 'Copy Match List'}
                  </button>
                  <button type="button" className="mxd-btn" onClick={() => window.print()}>
                    Print / Save PDF
                  </button>
                  <button
                    type="button"
                    className="mxd-btn"
                    onClick={() => {
                      setFixturesAnimKey((k) => k + 1);
                      soundEngine.playFinalCelebration();
                      triggerBurst();
                    }}
                  >
                    Replay Reveal
                  </button>
                  <button
                    type="button"
                    className="mxd-btn mxd-btn-crimson"
                    onClick={requestReset}
                  >
                    Reset draw &amp; bracket
                  </button>
                  {typeof onApplyToBracket === 'function' && (
                    <button
                      type="button"
                      className="mxd-btn mxd-btn-gold"
                      onClick={() => onApplyToBracket(revealedPicks.map((p) => p.team), drawMatches)}
                    >
                      {applyLabel}
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {/* ==============================================================
          DRAMATIC MATCH ANNOUNCEMENT SPOTLIGHT OVERLAY
         ============================================================== */}
      {phase === 'match_announce' && announcedMatch && announcedMatch.teamA && announcedMatch.teamB && (
        <div
          className="mxd-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Match ${announcedMatch.matchNumber} Announcement`}
        >
          <div className="mxd-beams" aria-hidden="true">
            <div className="mxd-beam is-left" />
            <div className="mxd-beam is-right" />
          </div>

          <div className="mxd-announce-card">
            <h2 className="mxd-announce-heading">QUARTER-FINAL MATCH {announcedMatch.matchNumber}</h2>
            <p className="mxd-announce-sub">MADDOXX CUP · UPPER BRACKET ROUND 1</p>

            <div className="mxd-clash">
              <div className="mxd-clash-panel is-radiant">
                <div className="mxd-clash-side">Radiant · Ball #{announcedMatch.teamA.ballNumber}</div>
                <h3 className="mxd-clash-name">{announcedMatch.teamA.team}</h3>
                {teamByName[announcedMatch.teamA.team] && teamByName[announcedMatch.teamA.team].avgMmr && (
                  <div className="mxd-clash-sub">
                    Avg <strong>{teamByName[announcedMatch.teamA.team].avgMmr.toLocaleString()}</strong>
                    {teamByName[announcedMatch.teamA.team].peakMmr
                      ? ` · Peak ${teamByName[announcedMatch.teamA.team].peakMmr.toLocaleString()} MMR`
                      : ' MMR'}
                  </div>
                )}
              </div>

              <div className="mxd-clash-vs" aria-label="versus">
                VS
              </div>

              <div className="mxd-clash-panel is-dire">
                <div className="mxd-clash-side">Dire · Ball #{announcedMatch.teamB.ballNumber}</div>
                <h3 className="mxd-clash-name">{announcedMatch.teamB.team}</h3>
                {teamByName[announcedMatch.teamB.team] && teamByName[announcedMatch.teamB.team].avgMmr && (
                  <div className="mxd-clash-sub">
                    Avg <strong>{teamByName[announcedMatch.teamB.team].avgMmr.toLocaleString()}</strong>
                    {teamByName[announcedMatch.teamB.team].peakMmr
                      ? ` · Peak ${teamByName[announcedMatch.teamB.team].peakMmr.toLocaleString()} MMR`
                      : ' MMR'}
                  </div>
                )}
              </div>
            </div>

            <div className="mxd-announce-actions">
              <button type="button" className="mxd-btn mxd-btn-primary mxd-btn-hero" onClick={handleContinueDraw}>
                {revealedPicks.length >= 8 ? 'Reveal Final Fixtures' : 'Continue Draw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          RESET / RESHUFFLE CONFIRMATION MODAL
         ============================================================== */}
      {confirmModal && (
        <div className="mxd-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="mxd-confirm-title">
          <div className="mxd-modal-box">
            <h2 id="mxd-confirm-title" className="mxd-modal-title">
              {confirmModal.type === 'reset'
                ? 'Reset entire draw ceremony?'
                : 'Reshuffle mystery balls?'}
            </h2>
            <p className="mxd-modal-body">
              {confirmModal.type === 'reset'
                ? 'This will permanently reset the saved draw, opening fixtures, bracket results, scores and match schedule. All of that data will be deleted from the database. Are you sure?'
                : 'This creates a brand-new random assignment of all 8 Maddoxx Cup teams across balls #1–#8. Saved draw results and bracket picks will be cleared. Are you sure?'}
            </p>
            <div className="mxd-modal-actions">
              <button type="button" className="mxd-btn" onClick={() => setConfirmModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="mxd-btn mxd-btn-crimson"
                onClick={() => {
                  if (confirmModal.type === 'reset') executeResetDraw();
                  else executeReshuffleDraw();
                }}
              >
                {confirmModal.type === 'reset' ? 'Confirm Reset' : 'Confirm Reshuffle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * MADDOXX CUP — Drop-in Mystery Ball Draw Component (Next.js App Router / React)
 *
 * Usage inside maddox-cup.vercel.app:
 * 1. Standalone route (e.g. app/draw/page.jsx):
 *      import MysteryBallDraw from "@/components/MysteryBallDraw";
 *      export default function DrawPage() { return <MysteryBallDraw />; }
 *
 * 2. Embedded tab inside app/admin (next to "Team List" & "Match Schemes"):
 *      <MysteryBallDraw
 *        embed
 *        teams={registeredTeams}
 *        onDrawComplete={(fixtures, orderedTeamNames) => { ... }}
 *        onApplyToBracket={(orderedTeamNames, fixtures) => {
 *          // Pass orderedTeamNames into your existing Match Schemes Round 1 order & switch tab!
 *        }}
 *      />
 */
export default function MysteryBallDraw(props) {
  return (
    <>
      <style>{MADDOXX_DRAW_STYLES}</style>
      {/* The bracket is a later sibling of .mxd-root, so lift the whole draw
          while a confirmation is open or its modal cannot receive clicks. */}
      <style>{`.mxd-root.mxd-modal-open { z-index: 1000; }`}</style>
      <MysteryBallDrawInner {...props} />
    </>
  );
}
