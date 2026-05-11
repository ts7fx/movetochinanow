/**
 * Output helper for --json support and --filter parsing.
 */

export function createOutput() {
  const jsonMode = process.argv.includes('--json');
  const data = {};

  return {
    data,
    json: jsonMode,
    log: jsonMode ? () => {} : (...args) => console.log(...args),
    write: jsonMode ? () => true : (...args) => process.stdout.write(...args),
    error: (...args) => console.error(...args),
    finish() {
      if (jsonMode) console.log(JSON.stringify(data, null, 2));
    },
  };
}

/**
 * Parse --filter CLI args into GSC dimensionFilterGroups.
 *
 * Format: --filter dimension=expression
 *         --filter dimension:operator=expression
 *
 * Operators: contains (default), equals, notContains, notEquals,
 *            includingRegex, excludingRegex
 */
export function parseFilters() {
  const filters = [];
  const args = process.argv;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--filter' && args[i + 1]) {
      const raw = args[i + 1];
      let dimension, operator, expression;

      if (raw.includes(':')) {
        const [dimOp, ...exprParts] = raw.split('=');
        const [dim, op] = dimOp.split(':');
        dimension = dim;
        operator = op;
        expression = exprParts.join('=');
      } else {
        const [dim, ...exprParts] = raw.split('=');
        dimension = dim;
        operator = 'contains';
        expression = exprParts.join('=');
      }

      if (dimension && expression) {
        filters.push({ dimension, operator, expression });
      }
      i++;
    }
  }

  if (filters.length === 0) return undefined;

  return [{
    groupType: 'and',
    filters,
  }];
}
