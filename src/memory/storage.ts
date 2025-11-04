import { Memory } from '../types';
import { generateId } from '../utils';

/**
 * Base interface for memory storage
 */
export interface MemoryStorage {
  add(content: string, metadata?: Record<string, unknown>): Promise<Memory>;
  get(id: string): Promise<Memory | null>;
  getAll(): Promise<Memory[]>;
  search(query: string, limit?: number): Promise<Memory[]>;
  clear(): Promise<void>;
  delete(id: string): Promise<boolean>;
}

/**
 * In-memory storage implementation
 */
export class InMemoryStorage implements MemoryStorage {
  private memories: Map<string, Memory>;

  constructor() {
    this.memories = new Map();
  }

  async add(
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<Memory> {
    const memory: Memory = {
      id: generateId(),
      content,
      metadata,
      timestamp: new Date(),
    };
    this.memories.set(memory.id, memory);
    return memory;
  }

  async get(id: string): Promise<Memory | null> {
    return this.memories.get(id) || null;
  }

  async getAll(): Promise<Memory[]> {
    return Array.from(this.memories.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async search(query: string, limit: number = 10): Promise<Memory[]> {
    const lowerQuery = query.toLowerCase();
    const results = Array.from(this.memories.values()).filter((memory) =>
      memory.content.toLowerCase().includes(lowerQuery)
    );

    return results
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async clear(): Promise<void> {
    this.memories.clear();
  }

  async delete(id: string): Promise<boolean> {
    return this.memories.delete(id);
  }
}
