import { AgentEvent, EventHandler } from '../types';
import { logger } from '../utils';

/**
 * Event bus for agent communication
 */
export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, EventHandler[]>;

  private constructor() {
    this.handlers = new Map();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    logger.debug(`Event handler registered for: ${eventType}`);
  }

  public off(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        logger.debug(`Event handler removed for: ${eventType}`);
      }
    }
  }

  public async emit(event: AgentEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (handlers && handlers.length > 0) {
      logger.debug(`Emitting event: ${event.type}`, { agentId: event.agentId });

      const promises = handlers.map((handler) => {
        try {
          return Promise.resolve(handler(event));
        } catch (error) {
          logger.error(
            `Error in event handler for ${event.type}`,
            error as Error
          );
          return Promise.resolve();
        }
      });

      await Promise.all(promises);
    }
  }

  public once(eventType: string, handler: EventHandler): void {
    const onceHandler: EventHandler = async (event: AgentEvent) => {
      await handler(event);
      this.off(eventType, onceHandler);
    };
    this.on(eventType, onceHandler);
  }

  public removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
      logger.debug(`All handlers removed for: ${eventType}`);
    } else {
      this.handlers.clear();
      logger.debug('All event handlers removed');
    }
  }

  public listenerCount(eventType: string): number {
    return this.handlers.get(eventType)?.length || 0;
  }

  public eventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const eventBus = EventBus.getInstance();
