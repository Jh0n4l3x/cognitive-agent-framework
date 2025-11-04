/**
 * Custom error classes for the agent framework
 */

export class AgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentError';
    Object.setPrototypeOf(this, AgentError.prototype);
  }
}

export class LLMError extends AgentError {
  constructor(
    message: string,
    public provider?: string
  ) {
    super(message);
    this.name = 'LLMError';
    Object.setPrototypeOf(this, LLMError.prototype);
  }
}

export class ToolExecutionError extends AgentError {
  constructor(
    message: string,
    public toolName?: string
  ) {
    super(message);
    this.name = 'ToolExecutionError';
    Object.setPrototypeOf(this, ToolExecutionError.prototype);
  }
}

export class TaskExecutionError extends AgentError {
  constructor(
    message: string,
    public taskId?: string
  ) {
    super(message);
    this.name = 'TaskExecutionError';
    Object.setPrototypeOf(this, TaskExecutionError.prototype);
  }
}

export class MemoryError extends AgentError {
  constructor(message: string) {
    super(message);
    this.name = 'MemoryError';
    Object.setPrototypeOf(this, MemoryError.prototype);
  }
}

export class ConfigurationError extends AgentError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
