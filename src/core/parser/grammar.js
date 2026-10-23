// @ts-check

/**
 * @typedef {Object} HeaderGrammar
 * @property {string} id
 * @property {'android' | 'ios'} family
 * @property {RegExp} regex Strict line-start regex
 * @property {boolean} hasSeconds
 * @property {boolean} is12Hour
 * @property {'/' | '.' | '-'} dateSeparator
 */

/**
 * @typedef {Object} ParsedHeaderMatch
 * @property {HeaderGrammar} grammar
 * @property {string} rawHeader
 * @property {string} datePart
 * @property {string} timePart
 * @property {string} body
 */

/**
 * Standard candidate header grammars covering Android and iOS variations worldwide.
 * Every grammar strictly requires a mandatory delimiter (' - ' or '] ') so that
 * wrapped message text (e.g., '12/5, 10:30 meeting') is never misidentified as a header.
 *
 * @type {HeaderGrammar[]}
 */
export const CANDIDATE_GRAMMARS = [
  // 1. Android standard slash 24h: "15/01/24, 14:30 - " or "15/1/2024, 14:30 – "
  {
    id: 'android-slash-24h',
    family: 'android',
    regex: /^(\d{1,4}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+[-–—]\s+(.*)$/,
    hasSeconds: false,
    is12Hour: false,
    dateSeparator: '/',
  },
  // 2. Android slash 12h with AM/PM: "1/15/24, 2:30 PM - " or "1/15/24, 2:30:15 p. m. - "
  {
    id: 'android-slash-12h',
    family: 'android',
    regex:
      /^(\d{1,4}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?\s*m\.?|[AP]\.?\s*M\.?))\s+[-–—]\s+(.*)$/i,
    hasSeconds: false,
    is12Hour: true,
    dateSeparator: '/',
  },
  // 3. Android dot-separated 24h (German/Russian/Nordic): "15.01.24, 14:30 - "
  {
    id: 'android-dot-24h',
    family: 'android',
    regex: /^(\d{1,4}\.\d{1,2}\.\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+[-–—]\s+(.*)$/,
    hasSeconds: false,
    is12Hour: false,
    dateSeparator: '.',
  },
  // 4. Android dot-separated 12h: "15.01.24, 2:30 PM - "
  {
    id: 'android-dot-12h',
    family: 'android',
    regex:
      /^(\d{1,4}\.\d{1,2}\.\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?\s*m\.?|[AP]\.?\s*M\.?))\s+[-–—]\s+(.*)$/i,
    hasSeconds: false,
    is12Hour: true,
    dateSeparator: '.',
  },
  // 5. Android hyphen-separated 24h: "2024-01-15, 14:30 - " or "15-01-2024, 14:30 - "
  {
    id: 'android-dash-24h',
    family: 'android',
    regex: /^(\d{1,4}-\d{1,2}-\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+[-–—]\s+(.*)$/,
    hasSeconds: false,
    is12Hour: false,
    dateSeparator: '-',
  },
  // 6. iOS bracketed slash 24h with seconds: "[15/01/24, 14:30:15] " or "[15/01/2024, 14:30:15] "
  {
    id: 'ios-bracket-slash-24h-sec',
    family: 'ios',
    regex: /^\[(\d{1,4}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}:\d{2})\]\s+(.*)$/,
    hasSeconds: true,
    is12Hour: false,
    dateSeparator: '/',
  },
  // 7. iOS bracketed slash 12h with seconds: "[1/15/24, 2:30:15 PM] " or "[1/15/24, 2:30:15 p. m.] "
  {
    id: 'ios-bracket-slash-12h-sec',
    family: 'ios',
    regex:
      /^\[(\d{1,4}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}:\d{2}\s*(?:[ap]\.?\s*m\.?|[AP]\.?\s*M\.?))\]\s+(.*)$/i,
    hasSeconds: true,
    is12Hour: true,
    dateSeparator: '/',
  },
  // 8. iOS bracketed slash 24h without seconds: "[15/01/24, 14:30] "
  {
    id: 'ios-bracket-slash-24h',
    family: 'ios',
    regex: /^\[(\d{1,4}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2})\]\s+(.*)$/,
    hasSeconds: false,
    is12Hour: false,
    dateSeparator: '/',
  },
  // 9. iOS bracketed dot 24h: "[15.01.24, 14:30:15] "
  {
    id: 'ios-bracket-dot-24h',
    family: 'ios',
    regex: /^\[(\d{1,4}\.\d{1,2}\.\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\]\s+(.*)$/,
    hasSeconds: false,
    is12Hour: false,
    dateSeparator: '.',
  },
  // 10. iOS bracketed dot 12h: "[15.01.24, 2:30:15 PM] "
  {
    id: 'ios-bracket-dot-12h',
    family: 'ios',
    regex:
      /^\[(\d{1,4}\.\d{1,2}\.\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?\s*m\.?|[AP]\.?\s*M\.?))\]\s+(.*)$/i,
    hasSeconds: false,
    is12Hour: true,
    dateSeparator: '.',
  },
  // 11. Universal Lenient Bracketed: "[date, time] "
  {
    id: 'universal-bracketed',
    family: 'ios',
    regex:
      /^\[(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:[ap]\.?\s*m\.?|[AP]\.?\s*M\.?))?)\]\s+(.*)$/i,
    hasSeconds: false,
    is12Hour: false,
    dateSeparator: '/',
  },
  // 12. Universal Lenient Delimited: "date, time - " or "date time - "
  {
    id: 'universal-dash',
    family: 'android',
    regex:
      /^(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:[ap]\.?\s*m\.?|[AP]\.?\s*M\.?))?)\s*[-–—:]\s+(.*)$/i,
    hasSeconds: false,
    is12Hour: false,
    dateSeparator: '/',
  },
];

/**
 * Inspects the initial sample lines of a chat export (e.g. first 200 non-empty lines)
 * and selects the candidate grammar that achieves the highest match score.
 *
 * @param {string[]} sampleLines
 * @returns {HeaderGrammar}
 */
export function detectGrammar(sampleLines) {
  const nonBlank = sampleLines
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 200);
  if (nonBlank.length === 0) {
    return CANDIDATE_GRAMMARS[0]; // fallback default
  }

  /** @type {Map<string, number>} */
  const scores = new Map();
  for (const grammar of CANDIDATE_GRAMMARS) {
    scores.set(grammar.id, 0);
  }

  for (const line of nonBlank) {
    for (const grammar of CANDIDATE_GRAMMARS) {
      if (grammar.regex.test(line)) {
        scores.set(grammar.id, (scores.get(grammar.id) || 0) + 1);
      }
    }
  }

  let bestGrammar = CANDIDATE_GRAMMARS[0];
  let highestScore = -1;

  for (const grammar of CANDIDATE_GRAMMARS) {
    const score = scores.get(grammar.id) || 0;
    if (score > highestScore) {
      highestScore = score;
      bestGrammar = grammar;
    }
  }

  return bestGrammar;
}

/**
 * Attempts to match a single line against a chosen grammar.
 *
 * @param {string} line
 * @param {HeaderGrammar} grammar
 * @returns {ParsedHeaderMatch | null}
 */
export function matchHeader(line, grammar) {
  const match = line.match(grammar.regex);
  if (!match) return null;

  return {
    grammar,
    rawHeader: line.slice(0, line.length - match[3].length),
    datePart: match[1].trim(),
    timePart: match[2].trim(),
    body: match[3],
  };
}
