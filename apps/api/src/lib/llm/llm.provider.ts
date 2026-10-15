import type { LlmQueryInput, AiQueryResponse } from '@saathi/shared';

/**
 * Common interface for all AI / LLM counselling providers.
 * Grounded mock adapter and external LLM adapters implement this interface.
 */
export interface LlmProvider {
  query(input: LlmQueryInput): Promise<AiQueryResponse>;
}
