/**
 * Base types for the agent framework
 */

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: FunctionCall;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface LLMResponse {
  content: string;
  functionCall?: FunctionCall;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'openrouter' | 'ollama';
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseURL?: string; // Para Ollama
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolResult {
  success: boolean;
  result: unknown;
  error?: string;
}

export interface Memory {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export interface AgentConfig {
  name: string;
  description: string;
  llmConfig: LLMConfig;
  tools?: ToolDefinition[];
  systemPrompt?: string;
  maxIterations?: number;
}

export interface TaskConfig {
  description: string;
  priority?: 'low' | 'medium' | 'high';
  deadline?: Date;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface TaskResult {
  success: boolean;
  result: unknown;
  error?: string;
  steps?: TaskStep[];
  duration?: number;
}

export interface TaskStep {
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface AgentEvent {
  type: string;
  agentId: string;
  data: unknown;
  timestamp: Date;
}

export type EventHandler = (event: AgentEvent) => void | Promise<void>;

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}
