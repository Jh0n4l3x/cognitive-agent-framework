import { AgentConfig, Message, TaskConfig, TaskResult } from '../types';
import { LLMProvider, LLMFactory } from '../llm';
import { ShortTermMemory, LongTermMemory } from '../memory';
import { ToolRegistry } from '../tools';
import { TaskQueue, TaskPlanner } from '../tasks';
import {
  generateId,
  logger,
  config as appConfig,
  parseJSON,
  yamlLoader,
  langsmith,
} from '../utils';
import { eventBus, EventTypes } from '../events';
import { AgentError } from '../types/errors';

/**
 * Base Agent class
 */
export class Agent {
  public id: string;
  public name: string;
  public description: string;
  protected llmProvider: LLMProvider;
  protected shortTermMemory: ShortTermMemory;
  protected longTermMemory: LongTermMemory;
  protected toolRegistry: ToolRegistry;
  protected taskQueue: TaskQueue;
  protected taskPlanner: TaskPlanner;
  protected systemPrompt: string;
  protected maxIterations: number;
  protected conversationHistory: Message[];

  constructor(config: AgentConfig) {
    this.id = generateId();
    this.name = config.name;
    this.description = config.description;

    // Initialize LLM provider
    const llmConfig = config.llmConfig.apiKey
      ? config.llmConfig
      : {
          ...config.llmConfig,
          ...appConfig.getLLMConfig(config.llmConfig.provider),
        };
    this.llmProvider = LLMFactory.createProvider(llmConfig);

    // Initialize memory
    this.shortTermMemory = new ShortTermMemory(this.id);
    this.longTermMemory = new LongTermMemory(this.id);

    // Initialize tools
    this.toolRegistry = new ToolRegistry();
    if (config.tools) {
      // Tools would be registered here
    }

    // Initialize task management
    this.taskQueue = new TaskQueue();
    this.taskPlanner = new TaskPlanner();

    // Configuration
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();
    this.maxIterations = config.maxIterations || 10;
    this.conversationHistory = [];

    logger.info(`Agent created: ${this.name}`, { id: this.id });

    eventBus.emit({
      type: EventTypes.AGENT_CREATED,
      agentId: this.id,
      data: { name: this.name, description: this.description },
      timestamp: new Date(),
    });
  }

  /**
   * Create agent from YAML configuration file
   *
   * @param nameOrPath - Agent name (e.g., 'andrea') or path to YAML file
   * @returns Agent instance
   */
  static async fromConfig(nameOrPath: string): Promise<Agent> {
    logger.info(`Loading agent from config: ${nameOrPath}`);
    const config = await yamlLoader.load(nameOrPath);
    return new Agent(config);
  }

  /**
   * List all available agents
   *
   * @returns Array of agent metadata
   */
  static async listAvailable(): Promise<
    Array<{ name: string; id: string; path: string }>
  > {
    return await yamlLoader.listAgents();
  }

  protected getDefaultSystemPrompt(): string {
    return `You are ${this.name}, ${this.description}.
You are a helpful and intelligent agent that can use tools to accomplish tasks.
When you need to use a tool, respond with a function call.
Always think step by step and explain your reasoning.`;
  }

  async run(input: string): Promise<string> {
    // Crear run de LangSmith (usando 'chain' porque 'agent' no es tipo válido)
    const run = langsmith.createRun({
      name: `Agent: ${this.name}`,
      runType: 'chain',
      inputs: { input },
      metadata: { agentId: this.id, type: 'agent' },
      tags: ['agent', this.name],
    });

    try {
      await eventBus.emit({
        type: EventTypes.AGENT_STARTED,
        agentId: this.id,
        data: { input },
        timestamp: new Date(),
      });

      // Add system prompt if conversation is empty
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: this.systemPrompt,
        });
      }

      // Add user input
      this.conversationHistory.push({
        role: 'user',
        content: input,
      });

      await this.shortTermMemory.add(input, { type: 'user_input' });

      let iterations = 0;
      let finalResponse = '';

      while (iterations < this.maxIterations) {
        iterations++;

        // Get LLM response
        await eventBus.emit({
          type: EventTypes.LLM_REQUEST,
          agentId: this.id,
          data: { iteration: iterations },
          timestamp: new Date(),
        });

        const response = await this.llmProvider.generateResponse(
          this.conversationHistory,
          undefined,
          this.toolRegistry.getDefinitions()
        );

        await eventBus.emit({
          type: EventTypes.LLM_RESPONSE,
          agentId: this.id,
          data: { response, iteration: iterations },
          timestamp: new Date(),
        });

        // Handle function calls
        if (response.functionCall) {
          const { name, arguments: argsStr } = response.functionCall;
          const args = parseJSON(argsStr) || {};

          logger.debug(`Executing tool: ${name}`, { args });

          const toolResult = await this.toolRegistry.execute(
            name,
            args,
            this.id
          );

          // Add function call and result to conversation
          this.conversationHistory.push({
            role: 'assistant',
            content: response.content || '',
            functionCall: response.functionCall,
          });

          this.conversationHistory.push({
            role: 'function',
            name,
            content: JSON.stringify(toolResult),
          });

          await this.shortTermMemory.add(
            `Used tool ${name}: ${JSON.stringify(toolResult)}`,
            {
              type: 'tool_execution',
              toolName: name,
            }
          );

          continue;
        }

        // No function call, we have the final response
        finalResponse = response.content;
        this.conversationHistory.push({
          role: 'assistant',
          content: finalResponse,
        });

        await this.shortTermMemory.add(finalResponse, {
          type: 'agent_response',
        });
        break;
      }

      if (iterations >= this.maxIterations) {
        logger.warn(`Agent reached max iterations: ${this.name}`);
        finalResponse =
          'I apologize, but I reached the maximum number of iterations without completing the task.';
      }

      await eventBus.emit({
        type: EventTypes.AGENT_STOPPED,
        agentId: this.id,
        data: { response: finalResponse, iterations },
        timestamp: new Date(),
      });

      // Finalizar run de LangSmith exitosamente
      await langsmith.endRun(run, { output: finalResponse, iterations });

      return finalResponse;
    } catch (error) {
      logger.error(`Agent error: ${this.name}`, error as Error);

      // Finalizar run de LangSmith con error
      await langsmith.endRunWithError(run, error as Error);

      await eventBus.emit({
        type: EventTypes.AGENT_ERROR,
        agentId: this.id,
        data: { error: (error as Error).message },
        timestamp: new Date(),
      });

      throw new AgentError(
        `Agent execution failed: ${(error as Error).message}`
      );
    }
  }

  async executeTask(taskConfig: TaskConfig): Promise<TaskResult> {
    const task = this.taskQueue.add(taskConfig);

    await eventBus.emit({
      type: EventTypes.TASK_CREATED,
      agentId: this.id,
      data: { task },
      timestamp: new Date(),
    });

    try {
      task.start();

      await eventBus.emit({
        type: EventTypes.TASK_STARTED,
        agentId: this.id,
        data: { taskId: task.id },
        timestamp: new Date(),
      });

      // Plan the task
      const steps = await this.taskPlanner.plan(task.description);
      steps.forEach((step) => task.addStep(step));

      // Execute each step
      for (let i = 0; i < task.steps.length; i++) {
        const step = task.steps[i];
        task.updateStepStatus(i, 'in_progress');

        await eventBus.emit({
          type: EventTypes.TASK_STEP_STARTED,
          agentId: this.id,
          data: { taskId: task.id, stepIndex: i, step },
          timestamp: new Date(),
        });

        try {
          const stepResult = await this.run(step.description);
          task.updateStepStatus(i, 'completed', stepResult);

          await eventBus.emit({
            type: EventTypes.TASK_STEP_COMPLETED,
            agentId: this.id,
            data: { taskId: task.id, stepIndex: i, result: stepResult },
            timestamp: new Date(),
          });
        } catch (error: any) {
          task.updateStepStatus(i, 'failed', null, error.message);
          throw error;
        }
      }

      // Compile final result
      const finalResult = task.steps.map((s) => s.result).join('\n\n');
      task.complete(finalResult);

      this.taskQueue.markCompleted(task.id);

      await eventBus.emit({
        type: EventTypes.TASK_COMPLETED,
        agentId: this.id,
        data: { taskId: task.id, result: task.result },
        timestamp: new Date(),
      });

      logger.info(`Task completed: ${task.id}`, {
        duration: task.getDuration(),
      });

      return task.result!;
    } catch (error: any) {
      task.fail(error.message);

      await eventBus.emit({
        type: EventTypes.TASK_FAILED,
        agentId: this.id,
        data: { taskId: task.id, error: error.message },
        timestamp: new Date(),
      });

      logger.error(`Task failed: ${task.id}`, error);

      return task.result!;
    }
  }

  async chat(message: string): Promise<string> {
    return await this.run(message);
  }

  clearConversation(): void {
    this.conversationHistory = [];
    logger.debug(`Conversation cleared for agent: ${this.name}`);
  }

  getConversationHistory(): Message[] {
    return [...this.conversationHistory];
  }

  registerTool(tool: any): void {
    this.toolRegistry.register(tool);
  }

  async getRecentMemories(limit: number = 5): Promise<any[]> {
    return await this.shortTermMemory.getRecent(limit);
  }

  async consolidateMemories(): Promise<void> {
    const shortTermMemories = await this.shortTermMemory.getAll();
    await this.longTermMemory.consolidate(shortTermMemories);
    logger.info(`Memories consolidated for agent: ${this.name}`);
  }
}
