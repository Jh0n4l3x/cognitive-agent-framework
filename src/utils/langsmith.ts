/**
 * LangSmith Integration
 * Proporciona observabilidad y tracing para agentes
 */

import { Client, RunTree } from 'langsmith';
import { logger } from './logger';

/**
 * Cliente de LangSmith singleton
 */
class LangSmithClient {
  private client: Client | null = null;
  private enabled: boolean = false;
  private projectName: string = 'AgentFramework';

  constructor() {
    this.initialize();
  }

  /**
   * Inicializar cliente de LangSmith
   */
  private initialize(): void {
    const apiKey =
      process.env.LANGCHAIN_API_KEY || process.env.LANGSMITH_API_KEY;
    const tracingEnabled = process.env.LANGCHAIN_TRACING_V2 === 'true';
    const projectName = process.env.LANGCHAIN_PROJECT || this.projectName;

    if (apiKey && tracingEnabled) {
      try {
        this.client = new Client({
          apiKey,
          apiUrl:
            process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com',
        });
        this.enabled = true;
        this.projectName = projectName;
        logger.info(`LangSmith habilitado - Proyecto: ${this.projectName}`);
      } catch (error) {
        logger.warn('Error inicializando LangSmith', error as Error);
        this.enabled = false;
      }
    } else {
      logger.debug(
        'LangSmith deshabilitado (configura LANGCHAIN_API_KEY y LANGCHAIN_TRACING_V2)'
      );
    }
  }

  /**
   * Verificar si LangSmith está habilitado
   */
  isEnabled(): boolean {
    return this.enabled && this.client !== null;
  }

  /**
   * Crear un nuevo run para tracing
   */
  createRun(config: {
    name: string;
    runType: 'chain' | 'llm' | 'tool' | 'retriever';
    inputs: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    tags?: string[];
    parentRunId?: string;
  }): RunTree | null {
    if (!this.isEnabled()) return null;

    try {
      const run = new RunTree({
        name: config.name,
        run_type: config.runType,
        inputs: config.inputs,
        project_name: this.projectName,
        metadata: config.metadata,
        tags: config.tags,
        parent_run_id: config.parentRunId,
      });

      return run;
    } catch (error) {
      logger.error('Error creando run de LangSmith', error as Error);
      return null;
    }
  }

  /**
   * Finalizar un run exitosamente
   */
  async endRun(
    run: RunTree | null,
    outputs: Record<string, unknown>
  ): Promise<void> {
    if (!run || !this.isEnabled()) return;

    try {
      await run.end(outputs);
      await run.postRun();
    } catch (error) {
      logger.error('Error finalizando run de LangSmith', error as Error);
    }
  }

  /**
   * Finalizar un run con error
   */
  async endRunWithError(run: RunTree | null, error: Error): Promise<void> {
    if (!run || !this.isEnabled()) return;

    try {
      await run.end(undefined, error.message);
      await run.postRun();
    } catch (err) {
      logger.error('Error finalizando run con error', err as Error);
    }
  }

  /**
   * Registrar un evento
   */
  async logEvent(config: {
    name: string;
    runType: 'chain' | 'llm' | 'tool' | 'retriever';
    inputs: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    error?: Error;
    metadata?: Record<string, unknown>;
    tags?: string[];
  }): Promise<void> {
    if (!this.isEnabled()) return;

    const run = this.createRun({
      name: config.name,
      runType: config.runType,
      inputs: config.inputs,
      metadata: config.metadata,
      tags: config.tags,
    });

    if (!run) return;

    if (config.error) {
      await this.endRunWithError(run, config.error);
    } else if (config.outputs) {
      await this.endRun(run, config.outputs);
    }
  }
}

// Exportar instancia singleton
export const langsmith = new LangSmithClient();
