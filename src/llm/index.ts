import { LLMProvider } from './base';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { OpenRouterProvider } from './openrouter';
import { OllamaProvider } from './ollama';
import { LLMConfig } from '../types';
import { LLMError } from '../types/errors';

/**
 * Factory for creating LLM providers
 */
export class LLMFactory {
  static createProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'openrouter':
        return new OpenRouterProvider(config);
      case 'ollama':
        return new OllamaProvider(config);
      default:
        throw new LLMError(`Unsupported LLM provider: ${config.provider}`);
    }
  }
}

export * from './base';
export * from './openai';
export * from './anthropic';
export * from './openrouter';
export * from './ollama';
