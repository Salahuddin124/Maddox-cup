
export const MATCH_SCHEME_STYLES = `
  /* =========================================================
     MATCH SCHEMES — PREMIUM ESPORTS UI
     ========================================================= */

  .scheme-builder,
  .schemes-teams,
  .round-robin-standings {
    --ms-bg: var(--surface, #111722);
    --ms-panel: var(--surface-2, #171f2d);
    --ms-border: var(--border-soft, #293447);
    --ms-border-strong: var(--border-strong, #3b4960);
    --ms-text: var(--text, #edf2fa);
    --ms-muted: var(--muted, #8d9bb0);
    --ms-blue: #5795f5;
    --ms-blue-soft: rgba(87, 149, 245, .12);
    --ms-gold: #e6b85c;
    --ms-green: #36c995;
    --ms-red: #e46f79;
  }

  /* ---------- Main containers ---------- */

  .scheme-builder,
  .schemes-teams,
  .round-robin-standings {
    position: relative;
    margin-top: 18px;
    padding: 26px;
    border: 1px solid var(--ms-border);
    border-radius: 16px;
    background: var(--ms-bg);
    box-shadow: 0 8px 30px rgba(0, 0, 0, .09);
  }

  .scheme-builder {
    margin-top: 0;
    overflow: hidden;
  }

  .scheme-builder::before {
    content: "";
    position: absolute;
    top: 0;
    left: 26px;
    right: 26px;
    height: 2px;
    background: linear-gradient(
      90deg,
      var(--ms-blue),
      rgba(87,149,245,.15),
      transparent
    );
  }

  /* ---------- Header ---------- */

  .builder-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .builder-head h3,
  .schemes-teams-head h3,
  .round-robin-standings-head h4 {
    margin: 0 0 7px;
    color: var(--ms-text);
    font-size: 18px;
    font-weight: 750;
    letter-spacing: -.035em;
  }

  .builder-head p {
    max-width: 680px;
    margin: 0;
    color: var(--ms-muted);
    font-size: 13px;
    line-height: 1.7;
  }

  .builder-head p strong {
    color: var(--ms-blue);
  }

  /* ---------- Buttons ---------- */

  .scheme-builder button {
    font-family: inherit;
  }

  .scheme-builder .btn-quiet {
    flex: none;
    padding: 9px 14px;
    border: 1px solid var(--ms-border);
    border-radius: 9px;
    background: var(--ms-panel);
    color: var(--ms-muted);
    font-size: 12px;
    font-weight: 650;
    transition: all .18s ease;
  }

  .scheme-builder .btn-quiet:hover {
    border-color: var(--ms-red);
    background: rgba(228,111,121,.08);
    color: var(--ms-red);
  }

  /* ---------- Format selector ---------- */

  .format-switch {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 24px 0 15px;
    padding: 5px;
    border: 1px solid var(--ms-border);
    border-radius: 11px;
    background: var(--ms-panel);
  }

  .format-switch button {
    position: relative;
    padding: 10px 17px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--ms-muted);
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
    transition: all .2s ease;
  }

  .format-switch button:hover {
    background: rgba(255,255,255,.035);
    color: var(--ms-text);
  }

  .format-switch button.is-active {
    border-color: rgba(87,149,245,.28);
    background: var(--ms-blue-soft);
    color: var(--ms-blue);
    box-shadow: inset 0 0 15px rgba(87,149,245,.035);
  }

  .format-switch button:focus-visible,
  .bracket-slot:focus-visible,
  .bracket-win-btn:focus-visible,
  .scheme-builder button:focus-visible {
    outline: 2px solid var(--ms-blue);
    outline-offset: 3px;
  }

  /* ---------- Progress status ---------- */

  .builder-status {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0 0 18px;
    color: var(--ms-muted);
    font-size: 12px;
    font-weight: 600;
  }

  .builder-status::before {
    content: "";
    width: 7px;
    height: 7px;
    flex: none;
    border-radius: 50%;
    background: var(--ms-green);
    box-shadow: 0 0 10px rgba(54,201,149,.4);
  }

  /* ---------- Bracket board ---------- */

  .bracket-board {
    --column-gap: 38px;
    --match-step: 111px;

    display: flex;
    align-items: stretch;
    gap: var(--column-gap);
    overflow-x: auto;
    padding: 8px 5px 20px;
    scrollbar-width: thin;
    scrollbar-color: var(--ms-border-strong) transparent;
  }

  .bracket-board::-webkit-scrollbar {
    height: 7px;
  }

  .bracket-board::-webkit-scrollbar-track {
    background: transparent;
  }

  .bracket-board::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: var(--ms-border-strong);
  }

  .bracket-section {
    display: flex;
    flex: none;
    flex-direction: column;
  }

  .bracket-section-label {
    min-height: 17px;
    margin: 0 0 9px 3px;
    color: var(--ms-blue);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .17em;
    text-transform: uppercase;
  }

  .bracket-section:last-child .bracket-section-label {
    color: var(--ms-gold);
  }

  .bracket-section-rounds {
    display: flex;
    flex: 1;
    align-items: stretch;
    gap: var(--column-gap);
  }

  .bracket-round {
    position: relative;
    display: flex;
    min-width: 252px;
    flex: none;
    flex-direction: column;
    justify-content: space-around;
    padding-top: 27px;
  }

  .bracket-round-label {
    position: absolute;
    top: 0;
    left: 3px;
    margin: 0;
    color: var(--ms-muted);
    font-size: 10px;
    font-weight: 750;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  /* ---------- Match cards ---------- */

  .bracket-match {
    position: relative;
    display: grid;
    gap: 6px;
    margin: 7px 0;
    padding: 9px;
    border: 1px solid var(--ms-border);
    border-radius: 11px;
    background: var(--ms-panel);
    box-shadow: 0 4px 12px rgba(0,0,0,.08);
    transition: border-color .2s ease, box-shadow .2s ease;
  }

  .bracket-match:hover {
    border-color: var(--ms-border-strong);
    box-shadow: 0 7px 18px rgba(0,0,0,.13);
  }

  /* ---------- Match connectors ---------- */

  .bracket-round.has-incoming .bracket-match::before,
  .bracket-connector,
  .bracket-connector::after {
    content: "";
    position: absolute;
    border-color: var(--ms-border-strong);
    pointer-events: none;
  }

  .bracket-round.has-incoming .bracket-match::before {
    top: 50%;
    left: calc(var(--column-gap) * -1);
    width: var(--column-gap);
    border-top: 1px solid;
  }

  .bracket-connector {
    top: 50%;
    right: calc(var(--column-gap) * -1);
    width: var(--column-gap);
    border-top: 1px solid;
  }

  .bracket-match.pair-end .bracket-connector {
    width: calc(var(--column-gap) / 2);
  }

  .bracket-match.pair-start .bracket-connector::after {
    top: 0;
    left: calc(var(--column-gap) / 2);
    height: var(--match-step);
    border-left: 1px solid;
  }

  /* ---------- Team slots ---------- */

  .bracket-slot {
    display: flex;
    min-height: 39px;
    align-items: center;
    gap: 8px;
    padding: 7px 9px;
    border: 1px dashed var(--ms-border-strong);
    border-radius: 8px;
    background: rgba(0,0,0,.06);
    color: var(--ms-muted);
    font-size: 12px;
    cursor: default;
    transition: all .18s ease;
  }

  .bracket-slot.is-filled {
    border-style: solid;
    border-color: var(--ms-border);
    background: rgba(255,255,255,.025);
    color: var(--ms-text);
  }

  .bracket-slot.is-seed.is-filled {
    cursor: grab;
  }

  .bracket-slot.is-seed.is-filled:active {
    cursor: grabbing;
  }

  .bracket-slot.is-filled:hover {
    border-color: var(--ms-blue);
    background: var(--ms-blue-soft);
  }

  .bracket-slot.is-filled.is-winner,
  .bracket-slot.is-filled.is-winner:hover {
    border-color: rgba(54,201,149,.55);
    background: rgba(54,201,149,.09);
    color: var(--ms-green);
    box-shadow: inset 3px 0 0 var(--ms-green);
  }

  .bracket-slot.is-out {
    opacity: .48;
  }

  .bracket-slot.is-out .bracket-slot-name {
    text-decoration: line-through;
    text-decoration-color: var(--ms-red);
  }

  .bracket-slot-name {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bracket-slot-grip {
    flex: none;
    color: var(--ms-muted);
    font-size: 14px;
    line-height: 1;
    opacity: .65;
  }

  .bracket-slot.is-seed.is-filled:hover .bracket-slot-grip {
    color: var(--ms-blue);
    opacity: 1;
  }

  /* ---------- Winner selection ---------- */

  .bracket-win-btn {
    display: inline-flex;
    width: 25px;
    height: 25px;
    flex: none;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid var(--ms-border-strong);
    border-radius: 7px;
    background: transparent;
    color: var(--ms-muted);
    font-size: 10px;
    font-weight: 800;
    cursor: pointer;
    transition: all .18s ease;
  }

  .bracket-win-btn:hover {
    border-color: var(--ms-green);
    background: rgba(54,201,149,.1);
    color: var(--ms-green);
  }

  .bracket-win-btn.is-active {
    border-color: var(--ms-green);
    background: var(--ms-green);
    color: #071a14;
    box-shadow: 0 0 12px rgba(54,201,149,.17);
  }

  .bracket-out-tag {
    flex: none;
    padding: 3px 6px;
    border-radius: 5px;
    background: rgba(228,111,121,.1);
    color: var(--ms-red);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .06em;
  }

  .bracket-slot-empty {
    flex: 1;
    color: var(--ms-muted);
    font-size: 11px;
  }

  /* ---------- Champion card ---------- */

  .bracket-champion {
    min-width: 265px;
  }

  .champion-card {
    position: relative;
    display: flex;
    min-height: 130px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin: 7px 0;
    padding: 17px;
    border: 1px dashed var(--ms-border-strong);
    border-radius: 13px;
    background: var(--ms-panel);
    text-align: center;
  }

  .champion-card::before {
    content: "";
    position: absolute;
    top: 50%;
    left: calc(var(--column-gap) * -1);
    width: var(--column-gap);
    border-top: 1px solid var(--ms-border-strong);
    pointer-events: none;
  }

  .champion-card.is-filled {
    border: 1px solid rgba(230,184,92,.6);
    background: linear-gradient(
      145deg,
      rgba(230,184,92,.13),
      var(--ms-panel) 70%
    );
    box-shadow: 0 0 0 1px rgba(230,184,92,.08),
      0 12px 35px rgba(0,0,0,.17);
  }

  .champion-crown {
    color: var(--ms-border-strong);
    font-size: 28px;
    line-height: 1;
  }

  .champion-card.is-filled .champion-crown {
    color: var(--ms-gold);
    filter: drop-shadow(0 0 8px rgba(230,184,92,.3));
  }

  .champion-eyebrow {
    color: var(--ms-muted);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .19em;
    text-transform: uppercase;
  }

  .champion-card.is-filled .champion-eyebrow {
    color: var(--ms-gold);
  }

  .champion-name {
    max-width: 100%;
    overflow: hidden;
    color: var(--ms-text);
    font-size: 16px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .champion-meta,
  .champion-empty {
    color: var(--ms-muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  /* ---------- Starting positions ---------- */

  .schemes-teams {
    padding: 25px;
  }

  .schemes-teams-head,
  .round-robin-standings-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  .schemes-teams-head h3,
  .round-robin-standings-head h4 {
    margin: 0;
    font-size: 16px;
  }

  .schemes-teams-head span,
  .round-robin-standings-head span {
    color: var(--ms-muted);
    font-size: 11px;
    font-weight: 600;
  }

  .schemes-empty {
    margin: 0;
    padding: 28px;
    border: 1px dashed var(--ms-border-strong);
    border-radius: 10px;
    color: var(--ms-muted);
    font-size: 13px;
    text-align: center;
  }

  .schemes-team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(235px, 1fr));
    gap: 11px;
  }

  .schemes-team {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 12px;
    padding: 13px;
    border: 1px solid var(--ms-border);
    border-radius: 11px;
    background: var(--ms-panel);
    color: var(--ms-text);
    transition: border-color .2s ease, transform .2s ease,
      background .2s ease;
  }

  .schemes-team:hover {
    transform: translateY(-2px);
    border-color: var(--ms-border-strong);
  }

  .schemes-team.is-out {
    opacity: .55;
  }

  .schemes-team.is-out .schemes-team-name {
    text-decoration: line-through;
    text-decoration-color: var(--ms-red);
  }

  .schemes-team-avatar {
    display: inline-flex;
    width: 39px;
    height: 39px;
    flex: none;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(87,149,245,.2);
    border-radius: 10px;
    background: var(--ms-blue-soft);
    color: var(--ms-blue);
    font-size: 15px;
    font-weight: 800;
  }

  .schemes-team-info {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 4px;
  }

  .schemes-team-name {
    overflow: hidden;
    color: var(--ms-text);
    font-size: 12px;
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .schemes-team-meta {
    color: var(--ms-muted);
    font-size: 10.5px;
    font-variant-numeric: tabular-nums;
  }

  .schemes-team-tag {
    flex: none;
    margin-left: auto;
    padding: 4px 7px;
    border: 1px solid var(--ms-border);
    border-radius: 6px;
    background: rgba(255,255,255,.025);
    color: var(--ms-muted);
    font-size: 9px;
    font-weight: 750;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .schemes-team-tag.is-out {
    border-color: rgba(228,111,121,.2);
    background: rgba(228,111,121,.08);
    color: var(--ms-red);
  }

  /* ---------- Round robin standings ---------- */

  .round-robin-standings {
    padding: 25px;
  }

  .round-robin-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--ms-border);
    border-radius: 11px;
  }

  .round-robin-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--ms-panel);
    font-size: 12px;
  }

  .round-robin-table th,
  .round-robin-table td {
    padding: 13px 15px;
    border-bottom: 1px solid var(--ms-border);
    text-align: left;
    white-space: nowrap;
  }

  .round-robin-table th {
    background: rgba(255,255,255,.025);
    color: var(--ms-muted);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .round-robin-table tbody tr {
    transition: background .15s ease;
  }

  .round-robin-table tbody tr:hover {
    background: rgba(87,149,245,.045);
  }

  .round-robin-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .round-robin-table .rr-rank {
    width: 42px;
    color: var(--ms-muted);
    font-weight: 750;
    font-variant-numeric: tabular-nums;
  }

  .round-robin-table .rr-team {
    display: flex;
    min-width: 180px;
    align-items: center;
    gap: 10px;
  }

  .round-robin-table .rr-team-name {
    color: var(--ms-text);
    font-weight: 750;
  }

  .round-robin-table tr.is-leader {
    background: rgba(230,184,92,.045);
  }

  .round-robin-table tr.is-leader .rr-rank,
  .round-robin-table tr.is-leader .rr-team-name {
    color: var(--ms-gold);
  }

  .round-robin-table .rr-number {
    color: var(--ms-text);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  /* ---------- Responsive ---------- */

  @media (max-width: 900px) {
    .scheme-builder,
    .schemes-teams,
    .round-robin-standings {
      padding: 21px;
    }

    .bracket-board {
      --column-gap: 28px;
    }

    .bracket-round {
      min-width: 235px;
    }
  }

  @media (max-width: 720px) {
    .scheme-builder,
    .schemes-teams,
    .round-robin-standings {
      padding: 17px 13px;
      border-radius: 12px;
    }

    .scheme-builder::before {
      left: 14px;
      right: 14px;
    }

    .builder-head {
      flex-wrap: wrap;
      gap: 13px;
    }

    .builder-head h3 {
      font-size: 16px;
    }

    .builder-head p {
      font-size: 12px;
    }

    .scheme-builder .btn-quiet {
      width: 100%;
    }

    .format-switch {
      display: grid;
      width: 100%;
      grid-template-columns: 1fr;
      margin-top: 19px;
    }

    .format-switch button {
      padding: 10px;
      font-size: 11px;
    }

    .bracket-board {
      --column-gap: 24px;
      --match-step: 111px;
      padding-bottom: 15px;
    }

    .bracket-round {
      min-width: 220px;
    }

    .bracket-champion {
      min-width: 225px;
    }

    .schemes-teams-head,
    .round-robin-standings-head {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .schemes-team-grid {
      grid-template-columns: 1fr;
    }

    .round-robin-table th,
    .round-robin-table td {
      padding: 11px 10px;
    }
  }

  /* ---------- Reduced motion ---------- */

  @media (prefers-reduced-motion: reduce) {
    .scheme-builder *,
    .schemes-teams *,
    .round-robin-standings * {
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
      animation-duration: .01ms !important;
    }
  }
    .bracket-board {
  position: relative;
  isolation: isolate;
  overflow: visible;
}

/* Connector layer */
.bracket-connections {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  z-index: 0;
}

/* Keep match cards above the connector layer. */
.bracket-section,
.bracket-champion-section {
  position: relative;
  z-index: 1;
}

/* Outer electric-blue glow */
.bracket-wire-glow {
  fill: none;
  stroke: rgba(0, 174, 255, 0.65);
  stroke-width: 8px;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 4px rgba(0, 174, 255, 0.9))
          drop-shadow(0 0 9px rgba(0, 115, 255, 0.65));
  opacity: 0.75;
}

/* Sharp inner line */
.bracket-wire-core {
  fill: none;
  stroke: #63d7ff;
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 3px rgba(75, 195, 255, 0.95));
}

/* Disable the old CSS-generated connector system. */
.bracket-connector {
  display: none !important;
}

.bracket-round.has-incoming .bracket-match::before {
  content: none !important;
  display: none !important;
}
`;
