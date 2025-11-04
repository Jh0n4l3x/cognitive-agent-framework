import axios, { AxiosInstance } from 'axios';
import { LLMProvider } from './base';
import { Message, LLMResponse, LLMConfig, ToolDefinition } from '../types';
import { LLMError } from '../types/errors';
import { logger, langsmith } from '../utils';

/**
 * Ollama LLM Provider
 * Para modelos locales
 */
export class OllamaProvider implements LLMProvider {
  private client: AxiosInstance;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    const baseURL = config.baseURL || 'http://localhost:11434';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generateResponse(
    messages: Message[],
    config?: Partial<LLMConfig>,
    tools?: ToolDefinition[]
  ): Promise<LLMResponse> {
    const run = langsmith.createRun({
      name: 'Ollama Chat',
      runType: 'llm',
      inputs: {
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      },
      metadata: {
        model: config?.model || this.config.model,
        temperature: config?.temperature || this.config.temperature,
        provider: 'ollama',
      },
      tags: ['ollama', 'llm', 'local'],
    });

    try {
      const requestConfig = { ...this.config, ...config };

      const payload: Record<string, unknown> = {
        model: requestConfig.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false,
        options: {
          temperature: requestConfig.temperature,
          num_predict: requestConfig.maxTokens,
        },
      };

      // Ollama no soporta function calling de la misma manera
      // pero podemos pasar las tools como contexto si es necesario
      if (tools && tools.length > 0) {
        const toolsContext = tools
          .map((t) => `Tool: ${t.name} - ${t.description}`)
          .join('\n');
        logger.debug('Tools available (added to context)', { toolsContext });
      }

      logger.debug('Ollama API Request', { payload });

      const response = await this.client.post('/api/chat', payload);

      const result: LLMResponse = {
        content: response.data.message?.content || '',
        usage: {
          promptTokens: response.data.prompt_eval_count || 0,
          completionTokens: response.data.eval_count || 0,
          totalTokens:
            (response.data.prompt_eval_count || 0) +
            (response.data.eval_count || 0),
        },
      };

      logger.debug('Ollama API Response', { result });

      await langsmith.endRun(run, {
        output: result.content,
        usage: result.usage,
      });

      return result;
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      logger.error('Ollama API Error', { error: errorMessage });

      await langsmith.endRunWithError(run, new Error(errorMessage));

      throw new LLMError(`Ollama API error: ${errorMessage}`, 'ollama');
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
        stream: true,
        options: {
          temperature: requestConfig.temperature,
          num_predict: requestConfig.maxTokens,
        },
      };

      const response = await this.client.post('/api/chat', payload, {
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
            try {
              const parsed = JSON.parse(line);
              const content = parsed.message?.content || '';
              if (content) {
                fullContent += content;
                if (onChunk) {
                  onChunk(content);
                }
              }

              if (parsed.done) {
                resolve({
                  content: fullContent,
                  usage: {
                    promptTokens: parsed.prompt_eval_count || 0,
                    completionTokens: parsed.eval_count || 0,
                    totalTokens:
                      (parsed.prompt_eval_count || 0) +
                      (parsed.eval_count || 0),
                  },
                });
              }
            } catch {
              // Ignore parse errors
            }
          }
        });

        response.data.on('error', (error: Error) => {
          reject(new LLMError(`Streaming error: ${error.message}`, 'ollama'));
        });
      });
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      throw new LLMError(`Ollama streaming error: ${errorMessage}`, 'ollama');
    }
  }
}
