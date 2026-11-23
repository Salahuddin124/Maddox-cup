import { configureStore, createSelector, createSlice } from "@reduxjs/toolkit";

export const SCHEME_CACHE_KEY = "maddoxx-scheme-cache";

const FORMATS = ["single", "double", "round-robin", "swiss"];

const emptySeed = { signature: "", slots: {} };
const emptyScheme = () => ({ slots: {}, winners: {} });
const emptyFormats = () => ({
  single: emptyScheme(),
  double: emptyScheme(),
  "round-robin": emptyScheme(),
  swiss: emptyScheme(),
});

const initialState = {
  // Active selector only. Switching formats must never touch another scheme.
  format: "single",
  // Each format owns its opening order and results, so all three brackets can
  // be progressed independently and restored from the frontend cache.
  formats: emptyFormats(),
  // Shared, locked starting positions used to seed every scheme.
  seed: emptySeed,
};

const isSeedSlot = (key) => typeof key === "string" && key.startsWith("u-0-");
const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const normalizeFormat = (value) => FORMATS.includes(value) ? value : "single";
const cleanSlots = (value) => (isRecord(value) ? { ...value } : {});
const cleanWinners = (value) => (isRecord(value) ? { ...value } : {});

const cleanScheme = (value) => ({
  slots: cleanSlots(value?.slots),
  winners: cleanWinners(value?.winners),
});

// A format that has never been opened has no slots yet. Fill it from the shared
// seed so its opening round is never blank.
const seedEmptySlots = (formats, seedSlots) => {
  if (Object.keys(seedSlots).length === 0) return formats;

  for (const key of FORMATS) {
    if (Object.keys(formats[key].slots).length === 0) {
      formats[key].slots = { ...seedSlots };
    }
  }
  return formats;
};

const activeScheme = (state) => {
  const format = normalizeFormat(state.format);
  if (!state.formats[format]) state.formats[format] = emptyScheme();
  return state.formats[format];
};

const schemeSlice = createSlice({
  name: "scheme",
  initialState,
  reducers: {
    hydrate(_state, action) {
      const raw = action.payload;
      // Older caches stored the whole root state, newer ones store the slice.
      const cached = raw?.scheme ?? raw;
      if (!isRecord(cached)) return initialState;

      const format = normalizeFormat(cached.format);
      const seed = isRecord(cached.seed)
        ? {
            signature:
              typeof cached.seed.signature === "string"
                ? cached.seed.signature
                : "",
            slots: cleanSlots(cached.seed.slots),
          }
        : { ...emptySeed };

      const formats = emptyFormats();
      if (isRecord(cached.formats)) {
        for (const key of FORMATS) formats[key] = cleanScheme(cached.formats[key]);
      } else {
        // Legacy single-scheme cache: its results belong to the format that
        // was active when it was written.
        formats[format] = cleanScheme(cached);
      }

      return { format, formats: seedEmptySlots(formats, seed.slots), seed };
    },
    setFormat(state, action) {
      const next = normalizeFormat(action.payload);
      if (state.format === next) return;
      state.format = next;

      const scheme = activeScheme(state);
      if (Object.keys(scheme.slots).length === 0) {
        scheme.slots = { ...state.seed.slots };
      }
    },
    setSeed(state, action) {
      const { signature = "", slots = {} } = action.payload ?? {};
      state.seed = { signature, slots: cleanSlots(slots) };

      // A roster change invalidates every scheme. Start each one from the new
      // seed so no format renders an empty opening round.
      const formats = emptyFormats();
      for (const key of FORMATS) formats[key].slots = { ...state.seed.slots };
      state.formats = formats;
    },
    moveTeam(state, action) {
      const scheme = activeScheme(state);
      const { from, to } = action.payload;
      // Starting positions are the only movable slots: no team can be removed.
      if (!isSeedSlot(from) || !isSeedSlot(to) || from === to) return;

      const moving = scheme.slots[from];
      if (moving === undefined) return;

      const displaced = scheme.slots[to];
      if (displaced !== undefined) scheme.slots[from] = displaced;
      else delete scheme.slots[from];

      scheme.slots[to] = moving;
      // Reordering changes the matchups, so this scheme's picks are stale.
      scheme.winners = {};
    },
    setWinner(state, action) {
      const scheme = activeScheme(state);
      const { matchKey, teamId, downstream = [] } = action.payload;
      if (!matchKey || teamId === undefined) return;

      if (scheme.winners[matchKey] === teamId) delete scheme.winners[matchKey];
      else scheme.winners[matchKey] = teamId;

      // A changed result invalidates every match fed by it (winner or loser),
      // including transitive results in later sections.
      for (const key of downstream) delete scheme.winners[key];
    },
    resetBracket(state) {
      const scheme = activeScheme(state);
      scheme.slots = { ...state.seed.slots };
      scheme.winners = {};
    },
  },
});

export const {
  hydrate: hydrateScheme,
  setFormat: setFormat,
  setSeed: setSeed,
  moveTeam: moveTeam,
  setWinner: setWinner,
  resetBracket: resetBracket,
} = schemeSlice.actions;

// Flatten the active scheme for the presentational container.
export const selectScheme = createSelector(
  [
    (state) => state.scheme.format,
    (state) => state.scheme.formats,
    (state) => state.scheme.seed,
  ],
  (format, formats, seed) => {
    const active = formats?.[format] ?? emptyScheme();
    return { format, slots: active.slots, winners: active.winners, seed };
  },
);

// One store for the admin session. Initial state is identical on the server
// and on the first client render; the provider applies the cached state after
// mount so hydration stays stable.
export const schemeStore = configureStore({
  reducer: { scheme: schemeSlice.reducer },
});
