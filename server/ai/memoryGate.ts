/**
 * Memory relevance gate for WhisperLeaf / assistant context.
 *
 * Long-term memory is only injected when relevance is high enough.
 * Keeps strong continuity within the current conversation; avoids pulling
 * unrelated old topics into fresh conversations.
 */

/** Minimum score (0–1) for a memory to be included. Conservative default. */
export const MEMORY_RELEVANCE_THRESHOLD = 0.65;

export type MemoryResult = {
  content: string;
  /** Semantic similarity or relevance score in [0, 1]. If missing, memory is not injected. */
  score?: number;
};

/**
 * Filter long-term memory results by relevance.
 * Only returns memories with score >= threshold; memories without a score are excluded.
 * When in doubt, we do not inject — prefer clean answers over forced memory use.
 */
export function filterMemoryByRelevance(
  memories: MemoryResult[],
  threshold: number = MEMORY_RELEVANCE_THRESHOLD
): MemoryResult[] {
  return memories.filter((m): m is MemoryResult & { score: number } => {
    if (m.score == null || typeof m.score !== "number") return false;
    return m.score >= threshold;
  });
}

/**
 * Limit to top N highest-scoring memories to avoid context bloat.
 */
export const MAX_INJECTED_MEMORIES = 3;

export function selectRelevantMemories(
  memories: MemoryResult[],
  threshold: number = MEMORY_RELEVANCE_THRESHOLD
): MemoryResult[] {
  const passed = filterMemoryByRelevance(memories, threshold);
  return passed
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, MAX_INJECTED_MEMORIES);
}
