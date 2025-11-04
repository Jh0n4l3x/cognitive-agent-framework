import { Memory } from '../types';
import { MemoryStorage, InMemoryStorage } from './storage';
import { logger } from '../utils';
import { eventBus, EventTypes } from '../events';

/**
 * Short-term memory manager
 */
export class ShortTermMemory {
  private storage: MemoryStorage;
  private maxItems: number;
  private agentId: string;

  constructor(agentId: string, maxItems: number = 50, storage?: MemoryStorage) {
    this.agentId = agentId;
    this.maxItems = maxItems;
    this.storage = storage || new InMemoryStorage();
  }

  async add(
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<Memory> {
    const memory = await this.storage.add(content, {
      ...metadata,
      agentId: this.agentId,
    });

    // Limit the number of memories
    const allMemories = await this.storage.getAll();
    if (allMemories.length > this.maxItems) {
      const toDelete = allMemories.slice(this.maxItems);
      for (const mem of toDelete) {
        await this.storage.delete(mem.id);
      }
    }

    await eventBus.emit({
      type: EventTypes.MEMORY_ADDED,
      agentId: this.agentId,
      data: { memory },
      timestamp: new Date(),
    });

    logger.debug(`Short-term memory added for agent ${this.agentId}`, {
      memoryId: memory.id,
    });
    return memory;
  }

  async get(id: string): Promise<Memory | null> {
    return await this.storage.get(id);
  }

  async getRecent(limit: number = 10): Promise<Memory[]> {
    const allMemories = await this.storage.getAll();
    return allMemories.slice(0, limit);
  }

  async search(query: string, limit: number = 5): Promise<Memory[]> {
    const results = await this.storage.search(query, limit);

    await eventBus.emit({
      type: EventTypes.MEMORY_RETRIEVED,
      agentId: this.agentId,
      data: { query, results },
      timestamp: new Date(),
    });

    return results;
  }

  async clear(): Promise<void> {
    await this.storage.clear();

    await eventBus.emit({
      type: EventTypes.MEMORY_CLEARED,
      agentId: this.agentId,
      data: { type: 'short-term' },
      timestamp: new Date(),
    });

    logger.debug(`Short-term memory cleared for agent ${this.agentId}`);
  }

  async getAll(): Promise<Memory[]> {
    return await this.storage.getAll();
  }
}
