"use client";

import { useState } from "react";
import logo from "./logo.jpg";

// Shared logo mark: always circular. Hovering plays a single full 360 turn and
// then settles back to its original state. The spin is driven by state so it
// always finishes the full turn even if the cursor leaves early.
export default function Logo({ size = 56, alt = "", className = "" }) {
  const [spinning, setSpinning] = useState(false);

  return (
    <span
      className={`logo-badge${className ? ` ${className}` : ""}`}
      style={{ "--logo-size": `${size}px` }}
    >
      <img
        className={`logo-badge-img${spinning ? " is-spinning" : ""}`}
        src={logo.src}
        alt={alt}
        width={logo.width}
        height={logo.height}
        draggable="false"
        onPointerEnter={() => setSpinning(true)}
        onAnimationEnd={() => setSpinning(false)}
      />
    </span>
  );
}

export const LOGO_STYLES = `
  .logo-badge {
    position: relative;
    display: inline-flex;
    flex: none;
    width: var(--logo-size, 56px);
    height: var(--logo-size, 56px);
    border-radius: 50%;
    background: #0b0e13;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.16),
      0 8px 22px rgba(0, 0, 0, 0.35);
    isolation: isolate;
  }

  /* Radiant halo. Sits behind the badge so it only shows around the edge, and
     fades in on hover instead of popping. */
  .logo-badge::after {
    content: "";
    position: absolute;
    inset: -24%;
    z-index: -1;
    border-radius: 50%;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(126, 158, 255, 0.78) 0%,
      rgba(180, 130, 255, 0.48) 40%,
      rgba(255, 190, 120, 0.32) 62%,
      transparent 74%
    );
    opacity: 0;
    filter: blur(10px);
    transform: scale(0.88);
    transition: opacity 320ms ease, transform 320ms ease;
    pointer-events: none;
  }

  .logo-badge-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    user-select: none;
    -webkit-user-drag: none;
    transform: rotate(0deg);
    will-change: transform;
  }

  .logo-badge-img.is-spinning {
    animation: logo-badge-spin 900ms cubic-bezier(0.45, 0, 0.25, 1) 1 both;
  }

  /* Hover = radiant glow + a slow colour cycle across the whole badge, so the
     halo and the artwork shift hue together. */
  .logo-badge:hover,
  .logo-badge:focus-within {
    animation: logo-badge-hue 5s linear infinite;
  }

  .logo-badge:hover::after,
  .logo-badge:focus-within::after {
    opacity: 1;
    animation: logo-badge-glow 2.8s ease-in-out infinite;
  }

  @keyframes logo-badge-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes logo-badge-hue {
    from {
      filter: hue-rotate(0deg);
    }
    to {
      filter: hue-rotate(360deg);
    }
  }

  @keyframes logo-badge-glow {
    0%,
    100% {
      opacity: 0.72;
      transform: scale(0.9);
    }
    50% {
      opacity: 1;
      transform: scale(1.14);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .logo-badge-img.is-spinning {
      animation: none;
    }

    .logo-badge:hover,
    .logo-badge:focus-within {
      animation: none;
    }

    .logo-badge:hover::after,
    .logo-badge:focus-within::after {
      opacity: 1;
      transform: none;
      animation: none;
    }
  }
`;
