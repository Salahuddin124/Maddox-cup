// Swiss stage scheduling. Every team plays every round and is paired against
// opponents with the same record. Pairings for later rounds are derived from
// the winners chosen so far, so the blueprint is rebuilt as results come in.

const toIds = (order = []) =>
  [...new Set(order.map(Number).filter(Number.isFinite))];

const pairKey = (a, b) =>
  [Number(a), Number(b)].sort((x, y) => x - y).join("-");

const recordKey = (record) => `${record.wins}-${record.losses}`;

// Pair a single score group, avoiding rematches where possible. An odd group
// passes its lowest seed down to the next group so everyone still plays.
function pairGroup(group, played, seedOrder, matches, roundIndex, carry) {
  let pool = carry === null ? [...group] : [carry, ...group];
  pool.sort((a, b) => (seedOrder.get(a) ?? 0) - (seedOrder.get(b) ?? 0));

  const dropped = pool.length % 2 === 1 ? pool.pop() : null;

  const used = new Set();
  for (let index = 0; index < pool.length; index += 1) {
    if (used.has(index)) continue;
    const left = pool[index];
    used.add(index);

    let partner = -1;
    for (let next = index + 1; next < pool.length; next += 1) {
      if (!used.has(next) && !played.has(pairKey(left, pool[next]))) {
        partner = next;
        break;
      }
    }

    // Everyone left has already met — fall back so the round still fills.
    if (partner === -1) {
      for (let next = index + 1; next < pool.length; next += 1) {
        if (!used.has(next)) {
          partner = next;
          break;
        }
      }
    }
    if (partner === -1) continue;

    const right = pool[partner];
    used.add(partner);
    played.add(pairKey(left, right));

    matches.push({
      key: `sw-${roundIndex}-${matches.length}`,
      sources: [
        { kind: "team", id: left },
        { kind: "team", id: right },
      ],
    });
  }

  return dropped;
}

export function buildSwiss(order = [], winners = {}) {
  const ids = toIds(order);
  const total = ids.length;
  const roundCount = total > 1 ? Math.max(1, Math.ceil(Math.log2(total))) : 0;

  const seedOrder = new Map(ids.map((id, index) => [id, index]));
  const records = new Map(
    ids.map((id) => [id, { wins: 0, losses: 0 }]),
  );
  const played = new Set();
  const rounds = [];

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    const groups = new Map();
    for (const id of ids) {
      const key = recordKey(records.get(id));
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(id);
    }

    const orderedGroups = [...groups.entries()].sort(([a], [b]) => {
      const [aWins, aLosses] = a.split("-").map(Number);
      const [bWins, bLosses] = b.split("-").map(Number);
      if (bWins !== aWins) return bWins - aWins;
      return aLosses - bLosses;
    });

    const matches = [];
    let carry = null;
    for (const [, group] of orderedGroups) {
      carry = pairGroup(group, played, seedOrder, matches, roundIndex, carry);
    }

    rounds.push({
      key: `sw-${roundIndex}`,
      label: `Round ${roundIndex + 1}`,
      matches,
      // Pairings change every round, so unrelated matches get no wires.
      connect: "none",
    });

    // Apply this round's picks before grouping the next one.
    for (const match of matches) {
      const left = Number(match.sources[0].id);
      const right = Number(match.sources[1].id);
      const picked = winners[match.key];
      if (picked === undefined) continue;

      const winner = Number(picked);
      if (winner !== left && winner !== right) continue;
      const loser = winner === left ? right : left;
      records.get(winner).wins += 1;
      records.get(loser).losses += 1;
    }
  }

  return {
    sections: [{ key: "swiss", label: "Swiss stage", rounds }],
    finalKey: null,
    order: ids,
  };
}

// Changing a result can change every later pairing, so all following rounds
// are invalidated rather than just the matches a fixed bracket would feed.
export function getSwissDownstream(blueprint, matchKey) {
  const roundIndex = Number(String(matchKey).split("-")[1]);
  if (!Number.isFinite(roundIndex)) return [];

  return blueprint.sections
    .flatMap((section) => section.rounds)
    .filter((round) => Number(round.key.split("-")[1]) > roundIndex)
    .flatMap((round) => round.matches.map((match) => match.key));
}

export function resolveSwiss(blueprint, winners = {}) {
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

  const met = (a, b) =>
    a.results.some((result) => result.id === b.teamId && result.won);

  const standings = [...stats.values()]
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      if (met(a, b)) return -1;
      if (met(b, a)) return 1;
      return a.order - b.order;
    })
    .map(({ results, ...row }) => {
      const playedMatches = row.wins + row.losses;
      return {
        ...row,
        played: playedMatches,
        winRate:
          playedMatches === 0
            ? 0
            : Math.round((row.wins / playedMatches) * 100),
      };
    });

  const complete = matches.every((match) => accepted.has(match.key));

  return {
    boardSlots,
    eliminated: new Set(),
    matchCount: matches.length,
    standings,
    championId: complete && standings.length > 0 ? standings[0].teamId : undefined,
    complete,
  };
}
