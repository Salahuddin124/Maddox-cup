export const SCHEDULE_STYLES = `
  .schedule-board {
    --schedule-bg: var(--surface, #111722);
    --schedule-panel: var(--surface-2, #171f2d);
    --schedule-border: var(--border-soft, #293447);
    --schedule-border-strong: var(--border-strong, #3b4960);
    --schedule-text: var(--text, #edf2fa);
    --schedule-muted: var(--muted, #8d9bb0);
    --schedule-blue: #5795f5;
    --schedule-gold: #e6b85c;
    --schedule-green: #36c995;

    position: relative;
    margin-top: 18px;
    padding: 26px;
    border: 1px solid var(--schedule-border);
    border-radius: 16px;
    background: var(--schedule-bg);
    box-shadow: 0 8px 30px rgba(0, 0, 0, .09);
    animation: admin-fade-in 300ms var(--ease) both;
  }

  .schedule-board::before {
    content: "";
    position: absolute;
    top: 0;
    left: 26px;
    right: 26px;
    height: 2px;
    background: linear-gradient(
      90deg,
      var(--schedule-blue),
      rgba(87, 149, 245, .15),
      transparent
    );
  }

  .schedule-board .builder-head h3 {
    margin: 0 0 7px;
    color: var(--schedule-text);
    font-size: 18px;
    font-weight: 750;
    letter-spacing: -.035em;
  }

  .schedule-board .builder-head p {
    max-width: 720px;
    margin: 0;
    color: var(--schedule-muted);
    font-size: 13px;
    line-height: 1.7;
  }

  .schedule-empty {
    margin: 18px 0 0;
    padding: 16px;
    border: 1px dashed var(--schedule-border);
    border-radius: 12px;
    color: var(--schedule-muted);
    font-size: 13px;
    text-align: center;
  }

  .schedule-bracket {
    margin-top: 22px;
  }

  /* The embedded bracket keeps its own card; flatten it so it reads as the
     first block of the Schedule section instead of a nested panel. */
  .schedule-bracket .scheme-builder.is-embedded {
    margin-top: 0;
    padding: 20px;
    background: var(--schedule-panel);
    border-color: var(--schedule-border);
  }

  .schedule-prompt {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 18px;
    padding: 13px 16px;
    border: 1px solid rgba(230, 184, 92, .45);
    border-radius: 11px;
    background: rgba(230, 184, 92, .09);
    animation: admin-fade-in 240ms var(--ease) both;
  }

  .schedule-prompt-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    flex: none;
    border-radius: 50%;
    background: var(--schedule-gold);
    color: #1b1608;
    font-size: 14px;
    font-weight: 800;
  }

  .schedule-prompt strong {
    display: block;
    margin-bottom: 3px;
    color: var(--schedule-gold);
    font-size: 12.5px;
    font-weight: 750;
  }

  .schedule-prompt p {
    margin: 0;
    color: var(--schedule-text);
    font-size: 12.5px;
    line-height: 1.6;
  }

  .schedule-prompt b {
    color: var(--schedule-text);
    font-weight: 750;
  }

  .schedule-rounds {
    display: grid;
    gap: 16px;
    margin-top: 24px;
  }

  .schedule-round {
    overflow: hidden;
    border: 1px solid var(--schedule-border);
    border-radius: 13px;
    background: var(--schedule-panel);
  }

  .schedule-round-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--schedule-border);
    background: rgba(87, 149, 245, .05);
  }

  .schedule-round-head h4 {
    margin: 0;
    color: var(--schedule-text);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -.02em;
  }

  .schedule-section-label {
    margin: 0 0 3px;
    color: var(--schedule-blue);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .schedule-round-count {
    color: var(--schedule-muted);
    font-size: 11px;
    font-weight: 650;
    white-space: nowrap;
  }

  .schedule-batches {
    display: grid;
    gap: 1px;
    background: var(--schedule-border);
  }

  .schedule-batch {
    background: var(--schedule-panel);
  }

  .schedule-batch + .schedule-batch {
    border-top: 1px solid var(--schedule-border);
  }

  .batch-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 11px 18px;
    background: rgba(87, 149, 245, .035);
  }

  .batch-title {
    margin: 0 0 3px;
    color: var(--schedule-gold);
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .batch-matchups {
    margin: 0;
    color: var(--schedule-text);
    font-size: 12px;
    font-weight: 650;
    line-height: 1.5;
  }

  .batch-with {
    color: var(--schedule-muted);
    font-size: 10px;
    font-style: italic;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
  }

  .batch-when {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: none;
  }

  .batch-when input {
    width: 138px;
    padding: 7px 8px;
    border: 1px solid var(--schedule-border-strong);
    border-radius: 8px;
    background: var(--schedule-bg);
    color: var(--schedule-text);
    font: inherit;
    font-size: 12px;
    color-scheme: dark;
  }

  .batch-when input:focus-visible,
  .bo-select:focus-visible,
  .score-input:focus-visible,
  .schedule-save:focus-visible,
  .schedule-clear:focus-visible {
    outline: 2px solid var(--schedule-blue);
    outline-offset: 2px;
  }

  [data-theme="light"] .batch-when input,
  [data-theme="light"] .score-input,
  [data-theme="light"] .bo-select {
    color-scheme: light;
  }

  .schedule-batch-print {
    display: none;
    color: var(--schedule-muted);
    font-size: 11px;
    font-weight: 650;
  }

  .schedule-matches {
    display: grid;
  }

  .schedule-match {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 290px minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    padding: 12px 18px;
  }

  .schedule-match + .schedule-match {
    border-top: 1px solid var(--schedule-border);
  }

  .schedule-match.has-result {
    background: rgba(54, 201, 149, .035);
  }

  .schedule-match.is-targeted {
    background: rgba(230, 184, 92, .12);
    box-shadow: inset 3px 0 0 var(--schedule-gold);
  }

  .schedule-match.is-targeted .score-input,
  .schedule-match.is-targeted .bo-select {
    border-color: var(--schedule-gold);
  }

  .schedule-team {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .schedule-team.is-right {
    justify-content: flex-end;
    text-align: right;
  }

  .schedule-team-name {
    overflow: hidden;
    color: var(--schedule-text);
    font-size: 13px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .schedule-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .score-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
  }

  .bo-select {
    min-width: 92px;
    padding: 7px 8px;
    border: 1px solid var(--schedule-border-strong);
    border-radius: 8px;
    background: var(--schedule-bg);
    color: var(--schedule-text);
    font: inherit;
    font-size: 11.5px;
    font-weight: 650;
    cursor: pointer;
  }

  .score-input {
    width: 48px;
    padding: 7px 6px;
    border: 1px solid var(--schedule-border-strong);
    border-radius: 8px;
    background: var(--schedule-bg);
    color: var(--schedule-text);
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    text-align: center;
  }

  .score-input:disabled,
  .bo-select:disabled {
    cursor: not-allowed;
    opacity: .5;
  }

  .score-separator {
    color: var(--schedule-muted);
    font-size: 14px;
    font-weight: 700;
  }

  .score-hint {
    color: var(--schedule-muted);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .match-id-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 6px;
    width: 100%;
  }

  .match-id-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .match-id-field span {
    color: var(--schedule-muted);
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: .07em;
    text-align: center;
    text-transform: uppercase;
  }

  .match-id-input {
    width: 100%;
    min-width: 0;
    padding: 6px 5px;
    border: 1px solid var(--schedule-border-strong);
    border-radius: 8px;
    background: var(--schedule-bg);
    color: var(--schedule-text);
    font: inherit;
    font-size: 11px;
    font-weight: 650;
    text-align: center;
  }

  .match-id-input:focus-visible {
    outline: 2px solid var(--schedule-blue);
    outline-offset: 2px;
  }

  .match-id-input:disabled {
    cursor: not-allowed;
    opacity: .5;
  }

  .score-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .schedule-save {
    padding: 5px 12px;
    border: 1px solid rgba(87, 149, 245, .45);
    border-radius: 8px;
    background: var(--schedule-blue-soft, rgba(87, 149, 245, .12));
    color: var(--schedule-blue);
    font: inherit;
    font-size: 11px;
    font-weight: 750;
    cursor: pointer;
  }

  .schedule-save:hover:not(:disabled) {
    background: rgba(87, 149, 245, .2);
  }

  .schedule-save:disabled {
    cursor: not-allowed;
    opacity: .5;
  }

  .schedule-clear {
    padding: 3px 6px;
    border: 0;
    background: transparent;
    color: var(--schedule-muted);
    font: inherit;
    font-size: 11px;
    cursor: pointer;
  }

  .schedule-clear:hover:not(:disabled) {
    color: #e46f79;
  }

  .schedule-team-score {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex: none;
    border: 1px solid rgba(230, 184, 92, .35);
    border-radius: 8px;
    background: rgba(230, 184, 92, .12);
    color: var(--schedule-gold);
    font-family: 'Barlow Condensed', 'Arial Narrow', Impact, sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
  }

  .schedule-result-note {
    grid-column: 1 / -1;
    margin: -2px 0 0;
    color: var(--schedule-muted);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .05em;
    text-align: center;
    text-transform: uppercase;
  }

  .schedule-result-note.is-saved {
    color: var(--schedule-green);
  }

  @media (max-width: 900px) {
    .batch-head {
      align-items: flex-start;
      flex-direction: column;
    }

    .batch-when {
      width: 100%;
    }
  }

  @media (max-width: 760px) {
    .schedule-board {
      padding: 18px;
    }

    .schedule-match {
      grid-template-columns: minmax(0, 1fr) 210px minmax(0, 1fr);
      gap: 8px;
      padding: 12px;
    }

    .bo-select {
      min-width: 78px;
    }
  }

  @media print {
    .schedule-board input,
    .schedule-board select,
    .schedule-board button,
    .score-actions,
    .schedule-prompt {
      display: none !important;
    }

    .schedule-batch-print {
      display: block;
    }

    .schedule-board,
    .schedule-round,
    .schedule-batch,
    .schedule-match {
      background: #ffffff !important;
      color: #14213d !important;
      border-color: #cbd5e1 !important;
      box-shadow: none !important;
    }

    .schedule-team-name,
    .schedule-round-head h4,
    .schedule-board .builder-head h3,
    .batch-matchups,
    .schedule-batch-print {
      color: #14213d !important;
    }
  }
`;
