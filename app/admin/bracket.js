// Bracket blueprints shared by both formats. A source describes where each
// slot gets its team: the locked seed slot, or the winner/loser of a match.
// Rounds are declared in dependency order so resolution is a single pass.

const seedSource = () => ({ kind: "seed" });
const winnerSource = (match) => ({ kind: "winner", match });
const loserSource = (match) => ({ kind: "loser", match });

export function buildBlueprint(format, upperCount) {
  const upperRounds = [];
  let count = upperCount;
  let round = 0;

  while (count >= 1) {
    upperRounds.push({
      key: `u-${round}`,
      label: count === 1
        ? format === "double" ? "Upper final" : "Final"
        : `Round ${round + 1}`,
      matches: Array.from({ length: count }, (_, match) => ({
        key: `u-${round}-${match}`,
        sources: round === 0
          ? [seedSource(), seedSource()]
          : [
              winnerSource(`u-${round - 1}-${2 * match}`),
              winnerSource(`u-${round - 1}-${2 * match + 1}`),
            ],
      })),
    });
    count /= 2;
    round += 1;
  }

  const sections = [
    {
      key: "upper",
      label: format === "double" ? "Upper bracket" : null,
      rounds: upperRounds,
    },
  ];
  let finalKey = upperRounds[upperRounds.length - 1].matches[0].key;

  if (format === "double" && upperCount >= 2) {
    const lowerRounds = [];
    let lowerIndex = 0;

    const addLowerRound = (matches, label) => {
      lowerRounds.push({ key: `l-${lowerIndex}`, label, matches });
      lowerIndex += 1;
      return matches.map((match) => match.key);
    };

    // First lower round pairs the teams that lost in the opening round.
    let survivors = addLowerRound(
      Array.from({ length: upperCount / 2 }, (_, match) => ({
        key: `l-0-${match}`,
        sources: [
          loserSource(`u-0-${2 * match}`),
          loserSource(`u-0-${2 * match + 1}`),
        ],
      })),
      "Lower round 1",
    );

    // Each later upper round drops its losers into the lower bracket; the
    // survivors then play down until only one team is left to face them.
    for (let upperRound = 1; upperRound < upperRounds.length; upperRound += 1) {
      const dropCount = upperCount / 2 ** upperRound;
      const nextIndex = lowerIndex;
      survivors = addLowerRound(
        Array.from({ length: dropCount }, (_, match) => ({
          key: `l-${nextIndex}-${match}`,
          sources: [
            winnerSource(survivors[match]),
            loserSource(`u-${upperRound}-${match}`),
          ],
        })),
        `Lower round ${lowerIndex + 1}`,
      );

      const target = upperCount / 2 ** (upperRound + 1);
      while (survivors.length > 1 && survivors.length > target) {
        const halfIndex = lowerIndex;
        survivors = addLowerRound(
          Array.from({ length: survivors.length / 2 }, (_, match) => ({
            key: `l-${halfIndex}-${match}`,
            sources: [
              winnerSource(survivors[2 * match]),
              winnerSource(survivors[2 * match + 1]),
            ],
          })),
          `Lower round ${lowerIndex + 1}`,
        );
      }
    }

    lowerRounds[lowerRounds.length - 1].label = "Lower final";
    sections.push({ key: "lower", label: "Lower bracket", rounds: lowerRounds });

    finalKey = "g-0-0";
    sections.push({
      key: "grand",
      label: "Grand final",
      rounds: [
        {
          key: "g-0",
          label: "Championship",
          matches: [
            {
              key: finalKey,
              sources: [
                winnerSource(upperRounds[upperRounds.length - 1].matches[0].key),
                winnerSource(survivors[0]),
              ],
            },
          ],
        },
      ],
    });
  }

  sections.forEach((section) => {
    section.rounds.forEach((round, index) => {
      const next = section.rounds[index + 1];
      if (!next) round.connect = "none";
      else if (next.matches.length === round.matches.length) round.connect = "straight";
      else round.connect = "merge";
    });
  });

  return { sections, finalKey };
}

export function resolveBracket(blueprint, slots, winners) {
  const boardSlots = {};
  const loserFeeds = new Set();
  const allMatches = blueprint.sections.flatMap((section) =>
    section.rounds.flatMap((round) => round.matches),
  );

  allMatches.forEach((match) => {
    match.sources.forEach((source) => {
      if (source.kind === "loser") loserFeeds.add(source.match);
    });
  });

  blueprint.sections.forEach((section) => {
    section.rounds.forEach((round) => {
      round.matches.forEach((match) => {
        match.sources.forEach((source, side) => {
          const slotKey = `${match.key}-${side}`;

          if (source.kind === "seed") {
            if (slots[slotKey] !== undefined) boardSlots[slotKey] = slots[slotKey];
            return;
          }

          if (source.kind === "winner") {
            const advanced = winners[source.match];
            if (advanced !== undefined) boardSlots[slotKey] = advanced;
            return;
          }

          const matchWinner = winners[source.match];
          if (matchWinner === undefined) return;

          for (let slot = 0; slot < 2; slot += 1) {
            const id = boardSlots[`${source.match}-${slot}`];
            if (id !== undefined && Number(id) !== Number(matchWinner)) {
              boardSlots[slotKey] = id;
              break;
            }
          }
        });
      });
    });
  });

  const eliminated = new Set();
  allMatches.forEach((match) => {
    const winner = winners[match.key];
    // Dropping to the lower bracket is not elimination.
    if (winner === undefined || loserFeeds.has(match.key)) return;

    for (let side = 0; side < 2; side += 1) {
      const id = boardSlots[`${match.key}-${side}`];
      if (id !== undefined && Number(id) !== Number(winner)) {
        eliminated.add(Number(id));
      }
    }
  });

  return { boardSlots, eliminated, matchCount: allMatches.length };
}

export function getDownstream(blueprint, matchKey) {
  const dependents = new Map();
  blueprint.sections
    .flatMap((section) => section.rounds.flatMap((round) => round.matches))
    .forEach((match) => {
      match.sources.forEach((source) => {
        if (!source.match) return;
        const list = dependents.get(source.match) ?? [];
        list.push(match.key);
        dependents.set(source.match, list);
      });
    });

  const stale = new Set();
  const queue = [...(dependents.get(matchKey) ?? [])];
  while (queue.length) {
    const key = queue.shift();
    if (stale.has(key)) continue;
    stale.add(key);
    (dependents.get(key) ?? []).forEach((next) => queue.push(next));
  }
  return [...stale];
}
