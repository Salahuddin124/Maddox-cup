"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MatchSchemes from "./MatchSchemes";
import { buildBlueprint, getDownstream, resolveBracket } from "./bracket";
import { SCHEDULE_STYLES } from "./schedule-styles";
import {
  hydrateTournament,
  mergeSchedules,
  schemeStore,
  selectScheme,
  setSchedule,
  setWinnerResult,
} from "./schemeStore";

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const normalizeName = (value) =>
  String(value ?? "").replace(/^\*\*|\*\*$/g, "").trim().toLowerCase();

const displayName = (value) =>
  String(value ?? "").replace(/^\*\*|\*\*$/g, "").trim();

// Converts saved picks to Round 1 keys when an older state has no slots.
const slotsFromPicks = (picks = [], teams = []) => {
  const byName = new Map(
    teams.map((team) => [normalizeName(team.teamName ?? team.name), team]),
  );
  const slots = {};

  picks.forEach((pick, index) => {
    const team = byName.get(normalizeName(pick?.team));
    if (!team) return;
    slots[`u-0-${Math.floor(index / 2)}-${index % 2}`] = Number(team.id);
  });

  return slots;
};

const emptyDraft = () => ({
  bestOf: 1,
  scoreA: "",
  scoreB: "",
  matchIds: [""],
});

// Only games actually played get a Match ID. A 2-0/0-2 Best of 3 ends after
// two games; a 2-1/1-2 series needs all three. Before a score is entered, keep
// all three slots available.
const matchIdCount = (draft) => {
  if (Number(draft?.bestOf) === 1) return 1;
  const a = Number(draft?.scoreA);
  const b = Number(draft?.scoreB);
  if (
    Number.isInteger(a) &&
    Number.isInteger(b) &&
    a + b === 2 &&
    Math.max(a, b) === 2
  ) {
    return 2;
  }
  return 3;
};

// Dota match IDs are numeric. Strip anything else so a pasted link cannot be
// stored as a broken ID.
const cleanMatchId = (value) =>
  String(value ?? "").replace(/\D/g, "").slice(0, 20);

const matchIdsFor = (draft) => {
  const source = Array.isArray(draft?.matchIds) ? draft.matchIds : [];
  return Array.from({ length: matchIdCount(draft) }, (_, index) =>
    cleanMatchId(source[index]),
  );
};

// A score is never two unrelated numbers: editing one side always snaps the
// other side to a legal counterpart for the selected Best of.
const scoreCeiling = (bestOf) => (Number(bestOf) === 1 ? 1 : 2);

const clampScore = (value, bestOf) => {
  if (value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return String(
    Math.max(0, Math.min(scoreCeiling(bestOf), Math.floor(number))),
  );
};

// Legal values for the opposite side. Bo1 is always 1-0/0-1; Bo3 finishes
// 2-0, 0-2, 2-1 or 1-2, so a 2 can face 0 or 1 while a 0 or 1 must face 2.
const counterpartValues = (value, bestOf) => {
  const side = Number(value);
  if (!Number.isInteger(side)) return [];
  if (Number(bestOf) === 1) return side === 1 ? [0] : [1];
  return side === 2 ? [0, 1] : [2];
};

const validScore = (a, b, bestOf) => {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return false;
  if (Number(bestOf) === 1) return (a === 1 && b === 0) || (a === 0 && b === 1);
  if (Number(bestOf) === 3) {
    return (
      (a === 2 && (b === 0 || b === 1)) ||
      (b === 2 && (a === 0 || a === 1))
    );
  }
  return false;
};

const draftIsValid = (draft) =>
  validScore(
    draft.scoreA === "" ? Number.NaN : Number(draft.scoreA),
    draft.scoreB === "" ? Number.NaN : Number(draft.scoreB),
    Number(draft.bestOf),
  );

function SchedulePanel({
  teams = [],
  target = null,
  onTargetHandled,
  onRequestScore,
}) {
  const dispatch = useDispatch();
  const { slots, winners, schedule } = useSelector(selectScheme);

  const [results, setResults] = useState({});
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [pendingMatchKey, setPendingMatchKey] = useState("");
  const scheduleTimers = useRef(new Map());

  const signature = useMemo(
    () => teams.map((team) => Number(team.id)).join(","),
    [teams],
  );
  const teamsById = useMemo(
    () => new Map(teams.map((team) => [Number(team.id), team])),
    [teams],
  );
  const upperCount = Math.max(
    2,
    2 ** Math.ceil(Math.log2(Math.max(teams.length, 2))),
  ) / 2;

  const blueprint = useMemo(
    () => buildBlueprint("double", upperCount),
    [upperCount],
  );
  const resolved = useMemo(
    () => resolveBracket(blueprint, slots, winners),
    [blueprint, slots, winners],
  );
  const rounds = useMemo(
    () =>
      blueprint.sections.flatMap((section) =>
        section.rounds.map((round) => ({ section, round })),
      ),
    [blueprint],
  );

  // Two matches per batch: parallel fixtures share one date/time input while
  // each keeps its own saved row in the database.
  const batches = useMemo(
    () =>
      rounds.flatMap(({ section, round }) => {
        const chunks = [];
        for (let index = 0; index < round.matches.length; index += 2) {
          chunks.push({
            key: `${round.key}-batch-${chunks.length + 1}`,
            roundKey: round.key,
            section,
            round,
            index: chunks.length + 1,
            matches: round.matches.slice(index, index + 2),
          });
        }
        return chunks;
      }),
    [rounds],
  );

  const activeMatchKey = target?.matchKey || pendingMatchKey;
  const activeTarget = useMemo(() => {
    if (!activeMatchKey) return null;

    const teamAId = resolved.boardSlots[`${activeMatchKey}-0`];
    const teamBId = resolved.boardSlots[`${activeMatchKey}-1`];
    const teamA = teamAId === undefined ? null : teamsById.get(Number(teamAId));
    const teamB = teamBId === undefined ? null : teamsById.get(Number(teamBId));

    return {
      matchKey: activeMatchKey,
      teamA: teamA ? displayName(teamA.teamName ?? teamA.name) : "Awaiting winner",
      teamB: teamB ? displayName(teamB.teamName ?? teamB.name) : "Awaiting winner",
      requestedTeam: target?.teamName || "",
    };
  }, [activeMatchKey, resolved.boardSlots, target?.teamName, teamsById]);

  const ready = teams.length === 8;

  const focusMatch = useCallback((matchKey) => {
    const node = document.querySelector(`[data-match-key="${matchKey}"]`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    node.querySelector(".score-input")?.focus({ preventScroll: true });
  }, []);

  const handleBracketW = useCallback(
    (matchKey) => {
      setPendingMatchKey(matchKey);
      focusMatch(matchKey);
    },
    [focusMatch],
  );

  useEffect(() => {
    if (!target?.matchKey || loading) return;
    setPendingMatchKey(target.matchKey);
    focusMatch(target.matchKey);
  }, [target, loading, focusMatch]);

  // The database is the source of truth. Loading all three endpoints here lets
  // the Schedule tab work even when Draw Format has never been opened.
  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetch("/api/tournament", { credentials: "same-origin", cache: "no-store" }),
      fetch("/api/schedule", { credentials: "same-origin", cache: "no-store" }),
      fetch("/api/results", { credentials: "same-origin", cache: "no-store" }),
    ])
      .then(async ([drawResponse, scheduleResponse, resultsResponse]) => {
        const [drawResult, scheduleResult, resultsResult] = await Promise.all([
          drawResponse.ok ? drawResponse.json() : null,
          scheduleResponse.ok ? scheduleResponse.json() : null,
          resultsResponse.ok ? resultsResponse.json() : null,
        ]);

        if (cancelled) return;

        const saved = drawResult?.state;
        const signatureMatches = saved?.signature === signature;
        const savedPicks =
          signatureMatches && Array.isArray(saved.picks) ? saved.picks : [];
        let savedSlots = signatureMatches && isRecord(saved.slots) ? saved.slots : {};

        if (Object.keys(savedSlots).length === 0 && savedPicks.length === 8) {
          savedSlots = slotsFromPicks(savedPicks, teams);
        }

        dispatch(
          hydrateTournament({
            signature,
            picks: savedPicks,
            slots: savedSlots,
            winners:
              signatureMatches && isRecord(saved.winners) ? saved.winners : {},
          }),
        );

        if (scheduleResult?.ok && Array.isArray(scheduleResult.schedules)) {
          dispatch(mergeSchedules({ schedules: scheduleResult.schedules }));
        }

        const byMatch = {};
        const nextDrafts = {};
        for (const row of resultsResult?.results ?? []) {
          if (
            isRecord(row) &&
            row.format === "double" &&
            typeof row.matchKey === "string"
          ) {
            byMatch[row.matchKey] = row;
            nextDrafts[row.matchKey] = {
              bestOf: Number(row.bestOf),
              scoreA: String(row.scoreA),
              scoreB: String(row.scoreB),
              matchIds: matchIdsFor({
                bestOf: Number(row.bestOf),
                scoreA: String(row.scoreA),
                scoreB: String(row.scoreB),
                matchIds: row.matchIds,
              }),
            };
          }
        }
        setResults(byMatch);
        setDrafts(nextDrafts);

        setError(
          !drawResult || !scheduleResult || !resultsResult
            ? "Couldn't load every saved schedule record."
            : "",
        );
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't load the saved schedule.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, ready, signature, teams]);

  useEffect(
    () => () => {
      scheduleTimers.current.forEach((id) => clearTimeout(id));
      scheduleTimers.current.clear();
    },
    [],
  );

  // One input updates every fixture in a parallel batch, but each fixture is
  // written to its own database row so they can still differ later if needed.
  const handleBatchChange = useCallback(
    (matchKeys, field, value) => {
      matchKeys.forEach((matchKey) => {
        dispatch(setSchedule({ format: "double", matchKey, field, value }));
      });

      const timerKey = `batch:${field}:${matchKeys.join(",")}`;
      clearTimeout(scheduleTimers.current.get(timerKey));

      scheduleTimers.current.set(
        timerKey,
        setTimeout(() => {
          scheduleTimers.current.delete(timerKey);
          matchKeys.forEach((matchKey) => {
            const entry =
              schemeStore.getState().scheme.schedules.double?.[matchKey] ?? {};
            fetch("/api/schedule", {
              method: "PUT",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                format: "double",
                matchKey,
                date: entry.date ?? "",
                time: entry.time ?? "",
              }),
            }).catch(() => {});
          });
        }, 350),
      );
    },
    [dispatch],
  );

  // Scores decide bracket progress, so the winner list is written back to the
  // same tournament row the Draw section reads.
  const persistWinners = useCallback(
    async (nextWinners) => {
      const response = await fetch("/api/tournament", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const saved = response.ok
        ? (await response.json().catch(() => null))?.state
        : null;

      const saveResponse = await fetch("/api/tournament", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature,
          picks: Array.isArray(saved?.picks) ? saved.picks : [],
          slots: Object.keys(slots).length ? slots : saved?.slots ?? {},
          winners: nextWinners,
        }),
      });

      if (!saveResponse.ok) throw new Error("Couldn't update the bracket.");
    },
    [signature, slots],
  );

  // A saved row is identified by its fixture key. Earlier versions hid a
  // saved score whenever the current teams or winner map did not line up,
  // which made correctly stored results look lost after a reload. Stale
  // dependents are removed at save/clear time instead, so display here stays
  // a direct lookup of what is in the database.
  const resultForMatch = useCallback(
    (matchKey) => results[matchKey] ?? null,
    [results],
  );

  // Editing either side repairs the other one, so a drawn score such as 1-1
  // can never be produced by the form.
  const handleScoreInput = useCallback((matchKey, side, rawValue) => {
    setDrafts((current) => {
      const draft = { ...(current[matchKey] ?? emptyDraft()) };
      const otherSide = side === "scoreA" ? "scoreB" : "scoreA";
      const value = clampScore(rawValue, draft.bestOf);

      draft[side] = value;
      if (value !== "") {
        const allowed = counterpartValues(value, draft.bestOf);
        if (draft[otherSide] === "" || !allowed.includes(Number(draft[otherSide]))) {
          draft[otherSide] = String(allowed[0]);
        }
      }
      draft.matchIds = matchIdsFor(draft);

      return { ...current, [matchKey]: draft };
    });
  }, []);

  const handleBestOfChange = useCallback((matchKey, value) => {
    const bestOf = Number(value);
    setDrafts((current) => {
      const draft = { ...(current[matchKey] ?? emptyDraft()), bestOf };
      let a = clampScore(draft.scoreA, bestOf);
      let b = clampScore(draft.scoreB, bestOf);

      if (a !== "") {
        const allowed = counterpartValues(a, bestOf);
        if (b === "" || !allowed.includes(Number(b))) b = String(allowed[0]);
      } else if (b !== "") {
        const allowed = counterpartValues(b, bestOf);
        a = String(allowed[0]);
      }

      draft.scoreA = a;
      draft.scoreB = b;
      draft.matchIds = matchIdsFor(draft);
      return { ...current, [matchKey]: draft };
    });
  }, []);

  const updateMatchId = useCallback((matchKey, index, value) => {
    setDrafts((current) => {
      const draft = { ...(current[matchKey] ?? emptyDraft()) };
      const ids = matchIdsFor(draft);
      ids[index] = cleanMatchId(value);
      draft.matchIds = ids;
      return { ...current, [matchKey]: draft };
    });
  }, []);

  // One change can invalidate a whole chain of later fixtures. Delete them in
  // one database call so a reload cannot resurrect scores that no longer
  // belong to the current bracket path.
  const clearResults = useCallback(async (keys) => {
    const unique = [...new Set(keys)].filter(Boolean);
    if (!unique.length) return;

    const query =
      unique.length === 1
        ? `format=double&matchKey=${encodeURIComponent(unique[0])}`
        : `format=double&matchKeys=${encodeURIComponent(unique.join(","))}`;
    const response = await fetch(`/api/results?${query}`, {
      method: "DELETE",
      credentials: "same-origin",
    });

    if (!response.ok) throw new Error("Couldn't clear affected scores.");

    setResults((current) => {
      const next = { ...current };
      unique.forEach((key) => delete next[key]);
      return next;
    });
    setDrafts((current) => {
      const next = { ...current };
      unique.forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  const handleSaveScore = useCallback(
    async (matchKey) => {
      const draft = drafts[matchKey] ?? emptyDraft();
      const teamAId = Number(resolved.boardSlots[`${matchKey}-0`]);
      const teamBId = Number(resolved.boardSlots[`${matchKey}-1`]);
      const bestOf = Number(draft.bestOf);
      const scoreA =
        draft.scoreA === "" ? Number.NaN : Number(draft.scoreA);
      const scoreB =
        draft.scoreB === "" ? Number.NaN : Number(draft.scoreB);

      if (!teamAId || !teamBId) {
        setError("Both teams must be known before a score can be saved.");
        return;
      }
      if (!validScore(scoreA, scoreB, bestOf)) {
        setError(
          bestOf === 1
            ? "Best of 1 must be 1-0 or 0-1."
            : "Best of 3 must be 2-0, 0-2, 2-1 or 1-2.",
        );
        return;
      }

      setBusyKey(matchKey);
      setError("");

      try {
        const response = await fetch("/api/results", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            format: "double",
            matchKey,
            bestOf,
            teamAId,
            teamBId,
            scoreA,
            scoreB,
            matchIds: matchIdsFor(draft),
          }),
        });
        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.ok) {
          throw new Error(result?.error || "Couldn't save the score.");
        }

        setResults((current) => ({
          ...current,
          [matchKey]: {
            matchKey,
            format: "double",
            bestOf,
            teamAId,
            teamBId,
            scoreA,
            scoreB,
            matchIds: matchIdsFor(draft),
          },
        }));

        const winnerId = scoreA > scoreB ? teamAId : teamBId;
        const downstream = getDownstream(blueprint, matchKey);
        const previousWinner = winners[matchKey];
        const winnerChanged =
          previousWinner === undefined || Number(previousWinner) !== winnerId;
        const nextWinners = { ...winners, [matchKey]: winnerId };
        for (const key of downstream) delete nextWinners[key];

        // If the winner changed, every later fixture now has different teams,
        // so its saved score must go as well.
        if (winnerChanged) await clearResults(downstream);

        dispatch(setWinnerResult({ matchKey, teamId: winnerId, downstream }));
        await persistWinners(nextWinners);

        setSavedKey(matchKey);
        if (activeTarget?.matchKey === matchKey) {
          setPendingMatchKey("");
          onTargetHandled?.();
        }
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Couldn't save the score.",
        );
      } finally {
        setBusyKey("");
      }
    },
    [
      activeTarget?.matchKey,
      blueprint,
      clearResults,
      dispatch,
      drafts,
      onTargetHandled,
      persistWinners,
      resolved.boardSlots,
      winners,
    ],
  );

  const handleClearScore = useCallback(
    async (matchKey) => {
      setBusyKey(matchKey);
      setError("");

      try {
        const downstream = getDownstream(blueprint, matchKey);
        await clearResults([matchKey, ...downstream]);
        setSavedKey("");

        const nextWinners = { ...winners };
        delete nextWinners[matchKey];
        for (const key of downstream) delete nextWinners[key];

        dispatch(setWinnerResult({ matchKey, clear: true, downstream }));
        await persistWinners(nextWinners);

        if (activeTarget?.matchKey === matchKey) {
          setPendingMatchKey("");
          onTargetHandled?.();
        }
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Couldn't clear the score.",
        );
      } finally {
        setBusyKey("");
      }
    },
    [
      activeTarget?.matchKey,
      blueprint,
      clearResults,
      dispatch,
      onTargetHandled,
      persistWinners,
      winners,
    ],
  );

  const matchupLabel = useCallback(
    (match) => {
      const teamAId = resolved.boardSlots[`${match.key}-0`];
      const teamBId = resolved.boardSlots[`${match.key}-1`];
      const teamA = teamAId === undefined ? null : teamsById.get(Number(teamAId));
      const teamB = teamBId === undefined ? null : teamsById.get(Number(teamBId));

      return `${teamA ? displayName(teamA.teamName ?? teamA.name) : "TBD"} vs ${
        teamB ? displayName(teamB.teamName ?? teamB.name) : "TBD"
      }`;
    },
    [resolved.boardSlots, teamsById],
  );

  return (
    <>
      <style>{SCHEDULE_STYLES}</style>

      <section className="schedule-board" aria-labelledby="schedule-heading">
        <div className="builder-head">
          <div>
            <h3 id="schedule-heading">Tournament schedule</h3>
            <p>
              The live Double Elimination table is shown first and updates as
              scores are saved. Matches run two at a time in labelled batches;
              set a batch time once and enter each score by hand. The other
              score corrects itself automatically so only real results can be
              saved. Fixtures without a saved score show Results Upcoming.
              Clicking <b>W</b> on a bracket team jumps to its fixture below.
            </p>
          </div>
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? <p className="schedule-empty">Loading schedule…</p> : null}

        {!loading && !ready ? (
          <p className="schedule-empty">
            The schedule needs exactly 8 registered teams before it can be
            built.
          </p>
        ) : null}

        {!loading && ready ? (
          <div className="schedule-content">
            <div className="schedule-bracket">
              <MatchSchemes
                teams={teams}
                embedded
                onRequestScore={handleBracketW}
              />
            </div>

            {activeTarget ? (
              <div className="schedule-prompt" role="status">
                <span className="schedule-prompt-icon" aria-hidden="true">!</span>
                <div>
                  <strong>Update the score for this bracket match</strong>
                  <p>
                    {activeTarget.requestedTeam
                      ? `${activeTarget.requestedTeam} was marked as the winner. `
                      : ""}
                    Enter the score for <b>{activeTarget.teamA}</b> vs{" "}
                    <b>{activeTarget.teamB}</b> in the fixture below.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="schedule-rounds">
              {rounds.map(({ section, round }) => (
                <article className="schedule-round" key={round.key}>
                  <header className="schedule-round-head">
                    <div>
                      <p className="schedule-section-label">
                        {section.label ?? "Bracket"}
                      </p>
                      <h4>{round.label}</h4>
                    </div>
                    <span className="schedule-round-count">
                      {round.matches.length}{" "}
                      {round.matches.length === 1 ? "fixture" : "fixtures"} ·{" "}
                      {Math.ceil(round.matches.length / 2)}{" "}
                      {Math.ceil(round.matches.length / 2) === 1
                        ? "batch"
                        : "batches"}
                    </span>
                  </header>

                  <div className="schedule-batches">
                    {batches
                      .filter((batch) => batch.roundKey === round.key)
                      .map((batch) => {
                        const matchKeys = batch.matches.map(
                          (match) => match.key,
                        );
                        const batchSchedule = schedule?.[matchKeys[0]] ?? {};
                        const when = [batchSchedule.date, batchSchedule.time]
                          .filter(Boolean)
                          .join(" · ");

                        return (
                          <div className="schedule-batch" key={batch.key}>
                            <div className="batch-head">
                              <div>
                                <p className="batch-title">
                                  Batch {batch.index}
                                </p>
                                <p className="batch-matchups">
                                  {batch.matches.map((match, index) => (
                                    <span key={match.key}>
                                      {index > 0 ? (
                                        <span className="batch-with"> with </span>
                                      ) : null}
                                      {matchupLabel(match)}
                                    </span>
                                  ))}
                                </p>
                                <span className="schedule-batch-print">
                                  {when || "Date & time not set"}
                                </span>
                              </div>

                              <div className="batch-when">
                                <input
                                  type="date"
                                  className="bracket-schedule-input"
                                  value={batchSchedule.date ?? ""}
                                  aria-label={`Date for batch ${batch.index} of ${round.label}`}
                                  onChange={(event) =>
                                    handleBatchChange(
                                      matchKeys,
                                      "date",
                                      event.target.value,
                                    )
                                  }
                                />
                                <input
                                  type="time"
                                  className="bracket-schedule-input"
                                  value={batchSchedule.time ?? ""}
                                  aria-label={`Time for batch ${batch.index} of ${round.label}`}
                                  onChange={(event) =>
                                    handleBatchChange(
                                      matchKeys,
                                      "time",
                                      event.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="schedule-matches">
                              {batch.matches.map((match) => {
                                const matchKey = match.key;
                                const teamAId =
                                  resolved.boardSlots[`${matchKey}-0`];
                                const teamBId =
                                  resolved.boardSlots[`${matchKey}-1`];
                                const teamA =
                                  teamAId === undefined
                                    ? null
                                    : teamsById.get(Number(teamAId)) ?? null;
                                const teamB =
                                  teamBId === undefined
                                    ? null
                                    : teamsById.get(Number(teamBId)) ?? null;
                                const result = resultForMatch(matchKey);
                                const draft = drafts[matchKey] ?? emptyDraft();
                                const canScore = Boolean(teamA && teamB);
                                const isBusy = busyKey === matchKey;
                                const canSave =
                                  canScore && !isBusy && draftIsValid(draft);
                                const ceiling = scoreCeiling(draft.bestOf);
                                const validScores =
                                  Number(draft.bestOf) === 1
                                    ? "1-0 or 0-1"
                                    : "2-0, 0-2, 2-1 or 1-2";
                                const matchIds = matchIdsFor(draft);
                                const savedMatchIds = Array.isArray(
                                  result?.matchIds,
                                )
                                  ? result.matchIds
                                      .slice(0, matchIds.length)
                                      .filter(Boolean)
                                  : [];

                                return (
                                  <div
                                    className={`schedule-match ${
                                      result ? "has-result" : ""
                                    } ${
                                      activeMatchKey === matchKey
                                        ? "is-targeted"
                                        : ""
                                    }`}
                                    key={matchKey}
                                    data-match-key={matchKey}
                                  >
                                    <div className="schedule-team is-left">
                                      <span className="schedule-team-name">
                                        {teamA
                                          ? displayName(
                                              teamA.teamName ?? teamA.name,
                                            )
                                          : "Awaiting winner"}
                                      </span>
                                      {result ? (
                                        <span className="schedule-team-score">
                                          {Number(result.scoreA)}
                                        </span>
                                      ) : null}
                                    </div>

                                    <div className="schedule-score">
                                      <div className="score-controls">
                                        <select
                                          className="bo-select"
                                          value={draft.bestOf}
                                          aria-label={`Best of for ${matchupLabel(match)}`}
                                          onChange={(event) =>
                                            handleBestOfChange(
                                              matchKey,
                                              event.target.value,
                                            )
                                          }
                                        >
                                          <option value={1}>Best of 1</option>
                                          <option value={3}>Best of 3</option>
                                        </select>

                                        <input
                                          type="number"
                                          className="score-input"
                                          min="0"
                                          max={ceiling}
                                          step="1"
                                          inputMode="numeric"
                                          value={draft.scoreA}
                                          disabled={!canScore || isBusy}
                                          aria-label={`Score for ${displayName(teamA?.teamName ?? teamA?.name) || "team A"}`}
                                          onChange={(event) =>
                                            handleScoreInput(
                                              matchKey,
                                              "scoreA",
                                              event.target.value,
                                            )
                                          }
                                        />
                                        <span className="score-separator">-</span>
                                        <input
                                          type="number"
                                          className="score-input"
                                          min="0"
                                          max={ceiling}
                                          step="1"
                                          inputMode="numeric"
                                          value={draft.scoreB}
                                          disabled={!canScore || isBusy}
                                          aria-label={`Score for ${displayName(teamB?.teamName ?? teamB?.name) || "team B"}`}
                                          onChange={(event) =>
                                            handleScoreInput(
                                              matchKey,
                                              "scoreB",
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </div>

                                      <span className="score-hint">
                                        Valid: {validScores}
                                      </span>

                                      <div className="match-id-grid">
                                        {matchIds.map((id, index) => (
                                          <label
                                            className="match-id-field"
                                            key={index}
                                          >
                                            <span>Match ID {index + 1}</span>
                                            <input
                                              type="text"
                                              className="match-id-input"
                                              value={id}
                                              inputMode="numeric"
                                              maxLength={20}
                                              placeholder="Dota ID"
                                              disabled={!canScore || isBusy}
                                              aria-label={`Match ID ${index + 1} for ${matchupLabel(match)}`}
                                              onChange={(event) =>
                                                updateMatchId(
                                                  matchKey,
                                                  index,
                                                  event.target.value,
                                                )
                                              }
                                            />
                                          </label>
                                        ))}
                                      </div>

                                      <div className="score-actions">
                                        <button
                                          type="button"
                                          className="schedule-save"
                                          disabled={!canSave}
                                          title={
                                            canSave
                                              ? "Save this score"
                                              : `Enter one of ${validScores}`
                                          }
                                          onClick={() =>
                                            handleSaveScore(matchKey)
                                          }
                                        >
                                          {isBusy ? "Saving…" : "Save score"}
                                        </button>
                                        {result ? (
                                          <button
                                            type="button"
                                            className="schedule-clear"
                                            disabled={isBusy}
                                            onClick={() =>
                                              handleClearScore(matchKey)
                                            }
                                          >
                                            Clear
                                          </button>
                                        ) : null}
                                      </div>
                                    </div>

                                    <div className="schedule-team is-right">
                                      {result ? (
                                        <span className="schedule-team-score">
                                          {Number(result.scoreB)}
                                        </span>
                                      ) : null}
                                      <span className="schedule-team-name">
                                        {teamB
                                          ? displayName(
                                              teamB.teamName ?? teamB.name,
                                            )
                                          : "Awaiting winner"}
                                      </span>
                                    </div>

                                    <p
                                      className={
                                        result
                                          ? "schedule-result-note is-saved"
                                          : "schedule-result-note"
                                      }
                                    >
                                      {result
                                        ? `Best of ${Number(result.bestOf)} · ${Number(result.scoreA)}-${Number(result.scoreB)}${
                                            savedMatchIds.length
                                              ? ` · Match IDs: ${savedMatchIds.join(", ")}`
                                              : ""
                                          }${
                                            savedKey === matchKey
                                              ? " · saved"
                                              : ""
                                          }`
                                        : "Results Upcoming"}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

export default SchedulePanel;
