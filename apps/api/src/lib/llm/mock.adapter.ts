import type { LlmQueryInput, AiQueryResponse } from '@saathi/shared';
import type { LlmProvider } from './llm.provider.js';
import { guardrails } from './guardrails.js';
import { retrievalService } from './retrieval.service.js';

export class GroundedMockAdapter implements LlmProvider {
  /**
   * Executes a grounded query with guardrail verification and strict fact retrieval.
   */
  async query(input: LlmQueryInput): Promise<AiQueryResponse> {
    // 1. Guardrail scope check
    const scopeCheck = guardrails.checkScope(input.query);
    if (!scopeCheck.allowed && scopeCheck.refusalResponse) {
      return scopeCheck.refusalResponse;
    }

    // 2. Verified data retrieval and synthesis
    return retrievalService.retrieveAndGenerate(input);
  }
}

export const groundedMockAdapter = new GroundedMockAdapter();
