import axios, { AxiosInstance } from 'axios';
import { LLMProvider } from './base';
import { Message, LLMResponse, LLMConfig, ToolDefinition } from '../types';
import { LLMError } from '../types/errors';
import { logger, langsmith } from '../utils';

/**
 * OpenRouter LLM Provider
 * Acceso unificado a múltiples modelos
 */
export class OpenRouterProvider implements LLMProvider {
  private client: AxiosInstance;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    if (!config.apiKey) {
      throw new LLMError('OpenRouter API key is required');
    }

    this.config = config;
    this.client = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/agent-framework',
        'X-Title': 'Agent Framework',
      },
    });
  }

  async generateResponse(
    messages: Message[],
    config?: Partial<LLMConfig>,
    tools?: ToolDefinition[]
  ): Promise<LLMResponse> {
    const run = langsmith.createRun({
      name: 'OpenRouter Chat',
      runType: 'llm',
      inputs: {
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      },
      metadata: {
        model: config?.model || this.config.model,
        temperature: config?.temperature || this.config.temperature,
        provider: 'openrouter',
      },
      tags: ['openrouter', 'llm'],
    });

    try {
      const requestConfig = { ...this.config, ...config };

      const payload: Record<string, unknown> = {
        model: requestConfig.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          ...(msg.name && { name: msg.name }),
        })),
        temperature: requestConfig.temperature,
        max_tokens: requestConfig.maxTokens,
      };

      if (tools && tools.length > 0) {
        payload.tools = tools.map((tool) => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        }));
        payload.tool_choice = 'auto';
      }

      logger.debug('OpenRouter API Request', { payload });

      const response = await this.client.post('/chat/completions', payload);
      const choice = response.data.choices[0];

      const result: LLMResponse = {
        content: choice.message.content || '',
        usage: {
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0,
          totalTokens: response.data.usage?.total_tokens || 0,
        },
      };

      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        const toolCall = choice.message.tool_calls[0];
        result.functionCall = {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        };
      }

      logger.debug('OpenRouter API Response', { result });

      await langsmith.endRun(run, {
        output: result.content,
        usage: result.usage,
      });

      return result;
    } catch (error: unknown) {
      const errorMessage =
        (error as any).response?.data?.error?.message ||
        (error as Error).message;
      logger.error('OpenRouter API Error', { error: errorMessage });

      await langsmith.endRunWithError(run, new Error(errorMessage));

      throw new LLMError(`OpenRouter API error: ${errorMessage}`, 'openrouter');
    }
  }

  async streamResponse(
    messages: Message[],
    config?: Partial<LLMConfig>,
    onChunk?: (chunk: string) => void
  ): Promise<LLMResponse> {
    try {
      const requestConfig = { ...this.config, ...config };

      const payload = {
        model: requestConfig.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: requestConfig.temperature,
        max_tokens: requestConfig.maxTokens,
        stream: true,
      };

      const response = await this.client.post('/chat/completions', payload, {
        responseType: 'stream',
      });

      let fullContent = '';

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk
            .toString()
            .split('\n')
            .filter((line) => line.trim() !== '');

          for (const line of lines) {
            if (line.includes('[DONE]')) continue;

            const message = line.replace(/^data: /, '');
            if (message) {
              try {
                const parsed = JSON.parse(message);
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  fullContent += content;
                  if (onChunk) {
                    onChunk(content);
                  }
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve({ content: fullContent });
        });

        response.data.on('error', (error: Error) => {
          reject(
            new LLMError(`Streaming error: ${error.message}`, 'openrouter')
          );
        });
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as any).response?.data?.error?.message ||
        (error as Error).message;
      throw new LLMError(
        `OpenRouter streaming error: ${errorMessage}`,
        'openrouter'
      );
    }
  }
}
