import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { AgentConfig, LLMConfig } from '../types';
import { logger } from './logger';

/**
 * Configuration structure from YAML files
 */
export interface YAMLAgentConfig {
  name: string;
  id: string;
  description?: string;
  llm: {
    provider: 'openai' | 'anthropic';
    model: string;
    temperature?: number;
    max_tokens?: number;
  };
  prompt?: string;
  tools?: string[];
  memory?: {
    enabled: boolean;
  };
  team?: {
    role?: string;
    reports_to?: string;
    can_delegate_to?: string[];
    delegation_rules?: string[];
  };
  filesystem?: {
    type: string;
    root_dir?: string;
    virtual_mode?: boolean;
    max_file_size_mb?: number;
  };
  use_deep_agents?: boolean;
  maxIterations?: number;
}

/**
 * Loads agent configurations from YAML files
 */
export class YAMLAgentLoader {
  private agentsDir: string;

  constructor(agentsDir: string = 'agents') {
    this.agentsDir = agentsDir;
  }

  /**
   * Load agent configuration from name or path
   *
   * @param nameOrPath - Agent name (e.g., 'andrea') or path to YAML file
   * @returns Agent configuration
   */
  async load(nameOrPath: string): Promise<AgentConfig> {
    const filePath = this.resolveAgentPath(nameOrPath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Agent configuration not found: ${filePath}`);
    }

    logger.info(`Loading agent configuration from: ${filePath}`);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const yamlConfig = yaml.load(fileContent) as YAMLAgentConfig;

    // Expand environment variables
    const expandedConfig = this.expandEnvVars(yamlConfig);

    // Convert to AgentConfig format
    return this.yamlToAgentConfig(expandedConfig);
  }

  /**
   * List all available agents
   *
   * @returns Array of agent metadata
   */
  async listAgents(): Promise<
    Array<{ name: string; id: string; path: string }>
  > {
    const agents: Array<{ name: string; id: string; path: string }> = [];

    // Search in main agents directory
    if (fs.existsSync(this.agentsDir)) {
      const files = fs.readdirSync(this.agentsDir);

      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          const filePath = path.join(this.agentsDir, file);
          try {
            const config = yaml.load(
              fs.readFileSync(filePath, 'utf-8')
            ) as YAMLAgentConfig;
            agents.push({
              name: config.name,
              id: config.id,
              path: filePath,
            });
          } catch (error) {
            logger.warn(
              `Failed to load agent from ${filePath}:`,
              error as Error
            );
          }
        }
      }
    }

    // Search in teams subdirectories
    const teamsDir = path.join(this.agentsDir, 'teams');
    if (fs.existsSync(teamsDir)) {
      const teamDirs = fs.readdirSync(teamsDir);

      for (const teamDir of teamDirs) {
        const teamPath = path.join(teamsDir, teamDir);
        if (fs.statSync(teamPath).isDirectory()) {
          const teamFiles = fs.readdirSync(teamPath);

          for (const file of teamFiles) {
            if (file.endsWith('.yaml') || file.endsWith('.yml')) {
              const filePath = path.join(teamPath, file);
              try {
                const config = yaml.load(
                  fs.readFileSync(filePath, 'utf-8')
                ) as YAMLAgentConfig;
                agents.push({
                  name: config.name,
                  id: config.id,
                  path: filePath,
                });
              } catch (error) {
                logger.warn(
                  `Failed to load agent from ${filePath}:`,
                  error as Error
                );
              }
            }
          }
        }
      }
    }

    return agents;
  }

  /**
   * Save agent configuration to YAML file
   *
   * @param config - Agent configuration
   * @param outputPath - Path to save the YAML file
   */
  async save(
    config: Partial<YAMLAgentConfig>,
    outputPath: string
  ): Promise<void> {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const yamlContent = yaml.dump(config, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    fs.writeFileSync(outputPath, yamlContent, 'utf-8');
    logger.info(`Agent configuration saved to: ${outputPath}`);
  }

  /**
   * Resolve agent path from name or path
   */
  private resolveAgentPath(nameOrPath: string): string {
    // If it's already a path to a YAML file
    if (nameOrPath.endsWith('.yaml') || nameOrPath.endsWith('.yml')) {
      return nameOrPath;
    }

    // Try direct path in agents directory
    const filePath = path.join(this.agentsDir, `${nameOrPath}.yaml`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }

    // Search in teams subdirectories
    const teamsDir = path.join(this.agentsDir, 'teams');
    if (fs.existsSync(teamsDir)) {
      const teamDirs = fs.readdirSync(teamsDir);

      for (const teamDir of teamDirs) {
        const teamPath = path.join(teamsDir, teamDir);
        if (fs.statSync(teamPath).isDirectory()) {
          const teamFilePath = path.join(teamPath, `${nameOrPath}.yaml`);
          if (fs.existsSync(teamFilePath)) {
            return teamFilePath;
          }
        }
      }
    }

    // Not found
    return path.join(this.agentsDir, `${nameOrPath}.yaml`);
  }

  /**
   * Convert YAML config to AgentConfig
   */
  private yamlToAgentConfig(yamlConfig: YAMLAgentConfig): AgentConfig {
    const llmConfig: LLMConfig = {
      provider: yamlConfig.llm.provider,
      model: yamlConfig.llm.model,
      temperature: yamlConfig.llm.temperature,
      maxTokens: yamlConfig.llm.max_tokens,
    };

    // Build system prompt
    let systemPrompt = yamlConfig.prompt || `You are ${yamlConfig.name}`;

    if (yamlConfig.description) {
      systemPrompt = `${yamlConfig.description}\n\n${systemPrompt}`;
    }

    // Add team information to prompt if available
    if (
      yamlConfig.team?.can_delegate_to &&
      yamlConfig.team.can_delegate_to.length > 0
    ) {
      systemPrompt += `\n\nYou can delegate tasks to: ${yamlConfig.team.can_delegate_to.join(', ')}`;
    }

    return {
      name: yamlConfig.name,
      description: yamlConfig.description || '',
      llmConfig,
      systemPrompt,
      maxIterations: yamlConfig.maxIterations || 10,
    };
  }

  /**
   * Expand environment variables in configuration
   */
  private expandEnvVars(obj: any): any {
    if (typeof obj === 'string') {
      // Replace ${VAR_NAME} or ${VAR_NAME:default}
      return obj.replace(/\$\{([^}]+)\}/g, (match, varExpr) => {
        if (varExpr.includes(':')) {
          const [varName, defaultValue] = varExpr.split(':');
          return process.env[varName.trim()] || defaultValue.trim();
        }
        return process.env[varExpr.trim()] || match;
      });
    } else if (Array.isArray(obj)) {
      return obj.map((item) => this.expandEnvVars(item));
    } else if (obj !== null && typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = this.expandEnvVars(obj[key]);
      }
      return result;
    }
    return obj;
  }
}

// Export singleton instance
export const yamlLoader = new YAMLAgentLoader();
