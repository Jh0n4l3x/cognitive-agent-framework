import { Task } from '../src/tasks/task';
import { TaskQueue } from '../src/tasks/queue';

describe('Task Management', () => {
  describe('Task', () => {
    it('should create a task with default values', () => {
      const task = new Task({ description: 'Test task' });

      expect(task.id).toBeDefined();
      expect(task.description).toBe('Test task');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
    });

    it('should add steps to a task', () => {
      const task = new Task({ description: 'Test task' });
      task.addStep('Step 1');
      task.addStep('Step 2');

      expect(task.steps).toHaveLength(2);
      expect(task.steps[0].description).toBe('Step 1');
    });

    it('should update step status', () => {
      const task = new Task({ description: 'Test task' });
      task.addStep('Step 1');
      task.updateStepStatus(0, 'completed', 'Result');

      expect(task.steps[0].status).toBe('completed');
      expect(task.steps[0].result).toBe('Result');
    });

    it('should complete a task', () => {
      const task = new Task({ description: 'Test task' });
      task.start();
      task.complete('Final result');

      expect(task.status).toBe('completed');
      expect(task.result?.success).toBe(true);
      expect(task.result?.result).toBe('Final result');
    });

    it('should fail a task', () => {
      const task = new Task({ description: 'Test task' });
      task.start();
      task.fail('Error message');

      expect(task.status).toBe('failed');
      expect(task.result?.success).toBe(false);
      expect(task.result?.error).toBe('Error message');
    });
  });

  describe('TaskQueue', () => {
    let queue: TaskQueue;

    beforeEach(() => {
      queue = new TaskQueue();
    });

    it('should add tasks to the queue', () => {
      const task = queue.add({ description: 'Task 1' });

      expect(queue.size()).toBe(1);
      expect(task.description).toBe('Task 1');
    });

    it('should get pending tasks', () => {
      queue.add({ description: 'Task 1' });
      queue.add({ description: 'Task 2' });

      const pending = queue.getPending();
      expect(pending).toHaveLength(2);
    });

    it('should get next task by priority', () => {
      queue.add({ description: 'Low priority', priority: 'low' });
      queue.add({ description: 'High priority', priority: 'high' });
      queue.add({ description: 'Medium priority', priority: 'medium' });

      const next = queue.getNext();
      expect(next?.description).toBe('High priority');
    });

    it('should handle task dependencies', () => {
      const task1 = queue.add({ description: 'Task 1' });
      queue.add({ description: 'Task 2', dependencies: [task1.id] });

      const next = queue.getNext();
      expect(next?.description).toBe('Task 1');
    });

    it('should mark tasks as completed', () => {
      const task = queue.add({ description: 'Task 1' });
      task.complete('Done');
      queue.markCompleted(task.id);

      const completed = queue.getCompleted();
      expect(completed).toHaveLength(1);
    });

    it('should clear the queue', () => {
      queue.add({ description: 'Task 1' });
      queue.add({ description: 'Task 2' });
      queue.clear();

      expect(queue.isEmpty()).toBe(true);
    });
  });
});
