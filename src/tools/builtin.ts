import { BaseTool } from './base';
import { ToolDefinition, ToolResult } from '../types';

/**
 * Calculator tool for basic arithmetic
 */
export class CalculatorTool extends BaseTool {
  constructor() {
    super('calculator', 'Performs basic arithmetic operations');
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['add', 'subtract', 'multiply', 'divide'],
            description: 'The arithmetic operation to perform',
          },
          a: {
            type: 'number',
            description: 'The first number',
          },
          b: {
            type: 'number',
            description: 'The second number',
          },
        },
        required: ['operation', 'a', 'b'],
      },
    };
  }

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const { operation, a, b } = args;

    if (typeof a !== 'number' || typeof b !== 'number') {
      return {
        success: false,
        result: null,
        error: 'Both a and b must be numbers',
      };
    }

    let result: number;

    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          return {
            success: false,
            result: null,
            error: 'Cannot divide by zero',
          };
        }
        result = a / b;
        break;
      default:
        return {
          success: false,
          result: null,
          error: `Unknown operation: ${operation}`,
        };
    }

    return {
      success: true,
      result,
    };
  }
}

/**
 * Web search tool (mock implementation)
 */
export class WebSearchTool extends BaseTool {
  constructor() {
    super('web_search', 'Searches the web for information');
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query',
          },
          numResults: {
            type: 'number',
            description: 'Number of results to return',
            default: 5,
          },
        },
        required: ['query'],
      },
    };
  }

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const { query, numResults = 5 } = args;
    const resultCount =
      typeof numResults === 'number'
        ? numResults
        : parseInt(String(numResults));

    // Mock implementation - in a real scenario, this would call a search API
    const mockResults = Array.from({ length: resultCount }, (_, i) => ({
      title: `Result ${i + 1} for "${query}"`,
      url: `https://example.com/result${i + 1}`,
      snippet: `This is a mock search result for the query "${query}".`,
    }));

    return {
      success: true,
      result: mockResults,
    };
  }
}

/**
 * Note-taking tool
 */
export class NoteTool extends BaseTool {
  private notes: Map<string, string>;

  constructor() {
    super('note', 'Saves and retrieves notes');
    this.notes = new Map();
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['save', 'get', 'list'],
            description: 'The action to perform',
          },
          key: {
            type: 'string',
            description: 'The note key (required for save and get)',
          },
          content: {
            type: 'string',
            description: 'The note content (required for save)',
          },
        },
        required: ['action'],
      },
    };
  }

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const { action, key, content } = args;

    switch (action) {
      case 'save':
        if (!key || !content) {
          return {
            success: false,
            result: null,
            error: 'Both key and content are required for save action',
          };
        }
        this.notes.set(String(key), String(content));
        return {
          success: true,
          result: `Note saved with key: ${key}`,
        };

      case 'get': {
        if (!key) {
          return {
            success: false,
            result: null,
            error: 'Key is required for get action',
          };
        }
        const note = this.notes.get(String(key));
        if (!note) {
          return {
            success: false,
            result: null,
            error: `Note not found with key: ${key}`,
          };
        }
        return {
          success: true,
          result: note,
        };
      }

      case 'list':
        return {
          success: true,
          result: Array.from(this.notes.keys()),
        };

      default:
        return {
          success: false,
          result: null,
          error: `Unknown action: ${action}`,
        };
    }
  }
}
