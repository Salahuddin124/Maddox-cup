"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Logo, { LOGO_STYLES } from "../Logo";
import { BASE_STYLES } from "./admin-styles";
import MatchSchemes from "./MatchSchemes";
import { ADMIN_THEME_KEY } from "./theme";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

const ROLE_LABELS = {
  carry: "Carry (Pos 1)",
  midlaner: "Midlaner (Pos 2)",
  offlaner: "Offlaner (Pos 3)",
  "soft-support": "Soft Support (Pos 4)",
  "hard-support": "Hard Support (Pos 5)",
};

const DASH_TABS = [
  { id: "teams", label: "Team List" },
  { id: "schemes", label: "Match Schemes" },
];

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

/* Animates a number from its previous value to the target. */
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      fromRef.current = target;
      setValue(target);
      return undefined;
    }

    const from = fromRef.current;
    let frame;
    let start;

    const tick = (now) => {
      start ??= now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);

      fromRef.current = next;
      setValue(next);

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function SummaryCard({ label, value, format = true }) {
  const animated = useCountUp(value);

  return (
    <div className="summary-card">
      <span className="summary-value">
        {format ? NUMBER_FORMAT.format(animated) : animated}
      </span>
      <span className="summary-label">{label}</span>
    </div>
  );
}

function Chevron() {
  return (
    <svg
      className="chevron"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        d="M5 7.5l5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MmrChart({ team }) {
  const [hovered, setHovered] = useState(null);
  const players = [...team.players].sort((a, b) => a.id - b.id);

  if (players.length === 0) {
    return <p className="chart-empty">No players to chart.</p>;
  }

  const width = 820;
  const height = 320;
  const padding = { top: 24, right: 96, bottom: 56, left: 62 };
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
  const baseY = padding.top + plotHeight;

  const areaPath = `${pathFor(currentPoints)} L ${currentPoints.at(-1)[0].toFixed(1)} ${baseY} L ${currentPoints[0][0].toFixed(1)} ${baseY} Z`;

  const ticks = Array.from({ length: 6 }, (_, index) =>
    Math.round(min + (span * index) / 5),
  );

  const columnWidth = plotWidth / Math.max(players.length - 1, 1);
  const tooltipWidth = 154;
  const tooltipHeight = 64;
  const tooltipX =
    hovered === null
      ? 0
      : Math.min(
          Math.max(xAt(hovered) - tooltipWidth / 2, padding.left),
          padding.left + plotWidth - tooltipWidth,
        );
  const tooltipY =
    hovered === null
      ? 0
      : Math.max(
          Math.min(yAt(Math.max(currentMmr[hovered], peakMmr[hovered])) - tooltipHeight - 14, baseY - tooltipHeight),
          2,
        );

  const gradientId = `area-${team.id}`;

  return (
    <figure className="chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Current and peak MMR chart for ${team.teamName}`}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--current)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--current)" stopOpacity="0" />
          </linearGradient>
        </defs>

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

        {hovered !== null ? (
          <line
            className="hover-line"
            x1={xAt(hovered)}
            y1={padding.top}
            x2={xAt(hovered)}
            y2={baseY}
          />
        ) : null}

        {players.map((player, index) => (
          <g key={`player-${player.id}`}>
            <text
              className={`axis-label ${hovered === index ? "axis-active" : ""}`}
              x={xAt(index)}
              y={height - 28}
              textAnchor="middle"
            >
              {truncate(player.ign)}
            </text>
            <text
              className="axis-sub-label"
              x={xAt(index)}
              y={height - 11}
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

        <g className="reveal">
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path className="series series-peak" d={pathFor(peakPoints)} />
          <path className="series series-current" d={pathFor(currentPoints)} />

          {peakPoints.map(([x, y], index) => (
            <circle
              key={`peak-${players[index].id}`}
              className={`dot dot-peak ${hovered === index ? "dot-active" : ""}`}
              cx={x}
              cy={y}
              r={4}
            />
          ))}

          {currentPoints.map(([x, y], index) => (
            <circle
              key={`current-${players[index].id}`}
              className={`dot dot-current ${hovered === index ? "dot-active" : ""}`}
              cx={x}
              cy={y}
              r={4.5}
            />
          ))}
        </g>

        {players.map((player, index) => (
          <rect
            key={`hit-${player.id}`}
            x={xAt(index) - columnWidth / 2}
            y={padding.top}
            width={columnWidth}
            height={plotHeight}
            fill="transparent"
            onMouseEnter={() => setHovered(index)}
          />
        ))}

        {hovered !== null ? (
          <g className="tooltip" pointerEvents="none">
            <rect
              x={tooltipX}
              y={tooltipY}
              width={tooltipWidth}
              height={tooltipHeight}
              rx="8"
            />
            <text className="tooltip-title" x={tooltipX + 12} y={tooltipY + 20}>
              {truncate(players[hovered].ign, 18)}
            </text>
            <text className="tooltip-row" x={tooltipX + 12} y={tooltipY + 38}>
              Current {NUMBER_FORMAT.format(currentMmr[hovered])}
            </text>
            <text className="tooltip-row" x={tooltipX + 12} y={tooltipY + 54}>
              Peak {NUMBER_FORMAT.format(peakMmr[hovered])}
            </text>
          </g>
        ) : null}
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

function TeamCard({ team, open, onToggle, index }) {
  const players = [...team.players].sort((a, b) => a.id - b.id);
  const averageCurrent = average(
    players.map((player) => Number(player.currentMmr) || 0),
  );
  const averagePeak = average(
    players.map((player) => Number(player.peakMmr) || 0),
  );
  const panelId = `team-${team.id}-panel`;

  return (
    <section
      className={`team-card ${open ? "is-open" : ""}`}
      style={{ "--i": Math.min(index, 8) }}
    >
      <h2 className="team-heading">
        <button
          type="button"
          className="team-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="team-avatar" aria-hidden="true">
            {String(team.teamName ?? "?").trim().charAt(0).toUpperCase()}
          </span>

          <span className="team-identity">
            <span className="team-title">{team.teamName}</span>
            <span className="team-meta">
              <span className="team-reference">{team.reference}</span>
              <span className="team-date">{formatDate(team.createdAt)}</span>
            </span>
          </span>

          <span className="team-stats">
            <span className="stat">
              <span className="stat-label">Avg current</span>
              <span className="stat-value">
                {NUMBER_FORMAT.format(averageCurrent)}
              </span>
            </span>
            <span className="stat">
              <span className="stat-label">Avg peak</span>
              <span className="stat-value">
                {NUMBER_FORMAT.format(averagePeak)}
              </span>
            </span>
            <span className="stat stat-count">
              <span className="stat-label">Players</span>
              <span className="stat-value">{players.length}</span>
            </span>
          </span>

          <Chevron />
        </button>
      </h2>

      <div className="collapse" id={panelId} role="region">
        <div className="collapse-inner">
          <div className="team-body">
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
                        <span className="role-chip">
                          {roleLabel(player.role)}
                        </span>
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
          </div>
        </div>
      </div>
    </section>
  );
}

function SkeletonList() {
  return (
    <div className="team-list" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading registrations…</span>
      {[0, 1, 2].map((item) => (
        <div className="skeleton" key={item} style={{ "--i": item }} />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState(() => new Set());
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("teams");
  const didAutoOpen = useRef(false);

  // The inline script in app/admin/page.jsx already applied the stored theme
  // before paint; this keeps React in sync with whatever it chose.
  useEffect(() => {
    const applied = document.documentElement.dataset.theme;
    setTheme(applied === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";

      document.documentElement.dataset.theme = next;

      try {
        window.localStorage.setItem(ADMIN_THEME_KEY, next);
      } catch {
        // Private mode / blocked storage: the toggle still works for this visit.
      }

      return next;
    });
  };

  const handleTabKeyDown = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const index = DASH_TABS.findIndex((tab) => tab.id === activeTab);
    let next = index;

    if (event.key === "ArrowRight") next = (index + 1) % DASH_TABS.length;
    if (event.key === "ArrowLeft") {
      next = (index - 1 + DASH_TABS.length) % DASH_TABS.length;
    }
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = DASH_TABS.length - 1;

    const nextId = DASH_TABS[next].id;
    setActiveTab(nextId);
    document.getElementById(`dash-tab-${nextId}`)?.focus();
  };

  const goToLogin = useCallback(() => {
    router.replace("/admin/login");
    router.refresh();
  }, [router]);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401) {
        // Cookie expired or was revoked mid-session.
        setTeams([]);
        goToLogin();
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Couldn't load teams.");
      }

      setTeams(Array.isArray(result?.teams) ? result.teams : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Couldn't reach the server.",
      );
    } finally {
      setLoading(false);
    }
  }, [goToLogin]);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  // Open the first team once so the page doesn't load as a wall of closed rows.
  useEffect(() => {
    if (!didAutoOpen.current && teams.length > 0) {
      didAutoOpen.current = true;
      setOpenIds(new Set([teams[0].id]));
    }
  }, [teams]);

  const toggleTeam = (id) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOpen = teams.length > 0 && openIds.size === teams.length;

  const toggleAll = () =>
    setOpenIds(allOpen ? new Set() : new Set(teams.map((team) => team.id)));

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
      <style>{BASE_STYLES}</style>
      <style>{STYLES}</style>
      <style>{LOGO_STYLES}</style>

      <main className="admin-shell dash">
        <div className="admin-aura" aria-hidden="true">
          <span className="aura-one" />
          <span className="aura-two" />
          <span className="aura-three" />
          <span className="aura-grid" />
        </div>

        <div className="dash-inner">
          <header className="admin-topbar">
            <div className="brand">
              <Logo size={40} />
              <div>
                <p className="brand-name">Maddoxx Cup</p>
                <h1>Registrations</h1>
              </div>
            </div>
            <div className="topbar-actions">
              <button
                type="button"
                className="btn theme-toggle"
                onClick={toggleTheme}
                aria-pressed={theme === "light"}
                aria-label={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
                title={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
              >
                <span className="theme-icon" aria-hidden="true">
                  <svg className="theme-sun" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4.2" />
                    <path d="M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7" />
                  </svg>
                  <svg className="theme-moon" viewBox="0 0 24 24">
                    <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z" />
                  </svg>
                </span>
                <span className="theme-label">
                  <span className="theme-label-dark">Dark</span>
                  <span className="theme-label-light">Light</span>
                </span>
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => loadTeams()}
                disabled={loading}
              >
                <svg
                  className={`btn-icon ${loading ? "spin" : ""}`}
                  viewBox="0 0 20 20"
                  width="15"
                  height="15"
                  aria-hidden="true"
                >
                  <path
                    d="M16 10a6 6 0 1 1-1.76-4.24M16 4v3.5h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {loading ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </header>

          <div
            className="dash-tabs"
            role="tablist"
            aria-label="Dashboard sections"
            onKeyDown={handleTabKeyDown}
          >
            {DASH_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`dash-tab-${tab.id}`}
                className={`dash-tab ${activeTab === tab.id ? "is-active" : ""}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`dash-panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section className="summary" aria-label="Registration summary">
            <SummaryCard label="Teams" value={teams.length} format={false} />
            <SummaryCard label="Players" value={totalPlayers} format={false} />
            <SummaryCard label="Average MMR" value={overallAverage} />
          </section>

          {activeTab === "teams" ? (
            <div
              role="tabpanel"
              id="dash-panel-teams"
              aria-labelledby="dash-tab-teams"
            >
              {error ? (
                <p className="form-error" role="alert">
                  {error}
                </p>
              ) : null}

              {teams.length > 1 ? (
                <div className="list-toolbar">
                  <p>
                    {teams.length} teams
                    <span className="toolbar-sub">
                      {" "}
                      — {openIds.size} expanded
                    </span>
                  </p>
                  <button
                    type="button"
                    className="btn btn-quiet"
                    onClick={toggleAll}
                  >
                    {allOpen ? "Collapse all" : "Expand all"}
                  </button>
                </div>
              ) : null}

              {loading && teams.length === 0 ? (
                <SkeletonList />
              ) : teams.length === 0 ? (
                <p className="empty-state">
                  No registrations yet. New teams will appear here as they sign
                  up.
                </p>
              ) : (
                <div className="team-list">
                  {teams.map((team, index) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      index={index}
                      open={openIds.has(team.id)}
                      onToggle={() => toggleTeam(team.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              role="tabpanel"
              id="dash-panel-schemes"
              aria-labelledby="dash-tab-schemes"
            >
              <MatchSchemes teams={teams} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

const STYLES = `
  .dash-inner {
    position: relative;
    z-index: 1;
    max-width: 1180px;
    margin: 0 auto;
  }

  /* ---------- Top bar ---------- */
  .dash .admin-topbar {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    max-width: none;
    margin: 0 0 28px;
    animation: fade-in 500ms var(--ease) both;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .brand-name {
    margin: 0 0 2px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 500;
  }

  .dash .admin-topbar h1 {
    margin: 0;
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 650;
    letter-spacing: -0.02em;
  }

  .topbar-actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: var(--surface);
    color: var(--text-soft);
    font: inherit;
    font-size: 13px;
    font-weight: 550;
    cursor: pointer;
    transition: background 160ms ease, border-color 160ms ease,
      color 160ms ease, transform 160ms var(--ease);
  }

  .btn:hover:not(:disabled) {
    border-color: #3a4252;
    background: var(--surface-2);
    color: var(--text);
  }

  .btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .btn:disabled {
    cursor: progress;
    opacity: 0.65;
  }

  .btn-quiet {
    background: transparent;
  }

  .btn:focus-visible,
  .team-toggle:focus-visible {
    outline: 2px solid var(--current);
    outline-offset: 2px;
  }

  .btn-icon.spin {
    animation: spin 800ms linear infinite;
  }

  /* ---------- Dashboard tabs ---------- */
  .dash-tabs {
    display: inline-flex;
    gap: 4px;
    margin: 0 0 24px;
    padding: 4px;
    border: 1px solid var(--border-soft);
    border-radius: 12px;
    background: var(--surface);
  }

  .dash-tab {
    padding: 9px 18px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background 180ms ease, color 180ms ease,
      box-shadow 180ms ease;
  }

  .dash-tab:hover {
    color: var(--text);
  }

  .dash-tab.is-active {
    background: var(--surface-2);
    color: var(--text);
    box-shadow: inset 0 0 0 1px var(--border);
  }

  .dash-tab:focus-visible {
    outline: 2px solid var(--current);
    outline-offset: 2px;
  }

  /* ---------- Theme toggle ---------- */
  .theme-toggle {
    padding-right: 15px;
  }

  .theme-icon {
    position: relative;
    display: inline-block;
    width: 16px;
    height: 16px;
    flex: none;
  }

  .theme-icon svg {
    position: absolute;
    inset: 0;
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 520ms var(--ease), opacity 260ms ease;
  }

  .theme-sun {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }

  .theme-moon {
    transform: rotate(-90deg) scale(0.35);
    opacity: 0;
  }

  [data-theme="light"] .theme-sun {
    transform: rotate(90deg) scale(0.35);
    opacity: 0;
  }

  [data-theme="light"] .theme-moon {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }

  .theme-label {
    display: inline-block;
    min-width: 34px;
    text-align: left;
  }

  /* Both labels are always rendered so the text matches the pre-paint theme
     instead of flickering from "Dark" to "Light" after hydration. */
  .theme-label-light {
    display: none;
  }

  [data-theme="light"] .theme-label-dark {
    display: none;
  }

  [data-theme="light"] .theme-label-light {
    display: inline;
  }

  /* ---------- Summary ---------- */
  .summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    max-width: none;
    margin: 0 0 28px;
  }

  .summary-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 18px 20px;
    border: 1px solid var(--border-soft);
    border-radius: 12px;
    background: var(--surface);
    animation: fade-in 600ms var(--ease) both;
  }

  .summary-card:nth-child(2) { animation-delay: 70ms; }
  .summary-card:nth-child(3) { animation-delay: 140ms; }

  .summary-value {
    font-size: 30px;
    font-weight: 650;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .summary-label {
    color: var(--muted);
    font-size: 13px;
  }

  /* ---------- Toolbar ---------- */
  .list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 12px;
    padding: 0 2px;
  }

  .list-toolbar p {
    margin: 0;
    color: var(--text-soft);
    font-size: 14px;
    font-weight: 550;
  }

  .toolbar-sub {
    color: var(--muted);
    font-weight: 400;
  }

  /* ---------- Team accordion ---------- */
  .team-list {
    display: grid;
    gap: 10px;
    max-width: none;
    margin: 0;
  }

  .team-card {
    border: 1px solid var(--border-soft);
    border-radius: 14px;
    background: var(--surface);
    overflow: hidden;
    transition: border-color 220ms ease, box-shadow 300ms ease,
      background 220ms ease;
    animation: fade-in 600ms var(--ease) both;
    animation-delay: calc(var(--i, 0) * 60ms);
  }

  .team-card:hover {
    border-color: var(--border);
  }

  .team-card.is-open {
    border-color: #343c4b;
    box-shadow: 0 18px 40px -22px rgba(0, 0, 0, 0.6);
  }

  .team-heading {
    margin: 0;
    font-size: inherit;
  }

  .team-toggle {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 16px 20px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 160ms ease;
  }

  .team-toggle:hover {
    background: rgba(255, 255, 255, 0.025);
  }

  .team-avatar {
    display: grid;
    flex: none;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: var(--surface-2);
    box-shadow: inset 0 0 0 1px var(--border);
    color: var(--current);
    font-size: 16px;
    font-weight: 650;
    transition: background 220ms ease, color 220ms ease;
  }

  .team-card.is-open .team-avatar {
    background: #2a3350;
    color: #c4d0f5;
  }

  .team-identity {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .team-title {
    overflow: hidden;
    font-size: 16px;
    font-weight: 620;
    letter-spacing: -0.01em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .team-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    color: var(--muted);
    font-size: 12.5px;
  }

  .team-reference {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
  }

  .team-stats {
    display: flex;
    flex: none;
    gap: 22px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .stat-label {
    color: var(--muted);
    font-size: 11.5px;
  }

  .stat-value {
    color: var(--text);
    font-size: 15px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .chevron {
    flex: none;
    color: var(--muted);
    transition: transform 380ms var(--ease), color 200ms ease;
  }

  .team-toggle:hover .chevron {
    color: var(--text-soft);
  }

  .team-card.is-open .chevron {
    transform: rotate(180deg);
    color: var(--text);
  }

  /* Smooth height animation without measuring: grid rows 0fr -> 1fr */
  .collapse {
    display: grid;
    grid-template-rows: 0fr;
    visibility: hidden;
    transition: grid-template-rows 420ms var(--ease), visibility 0s linear 420ms;
  }

  .team-card.is-open .collapse {
    grid-template-rows: 1fr;
    visibility: visible;
    transition: grid-template-rows 420ms var(--ease), visibility 0s;
  }

  .collapse-inner {
    min-height: 0;
    overflow: hidden;
  }

  .team-body {
    padding: 4px 20px 22px;
    border-top: 1px solid var(--border-soft);
    opacity: 0;
    transform: translateY(-6px);
    transition: opacity 260ms ease, transform 420ms var(--ease);
  }

  .team-card.is-open .team-body {
    padding-top: 20px;
    opacity: 1;
    transform: none;
    transition-delay: 90ms;
  }

  /* ---------- Chart ---------- */
  .chart {
    margin: 0;
    padding: 14px 14px 10px;
    border: 1px solid var(--border-soft);
    border-radius: 12px;
    background: #161a21;
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
    border: 1px dashed var(--border);
    border-radius: 12px;
    color: var(--muted);
    text-align: center;
  }

  .grid-line {
    stroke: #232933;
    stroke-width: 1;
  }

  .hover-line {
    stroke: #3a4252;
    stroke-width: 1;
  }

  .axis-label {
    fill: var(--muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    transition: fill 150ms ease;
  }

  .axis-active {
    fill: var(--text);
  }

  .axis-sub-label {
    fill: #596172;
    font-size: 10px;
  }

  .series {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .series-current {
    stroke: var(--current);
    stroke-width: 2.5;
  }

  .series-peak {
    stroke: var(--peak);
    stroke-width: 2;
    stroke-dasharray: 7 6;
  }

  .dot {
    stroke: #161a21;
    stroke-width: 2;
    transition: r 160ms var(--ease);
  }

  .dot-active {
    r: 6.5;
  }

  .dot-current {
    fill: var(--current);
  }

  .dot-peak {
    fill: var(--peak);
  }

  .average-line {
    stroke: var(--avg);
    stroke-width: 1.5;
    stroke-dasharray: 3 6;
    opacity: 0.8;
  }

  .average-label {
    fill: var(--avg);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .team-card.is-open .reveal {
    animation: reveal 1100ms var(--ease) 180ms both;
  }

  .tooltip rect {
    fill: #232933;
    stroke: #3a4252;
  }

  .tooltip-title {
    fill: var(--text);
    font-size: 12.5px;
    font-weight: 600;
  }

  .tooltip-row {
    fill: var(--text-soft);
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    margin: 8px 4px 2px;
    color: var(--muted);
    font-size: 12px;
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .swatch {
    display: inline-block;
    width: 18px;
    height: 3px;
    border-radius: 999px;
  }

  .swatch-current { background: var(--current); }

  .swatch-peak {
    background: repeating-linear-gradient(
      90deg,
      var(--peak) 0 5px,
      transparent 5px 8px
    );
  }

  .swatch-average {
    background: repeating-linear-gradient(
      90deg,
      var(--avg) 0 3px,
      transparent 3px 6px
    );
  }

  /* ---------- Table ---------- */
  .table-wrap {
    margin-top: 16px;
    border: 1px solid var(--border-soft);
    border-radius: 12px;
    overflow-x: auto;
  }

  .dash table {
    width: 100%;
    min-width: 780px;
    border-collapse: collapse;
    font-size: 13px;
  }

  .dash th {
    padding: 11px 14px;
    border-bottom: 1px solid var(--border-soft);
    background: #171b22;
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
  }

  .dash td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border-soft);
    color: var(--text-soft);
    vertical-align: middle;
    transition: background 140ms ease;
  }

  .dash tbody tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }

  .dash tbody tr:last-child td {
    border-bottom: 0;
  }

  .player-cell {
    color: var(--text) !important;
    font-weight: 600;
    white-space: nowrap;
  }

  .captain-badge {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    border-radius: 6px;
    background: rgba(210, 178, 122, 0.14);
    color: var(--peak);
    font-size: 11px;
    font-weight: 600;
  }

  .role-chip {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 6px;
    background: var(--surface-2);
    color: var(--text-soft);
    font-size: 12px;
    white-space: nowrap;
  }

  .number-cell {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .mono-cell {
    max-width: 220px;
    overflow: hidden;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ---------- States ---------- */
  .dash .form-error {
    margin: 0 0 16px;
    padding: 12px 16px;
    border: 1px solid rgba(224, 138, 138, 0.35);
    border-radius: 10px;
    background: rgba(224, 138, 138, 0.08);
    color: var(--danger);
    font-size: 14px;
    animation: fade-in 300ms var(--ease) both;
  }

  .dash .empty-state {
    max-width: none;
    margin: 0;
    padding: 56px 24px;
    border: 1px dashed var(--border);
    border-radius: 14px;
    color: var(--muted);
    text-align: center;
  }

  .skeleton {
    height: 74px;
    border: 1px solid var(--border-soft);
    border-radius: 14px;
    background: linear-gradient(
        100deg,
        transparent 30%,
        rgba(255, 255, 255, 0.045) 50%,
        transparent 70%
      ),
      var(--surface);
    background-size: 220% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
    animation-delay: calc(var(--i, 0) * 120ms);
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

  /* ---------- Keyframes ---------- */
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }

  @keyframes reveal {
    from { clip-path: inset(-12px 100% -12px -12px); }
    to { clip-path: inset(-12px -12px -12px -12px); }
  }

  @keyframes shimmer {
    from { background-position: 120% 0; }
    to { background-position: -120% 0; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ---------- Responsive ---------- */
  @media (max-width: 860px) {
    .stat-count { display: none; }
  }

  @media (max-width: 720px) {
    .summary { grid-template-columns: 1fr; }

    .dash-tab {
      padding: 9px 12px;
      font-size: 12px;
    }

    .team-toggle {
      flex-wrap: wrap;
      padding: 14px 16px;
    }

    .team-identity { flex-basis: calc(100% - 100px); }

    .team-stats {
      order: 3;
      width: 100%;
      gap: 24px;
      padding-left: 56px;
    }

    .stat { align-items: flex-start; }

    .team-body { padding: 4px 14px 18px; }

    .chart { padding: 8px 6px 6px; }
  }

  /* ---------- Light theme touch-ups ----------
     Surfaces that use literal dark colors instead of variables. */
  [data-theme="light"] .chart {
    background: #ffffff;
  }

  [data-theme="light"] .grid-line {
    stroke: #e3e8f1;
  }

  [data-theme="light"] .hover-line {
    stroke: #c7cfdd;
  }

  [data-theme="light"] .axis-sub-label {
    fill: #8b93a3;
  }

  [data-theme="light"] .dot {
    stroke: #ffffff;
  }

  [data-theme="light"] .tooltip rect {
    fill: #ffffff;
    stroke: #c7cfdd;
  }

  [data-theme="light"] .dash th {
    background: #f5f7fb;
  }

  [data-theme="light"] .dash tbody tr:hover td,
  [data-theme="light"] .team-toggle:hover {
    background: rgba(20, 30, 50, 0.035);
  }

  [data-theme="light"] .team-card.is-open {
    border-color: var(--border-strong);
    box-shadow: 0 18px 40px -26px rgba(23, 32, 50, 0.3);
  }

  [data-theme="light"] .team-card.is-open .team-avatar {
    background: #dfe6f7;
    color: #33477e;
  }

  [data-theme="light"] .btn:hover:not(:disabled) {
    border-color: var(--border-strong);
  }

  [data-theme="light"] .captain-badge {
    background: rgba(141, 106, 44, 0.12);
  }

  [data-theme="light"] .skeleton {
    background:
      linear-gradient(
        100deg,
        transparent 30%,
        rgba(20, 30, 50, 0.06) 50%,
        transparent 70%
      ),
      var(--surface);
    background-size: 220% 100%;
  }
`;