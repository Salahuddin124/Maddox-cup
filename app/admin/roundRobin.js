// Round robin scheduling. Every team is paired with every other team exactly
// once using the circle method. An odd team count gets one bye per round.

const toIds = (order = []) =>
  [...new Set(order.map(Number).filter(Number.isFinite))];

export function buildRoundRobin(order = []) {
  const ids = toIds(order);
  const padded = ids.length % 2 === 0 ? ids : [...ids, null];
  const total = padded.length;
  const rounds = [];

  if (total >= 2) {
    let rotating = padded.slice(1);

    for (let roundIndex = 0; roundIndex < total - 1; roundIndex += 1) {
      const arrangement = [padded[0], ...rotating];
      const matches = [];

      for (let side = 0; side < total / 2; side += 1) {
        const left = arrangement[side];
        const right = arrangement[total - 1 - side];
        if (left === null || right === null) continue;

        // Alternate the home/away order so no team is always listed first.
        const pair = roundIndex % 2 === 0 ? [left, right] : [right, left];
        matches.push({
          key: `rr-${roundIndex}-${side}`,
          sources: pair.map((id) => ({ kind: "team", id })),
        });
      }

      rounds.push({
        key: `rr-${roundIndex}`,
        label: `Round ${roundIndex + 1}`,
        matches,
        // Unrelated matches must not be joined by bracket connector lines.
        connect: "none",
      });

      rotating = [...rotating.slice(1), rotating[0]];
    }
  }

  return {
    sections: [{ key: "round-robin", label: "Round robin", rounds }],
    finalKey: null,
    order: ids,
  };
}

export function resolveRoundRobin(blueprint, winners = {}) {
  const matches = blueprint.sections.flatMap((section) =>
    section.rounds.flatMap((round) => round.matches),
  );
  const order = new Map(
    (blueprint.order ?? []).map((id, index) => [Number(id), index]),
  );
  const stats = new Map();
  const boardSlots = {};
  const accepted = new Set();

  const ensure = (value) => {
    const teamId = Number(value);
    if (!stats.has(teamId)) {
      stats.set(teamId, {
        teamId,
        order: order.get(teamId) ?? stats.size,
        wins: 0,
        losses: 0,
        results: [],
      });
    }
    return stats.get(teamId);
  };

  matches.forEach((match) => {
    const left = Number(match.sources[0].id);
    const right = Number(match.sources[1].id);
    boardSlots[`${match.key}-0`] = left;
    boardSlots[`${match.key}-1`] = right;

    ensure(left);
    ensure(right);
    const picked = winners[match.key];

    if (picked === undefined) return;

    const winner = Number(picked);
    if (winner !== left && winner !== right) return;

    const loser = winner === left ? right : left;
    const winnerStat = ensure(winner);
    const loserStat = ensure(loser);

    winnerStat.wins += 1;
    loserStat.losses += 1;
    winnerStat.results.push({ id: loser, won: true });
    loserStat.results.push({ id: winner, won: false });
    accepted.add(match.key);
  });

  const headToHead = (a, b) =>
    a.results.some((result) => result.id === b.teamId && result.won) ? 1 : 0;

  const ranked = [...stats.values()].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;

    const direct = headToHead(b, a) - headToHead(a, b);
    if (direct !== 0) return direct;

    return a.order - b.order;
  });

  const standings = ranked.map(({ results, ...row }) => {
    const played = row.wins + row.losses;
    return {
      ...row,
      played,
      winRate: played === 0 ? 0 : Math.round((row.wins / played) * 100),
    };
  });

  const complete = matches.every((match) => accepted.has(match.key));
  const championId = complete && standings.length > 0
    ? standings[0].teamId
    : undefined;

  return {
    boardSlots,
    eliminated: new Set(),
    matchCount: matches.length,
    standings,
    championId,
    complete,
  };
}
