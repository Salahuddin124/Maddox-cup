"use client";

import { useCallback, useEffect, useState } from "react";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

const ROLE_LABELS = {
  carry: "Carry (Pos 1)",
  midlaner: "Midlaner (Pos 2)",
  offlaner: "Offlaner (Pos 3)",
  "soft-support": "Soft Support (Pos 4)",
  "hard-support": "Hard Support (Pos 5)",
};

function roleLabel(value) {
  return ROLE_LABELS[value] ?? value ?? "—";
}

function truncate(value, max = 12) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function average(values) {
  if (values.length === 0) return 0;

  return Math.round(
    values.reduce((total, value) => total + Number(value || 0), 0) /
      values.length,
  );
}

function formatDate(value) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
}

function MmrChart({ team }) {
  const players = [...team.players].sort((a, b) => a.id - b.id);

  if (players.length === 0) {
    return <p className="chart-empty">No players to chart.</p>;
  }

  const width = 820;
  const height = 340;
  const padding = { top: 28, right: 118, bottom: 58, left: 66 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const currentMmr = players.map((player) => Number(player.currentMmr) || 0);
  const peakMmr = players.map((player) => Number(player.peakMmr) || 0);
  const allValues = [...currentMmr, ...peakMmr];
  const step = 500;
  const min = Math.max(
    0,
    Math.floor((Math.min(...allValues) - step) / step) * step,
  );
  const max = Math.ceil((Math.max(...allValues) + step) / step) * step;
  const span = Math.max(max - min, step);

  const xAt = (index) =>
    players.length === 1
      ? padding.left + plotWidth / 2
      : padding.left + (plotWidth * index) / (players.length - 1);
  const yAt = (value) =>
    padding.top + plotHeight - ((value - min) / span) * plotHeight;

  const pointsFor = (values) =>
    values.map((value, index) => [xAt(index), yAt(value)]);
  const pathFor = (points) =>
    points
      .map(
        ([x, y], index) =>
          `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`,
      )
      .join(" ");

  const currentPoints = pointsFor(currentMmr);
  const peakPoints = pointsFor(peakMmr);
  const teamAverage = average(currentMmr);
  const averageY = yAt(teamAverage);

  const ticks = Array.from({ length: 6 }, (_, index) =>
    Math.round(min + (span * index) / 5),
  );

  return (
    <figure className="chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Current and peak MMR chart for ${team.teamName}`}
      >
        {ticks.map((value) => (
          <g key={`tick-${value}`}>
            <line
              className="grid-line"
              x1={padding.left}
              y1={yAt(value)}
              x2={padding.left + plotWidth}
              y2={yAt(value)}
            />
            <text
              className="axis-label"
              x={padding.left - 12}
              y={yAt(value) + 4}
              textAnchor="end"
            >
              {NUMBER_FORMAT.format(value)}
            </text>
          </g>
        ))}

        {players.map((player, index) => (
          <g key={`player-${player.id}`}>
            <line
              className="grid-line grid-line-vertical"
              x1={xAt(index)}
              y1={padding.top}
              x2={xAt(index)}
              y2={padding.top + plotHeight}
            />
            <text
              className="axis-label"
              x={xAt(index)}
              y={height - 30}
              textAnchor="middle"
            >
              {truncate(player.ign)}
            </text>
            <text
              className="axis-sub-label"
              x={xAt(index)}
              y={height - 13}
              textAnchor="middle"
            >
              {player.id === 1 ? "Captain" : `Player ${player.id}`}
            </text>
          </g>
        ))}

        <line
          className="average-line"
          x1={padding.left}
          y1={averageY}
          x2={padding.left + plotWidth}
          y2={averageY}
        />
        <text
          className="average-label"
          x={padding.left + plotWidth + 10}
          y={averageY + 4}
        >
          Avg {NUMBER_FORMAT.format(teamAverage)}
        </text>

        <path className="series series-peak" d={pathFor(peakPoints)} />
        <path className="series series-current" d={pathFor(currentPoints)} />

        {peakPoints.map(([x, y], index) => (
          <circle
            key={`peak-${players[index].id}`}
            className="dot dot-peak"
            cx={x}
            cy={y}
            r={4.5}
          >
            <title>
              {players[index].ign} peak MMR:{" "}
              {NUMBER_FORMAT.format(peakMmr[index])}
            </title>
          </circle>
        ))}

        {currentPoints.map(([x, y], index) => (
          <circle
            key={`current-${players[index].id}`}
            className="dot dot-current"
            cx={x}
            cy={y}
            r={4.5}
          >
            <title>
              {players[index].ign} current MMR:{" "}
              {NUMBER_FORMAT.format(currentMmr[index])}
            </title>
          </circle>
        ))}
      </svg>

      <figcaption className="legend">
        <span>
          <i className="swatch swatch-current" /> Current MMR
        </span>
        <span>
          <i className="swatch swatch-peak" /> Peak MMR
        </span>
        <span>
          <i className="swatch swatch-average" /> Team average
        </span>
      </figcaption>
    </figure>
  );
}

function TeamCard({ team }) {
  const players = [...team.players].sort((a, b) => a.id - b.id);
  const averageCurrent = average(
    players.map((player) => Number(player.currentMmr) || 0),
  );
  const averagePeak = average(
    players.map((player) => Number(player.peakMmr) || 0),
  );

  return (
    <section className="team-card" aria-labelledby={`team-${team.id}-title`}>
      <header className="team-head">
        <div>
          <h2 className="team-title" id={`team-${team.id}-title`}>
            {team.teamName}
          </h2>
          <p className="team-meta">
            <span className="team-reference">{team.reference}</span>
            <span aria-hidden="true"> · </span>
            {formatDate(team.createdAt)}
          </p>
        </div>
        <div className="team-averages">
          <span>
            Avg current <strong>{NUMBER_FORMAT.format(averageCurrent)}</strong>
          </span>
          <span>
            Avg peak <strong>{NUMBER_FORMAT.format(averagePeak)}</strong>
          </span>
        </div>
      </header>

      <MmrChart team={team} />

      <div className="table-wrap">
        <table>
          <caption className="sr-only">
            Players registered for {team.teamName}
          </caption>
          <thead>
            <tr>
              <th scope="col">Player</th>
              <th scope="col">Role</th>
              <th scope="col">Current MMR</th>
              <th scope="col">Peak MMR</th>
              <th scope="col">Steam ID</th>
              <th scope="col">Phone</th>
              <th scope="col">Discord</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id}>
                <td className="player-cell">
                  {player.ign}
                  {player.id === 1 ? (
                    <span className="captain-badge">Captain</span>
                  ) : null}
                </td>
                <td>
                  <span className="role-chip">{roleLabel(player.role)}</span>
                </td>
                <td className="number-cell">
                  {NUMBER_FORMAT.format(Number(player.currentMmr) || 0)}
                </td>
                <td className="number-cell">
                  {NUMBER_FORMAT.format(Number(player.peakMmr) || 0)}
                </td>
                <td className="mono-cell">{player.steamId || "—"}</td>
                <td className="mono-cell">{player.phone || "—"}</td>
                <td className="mono-cell">{player.discord || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  const [authState, setAuthState] = useState("checking");
  const [passphrase, setPassphrase] = useState("");
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401) {
        setTeams([]);
        setAuthState("guest");
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Couldn't load teams.");
      }

      setTeams(Array.isArray(result?.teams) ? result.teams : []);
      setAuthState("authed");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Couldn't reach the server.",
      );
      setAuthState("guest");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ passphrase }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Couldn't unlock the admin view.");
      }

      setPassphrase("");
      setAuthState("authed");
      await loadTeams();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Couldn't unlock the admin view.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin", {
        method: "DELETE",
        credentials: "same-origin",
      });
    } catch {
      // Locking the UI locally is enough if the request fails.
    }

    setTeams([]);
    setPassphrase("");
    setAuthState("guest");
    setError("");
  };

  const totalPlayers = teams.reduce(
    (total, team) => total + team.players.length,
    0,
  );
  const overallAverage = average(
    teams.flatMap((team) =>
      team.players.map((player) => Number(player.currentMmr) || 0),
    ),
  );

  return (
    <>
      <style>{STYLES}</style>

      {authState === "checking" ? (
        <main className="admin-shell centered-shell">
          <p className="status">Checking access…</p>
        </main>
      ) : null}

      {authState === "guest" ? (
        <main className="admin-shell centered-shell">
          <form className="login-card" onSubmit={handleLogin}>
            <div className="lock-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
              </svg>
            </div>
            <p className="eyebrow">MADDOXX CUP</p>
            <h1>Admin access</h1>
            <p className="login-copy">
              Enter the pass phrase to view registered teams and MMR charts.
            </p>

            <label className="login-label" htmlFor="admin-passphrase">
              Pass phrase
            </label>
            <input
              id="admin-passphrase"
              className="login-input"
              type="password"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              placeholder="Enter pass phrase"
              autoComplete="current-password"
              required
            />

            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}

            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Checking…" : "Unlock"}
            </button>
          </form>
        </main>
      ) : null}

      {authState === "authed" ? (
        <main className="admin-shell">
          <header className="admin-topbar">
            <div>
              <p className="eyebrow">MADDOXX CUP</p>
              <h1>Registration admin</h1>
            </div>
            <div className="topbar-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => loadTeams()}
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={handleLogout}
              >
                Lock
              </button>
            </div>
          </header>

          <section className="summary" aria-label="Registration summary">
            <div className="summary-card">
              <span className="summary-value">{teams.length}</span>
              <span className="summary-label">Teams</span>
            </div>
            <div className="summary-card">
              <span className="summary-value">{totalPlayers}</span>
              <span className="summary-label">Players</span>
            </div>
            <div className="summary-card">
              <span className="summary-value">
                {NUMBER_FORMAT.format(overallAverage)}
              </span>
              <span className="summary-label">Overall avg MMR</span>
            </div>
          </section>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          {teams.length === 0 ? (
            <p className="empty-state">No registrations yet.</p>
          ) : (
            <div className="team-list">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </main>
      ) : null}
    </>
  );
}

const STYLES = `
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

  .admin-topbar {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: flex-end;
    justify-content: space-between;
    max-width: 1240px;
    margin: 0 auto 26px;
  }

  .admin-topbar h1 {
    margin: 0;
    font-size: clamp(26px, 3.4vw, 38px);
    letter-spacing: -0.03em;
  }

  .topbar-actions {
    display: flex;
    gap: 10px;
  }

  .ghost-button {
    padding: 9px 16px;
    border: 1px solid #2a3b58;
    border-radius: 10px;
    background: rgba(18, 28, 46, 0.85);
    color: #cfdcf0;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 120ms ease, background 120ms ease;
  }

  .ghost-button:hover:not(:disabled) {
    border-color: #4f8cff;
    background: #16233a;
  }

  .ghost-button:disabled {
    cursor: progress;
    opacity: 0.6;
  }

  .summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    max-width: 1240px;
    margin: 0 auto 24px;
  }

  .summary-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 18px 20px;
    border: 1px solid #223149;
    border-radius: 14px;
    background: rgba(16, 25, 42, 0.72);
  }

  .summary-value {
    color: #fff;
    font-size: 28px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  .summary-label {
    color: #8fa3c0;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .team-list {
    display: grid;
    gap: 26px;
    max-width: 1240px;
    margin: 0 auto;
  }

  .team-card {
    padding: 22px;
    border: 1px solid #223149;
    border-radius: 18px;
    background: rgba(14, 23, 40, 0.82);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  }

  .team-head {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .team-title {
    margin: 0 0 6px;
    font-size: 22px;
    letter-spacing: -0.02em;
  }

  .team-meta {
    margin: 0;
    color: #8fa3c0;
    font-size: 13px;
  }

  .team-reference {
    color: #b9c9e3;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12.5px;
  }

  .team-averages {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .team-averages span {
    padding: 7px 12px;
    border: 1px solid #223149;
    border-radius: 999px;
    background: #101b2e;
    color: #9db2d1;
    font-size: 12.5px;
  }

  .team-averages strong {
    color: #e6edf7;
    font-variant-numeric: tabular-nums;
  }

  .chart {
    margin: 0;
    padding: 14px 14px 10px;
    border: 1px solid #1d2b44;
    border-radius: 14px;
    background: #0a1322;
  }

  .chart svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .chart-empty {
    margin: 0;
    padding: 30px;
    border: 1px dashed #2a3b58;
    border-radius: 12px;
    color: #8fa3c0;
    text-align: center;
  }

  .grid-line {
    stroke: #1c2a42;
    stroke-width: 1;
  }

  .grid-line-vertical {
    stroke-dasharray: 2 7;
    opacity: 0.7;
  }

  .axis-label {
    fill: #8fa3c0;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .axis-sub-label {
    fill: #5d7191;
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .series {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .series-current {
    stroke: #ff4d6d;
    stroke-width: 3;
  }

  .series-peak {
    stroke: #4f8cff;
    stroke-width: 2.5;
    stroke-dasharray: 8 6;
  }

  .dot {
    stroke: #0a1322;
    stroke-width: 2;
  }

  .dot-current {
    fill: #ff4d6d;
  }

  .dot-peak {
    fill: #4f8cff;
  }

  .average-line {
    stroke: #34d399;
    stroke-width: 2;
    stroke-dasharray: 4 6;
  }

  .average-label {
    fill: #34d399;
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    margin: 10px 4px 2px;
    color: #9db2d1;
    font-size: 12px;
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .swatch {
    display: inline-block;
    width: 18px;
    height: 3px;
    border-radius: 999px;
  }

  .swatch-current {
    background: #ff4d6d;
  }

  .swatch-peak {
    background: repeating-linear-gradient(
      90deg,
      #4f8cff 0 5px,
      transparent 5px 8px
    );
  }

  .swatch-average {
    background: repeating-linear-gradient(
      90deg,
      #34d399 0 3px,
      transparent 3px 6px
    );
  }

  .table-wrap {
    margin-top: 16px;
    overflow-x: auto;
  }

  table {
    width: 100%;
    min-width: 780px;
    border-collapse: collapse;
    font-size: 13px;
  }

  th {
    padding: 10px 12px;
    border-bottom: 1px solid #223149;
    color: #7d93b5;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
  }

  td {
    padding: 11px 12px;
    border-bottom: 1px solid #182640;
    color: #cfdcf0;
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  .player-cell {
    color: #fff;
    font-weight: 600;
    white-space: nowrap;
  }

  .captain-badge {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 7px;
    border-radius: 999px;
    background: rgba(255, 77, 109, 0.16);
    color: #ff9caf;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .role-chip {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 999px;
    background: #1a2942;
    color: #9db7dd;
    font-size: 11.5px;
    white-space: nowrap;
  }

  .number-cell {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .mono-cell {
    color: #9db2d1;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-state {
    max-width: 1240px;
    margin: 0 auto;
    padding: 48px 24px;
    border: 1px dashed #2a3b58;
    border-radius: 16px;
    color: #8fa3c0;
    text-align: center;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 720px) {
    .admin-shell {
      padding: 28px 14px 48px;
    }

    .summary {
      grid-template-columns: 1fr;
    }

    .team-card {
      padding: 16px;
    }

    .chart {
      padding: 8px 6px 6px;
    }

    .legend {
      gap: 12px;
    }
  }
`;
