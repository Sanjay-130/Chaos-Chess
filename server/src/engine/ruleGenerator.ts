import { MoveStyle, RuleMapping } from '@chaos-chess/shared';

const STYLES: MoveStyle[] = ['queen', 'rook', 'bishop', 'knight'];

/**
 * Fisher-Yates shuffle to generate one of the 24 valid permutations randomly.
 * Returns a RuleMapping where each piece type maps to a unique MoveStyle.
 */
export function generateRuleMapping(): RuleMapping {
  const shuffled = [...STYLES];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    queen: shuffled[0],
    rook: shuffled[1],
    bishop: shuffled[2],
    knight: shuffled[3],
  };
}

/** Returns all 24 valid permutations (useful for testing) */
export function getAllPermutations(): RuleMapping[] {
  const results: RuleMapping[] = [];

  function permute(arr: MoveStyle[], current: MoveStyle[]): void {
    if (arr.length === 0) {
      results.push({
        queen: current[0],
        rook: current[1],
        bishop: current[2],
        knight: current[3],
      });
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      permute(rest, [...current, arr[i]]);
    }
  }

  permute([...STYLES], []);
  return results;
}

/** Format a rule mapping as human-readable strings for display */
export function formatRuleMapping(mapping: RuleMapping): Array<{ piece: string; movesLike: string }> {
  return [
    { piece: 'Queen', movesLike: capitalize(mapping.queen) },
    { piece: 'Rook', movesLike: capitalize(mapping.rook) },
    { piece: 'Bishop', movesLike: capitalize(mapping.bishop) },
    { piece: 'Knight', movesLike: capitalize(mapping.knight) },
  ];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
