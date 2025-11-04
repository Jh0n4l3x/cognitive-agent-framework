import { ToolDefinition, ToolResult } from '../types';
import { ToolExecutionError } from '../types/errors';
import { logger } from '../utils';
import { eventBus, EventTypes } from '../events';

/**
 * Base class for tools
 */
export abstract class BaseTool {
  public name: string;
  public description: string;
  protected agentId?: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  abstract execute(args: Record<string, unknown>): Promise<ToolResult>;

  abstract getDefinition(): ToolDefinition;

  setAgentId(agentId: string): void {
    this.agentId = agentId;
  }

  protected async emitEvent(eventType: string, data: unknown): Promise<void> {
    if (this.agentId) {
      await eventBus.emit({
        type: eventType,
        agentId: this.agentId,
        data:
          typeof data === 'object' && data !== null
            ? { tool: this.name, ...data }
            : { tool: this.name, value: data },
        timestamp: new Date(),
      });
    }
  }
}

/**
 * Tool registry for managing available tools
 */
export class ToolRegistry {
  private tools: Map<string, BaseTool>;

  constructor() {
    this.tools = new Map();
  }

  register(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
    logger.debug(`Tool registered: ${tool.name}`);
  }

  unregister(toolName: string): boolean {
    const result = this.tools.delete(toolName);
    if (result) {
      logger.debug(`Tool unregistered: ${toolName}`);
    }
    return result;
  }

  get(toolName: string): BaseTool | undefined {
    return this.tools.get(toolName);
  }

  getAll(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  getDefinitions(): ToolDefinition[] {
    return this.getAll().map((tool) => tool.getDefinition());
  }

  async execute(
    toolName: string,
    args: Record<string, unknown>,
    agentId?: string
  ): Promise<ToolResult> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      const error = `Tool not found: ${toolName}`;
      logger.error(error);
      throw new ToolExecutionError(error, toolName);
    }

    if (agentId) {
      tool.setAgentId(agentId);
      await eventBus.emit({
        type: EventTypes.TOOL_EXECUTION_STARTED,
        agentId,
        data: { tool: toolName, args },
        timestamp: new Date(),
      });
    }

    try {
      logger.debug(`Executing tool: ${toolName}`, { args });
      const result = await tool.execute(args);

      if (agentId) {
        await eventBus.emit({
          type: EventTypes.TOOL_EXECUTION_COMPLETED,
          agentId,
          data: { tool: toolName, result },
          timestamp: new Date(),
        });
      }

      logger.debug(`Tool execution completed: ${toolName}`, { result });
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error(
        `Tool execution failed: ${toolName}`,
        error instanceof Error ? error : new Error(String(error))
      );

      if (agentId) {
        await eventBus.emit({
          type: EventTypes.TOOL_EXECUTION_FAILED,
          agentId,
          data: { tool: toolName, error: errorMessage },
          timestamp: new Date(),
        });
      }

      return {
        success: false,
        result: null,
        error: errorMessage,
      };
    }
  }

  clear(): void {
    this.tools.clear();
    logger.debug('All tools cleared from registry');
  }
}
