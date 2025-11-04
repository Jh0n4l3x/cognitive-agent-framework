#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Agent } from './core/agent';
import { yamlLoader } from './utils';

const program = new Command();

program
  .name('agent-cli')
  .description('CLI for managing and running AI agents')
  .version('1.0.0');

/**
 * Run an agent
 */
program
  .command('run <agent>')
  .description('Run an agent with optional message')
  .option('-m, --message <message>', 'Message to send to the agent')
  .option('-c, --chat', 'Start interactive chat mode')
  .action(
    async (
      agentName: string,
      options: { message?: string; chat?: boolean }
    ) => {
      try {
        console.log(chalk.cyan(`\n🤖 Loading agent: ${agentName}...\n`));

        const agent = await Agent.fromConfig(agentName);

        console.log(chalk.green(`✅ Agent loaded: ${agent.name}`));
        console.log(chalk.gray(`   ${agent.description}\n`));

        if (options.message) {
          // Single message mode
          console.log(chalk.cyan(`\n${agent.name}:`));
          const response = await agent.run(options.message);
          console.log(chalk.white(response));
          console.log();
        } else {
          // Interactive chat mode (default)
          console.log(chalk.yellow('💬 Chat mode (type "exit" to quit)\n'));

          let running = true;
          while (running) {
            const { message } = await inquirer.prompt([
              {
                type: 'input',
                name: 'message',
                message: chalk.blue('You:'),
              },
            ]);

            if (
              message.toLowerCase() === 'exit' ||
              message.toLowerCase() === 'quit'
            ) {
              console.log(chalk.yellow('\n👋 Goodbye!\n'));
              running = false;
              break;
            }

            try {
              console.log(chalk.cyan(`\n${agent.name}:`));
              const response = await agent.run(message);
              console.log(chalk.white(response));
              console.log();
            } catch (error: any) {
              console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
            }
          }
        }
      } catch (error: any) {
        console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
        process.exit(1);
      }
    }
  );

/**
 * List available agents
 */
program
  .command('list')
  .description('List all available agents')
  .action(async () => {
    try {
      console.log(chalk.cyan('\n🤖 Available Agents:\n'));

      const agents = await Agent.listAvailable();

      if (agents.length === 0) {
        console.log(chalk.yellow('No agents found.\n'));
        return;
      }

      for (const agent of agents) {
        console.log(chalk.green(`  • ${agent.name}`));
        console.log(chalk.gray(`    ID: ${agent.id}`));
        console.log(chalk.gray(`    Path: ${agent.path}\n`));
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

/**
 * Show agent info
 */
program
  .command('info <agent>')
  .description('Show detailed information about an agent')
  .action(async (agentName: string) => {
    try {
      console.log(chalk.cyan(`\n🤖 Agent Information: ${agentName}\n`));

      const agent = await Agent.fromConfig(agentName);

      console.log(chalk.green(`Name: ${agent.name}`));
      console.log(chalk.gray(`Description: ${agent.description}`));
      console.log(chalk.gray(`Max Iterations: ${agent['maxIterations']}`));
      console.log();
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      process.exit(1);
    }
  });

/**
 * Create a new agent
 */
program
  .command('create <name>')
  .description('Create a new agent configuration')
  .option('-d, --description <description>', 'Agent description')
  .option('-m, --model <model>', 'LLM model to use', 'gpt-4')
  .option(
    '-p, --provider <provider>',
    'LLM provider (openai or anthropic)',
    'openai'
  )
  .action(
    async (
      name: string,
      options: {
        description?: string;
        model: string;
        provider: 'openai' | 'anthropic';
      }
    ) => {
      try {
        const config = {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          id: name.toLowerCase().replace(/\s+/g, '_'),
          description: options.description || `${name} agent`,
          llm: {
            provider: options.provider,
            model: options.model,
            temperature: 0.7,
            max_tokens: 4096,
          },
          prompt: `You are ${name}, a helpful AI assistant.`,
          tools: [],
          memory: {
            enabled: true,
          },
          maxIterations: 10,
        };

        const outputPath = `agents/${name.toLowerCase()}.yaml`;
        await yamlLoader.save(config, outputPath);

        console.log(chalk.green(`\n✅ Agent created: ${outputPath}\n`));
        console.log(chalk.cyan('Configuration:'));
        console.log(chalk.gray(`  Name: ${config.name}`));
        console.log(
          chalk.gray(`  Model: ${config.llm.provider}/${config.llm.model}`)
        );
        console.log(chalk.gray(`  Tools: ${config.tools.length}\n`));
        console.log(
          chalk.yellow(`💡 Run: agent-cli run ${name.toLowerCase()} --chat\n`)
        );
      } catch (error: any) {
        console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
        process.exit(1);
      }
    }
  );

program.parse();
