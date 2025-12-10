// A simple, zero-dependency fuzzy search implementation

export function fuzzySearch<T extends { title: string; category: string; description?: string }>(
  query: string,
  items: T[],
  threshold = 0.4 // 0.0 is perfect match, 1.0 is no match
): T[] {
  if (!query) return items;
  
  const lowerQuery = query.toLowerCase();

  // 1. Exact or Partial Match (Fastest)
  const exactMatches = items.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) || 
    item.category.toLowerCase().includes(lowerQuery)
  );

  if (exactMatches.length > 0) return exactMatches;

  // 2. Fuzzy Match (Levenshtein Distance) - If no exact match found
  return items.filter(item => {
    const titleScore = getLevenshteinDistance(lowerQuery, item.title.toLowerCase());
    const relativeScore = titleScore / Math.max(item.title.length, lowerQuery.length);
    return relativeScore < threshold;
  }).sort((a, b) => {
    // Sort by closest match
    const distA = getLevenshteinDistance(lowerQuery, a.title.toLowerCase());
    const distB = getLevenshteinDistance(lowerQuery, b.title.toLowerCase());
    return distA - distB;
  });
}

// Algorithm to count how many edits (typos) needed to change A to B
function getLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
