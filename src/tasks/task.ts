import { TaskConfig, TaskResult, TaskStep } from '../types';
import { generateId } from '../utils';

/**
 * Task class representing a unit of work
 */
export class Task {
  public id: string;
  public description: string;
  public priority: 'low' | 'medium' | 'high';
  public status: 'pending' | 'in_progress' | 'completed' | 'failed';
  public deadline?: Date;
  public dependencies: string[];
  public metadata: Record<string, any>;
  public steps: TaskStep[];
  public result?: TaskResult;
  public createdAt: Date;
  public startedAt?: Date;
  public completedAt?: Date;

  constructor(config: TaskConfig) {
    this.id = generateId();
    this.description = config.description;
    this.priority = config.priority || 'medium';
    this.status = 'pending';
    this.deadline = config.deadline;
    this.dependencies = config.dependencies || [];
    this.metadata = config.metadata || {};
    this.steps = [];
    this.createdAt = new Date();
  }

  addStep(description: string): TaskStep {
    const step: TaskStep = {
      description,
      status: 'pending',
    };
    this.steps.push(step);
    return step;
  }

  updateStepStatus(
    stepIndex: number,
    status: TaskStep['status'],
    result?: any,
    error?: string
  ): void {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      const step = this.steps[stepIndex];
      step.status = status;

      if (status === 'in_progress') {
        step.startTime = new Date();
      } else if (status === 'completed' || status === 'failed') {
        step.endTime = new Date();
        if (result !== undefined) {
          step.result = result;
        }
        if (error) {
          step.error = error;
        }
      }
    }
  }

  start(): void {
    this.status = 'in_progress';
    this.startedAt = new Date();
  }

  complete(result: any): void {
    this.status = 'completed';
    this.completedAt = new Date();
    this.result = {
      success: true,
      result,
      steps: this.steps,
      duration:
        this.completedAt.getTime() -
        (this.startedAt?.getTime() || this.createdAt.getTime()),
    };
  }

  fail(error: string): void {
    this.status = 'failed';
    this.completedAt = new Date();
    this.result = {
      success: false,
      result: null,
      error,
      steps: this.steps,
      duration:
        this.completedAt.getTime() -
        (this.startedAt?.getTime() || this.createdAt.getTime()),
    };
  }

  isReady(completedTaskIds: Set<string>): boolean {
    return this.dependencies.every((depId) => completedTaskIds.has(depId));
  }

  getDuration(): number | undefined {
    if (this.startedAt && this.completedAt) {
      return this.completedAt.getTime() - this.startedAt.getTime();
    }
    return undefined;
  }
}
