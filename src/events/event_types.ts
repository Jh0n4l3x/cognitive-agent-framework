/**
 * Event types used in the agent framework
 */
export const EventTypes = {
  // Agent lifecycle events
  AGENT_CREATED: 'agent.created',
  AGENT_STARTED: 'agent.started',
  AGENT_STOPPED: 'agent.stopped',
  AGENT_ERROR: 'agent.error',

  // Task events
  TASK_CREATED: 'task.created',
  TASK_STARTED: 'task.started',
  TASK_COMPLETED: 'task.completed',
  TASK_FAILED: 'task.failed',
  TASK_STEP_STARTED: 'task.step.started',
  TASK_STEP_COMPLETED: 'task.step.completed',

  // Tool events
  TOOL_EXECUTION_STARTED: 'tool.execution.started',
  TOOL_EXECUTION_COMPLETED: 'tool.execution.completed',
  TOOL_EXECUTION_FAILED: 'tool.execution.failed',

  // Memory events
  MEMORY_ADDED: 'memory.added',
  MEMORY_RETRIEVED: 'memory.retrieved',
  MEMORY_CLEARED: 'memory.cleared',

  // LLM events
  LLM_REQUEST: 'llm.request',
  LLM_RESPONSE: 'llm.response',
  LLM_ERROR: 'llm.error',
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];
