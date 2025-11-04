import { Message, LLMResponse, LLMConfig, ToolDefinition } from '../types';

/**
 * Base interface for LLM providers
 */
export interface LLMProvider {
  generateResponse(
    messages: Message[],
    config?: Partial<LLMConfig>,
    tools?: ToolDefinition[]
  ): Promise<LLMResponse>;

  streamResponse?(
    messages: Message[],
    config?: Partial<LLMConfig>,
    onChunk?: (chunk: string) => void
  ): Promise<LLMResponse>;
}
