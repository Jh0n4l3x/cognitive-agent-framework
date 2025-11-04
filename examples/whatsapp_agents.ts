/**
 * Ejemplo: Usar diferentes agentes con WhatsApp
 *
 * Este archivo muestra cómo configurar la integración de WhatsApp
 * con diferentes agentes del sistema.
 */

import { WhatsAppManager } from '../src/integrations/whatsapp';

/**
 * Ejemplo 1: Usar Laura (agente por defecto)
 */
async function usarLaura() {
  const whatsapp = new WhatsAppManager({
    agentName: 'laura',
    clientId: 'laura-whatsapp',
    autoRespondGroups: false,
    triggers: ['laura', 'bot', 'asistente'],
  });

  await whatsapp.start();
  return whatsapp;
}

/**
 * Ejemplo 2: Usar Andrea (agente de desarrollo)
 */
async function usarAndrea() {
  const whatsapp = new WhatsAppManager({
    agentName: 'andrea',
    clientId: 'andrea-whatsapp',
    autoRespondGroups: false,
    triggers: ['andrea', 'developer', 'dev'],
  });

  await whatsapp.start();
  return whatsapp;
}

/**
 * Ejemplo 3: Usar Research Agent
 */
async function usarResearchAgent() {
  const whatsapp = new WhatsAppManager({
    agentName: 'research_agent',
    clientId: 'research-whatsapp',
    autoRespondGroups: true, // Responder en grupos también
    triggers: ['research', 'investigación', 'buscar'],
  });

  await whatsapp.start();
  return whatsapp;
}

/**
 * Función principal
 */
async function main() {
  console.log('\n🤖 Ejemplo: Integración WhatsApp con Agentes\n');
  console.log('Elige qué agente usar:');
  console.log('1. Laura (Asistente personal)');
  console.log('2. Andrea (Desarrollador)');
  console.log('3. Research Agent (Investigación)');
  console.log('\nPor defecto se usará Laura...\n');

  // Usar Laura por defecto
  // Puedes cambiar esto a usarAndrea() o usarResearchAgent()
  const whatsapp = await usarLaura();

  // Manejar señales de terminación
  process.on('SIGINT', async () => {
    await whatsapp.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await whatsapp.stop();
    process.exit(0);
  });
}

// Ejecutar
if (require.main === module) {
  main().catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
}

export { usarLaura, usarAndrea, usarResearchAgent };
