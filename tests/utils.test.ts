import {
  generateId,
  sleep,
  parseJSON,
  truncateString,
  deepClone,
} from '../src/utils/helpers';

describe('Helper Functions', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs in the correct format', () => {
      const id = generateId();
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('sleep', () => {
    it('should wait for the specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(90);
    });
  });

  describe('parseJSON', () => {
    it('should parse valid JSON', () => {
      const result = parseJSON('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should return null for invalid JSON', () => {
      const result = parseJSON('invalid json');
      expect(result).toBeNull();
    });
  });

  describe('truncateString', () => {
    it('should truncate long strings', () => {
      const result = truncateString('Hello World!', 8);
      expect(result).toBe('Hello...');
    });

    it('should not truncate short strings', () => {
      const result = truncateString('Hi', 10);
      expect(result).toBe('Hi');
    });
  });

  describe('deepClone', () => {
    it('should create a deep clone of an object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
    });
  });
});
