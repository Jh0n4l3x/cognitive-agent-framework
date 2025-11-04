import dotenv from 'dotenv';
import { ConfigurationError } from '../types/errors';
import { LLMConfig } from '../types';

/**
 * Configuration manager for the agent framework
 */
class Config {
  private static instance: Config;
  private config: Record<string, unknown>;

  private constructor() {
    dotenv.config();
    this.config = {};
    this.loadConfig();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private loadConfig(): void {
    this.config = {
      llm: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY || '',
          defaultModel: process.env.DEFAULT_MODEL || 'gpt-4',
          temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.DEFAULT_MAX_TOKENS || '2000', 10),
        },
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY || '',
          defaultModel: process.env.DEFAULT_MODEL || 'claude-3-opus-20240229',
          temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.DEFAULT_MAX_TOKENS || '2000', 10),
        },
        openrouter: {
          apiKey: process.env.OPENROUTER_API_KEY || '',
          defaultModel:
            process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
          temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.DEFAULT_MAX_TOKENS || '8192', 10),
        },
        ollama: {
          apiKey: '', // Ollama no requiere API key
          defaultModel: process.env.OLLAMA_MODEL || 'llama3.2',
          temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.DEFAULT_MAX_TOKENS || '2000', 10),
          baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        },
        defaultProvider: (process.env.DEFAULT_LLM_PROVIDER || 'openai') as
          | 'openai'
          | 'anthropic'
          | 'openrouter'
          | 'ollama',
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/agent_framework.log',
      },
      memory: {
        storagePath: process.env.MEMORY_STORAGE_PATH || './memory_storage',
        maxItems: parseInt(process.env.MAX_MEMORY_ITEMS || '100', 10),
      },
      agent: {
        maxTaskRetries: parseInt(process.env.MAX_TASK_RETRIES || '3', 10),
        taskTimeout: parseInt(process.env.TASK_TIMEOUT || '300000', 10),
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }

  public get(key: string): unknown {
    const keys = key.split('.');
    let value: unknown = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }

    return value;
  }

  public set(key: string, value: unknown): void {
    const keys = key.split('.');
    let current: Record<string, unknown> = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
  }

  public getLLMConfig(
    provider?: 'openai' | 'anthropic' | 'openrouter' | 'ollama'
  ): LLMConfig {
    const llmConfig = this.config.llm as Record<string, unknown>;
    const selectedProvider = (provider || llmConfig.defaultProvider) as string;
    const providerConfig = llmConfig[selectedProvider] as
      | Record<string, unknown>
      | undefined;

    if (!providerConfig) {
      throw new ConfigurationError(
        `LLM provider '${selectedProvider}' not configured`
      );
    }

    const apiKey = providerConfig.apiKey as string;
    // Ollama no requiere API key
    if (!apiKey && selectedProvider !== 'ollama') {
      throw new ConfigurationError(
        `API key not found for provider '${selectedProvider}'. Please set the appropriate environment variable.`
      );
    }

    const config: LLMConfig = {
      provider: selectedProvider as
        | 'openai'
        | 'anthropic'
        | 'openrouter'
        | 'ollama',
      model: providerConfig.defaultModel as string,
      temperature: providerConfig.temperature as number,
      maxTokens: providerConfig.maxTokens as number,
      apiKey,
    };

    // Agregar baseURL para Ollama
    if (selectedProvider === 'ollama' && providerConfig.baseURL) {
      config.baseURL = providerConfig.baseURL as string;
    }

    return config;
  }

  public getAll(): Record<string, unknown> {
    return { ...this.config };
  }
}

export const config = Config.getInstance();
