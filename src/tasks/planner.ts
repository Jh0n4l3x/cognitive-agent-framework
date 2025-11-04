import { Task } from './task';
import { TaskConfig } from '../types';
import { logger } from '../utils';

/**
 * Task planner that breaks down complex tasks into steps
 */
export class TaskPlanner {
  async plan(taskDescription: string): Promise<string[]> {
    // Simple planning - in a real implementation, this could use LLM
    const steps: string[] = [];

    // Break down the task into logical steps
    if (taskDescription.toLowerCase().includes('research')) {
      steps.push('Identify key topics and questions');
      steps.push('Search for relevant information');
      steps.push('Analyze and synthesize findings');
      steps.push('Summarize results');
    } else if (taskDescription.toLowerCase().includes('write')) {
      steps.push('Outline the content structure');
      steps.push('Draft the main content');
      steps.push('Review and edit');
      steps.push('Finalize the document');
    } else if (taskDescription.toLowerCase().includes('analyze')) {
      steps.push('Collect data');
      steps.push('Process and clean data');
      steps.push('Perform analysis');
      steps.push('Generate report');
    } else {
      // Default steps for generic tasks
      steps.push('Understand the requirements');
      steps.push('Execute the task');
      steps.push('Verify the results');
    }

    logger.debug('Task plan generated', { taskDescription, steps });
    return steps;
  }

  async decompose(complexTask: string): Promise<TaskConfig[]> {
    // Decompose a complex task into subtasks
    const steps = await this.plan(complexTask);

    const subtasks: TaskConfig[] = steps.map((step, index) => ({
      description: step,
      priority: 'medium' as const,
      dependencies: index > 0 ? [`step-${index - 1}`] : [],
      metadata: {
        parentTask: complexTask,
        stepIndex: index,
      },
    }));

    logger.debug('Task decomposed into subtasks', {
      complexTask,
      subtaskCount: subtasks.length,
    });
    return subtasks;
  }

  async estimateComplexity(task: Task): Promise<'low' | 'medium' | 'high'> {
    // Simple complexity estimation
    const description = task.description.toLowerCase();
    const wordCount = description.split(/\s+/).length;
    const dependencies = task.dependencies.length;

    if (wordCount > 20 || dependencies > 2) {
      return 'high';
    } else if (wordCount > 10 || dependencies > 0) {
      return 'medium';
    }
    return 'low';
  }
}
