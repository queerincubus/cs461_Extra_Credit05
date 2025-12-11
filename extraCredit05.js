// Enumerate DFAs over alphabet {a,b} and validate them.
// Prints first 20 enumerated DFAs, then prints examples of valid and invalid DFAs.

// -----------------------------------------------------------------------------
// ENUMERATOR
// -----------------------------------------------------------------------------
function* enumerateDFAs(alphabet = ['a', 'b']) {
  let n = 1;
  while (true) {
    const symCount = alphabet.length;
    const digitsLen = n * symCount;

    const digits = Array(digitsLen).fill(0);

    const incrementDigits = () => {
      for (let i = 0; i < digitsLen; i++) {
        digits[i]++;
        if (digits[i] < n) return true;
        digits[i] = 0;
      }
      return false;
    };

    let moreTransitions = true;
    while (moreTransitions) {
      const transitions = {};

      for (let s = 0; s < n; s++) {
        const row = {};
        for (let k = 0; k < symCount; k++) {
          const idx = s * symCount + k;
          row[alphabet[k]] = digits[idx];
        }
        transitions[s] = row;
      }

      const finalCount = 1 << n;
      for (let mask = 0; mask < finalCount; mask++) {
        const finals = [];
        for (let s = 0; s < n; s++)
          if (mask & (1 << s)) finals.push(s);

        yield {
          states: Array.from({ length: n }, (_, i) => i),
          alphabet,
          start: 0,
          finals,
          transitions
        };
      }

      moreTransitions = incrementDigits();
    }

    n++;
  }
}

// -----------------------------------------------------------------------------
// PRINT FIRST 20 ENUMERATED DFAs
// -----------------------------------------------------------------------------
(function demoEnumeration() {
  console.log("=== FIRST 20 ENUMERATED DFAs ===");

  let count = 0;
  for (const dfa of enumerateDFAs(['a', 'b'])) {
    count++;
    console.log(`----- DFA #${count} -----`);
    console.log(JSON.stringify(dfa, null, 2));
    if (count >= 20) break;
  }
})();

// -----------------------------------------------------------------------------
// VALIDATION FUNCTION
// -----------------------------------------------------------------------------
function validateDFA(dfa) {
  const { states, alphabet, start, finals, transitions } = dfa;

  const stateSet = new Set(states);

  // 1. Check start state
  if (!stateSet.has(start)) return 0;

  // 2. Check finals
  for (const f of finals) {
    if (!stateSet.has(f)) return 0;
  }

  // 3. Check transitions
  for (const s of states) {
    if (!(s in transitions)) return 0;

    for (const symbol of alphabet) {
      if (!(symbol in transitions[s])) return 0;

      const target = transitions[s][symbol];
      if (!stateSet.has(target)) return 0;
    }
  }

  return 1; // PASSED ALL CHECKS
}

// -----------------------------------------------------------------------------
// VALID & INVALID EXAMPLES
// -----------------------------------------------------------------------------
console.log("\n=== VALIDATION EXAMPLES ===");

// VALID DFA example
const validDFA = {
  states: [0, 1],
  alphabet: ['a', 'b'],
  start: 0,
  finals: [1],
  transitions: {
    0: { a: 1, b: 0 },
    1: { a: 1, b: 0 }
  }
};

// INVALID DFA example
const invalidDFA = {
  states: [0, 1],
  alphabet: ['a', 'b'],
  start: 0,
  finals: [1],
  transitions: {
    0: { a: 1, b: 0 },
    1: { b: 0 }  // ERROR: missing 'a'
  }
};

console.log("Valid DFA example validation:", validDFA);
console.log("Valid DFA example validation:", validateDFA(validDFA));
console.log("Invalid DFA example validation:", invalidDFA);
console.log("Invalid DFA example validation:", validateDFA(invalidDFA));

// ============================================================================
// --------------- DFA → TM DECIDER (TM-D)  -----------------------------------
// ============================================================================

function convertDFAtoTM(dfa) {
  return {
    states: dfa.states,
    start: dfa.start,
    finals: dfa.finals,
    dfaTransitions: dfa.transitions,
    blank: "_"
  };
}

// ============================================================================
// --------------------- TM-D SIMULATOR ---------------------------------------
// ============================================================================

function simulateTM(tm, input) {
  const tape = input.split("");
  let head = 0;
  let state = tm.start;

  const configs = [];

  const logConfig = (action = "") => {
    const tapeStr = tape.join("");
    const headMarker = " ".repeat(head) + "^";
    configs.push(`State=${state} | Tape="${tapeStr}"\n${headMarker}  ${action}`);
  };

  logConfig("Start");

  while (true) {
    const symbol = tape[head] ?? tm.blank;

    // End of input
    if (symbol === tm.blank) {
      const decision = tm.finals.includes(state) ? "ACCEPT" : "REJECT";
      logConfig(`→ ${decision}`);
      return { decision, configs };
    }

    // DFA transition
    const nextState = tm.dfaTransitions[state][symbol];

    logConfig(`Read '${symbol}', go to state ${nextState}`);

    state = nextState;

    // Move right
    head++;
  }
}

// ============================================================================
// ------------ RUN TM-D ON A SPECIFIC DFA AND INPUT STRING -------------------
// ============================================================================

console.log("\n=== TM-D SIMULATION EXAMPLE ===");

const TM = convertDFAtoTM(validDFA);
const input = "abba";

const result = simulateTM(TM, input);

console.log(`Decision on "${input}":`, result.decision);
console.log("\n--- Tape Configurations ---");
console.log(result.configs.join("\n\n"));

// -----------------------------------------------------------------------------
// Determine if a DFA recognizes the empty language
// -----------------------------------------------------------------------------
// A DFA recognizes ∅ iff NO accepting state is reachable from the start state.
// We simply BFS the transition graph from the start state.

function dfaRecognizesEmpty(dfa) {
  const { start, finals, transitions, alphabet } = dfa;

  const queue = [start];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const state = queue.shift();

    // If we ever reach a final state → language is nonempty
    if (finals.includes(state)) {
      return false; // NOT empty language
    }

    // Explore all transitions
    for (const sym of alphabet) {
      const nxt = transitions[state][sym];
      if (!visited.has(nxt)) {
        visited.add(nxt);
        queue.push(nxt);
      }
    }
  }

  // No reachable final state found → language is empty
  return true;
}

// -----------------------------------------------------------------------------
// Determine if a DFA recognizes the empty language
// -----------------------------------------------------------------------------
// A DFA recognizes ∅ iff NO accepting state is reachable from the start state.
// We simply BFS the transition graph from the start state.

function dfaRecognizesEmpty(dfa) {
  const { start, finals, transitions, alphabet } = dfa;

  const queue = [start];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const state = queue.shift();

    // If we ever reach a final state → language is nonempty
    if (finals.includes(state)) {
      return false; // NOT empty language
    }

    // Explore all transitions
    for (const sym of alphabet) {
      const nxt = transitions[state][sym];
      if (!visited.has(nxt)) {
        visited.add(nxt);
        queue.push(nxt);
      }
    }
  }

  // No reachable final state found → language is empty
  return true;
}

console.log("=== EMPTY DFA EXAMPLE ===")
const emptyDFA = {
  states: [0, 1],
  alphabet: ['a', 'b'],
  start: 0,
  finals: [],   // no accepting states
  transitions: {
    0: { a: 1, b: 1 },
    1: { a: 1, b: 1 }
  }
};

console.log(emptyDFA);
console.log(dfaRecognizesEmpty(emptyDFA));   // true


const nonEmptyDFA = {
  states: [0, 1],
  alphabet: ['a', 'b'],
  start: 0,
  finals: [1],   // reachable
  transitions: {
    0: { a: 1, b: 0 },
    1: { a: 1, b: 1 }
  }
};

console.log("=== NON-EMPTY DFA EXAMPLE ===");
console.log(nonEmptyDFA);
console.log(dfaRecognizesEmpty(nonEmptyDFA));   // false