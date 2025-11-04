import { BaseTool } from './base';
import { ToolDefinition, ToolResult } from '../types';
import { Client } from 'whatsapp-web.js';
import { logger } from '../utils';

/**
 * WhatsApp Send Message Tool
 * Sends messages to WhatsApp contacts
 */
export class WhatsAppSendTool extends BaseTool {
  private client: Client;

  constructor(client: Client) {
    super(
      'whatsapp_send',
      'Envía un mensaje de WhatsApp a un contacto o grupo. Parámetros: recipient (número con código de país sin +, ej: 573001234567), message (texto del mensaje)'
    );
    this.client = client;
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          recipient: {
            type: 'string',
            description:
              'Número de teléfono del destinatario con código de país (sin +), ej: 573001234567',
          },
          message: {
            type: 'string',
            description: 'Mensaje a enviar',
          },
        },
        required: ['recipient', 'message'],
      },
    };
  }

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    try {
      const { recipient, message } = args as {
        recipient: string;
        message: string;
      };

      // Validar que el cliente esté listo
      if (!this.client || !this.client.info) {
        logger.warn('WhatsApp client not ready');
        return {
          success: false,
          result: null,
          error:
            'WhatsApp no está listo. Por favor, intenta de nuevo en un momento.',
        };
      }

      const chatId = `${recipient}@c.us`;

      // Enviar mensaje con timeout
      const sendPromise = this.client.sendMessage(chatId, message);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      await Promise.race([sendPromise, timeoutPromise]);

      logger.info(`Message sent to ${recipient}`);

      return {
        success: true,
        result: {
          recipient,
          message,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMsg = (error as Error).message;
      logger.error('Error sending WhatsApp message', error as Error);

      // Si es un error de timeout o evaluación, dar una respuesta más amigable
      if (
        errorMsg.includes('Timeout') ||
        errorMsg.includes('Evaluation failed')
      ) {
        return {
          success: false,
          result: null,
          error:
            'No pude enviar el mensaje en este momento. WhatsApp puede estar ocupado.',
        };
      }

      return {
        success: false,
        result: null,
        error: `Error al enviar mensaje: ${errorMsg}`,
      };
    }
  }
}

/**
 * WhatsApp Get Contacts Tool
 */
export class WhatsAppGetContactsTool extends BaseTool {
  private client: Client;

  constructor(client: Client) {
    super('whatsapp_get_contacts', 'Obtiene la lista de contactos de WhatsApp');
    this.client = client;
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {},
      },
    };
  }

  async execute(_args: Record<string, unknown>): Promise<ToolResult> {
    try {
      const contacts = await this.client.getContacts();

      const contactsList = contacts
        .filter((contact) => contact.isMyContact)
        .map((contact) => ({
          name: contact.name || contact.pushname || 'Sin nombre',
          number: contact.number,
          id: contact.id._serialized,
        }))
        .slice(0, 20);

      return {
        success: true,
        result: {
          total: contactsList.length,
          contacts: contactsList,
        },
      };
    } catch (error) {
      logger.error('Error getting WhatsApp contacts', error as Error);
      return {
        success: false,
        result: null,
        error: `Error al obtener contactos: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * WhatsApp Get Chats Tool
 */
export class WhatsAppGetChatsTool extends BaseTool {
  private client: Client;

  constructor(client: Client) {
    super(
      'whatsapp_get_chats',
      'Obtiene la lista de chats recientes de WhatsApp'
    );
    this.client = client;
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Número máximo de chats a devolver',
            default: 10,
          },
        },
      },
    };
  }

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    try {
      const { limit = 10 } = args as { limit?: number };

      const chats = await this.client.getChats();

      const chatsList = chats.slice(0, limit).map((chat) => ({
        name: chat.name,
        id: chat.id._serialized,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        timestamp: chat.timestamp,
      }));

      return {
        success: true,
        result: {
          total: chatsList.length,
          chats: chatsList,
        },
      };
    } catch (error) {
      logger.error('Error getting WhatsApp chats', error as Error);
      return {
        success: false,
        result: null,
        error: `Error al obtener chats: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * WhatsApp Get Messages Tool
 */
export class WhatsAppGetMessagesTool extends BaseTool {
  private client: Client;

  constructor(client: Client) {
    super(
      'whatsapp_get_messages',
      'Obtiene los mensajes de un chat específico'
    );
    this.client = client;
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID del chat (ej: 573001234567@c.us)',
          },
          limit: {
            type: 'number',
            description: 'Número de mensajes a recuperar',
            default: 10,
          },
        },
        required: ['chatId'],
      },
    };
  }

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    try {
      const { chatId, limit = 10 } = args as { chatId: string; limit?: number };

      const chat = await this.client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit });

      const messagesList = messages.map((msg) => ({
        id: msg.id._serialized,
        body: msg.body,
        from: msg.from,
        timestamp: msg.timestamp,
        fromMe: msg.fromMe,
      }));

      return {
        success: true,
        result: {
          chatId,
          total: messagesList.length,
          messages: messagesList,
        },
      };
    } catch (error) {
      logger.error('Error getting WhatsApp messages', error as Error);
      return {
        success: false,
        result: null,
        error: `Error al obtener mensajes: ${(error as Error).message}`,
      };
    }
  }
}

/**
 * WhatsApp Send Media Tool
 */
export class WhatsAppSendMediaTool extends BaseTool {
  private client: Client;

  constructor(client: Client) {
    super('whatsapp_send_media', 'Envía un archivo multimedia por WhatsApp');
    this.client = client;
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          recipient: {
            type: 'string',
            description:
              'Número de teléfono del destinatario con código de país',
          },
          mediaUrl: {
            type: 'string',
            description: 'URL del archivo multimedia',
          },
          caption: {
            type: 'string',
            description: 'Texto que acompaña el archivo (opcional)',
          },
        },
        required: ['recipient', 'mediaUrl'],
      },
    };
  }

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    try {
      const { recipient, mediaUrl, caption } = args as {
        recipient: string;
        mediaUrl: string;
        caption?: string;
      };

      const chatId = `${recipient}@c.us`;
      const { MessageMedia } = await import('whatsapp-web.js');

      const media = await MessageMedia.fromUrl(mediaUrl);
      await this.client.sendMessage(chatId, media, { caption });

      logger.info(`Media sent to ${recipient}`);

      return {
        success: true,
        result: {
          recipient,
          mediaUrl,
          caption,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('Error sending WhatsApp media', error as Error);
      return {
        success: false,
        result: null,
        error: `Error al enviar multimedia: ${(error as Error).message}`,
      };
    }
  }
}
