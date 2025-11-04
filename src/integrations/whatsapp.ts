/**
 * WhatsApp Integration
 * Sistema de integración de agentes con WhatsApp usando whatsapp-web.js
 */

import { Agent } from '../core/agent';
import { CalculatorTool, NoteTool } from '../tools';
import { logger } from '../utils';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

/**
 * Configuración del gestor de WhatsApp
 */
interface WhatsAppManagerConfig {
  agentName?: string;
  clientId?: string;
  autoRespondGroups?: boolean;
  triggers?: string[];
  checkUnreadOnStart?: boolean;
  unreadHoursLimit?: number;
}

/**
 * Gestor de integración de agentes con WhatsApp
 */
class WhatsAppManager {
  private agent: Agent | null = null;
  private whatsappClient: Client;
  private messageCount: number = 0;
  private config: WhatsAppManagerConfig;

  constructor(config: WhatsAppManagerConfig = {}) {
    this.config = {
      agentName: config.agentName || 'laura',
      clientId: config.clientId || 'agent-whatsapp',
      autoRespondGroups: config.autoRespondGroups || false,
      triggers: config.triggers || ['laura', 'bot', 'asistente'],
      checkUnreadOnStart: config.checkUnreadOnStart !== false, // Por defecto true
      unreadHoursLimit: config.unreadHoursLimit || 5,
    };

    // Configurar cliente de WhatsApp
    this.whatsappClient = new Client({
      authStrategy: new LocalAuth({
        clientId: this.config.clientId,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    this.setupWhatsAppHandlers();
  }

  /**
   * Configurar manejadores de eventos de WhatsApp.
   */
  private setupWhatsAppHandlers(): void {
    this.whatsappClient.on('qr', (qr) => {
      console.clear();
      console.log('\n📱 Escanea este código QR con WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('');
    });

    this.whatsappClient.on('authenticated', () => {
      logger.info('✅ WhatsApp autenticado');
    });

    this.whatsappClient.on('ready', async () => {
      console.clear();
      const info = this.whatsappClient.info;
      console.log(`\n✅ WhatsApp conectado (${info.pushname})`);
      console.log(
        `🤖 Agente: ${this.config.agentName} | Triggers: ${this.config.triggers?.join(', ')}\n`
      );

      // Revisar mensajes no leídos al iniciar
      if (this.config.checkUnreadOnStart) {
        await this.checkUnreadMessages();
      }
    });

    this.whatsappClient.on('message', async (message: Message) => {
      await this.handleMessage(message);
    });

    this.whatsappClient.on('auth_failure', (msg) => {
      logger.error('Error de autenticación', new Error(msg));
      console.error('\n❌ Error de autenticación:', msg);
      console.log(
        '💡 Intenta eliminar la carpeta .wwebjs_auth y volver a ejecutar\n'
      );
    });

    this.whatsappClient.on('disconnected', (reason) => {
      logger.warn(`WhatsApp desconectado: ${reason}`);
      console.log(`\n⚠️  WhatsApp desconectado: ${reason}\n`);
    });
  }

  /**
   * Revisar y responder mensajes no leídos
   */
  private async checkUnreadMessages(): Promise<void> {
    try {
      console.log('🔍 Revisando mensajes no leídos...');

      const chats = await this.whatsappClient.getChats();
      const now = Date.now();
      const hoursLimit = this.config.unreadHoursLimit! * 60 * 60 * 1000; // Convertir a ms
      let processedCount = 0;

      for (const chat of chats) {
        // Ignorar grupos si no está configurado
        if (chat.isGroup && !this.config.autoRespondGroups) continue;

        // Solo chats con mensajes no leídos
        if (chat.unreadCount === 0) continue;

        // Obtener mensajes no leídos
        const messages = await chat.fetchMessages({ limit: 50 });

        for (const message of messages) {
          // Ignorar mensajes propios
          if (message.fromMe) continue;

          // Ignorar si ya fue leído
          if (message.ack && message.ack > 1) continue;

          // Verificar tiempo límite (últimas X horas)
          const messageTime = message.timestamp * 1000;
          if (now - messageTime > hoursLimit) continue;

          // Responder a TODOS los mensajes no leídos
          // Si quieres filtrar por triggers, descomenta la siguiente línea:
          // if (!this.shouldRespond(message.body)) continue;

          // Procesar mensaje
          const contact = await message.getContact();
          const contactName =
            contact.name || contact.pushname || contact.number;

          console.log(
            `📬 Mensaje no leído de ${contactName} (${this.formatTimeAgo(messageTime)})`
          );
          console.log(`   "${message.body.substring(0, 60)}..."`);

          // Generar y enviar respuesta
          await chat.sendSeen();
          const response = await this.generateResponse(
            contactName,
            message.body
          );
          await message.reply(response);

          processedCount++;
          this.messageCount++;

          // Guardar conversación
          await this.saveConversation(contactName, message.body, response);

          // Pequeña pausa entre respuestas
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      if (processedCount > 0) {
        console.log(`✅ Respondidos ${processedCount} mensajes no leídos\n`);
      } else {
        console.log('✅ No hay mensajes no leídos pendientes\n');
      }
    } catch (error) {
      logger.error('Error revisando mensajes no leídos', error as Error);
    }
  }

  /**
   * Formatear tiempo transcurrido
   */
  private formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `hace ${hours}h`;
    } else if (minutes > 0) {
      return `hace ${minutes}m`;
    } else {
      return 'ahora';
    }
  }

  /**
   * Manejar mensajes entrantes
   */
  private async handleMessage(message: Message): Promise<void> {
    try {
      // Ignorar mensajes propios
      if (message.fromMe) return;

      // Obtener chat y verificar si es grupo
      const chat = await message.getChat();
      if (chat.isGroup && !this.config.autoRespondGroups) return;

      // Responder a TODOS los mensajes (sin necesidad de triggers)
      // Si quieres volver al comportamiento anterior, descomenta la siguiente línea:
      // if (!this.shouldRespond(message.body)) return;

      // Obtener información del contacto
      const contact = await message.getContact();
      const contactName = contact.name || contact.pushname || contact.number;

      this.messageCount++;
      console.log(
        `\n[${new Date().toLocaleTimeString()}] ${contactName}: ${message.body}`
      );

      // Marcar como visto y simular escritura
      await chat.sendSeen();

      // Generar respuesta con el agente (incluyendo historial del chat)
      const response = await this.generateResponse(
        contactName,
        message.body,
        chat
      );

      // Enviar respuesta
      await message.reply(response);

      // Guardar conversación
      await this.saveConversation(contactName, message.body, response);
    } catch (error) {
      logger.error('Error procesando mensaje', error as Error);
      console.error('❌ Error:', (error as Error).message);
    }
  }

  /**
   * Generar respuesta usando el agente
   */
  private async generateResponse(
    contactName: string,
    messageBody: string,
    chat?: unknown
  ): Promise<string> {
    if (!this.agent) {
      logger.warn('Agente no inicializado, usando respuesta por defecto');
      return `Hola! 👋 Mi sistema aún se está inicializando. Por favor, intenta de nuevo en un momento.`;
    }

    try {
      // Obtener los últimos 15 mensajes del chat para contexto
      let conversationContext = '';
      if (chat && typeof chat === 'object' && chat !== null) {
        try {
          const chatObj = chat as {
            fetchMessages: (opts: { limit: number }) => Promise<unknown[]>;
          };
          const messages = await chatObj.fetchMessages({ limit: 15 });
          const recentMessages = messages
            .reverse() // Ordenar cronológicamente
            .slice(-15) // Tomar últimos 15
            .map((msg: unknown) => {
              const message = msg as { fromMe: boolean; body: string };
              const sender = message.fromMe ? 'Tú' : contactName;
              return `${sender}: ${message.body}`;
            })
            .join('\n');

          conversationContext = `\n\nHistorial de conversación reciente:\n${recentMessages}\n\n`;
        } catch (error) {
          logger.warn(
            'No se pudo obtener historial de mensajes',
            error instanceof Error ? error : undefined
          );
        }
      }

      const context = `${conversationContext}Mensaje actual de ${contactName}: ${messageBody}`;
      const response = await this.agent.chat(context);
      return response;
    } catch (error) {
      logger.error('Error generando respuesta', error as Error);
      return `Disculpa ${contactName}, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?`;
    }
  }

  /**
   * Guardar conversación en memoria
   */
  private async saveConversation(
    contact: string,
    userMsg: string,
    agentMsg: string
  ): Promise<void> {
    try {
      const note = `[${new Date().toISOString()}] ${contact}\nUsuario: ${userMsg}\nAgente: ${agentMsg}`;
      const noteTool = new NoteTool();
      await noteTool.execute({
        action: 'save',
        key: `chat_${contact}_${Date.now()}`,
        content: note,
      });
    } catch (error) {
      logger.error('Error guardando conversación', error as Error);
    }
  }

  /**
   * Inicializar y arrancar la integración
   */
  public async start(): Promise<void> {
    try {
      // Cargar agente desde YAML
      logger.info(`Cargando agente: ${this.config.agentName}`);
      this.agent = await Agent.fromConfig(this.config.agentName!);

      // Registrar herramientas básicas (NO WhatsApp tools para evitar confusión)
      logger.info('Registrando herramientas...');
      this.agent.registerTool(new CalculatorTool());
      this.agent.registerTool(new NoteTool());

      logger.info('Inicializando WhatsApp...');
      await this.whatsappClient.initialize();
    } catch (error) {
      logger.error(
        'Error fatal al iniciar integración WhatsApp',
        error as Error
      );
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    }
  }

  /**
   * Detener la integración
   */
  public async stop(): Promise<void> {
    console.log('\n👋 Cerrando WhatsApp...\n');
    await this.whatsappClient.destroy();
  }
}

/**
 * Función principal
 */
async function main() {
  // Configuración por defecto (usa el agente Laura)
  const whatsapp = new WhatsAppManager({
    agentName: 'laura',
    clientId: 'agent-whatsapp',
    autoRespondGroups: false,
    triggers: ['laura', 'bot', 'asistente'],
    checkUnreadOnStart: true, // Revisar no leídos al iniciar
    unreadHoursLimit: 5, // Últimas 5 horas
  });

  // Manejar señales de terminación
  process.on('SIGINT', async () => {
    await whatsapp.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await whatsapp.stop();
    process.exit(0);
  });

  // Iniciar integración
  await whatsapp.start();
}

// Ejecutar
if (require.main === module) {
  main().catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}

export { WhatsAppManager, WhatsAppManagerConfig };
