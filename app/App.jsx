"use client";

import { useEffect, useRef, useState } from "react";

const TOURNAMENT = "MADDOXX CUP";
const TITLE = "MADDOXX CUP";
const SUBTITLE = "Five players. One bracket. Register your squad.";
const TOTAL_FIELDS = 31;

const ROLES = [
  { value: "carry", label: "Carry (Pos 1)" },
  { value: "midlaner", label: "Midlaner (Pos 2)" },
  { value: "offlaner", label: "Offlaner (Pos 3)" },
  { value: "soft-support", label: "Soft Support (Pos 4)" },
  { value: "hard-support", label: "Hard Support (Pos 5)" },
];

const ROLE_LABELS = ROLES.reduce((labels, role) => {
  labels[role.value] = role.label;
  return labels;
}, {});

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

const EMPTY_PLAYERS = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  ign: "",
  steamId: "",
  role: "",
  currentMmr: "",
  peakMmr: "",
  discord: "",
}));

function hasValue(value) {
  return String(value ?? "").trim() !== "";
}

function isValidMmr(value) {
  return hasValue(value) && Number.isFinite(Number(value)) && Number(value) >= 0;
}

function isPlayerComplete(player) {
  return (
    hasValue(player.ign) &&
    hasValue(player.steamId) &&
    hasValue(player.role) &&
    isValidMmr(player.currentMmr) &&
    isValidMmr(player.peakMmr) &&
    hasValue(player.discord)
  );
}

function roleLabel(role) {
  return ROLE_LABELS[role] ?? "Role not set";
}

function playersFromRegistration(registration) {
  const savedPlayers = Array.isArray(registration?.players)
    ? registration.players
    : [];
  const savedById = new Map(
    savedPlayers.map((player) => [Number(player.id), player]),
  );

  return EMPTY_PLAYERS.map((emptyPlayer, index) => {
    const saved = savedById.get(emptyPlayer.id) ?? savedPlayers[index] ?? {};
    const currentMmr = saved.currentMmr;
    const peakMmr = saved.peakMmr;

    return {
      id: emptyPlayer.id,
      ign: typeof saved.ign === "string" ? saved.ign : "",
      steamId: typeof saved.steamId === "string" ? saved.steamId : "",
      role: saved.role && ROLE_LABELS[saved.role] ? saved.role : "",
      currentMmr:
        currentMmr === undefined || currentMmr === null
          ? ""
          : String(currentMmr),
      peakMmr:
        peakMmr === undefined || peakMmr === null ? "" : String(peakMmr),
      discord: typeof saved.discord === "string" ? saved.discord : "",
    };
  });
}

function Caret() {
  return <span className="type-caret" aria-hidden="true" />;
}

export default function App() {
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState(() =>
    EMPTY_PLAYERS.map((player) => ({ ...player })),
  );
  const [submittedData, setSubmittedData] = useState(null);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState("checking");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [phase, setPhase] = useState("waiting");
  const [titleCount, setTitleCount] = useState(0);
  const [subtitleCount, setSubtitleCount] = useState(0);
  const [caretOn, setCaretOn] = useState(true);

  const backgroundRef = useRef(null);
  const successHeadingRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      setTitleCount(TITLE.length);
      setSubtitleCount(SUBTITLE.length);
      setCaretOn(false);
      setPhase("done");
      return undefined;
    }

    if (phase === "waiting") {
      const blinkId = window.setInterval(() => {
        setCaretOn((visible) => !visible);
      }, 420);

      const startId = window.setTimeout(() => {
        window.clearInterval(blinkId);
        setCaretOn(true);
        setTitleCount(1);
        setPhase("title");
      }, 500);

      return () => {
        window.clearInterval(blinkId);
        window.clearTimeout(startId);
      };
    }

    if (phase === "title") {
      if (titleCount < TITLE.length) {
        const nextId = window.setTimeout(() => {
          setTitleCount((count) => Math.min(count + 1, TITLE.length));
        }, 90);

        return () => window.clearTimeout(nextId);
      }

      const subtitleId = window.setTimeout(() => {
        setCaretOn(true);
        setPhase("subtitle");
      }, 200);

      return () => window.clearTimeout(subtitleId);
    }

    if (phase === "subtitle") {
      if (subtitleCount < SUBTITLE.length) {
        const nextId = window.setTimeout(() => {
          setSubtitleCount((count) => Math.min(count + 1, SUBTITLE.length));
        }, 14);

        return () => window.clearTimeout(nextId);
      }

      const blinkId = window.setTimeout(() => {
        setPhase("blink");
      }, 320);

      return () => window.clearTimeout(blinkId);
    }

    if (phase === "blink") {
      const blinkTimers = [
        window.setTimeout(() => setCaretOn(false), 260),
        window.setTimeout(() => setCaretOn(true), 620),
        window.setTimeout(() => setCaretOn(false), 980),
        window.setTimeout(() => setCaretOn(true), 1340),
        window.setTimeout(() => setCaretOn(false), 1700),
        window.setTimeout(() => setCaretOn(true), 2060),
      ];

      const finishId = window.setTimeout(() => {
        setCaretOn(false);
        setPhase("done");
      }, 2320);

      return () => {
        blinkTimers.forEach((timerId) => window.clearTimeout(timerId));
        window.clearTimeout(finishId);
      };
    }

    return undefined;
  }, [phase, titleCount, subtitleCount]);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return undefined;

    let frameId = 0;
    let pointerX = -9999;
    let pointerY = -9999;

    const paintSpotlight = () => {
      frameId = 0;
      const node = backgroundRef.current;
      if (!node) return;

      node.style.setProperty("--mx", `${pointerX}px`);
      node.style.setProperty("--my", `${pointerY}px`);
    };

    const handlePointerMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!frameId) {
        frameId = window.requestAnimationFrame(paintSpotlight);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!submittedData) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });

    successHeadingRef.current?.focus({ preventScroll: true });
  }, [submittedData]);

  useEffect(() => {
    let cancelled = false;

    const loadSavedRegistration = async () => {
      try {
        const response = await fetch("/api/register", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const result = await response.json().catch(() => null);

        if (cancelled) return;

        if (response.ok && result?.registered && result.registration) {
          const registration = result.registration;
          const savedPlayers = playersFromRegistration(registration);

          setTeamName(registration.teamName ?? "");
          setPlayers(savedPlayers);
          setHasSubmittedOnce(true);
          setSubmittedData({
            tournament: TOURNAMENT,
            teamName: registration.teamName ?? "",
            players: savedPlayers.map((player) => ({
              ...player,
              currentMmr: Number(player.currentMmr),
              peakMmr: Number(player.peakMmr),
            })),
            reference: registration.reference ?? null,
            registrationId: registration.id ?? null,
          });
          setRegistrationStatus("registered");
          return;
        }

        setRegistrationStatus("none");
      } catch {
        if (!cancelled) setRegistrationStatus("none");
      }
    };

    loadSavedRegistration();

    return () => {
      cancelled = true;
    };
  }, []);

  const completedFields =
    (hasValue(teamName) ? 1 : 0) +
    players.reduce((total, player) => {
      let count = 0;
      if (hasValue(player.ign)) count += 1;
      if (hasValue(player.steamId)) count += 1;
      if (hasValue(player.role)) count += 1;
      if (isValidMmr(player.currentMmr)) count += 1;
      if (isValidMmr(player.peakMmr)) count += 1;
      if (hasValue(player.discord)) count += 1;
      return total + count;
    }, 0);

  const progress = Math.round((completedFields / TOTAL_FIELDS) * 100);
  const formComplete = completedFields === TOTAL_FIELDS;
  const isUpdate = registrationStatus === "registered";

  const mmrErrors = {};
  players.forEach((player) => {
    const current = isValidMmr(player.currentMmr)
      ? Number(player.currentMmr)
      : null;
    const peak = isValidMmr(player.peakMmr) ? Number(player.peakMmr) : null;

    if (current !== null && peak !== null && peak < current) {
      mmrErrors[player.id] = true;
    }
  });
  const hasMmrError = Object.keys(mmrErrors).length > 0;

  const roleCounts = players.reduce((counts, player) => {
    if (player.role) {
      counts[player.role] = (counts[player.role] ?? 0) + 1;
    }
    return counts;
  }, {});

  const duplicateRoles = ROLES.filter(
    (role) => (roleCounts[role.value] ?? 0) > 1,
  ).map((role) => role.label);

  const updatePlayer = (id, field, value) => {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === id ? { ...player, [field]: value } : player,
      ),
    );
    setSubmitError("");
  };

  const handleTeamNameChange = (event) => {
    setTeamName(event.target.value);
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (submittingRef.current) return;

    if (hasMmrError) return;

    if (!formComplete) {
      setSubmitError("Please complete every field before registering.");
      return;
    }

    const payload = {
      tournament: TOURNAMENT,
      teamName: teamName.trim(),
      players: players.map((player) => ({
        id: player.id,
        ign: player.ign.trim(),
        steamId: player.steamId.trim(),
        role: player.role,
        currentMmr: Number(player.currentMmr),
        peakMmr: Number(player.peakMmr),
        discord: player.discord.trim(),
      })),
    };

    console.log(payload);
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "We couldn't save your registration. Please try again.",
        );
      }

      setHasSubmittedOnce(true);
      setRegistrationStatus("registered");
      setSubmittedData({
        ...payload,
        reference: result?.reference ?? null,
        registrationId: result?.id ?? null,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't save your registration. Please try again.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleEditRoster = () => {
    setSubmittedData(null);
    setSubmitError("");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const titleCaretVisible =
    (phase === "waiting" || phase === "title") && caretOn;
  const subtitleCaretVisible =
    (phase === "subtitle" || phase === "blink") && caretOn;

  const submittedPlayers = submittedData?.players ?? [];
  const averageCurrentMmr = submittedPlayers.length
    ? Math.round(
        submittedPlayers.reduce(
          (total, player) => total + Number(player.currentMmr || 0),
          0,
        ) / submittedPlayers.length,
      )
    : 0;
  const averagePeakMmr = submittedPlayers.length
    ? Math.round(
        submittedPlayers.reduce(
          (total, player) => total + Number(player.peakMmr || 0),
          0,
        ) / submittedPlayers.length,
      )
    : 0;

  return (
    <>
      <style>{STYLES}</style>

      <div className="maddoxx-page">
        <div className="background" ref={backgroundRef} aria-hidden="true">
          <div className="background-dots" />
          <div className="background-spotlight" />
          <div className="background-blob background-blob-red" />
          <div className="background-blob background-blob-blue" />
          <div className="background-fade" />
        </div>

        <header className="hero">
          <div className="hero-inner">
            <p className="hero-kicker">Official tournament registration</p>

            <h1 className="hero-title">
              <span className="sr-only">{TITLE}</span>
              <span aria-hidden="true">
                {TITLE.slice(0, titleCount)}
                {titleCaretVisible ? <Caret /> : null}
                <span className="hero-phantom">
                  {TITLE.slice(titleCount)}
                </span>
              </span>
            </h1>

            <p className="hero-subtitle">
              <span className="sr-only">{SUBTITLE}</span>
              <span aria-hidden="true">
                {SUBTITLE.slice(0, subtitleCount)}
                {subtitleCaretVisible ? <Caret /> : null}
                <span className="hero-phantom">
                  {SUBTITLE.slice(subtitleCount)}
                </span>
              </span>
            </p>
          </div>
        </header>

        <main className="main">
          {registrationStatus === "checking" ? (
            <p className="status-card" role="status">
              Checking your registration…
            </p>
          ) : submittedData ? (
            <section
              className="success"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="success-card">
                <div className="check-wrap" aria-hidden="true">
                  <svg className="check-svg" viewBox="0 0 100 100">
                    <circle
                      className="check-circle"
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="#0f7b4f"
                      strokeWidth="3"
                    />
                    <path
                      className="check-mark"
                      d="M28 52l15 15 30-35"
                      fill="none"
                      stroke="#0f7b4f"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2
                  className="success-title"
                  ref={successHeadingRef}
                  tabIndex={-1}
                >
                  {submittedData.teamName} is registered
                </h2>

                {submittedData.reference ? (
                  <p className="success-reference">
                    Registration reference{" "}
                    <strong>{submittedData.reference}</strong>
                  </p>
                ) : null}

                <p className="success-lock-note">
                  This browser is registered. Reloading this page shows
                  this team instead of a blank form.
                </p>

                <div className="success-stats">
                  <div className="stat">
                    <span className="stat-value">
                      {submittedPlayers.length}
                    </span>
                    <span className="stat-label">Players</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">
                      {NUMBER_FORMAT.format(averageCurrentMmr)}
                    </span>
                    <span className="stat-label">Average current MMR</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">
                      {NUMBER_FORMAT.format(averagePeakMmr)}
                    </span>
                    <span className="stat-label">Average peak MMR</span>
                  </div>
                </div>

                <div className="table-wrap">
                  <table className="roster">
                    <caption className="sr-only">
                      Registered roster for {submittedData.teamName}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Player</th>
                        <th scope="col">Role</th>
                        <th scope="col">Current MMR</th>
                        <th scope="col">Peak MMR</th>
                        <th scope="col">Steam ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedPlayers.map((player, index) => (
                        <tr
                          className="roster-row"
                          key={player.id}
                          style={{ "--row": index }}
                        >
                          <td className="roster-player">{player.ign}</td>
                          <td>
                            <span className="roster-role">
                              {roleLabel(player.role)}
                            </span>
                          </td>
                          <td className="roster-number">
                            {NUMBER_FORMAT.format(player.currentMmr)}
                          </td>
                          <td className="roster-number">
                            {NUMBER_FORMAT.format(player.peakMmr)}
                          </td>
                          <td className="roster-steam">{player.steamId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="edit-button"
                  onClick={handleEditRoster}
                >
                  Edit roster
                </button>
              </div>
            </section>
          ) : (
            <div
              className={`form-shell ${
                hasSubmittedOnce ? "form-shell-instant" : ""
              }`}
            >
              <div
                className="progress"
                role="progressbar"
                aria-label="Roster completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div className="progress-head">
                  <span className="progress-label">Roster completion</span>
                  <span
                    className={`progress-value ${
                      progress === 100 ? "is-complete" : ""
                    }`}
                  >
                    {progress}%
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${
                      progress === 100 ? "is-complete" : ""
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <form className="registration-form" onSubmit={handleSubmit}>
                <div className="form-stack">
                  <section className="card">
                    <div className="card-head">
                      <div>
                        <h2 className="card-title">Team identity</h2>
                        <p className="card-note">
                          The name your five players will play under.
                        </p>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="field">
                        <label className="field-label" htmlFor="team-name">
                          Team name <span className="required">*</span>
                        </label>
                        <input
                          id="team-name"
                          className="input input-team"
                          type="text"
                          value={teamName}
                          onChange={handleTeamNameChange}
                          placeholder="e.g. Nightfall Five"
                          autoComplete="organization"
                          maxLength={80}
                          required
                        />
                      </div>
                    </div>
                  </section>

                  {duplicateRoles.length > 0 ? (
                    <div className="warning" role="alert">
                      <svg
                        className="warning-icon"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 3 2.8 19a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 9v4.5M12 17v.01"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p>
                        <strong>Duplicate roles.</strong> These roles are
                        assigned to more than one player:{" "}
                        {duplicateRoles.join(", ")}. Each role should be
                        unique.
                      </p>
                    </div>
                  ) : null}

                  {players.map((player) => {
                    const complete = isPlayerComplete(player);
                    const mmrError = Boolean(mmrErrors[player.id]);

                    return (
                      <section
                        className="card player-card"
                        key={player.id}
                        aria-labelledby={`player-${player.id}-title`}
                      >
                        <div className="card-head player-head">
                          <div className="player-heading">
                            <span
                              className={`player-badge ${
                                complete ? "is-complete" : ""
                              }`}
                              aria-hidden="true"
                            >
                              {complete ? (
                                <svg viewBox="0 0 20 20">
                                  <path
                                    d="m5 10.5 3.2 3.2L15 6.8"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : (
                                player.id
                              )}
                            </span>
                            <h2
                              className="card-title"
                              id={`player-${player.id}-title`}
                            >
                              Player {player.id}
                            </h2>
                          </div>
                          <span
                            className={`role-chip ${
                              player.role ? "is-set" : ""
                            }`}
                          >
                            {player.role
                              ? roleLabel(player.role)
                              : "Role not set"}
                          </span>
                        </div>

                        <div className="card-body">
                          <div className="player-grid">
                            <div className="field">
                              <label
                                className="field-label"
                                htmlFor={`player-${player.id}-ign`}
                              >
                                In-game name{" "}
                                <span className="required">*</span>
                              </label>
                              <input
                                id={`player-${player.id}-ign`}
                                className="input"
                                type="text"
                                value={player.ign}
                                onChange={(event) =>
                                  updatePlayer(
                                    player.id,
                                    "ign",
                                    event.target.value,
                                  )
                                }
                                placeholder="Dota in-game name"
                                autoComplete="off"
                                maxLength={40}
                                required
                              />
                            </div>

                            <div className="field">
                              <label
                                className="field-label"
                                htmlFor={`player-${player.id}-steam`}
                              >
                                Steam ID or friend ID{" "}
                                <span className="required">*</span>
                              </label>
                              <input
                                id={`player-${player.id}-steam`}
                                className="input"
                                type="text"
                                value={player.steamId}
                                onChange={(event) =>
                                  updatePlayer(
                                    player.id,
                                    "steamId",
                                    event.target.value,
                                  )
                                }
                                placeholder="SteamID64 or friend code"
                                autoComplete="off"
                                maxLength={64}
                                required
                              />
                            </div>

                            <div className="field">
                              <label
                                className="field-label"
                                htmlFor={`player-${player.id}-role`}
                              >
                                Primary role{" "}
                                <span className="required">*</span>
                              </label>
                              <select
                                id={`player-${player.id}-role`}
                                className="select"
                                value={player.role}
                                onChange={(event) =>
                                  updatePlayer(
                                    player.id,
                                    "role",
                                    event.target.value,
                                  )
                                }
                                required
                              >
                                <option value="" disabled>
                                  Select role
                                </option>
                                {ROLES.map((role) => (
                                  <option key={role.value} value={role.value}>
                                    {role.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="field">
                              <label
                                className="field-label"
                                htmlFor={`player-${player.id}-discord`}
                              >
                                Discord profile link{" "}
                                <span className="required">*</span>
                              </label>
                              <input
                                id={`player-${player.id}-discord`}
                                className="input"
                                type="url"
                                value={player.discord}
                                onChange={(event) =>
                                  updatePlayer(
                                    player.id,
                                    "discord",
                                    event.target.value,
                                  )
                                }
                                placeholder="https://discord.com/users/..."
                                autoComplete="url"
                                maxLength={200}
                                required
                              />
                            </div>

                            <div className="field">
                              <label
                                className="field-label"
                                htmlFor={`player-${player.id}-current-mmr`}
                              >
                                Current MMR{" "}
                                <span className="required">*</span>
                              </label>
                              <input
                                id={`player-${player.id}-current-mmr`}
                                className={`input ${mmrError ? "is-invalid" : ""}`}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                step={1}
                                value={player.currentMmr}
                                onChange={(event) =>
                                  updatePlayer(
                                    player.id,
                                    "currentMmr",
                                    event.target.value,
                                  )
                                }
                                placeholder="0"
                                aria-invalid={mmrError}
                                aria-describedby={
                                  mmrError
                                    ? `player-${player.id}-peak-error`
                                    : undefined
                                }
                                required
                              />
                            </div>

                            <div className="field">
                              <label
                                className="field-label"
                                htmlFor={`player-${player.id}-peak-mmr`}
                              >
                                Peak MMR{" "}
                                <span className="required">*</span>
                              </label>
                              <input
                                id={`player-${player.id}-peak-mmr`}
                                className={`input ${mmrError ? "is-invalid" : ""}`}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                step={1}
                                value={player.peakMmr}
                                onChange={(event) =>
                                  updatePlayer(
                                    player.id,
                                    "peakMmr",
                                    event.target.value,
                                  )
                                }
                                placeholder="0"
                                aria-invalid={mmrError}
                                aria-describedby={
                                  mmrError
                                    ? `player-${player.id}-peak-error`
                                    : undefined
                                }
                                required
                              />
                              {mmrError ? (
                                <p
                                  className="field-error"
                                  id={`player-${player.id}-peak-error`}
                                >
                                  Peak MMR cannot be lower than current MMR.
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </section>
                    );
                  })}

                  {submitError ? (
                    <div className="error-banner" role="alert">
                      {submitError}
                    </div>
                  ) : null}

                  <div className="submit-area">
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={hasMmrError || isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isUpdate ? "Update registration" : "Register team"}
                    </button>
                    <p className="submit-note">
                      {isUpdate
                        ? "This browser already has a registration. Saving updates that existing entry."
                        : "All five players must be registered. Entries are saved instantly."}
                    </p>
                  </div>
                </div>
              </form>
            </div>
          )}
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

#root,
#__next {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  text-align: left;
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
  /* Clip avoids creating a body scroll container, which keeps the sticky
     progress bar working while still preventing horizontal scrolling. */
  body {
    overflow-x: clip;
  }
}

button,
input,
select {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
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

.maddoxx-page {
  position: relative;
  min-height: 100vh;
}

.background {
  --mx: -9999px;
  --my: -9999px;
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: #f4f5f8;
}

.background-dots,
.background-spotlight {
  position: absolute;
  inset: 0;
  background-size: 28px 28px;
}

.background-dots {
  background-image: radial-gradient(circle, rgba(20, 33, 61, 0.13) 1px, transparent 1.4px);
  -webkit-mask-image: radial-gradient(ellipse 72% 68% at 50% 42%, #000 30%, transparent 100%);
  mask-image: radial-gradient(ellipse 72% 68% at 50% 42%, #000 30%, transparent 100%);
  opacity: 0.75;
}

.background-spotlight {
  display: none;
  background-image: radial-gradient(circle, rgba(200, 16, 46, 0.52) 1px, transparent 1.45px);
  -webkit-mask-image: radial-gradient(circle 190px at var(--mx) var(--my), #000 0%, rgba(0, 0, 0, 0.72) 52%, transparent 100%);
  mask-image: radial-gradient(circle 190px at var(--mx) var(--my), #000 0%, rgba(0, 0, 0, 0.72) 52%, transparent 100%);
  opacity: 0.9;
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
  min-height: 0.88em;
}

.hero-subtitle {
  margin: 18px 0 0;
  max-width: 620px;
  min-height: 1.6em;
  color: #c3cbda;
  font-size: clamp(15px, 2vw, 17px);
  font-weight: 400;
  line-height: 1.6;
}

.hero-phantom {
  visibility: hidden;
}

.type-caret {
  position: relative;
  display: inline-block;
  width: 0;
  height: 1em;
  vertical-align: -0.08em;
  pointer-events: none;
}

.type-caret::after {
  content: '';
  position: absolute;
  left: 2px;
  bottom: 0.07em;
  width: 3px;
  height: 0.82em;
  border-radius: 2px;
  background: #c8102e;
}

.main {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: -56px auto 0;
  padding: 0 24px 96px;
}

.form-shell {
  animation: formIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both;
}

.form-shell.form-shell-instant {
  animation: none;
  opacity: 1;
  transform: none;
}

.progress {
  position: sticky;
  top: 0;
  z-index: 20;
  margin-bottom: 16px;
  padding: 13px 16px 14px;
  border: 1px solid #e1e5ed;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 1px 2px rgba(20, 33, 61, 0.04),
    0 12px 28px -22px rgba(20, 33, 61, 0.4);
  backdrop-filter: blur(8px);
}

.progress-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.progress-label {
  color: #4b5873;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.progress-value {
  margin-left: auto;
  color: #14213d;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transition: color 0.25s ease;
}

.progress-value.is-complete {
  color: #0f7b4f;
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e9edf4;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: #14213d;
  transition:
    width 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.3s ease;
}

.progress-fill.is-complete {
  background: #0f7b4f;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  overflow: hidden;
  border: 1px solid #e1e5ed;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(20, 33, 61, 0.035),
    0 14px 32px -28px rgba(20, 33, 61, 0.35);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.card:focus-within {
  border-color: #b9c2d4;
  box-shadow:
    0 2px 4px rgba(20, 33, 61, 0.04),
    0 18px 38px -26px rgba(20, 33, 61, 0.4);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid #e1e5ed;
  background: #f7f8fa;
}

.card-title {
  margin: 0;
  color: #14213d;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.card-note {
  margin: 3px 0 0;
  color: #5f6b84;
  font-size: 12.5px;
  line-height: 1.4;
}

.card-body {
  padding: 20px;
}

.player-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.player-badge {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: none;
  border: 1px solid #e1e5ed;
  border-radius: 8px;
  background: #eef1f6;
  color: #4b5873;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.player-badge svg {
  width: 17px;
  height: 17px;
}

.player-badge.is-complete {
  border-color: #bfe3d0;
  background: #e8f5ee;
  color: #0f7b4f;
}

.role-chip {
  display: inline-flex;
  align-items: center;
  flex: none;
  padding: 5px 10px;
  border: 1px solid #e1e5ed;
  border-radius: 999px;
  background: #f2f4f8;
  color: #5f6b84;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.role-chip.is-set {
  border-color: #f3cfd6;
  background: #fbeef1;
  color: #9d0c24;
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field-label {
  color: #4b5873;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.4;
}

.required {
  color: #c8102e;
}

.input,
.select {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #cfd6e3;
  border-radius: 8px;
  background-color: #ffffff;
  color: #14213d;
  font-size: 14px;
  line-height: 1.2;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease;
}

.input::placeholder {
  color: #6b768c;
}

.input:hover,
.select:hover {
  border-color: #b7c1d2;
}

.input:focus,
.select:focus {
  outline: none;
  border-color: #14213d;
  box-shadow: 0 0 0 3px rgba(20, 33, 61, 0.14);
}

.input-team {
  height: 52px;
  padding: 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 38px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%234b5873' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
}

.input.is-invalid {
  border-color: #c8102e;
  background-color: #fffafb;
}

.input.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(200, 16, 46, 0.14);
}

.field-error {
  margin: 0;
  color: #c8102e;
  font-size: 12px;
  line-height: 1.4;
}

.warning {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #f0c9d0;
  border-radius: 12px;
  background: #fdf3f5;
  color: #8f1a31;
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex: none;
  margin-top: 1px;
}

.warning p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
}

.warning strong {
  font-weight: 600;
}

.error-banner {
  padding: 12px 16px;
  border: 1px solid #f0c9d0;
  border-radius: 10px;
  background: #fdf3f5;
  color: #9d0c24;
  font-size: 13px;
  line-height: 1.5;
}

.submit-area {
  margin-top: 4px;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 10px;
  background: #c8102e;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 10px 22px -10px rgba(200, 16, 46, 0.55);
  transition:
    background-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.submit-button:hover:not(:disabled) {
  background: #9d0c24;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px -10px rgba(157, 12, 36, 0.55);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:focus-visible {
  outline: 3px solid rgba(20, 33, 61, 0.35);
  outline-offset: 3px;
}

.submit-button:disabled {
  background: #d8a9b1;
  box-shadow: none;
}

.submit-note {
  margin: 10px 0 0;
  color: #5f6b84;
  font-size: 12.5px;
  line-height: 1.5;
  text-align: center;
}

.success {
  animation: formIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.success-card {
  padding: clamp(28px, 5vw, 48px);
  overflow: hidden;
  border: 1px solid #e1e5ed;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(20, 33, 61, 0.035),
    0 24px 54px -34px rgba(20, 33, 61, 0.42);
  text-align: center;
}

.check-wrap {
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: #eef8f2;
}

.check-svg {
  width: 64px;
  height: 64px;
  overflow: visible;
}

.check-circle {
  stroke-dasharray: 277;
  stroke-dashoffset: 277;
  animation: drawCircle 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.1s forwards;
}

.check-mark {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: drawCheck 0.45s cubic-bezier(0.65, 0, 0.35, 1) 0.75s forwards;
}

.success-title {
  margin: 0;
  color: #14213d;
  font-family: 'Barlow Condensed', 'Arial Narrow', Impact, sans-serif;
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: 0.01em;
  overflow-wrap: anywhere;
}

.success-title:focus {
  outline: none;
}

.success-reference {
  margin: 10px 0 0;
  color: #5f6b84;
  font-size: 12.5px;
  line-height: 1.5;
}

.success-reference strong {
  color: #4b5873;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.success-lock-note {
  margin: 8px 0 0;
  color: #5f6b84;
  font-size: 12.5px;
  line-height: 1.5;
}

.status-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  margin: 0;
  padding: 24px;
  border: 1px solid #e1e5ed;
  border-radius: 12px;
  background: #ffffff;
  color: #5f6b84;
  font-size: 13.5px;
  font-weight: 500;
  box-shadow:
    0 1px 2px rgba(20, 33, 61, 0.035),
    0 14px 32px -28px rgba(20, 33, 61, 0.35);
}

.success-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 28px 0;
  overflow: hidden;
  border: 1px solid #e1e5ed;
  border-radius: 10px;
  background: #e1e5ed;
  text-align: center;
}

.stat {
  min-width: 0;
  padding: 18px 12px;
  background: #fafbfc;
}

.stat-value {
  display: block;
  color: #14213d;
  font-family: 'Barlow Condensed', 'Arial Narrow', Impact, sans-serif;
  font-size: clamp(28px, 4vw, 38px);
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  display: block;
  margin-top: 6px;
  color: #5f6b84;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.02em;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #e1e5ed;
  border-radius: 10px;
  text-align: left;
}

.roster {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  font-size: 13px;
}

.roster th {
  padding: 11px 14px;
  border-bottom: 1px solid #e1e5ed;
  background: #f7f8fa;
  color: #4b5873;
  font-size: 11.5px;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.roster td {
  padding: 12px 14px;
  border-bottom: 1px solid #edf0f5;
  color: #4b5873;
  vertical-align: middle;
}

.roster tbody tr:last-child td {
  border-bottom: 0;
}

.roster-player {
  color: #14213d !important;
  font-weight: 600;
}

.roster-number {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.roster-steam {
  white-space: nowrap;
}

.roster-role {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  background: #fbeef1;
  color: #9d0c24;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.roster-row {
  opacity: 0;
  transform: translateY(8px);
  animation: rowIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: calc(0.7s + (var(--row) * 0.07s));
}

.edit-button {
  height: 46px;
  margin-top: 26px;
  padding: 0 24px;
  border: 1px solid #cfd6e3;
  border-radius: 8px;
  background: #ffffff;
  color: #14213d;
  font-size: 14px;
  font-weight: 600;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.edit-button:hover {
  border-color: #14213d;
  background: #f7f8fa;
}

.edit-button:focus-visible {
  outline: 3px solid rgba(20, 33, 61, 0.25);
  outline-offset: 3px;
}

@keyframes drawLine {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes formIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes drawCircle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes drawCheck {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes rowIn {
  to {
    opacity: 1;
    transform: none;
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

@media (pointer: fine) {
  .background-spotlight {
    display: block;
  }
}

@media (max-width: 640px) {
  .hero {
    padding-bottom: 96px;
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
    margin-top: -48px;
    padding: 0 16px 64px;
  }

  .progress {
    padding: 11px 13px 12px;
    border-radius: 10px;
  }

  .progress-label {
    display: none;
  }

  .card-head {
    padding: 13px 16px;
  }

  .card-body {
    padding: 16px;
  }

  .player-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }

  .input,
  .select {
    font-size: 16px;
  }

  .input-team {
    font-size: 17px;
  }

  .role-chip {
    padding: 4px 8px;
    font-size: 11px;
  }

  .success-stats {
    grid-template-columns: minmax(0, 1fr);
  }

  .stat {
    padding: 14px 12px;
  }

  .stat-label {
    margin-top: 4px;
  }

  .edit-button {
    width: 100%;
  }
}

@media (max-width: 400px) {
  .card-head {
    align-items: flex-start;
  }

  .player-head {
    flex-direction: column;
  }

  .role-chip {
    margin-left: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }

  .hero::after {
    animation: none;
    transform: scaleX(1);
  }

  .form-shell,
  .success,
  .success-card,
  .roster-row {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .check-circle,
  .check-mark {
    animation: none !important;
    stroke-dashoffset: 0;
  }
}
`;
