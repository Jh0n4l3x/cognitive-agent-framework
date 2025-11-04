import { Task } from './task';
import { TaskConfig } from '../types';
import { logger } from '../utils';

/**
 * Task queue with priority management
 */
export class TaskQueue {
  private tasks: Map<string, Task>;
  private completedTasks: Set<string>;

  constructor() {
    this.tasks = new Map();
    this.completedTasks = new Set();
  }

  add(config: TaskConfig): Task {
    const task = new Task(config);
    this.tasks.set(task.id, task);
    logger.debug(`Task added to queue: ${task.id}`, {
      description: task.description,
    });
    return task;
  }

  get(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  getPending(): Task[] {
    return this.getAll().filter((task) => task.status === 'pending');
  }

  getInProgress(): Task[] {
    return this.getAll().filter((task) => task.status === 'in_progress');
  }

  getCompleted(): Task[] {
    return this.getAll().filter((task) => task.status === 'completed');
  }

  getFailed(): Task[] {
    return this.getAll().filter((task) => task.status === 'failed');
  }

  getNext(): Task | undefined {
    const pendingTasks = this.getPending();

    // Filter tasks that have their dependencies met
    const readyTasks = pendingTasks.filter((task) =>
      task.isReady(this.completedTasks)
    );

    if (readyTasks.length === 0) {
      return undefined;
    }

    // Sort by priority and creation time
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    readyTasks.sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return readyTasks[0];
  }

  markCompleted(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'completed') {
      this.completedTasks.add(taskId);
      logger.debug(`Task marked as completed: ${taskId}`);
    }
  }

  remove(taskId: string): boolean {
    const result = this.tasks.delete(taskId);
    this.completedTasks.delete(taskId);
    if (result) {
      logger.debug(`Task removed from queue: ${taskId}`);
    }
    return result;
  }

  clear(): void {
    this.tasks.clear();
    this.completedTasks.clear();
    logger.debug('Task queue cleared');
  }

  size(): number {
    return this.tasks.size;
  }

  isEmpty(): boolean {
    return this.tasks.size === 0;
  }

  hasReadyTasks(): boolean {
    return this.getNext() !== undefined;
  }
}
