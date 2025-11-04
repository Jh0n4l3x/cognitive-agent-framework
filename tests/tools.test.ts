import { CalculatorTool, WebSearchTool, NoteTool } from '../src/tools/builtin';

describe('Built-in Tools', () => {
  describe('CalculatorTool', () => {
    let calculator: CalculatorTool;

    beforeEach(() => {
      calculator = new CalculatorTool();
    });

    it('should add two numbers', async () => {
      const result = await calculator.execute({ operation: 'add', a: 5, b: 3 });
      expect(result.success).toBe(true);
      expect(result.result).toBe(8);
    });

    it('should subtract two numbers', async () => {
      const result = await calculator.execute({
        operation: 'subtract',
        a: 10,
        b: 4,
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe(6);
    });

    it('should multiply two numbers', async () => {
      const result = await calculator.execute({
        operation: 'multiply',
        a: 6,
        b: 7,
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe(42);
    });

    it('should divide two numbers', async () => {
      const result = await calculator.execute({
        operation: 'divide',
        a: 15,
        b: 3,
      });
      expect(result.success).toBe(true);
      expect(result.result).toBe(5);
    });

    it('should handle division by zero', async () => {
      const result = await calculator.execute({
        operation: 'divide',
        a: 10,
        b: 0,
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot divide by zero');
    });

    it('should return definition', () => {
      const definition = calculator.getDefinition();
      expect(definition.name).toBe('calculator');
      expect(definition.parameters.required).toContain('operation');
    });
  });

  describe('WebSearchTool', () => {
    let webSearch: WebSearchTool;

    beforeEach(() => {
      webSearch = new WebSearchTool();
    });

    it('should return search results', async () => {
      const result = await webSearch.execute({
        query: 'TypeScript',
        numResults: 3,
      });
      expect(result.success).toBe(true);
      expect(Array.isArray(result.result)).toBe(true);
      expect(result.result).toHaveLength(3);
    });

    it('should use default number of results', async () => {
      const result = await webSearch.execute({ query: 'AI' });
      expect(result.success).toBe(true);
      expect(result.result).toHaveLength(5);
    });
  });

  describe('NoteTool', () => {
    let noteTool: NoteTool;

    beforeEach(() => {
      noteTool = new NoteTool();
    });

    it('should save a note', async () => {
      const result = await noteTool.execute({
        action: 'save',
        key: 'test',
        content: 'Test note',
      });
      expect(result.success).toBe(true);
    });

    it('should retrieve a saved note', async () => {
      await noteTool.execute({
        action: 'save',
        key: 'test',
        content: 'Test note',
      });
      const result = await noteTool.execute({ action: 'get', key: 'test' });
      expect(result.success).toBe(true);
      expect(result.result).toBe('Test note');
    });

    it('should list all notes', async () => {
      await noteTool.execute({
        action: 'save',
        key: 'note1',
        content: 'Content 1',
      });
      await noteTool.execute({
        action: 'save',
        key: 'note2',
        content: 'Content 2',
      });
      const result = await noteTool.execute({ action: 'list' });
      expect(result.success).toBe(true);
      expect(result.result).toContain('note1');
      expect(result.result).toContain('note2');
    });

    it('should handle missing note', async () => {
      const result = await noteTool.execute({
        action: 'get',
        key: 'nonexistent',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
