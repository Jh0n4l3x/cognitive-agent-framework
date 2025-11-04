import axios, { AxiosInstance } from 'axios';
import { LLMProvider } from './base';
import { Message, LLMResponse, LLMConfig, ToolDefinition } from '../types';
import { LLMError } from '../types/errors';
import { logger } from '../utils';

/**
 * Anthropic (Claude) LLM Provider
 */
export class AnthropicProvider implements LLMProvider {
  private client: AxiosInstance;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    if (!config.apiKey) {
      throw new LLMError('Anthropic API key is required');
    }

    this.config = config;
    this.client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
    });
  }

  async generateResponse(
    messages: Message[],
    config?: Partial<LLMConfig>,
    tools?: ToolDefinition[]
  ): Promise<LLMResponse> {
    try {
      const requestConfig = { ...this.config, ...config };

      // Extract system message if present
      const systemMessage = messages.find((msg) => msg.role === 'system');
      const conversationMessages = messages.filter(
        (msg) => msg.role !== 'system'
      );

      const payload: any = {
        model: requestConfig.model,
        messages: conversationMessages.map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
        max_tokens: requestConfig.maxTokens || 2000,
        temperature: requestConfig.temperature,
      };

      if (systemMessage) {
        payload.system = systemMessage.content;
      }

      if (tools && tools.length > 0) {
        payload.tools = tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.parameters,
        }));
      }

      logger.debug('Anthropic API Request', { payload });

      const response = await this.client.post('/messages', payload);

      const result: LLMResponse = {
        content: '',
        usage: {
          promptTokens: response.data.usage?.input_tokens || 0,
          completionTokens: response.data.usage?.output_tokens || 0,
          totalTokens:
            (response.data.usage?.input_tokens || 0) +
            (response.data.usage?.output_tokens || 0),
        },
      };

      // Handle content blocks
      if (response.data.content && Array.isArray(response.data.content)) {
        for (const block of response.data.content) {
          if (block.type === 'text') {
            result.content += block.text;
          } else if (block.type === 'tool_use') {
            result.functionCall = {
              name: block.name,
              arguments: JSON.stringify(block.input),
            };
          }
        }
      }

      logger.debug('Anthropic API Response', { result });

      return result;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || error.message;
      logger.error('Anthropic API Error', { error: errorMessage });
      throw new LLMError(`Anthropic API error: ${errorMessage}`, 'anthropic');
    }
  }

  async streamResponse(
    messages: Message[],
    config?: Partial<LLMConfig>,
    onChunk?: (chunk: string) => void
  ): Promise<LLMResponse> {
    try {
      const requestConfig = { ...this.config, ...config };

      const systemMessage = messages.find((msg) => msg.role === 'system');
      const conversationMessages = messages.filter(
        (msg) => msg.role !== 'system'
      );

      const payload: any = {
        model: requestConfig.model,
        messages: conversationMessages.map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
        max_tokens: requestConfig.maxTokens || 2000,
        temperature: requestConfig.temperature,
        stream: true,
      };

      if (systemMessage) {
        payload.system = systemMessage.content;
      }

      const response = await this.client.post('/messages', payload, {
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
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (
                  parsed.type === 'content_block_delta' &&
                  parsed.delta?.text
                ) {
                  const content = parsed.delta.text;
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
            new LLMError(`Streaming error: ${error.message}`, 'anthropic')
          );
        });
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || error.message;
      throw new LLMError(
        `Anthropic streaming error: ${errorMessage}`,
        'anthropic'
      );
    }
  }
}
