import { Memory } from '../types';
import { MemoryStorage, InMemoryStorage } from './storage';
import { logger } from '../utils';
import { eventBus, EventTypes } from '../events';

/**
 * Long-term memory manager with importance scoring
 */
export class LongTermMemory {
  private storage: MemoryStorage;
  private agentId: string;

  constructor(agentId: string, storage?: MemoryStorage) {
    this.agentId = agentId;
    this.storage = storage || new InMemoryStorage();
  }

  async add(
    content: string,
    metadata: Record<string, unknown> = {},
    importance: number = 0.5
  ): Promise<Memory> {
    const memory = await this.storage.add(content, {
      ...metadata,
      agentId: this.agentId,
      importance,
    });

    await eventBus.emit({
      type: EventTypes.MEMORY_ADDED,
      agentId: this.agentId,
      data: { memory, type: 'long-term' },
      timestamp: new Date(),
    });

    logger.debug(`Long-term memory added for agent ${this.agentId}`, {
      memoryId: memory.id,
      importance,
    });

    return memory;
  }

  async get(id: string): Promise<Memory | null> {
    return await this.storage.get(id);
  }

  async search(query: string, limit: number = 5): Promise<Memory[]> {
    const results = await this.storage.search(query, limit);

    await eventBus.emit({
      type: EventTypes.MEMORY_RETRIEVED,
      agentId: this.agentId,
      data: { query, results, type: 'long-term' },
      timestamp: new Date(),
    });

    return results;
  }

  async getImportant(
    minImportance: number = 0.7,
    limit: number = 10
  ): Promise<Memory[]> {
    const allMemories = await this.storage.getAll();

    return allMemories
      .filter((memory) => {
        const importance =
          typeof memory.metadata.importance === 'number'
            ? memory.metadata.importance
            : 0;
        return importance >= minImportance;
      })
      .sort((a, b) => {
        const importanceA =
          typeof a.metadata.importance === 'number' ? a.metadata.importance : 0;
        const importanceB =
          typeof b.metadata.importance === 'number' ? b.metadata.importance : 0;
        return importanceB - importanceA;
      })
      .slice(0, limit);
  }

  async consolidate(shortTermMemories: Memory[]): Promise<void> {
    // Simple consolidation: move important short-term memories to long-term
    for (const memory of shortTermMemories) {
      const importance = this.calculateImportance(memory);
      if (importance > 0.6) {
        await this.add(memory.content, memory.metadata, importance);
      }
    }

    logger.debug(
      `Consolidated ${shortTermMemories.length} memories for agent ${this.agentId}`
    );
  }

  private calculateImportance(memory: Memory): number {
    // Simple importance calculation based on content length and metadata
    let importance = 0.5;

    if (memory.content.length > 200) {
      importance += 0.1;
    }

    if (memory.metadata.taskSuccess === true) {
      importance += 0.2;
    }

    if (memory.metadata.toolUsed) {
      importance += 0.1;
    }

    return Math.min(importance, 1.0);
  }

  async clear(): Promise<void> {
    await this.storage.clear();

    await eventBus.emit({
      type: EventTypes.MEMORY_CLEARED,
      agentId: this.agentId,
      data: { type: 'long-term' },
      timestamp: new Date(),
    });

    logger.debug(`Long-term memory cleared for agent ${this.agentId}`);
  }

  async getAll(): Promise<Memory[]> {
    return await this.storage.getAll();
  }
}
