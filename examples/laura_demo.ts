/**
 * Ejemplo: Uso de Laura de forma programática
 * Demuestra cómo interactuar con Laura sin WhatsApp
 */

import { Agent } from '../src/core/agent';
import { CalculatorTool, NoteTool } from '../src/tools';
import { logger } from '../src/utils';

async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 DEMO: Laura (sin WhatsApp)');
    console.log('='.repeat(60) + '\n');

    // Cargar Laura desde el archivo YAML
    logger.info('Cargando Laura desde configuración YAML...');
    const laura = await Agent.fromConfig('laura');

    // Registrar herramientas básicas (sin WhatsApp)
    laura.registerTool(new CalculatorTool());
    laura.registerTool(new NoteTool());

    console.log('✅ Laura cargada correctamente\n');
    console.log(`📝 Nombre: ${laura.name}`);
    console.log(`📋 Descripción: ${laura.description}\n`);

    // Ejemplo 1: Conversación simple
    console.log('='.repeat(60));
    console.log('Ejemplo 1: Conversación Simple');
    console.log('='.repeat(60) + '\n');

    const response1 = await laura.chat('Hola Laura, ¿cómo estás?');
    console.log('👤 Usuario: Hola Laura, ¿cómo estás?');
    console.log(`🤖 Laura: ${response1}\n`);

    // Ejemplo 2: Usar calculadora
    console.log('='.repeat(60));
    console.log('Ejemplo 2: Cálculos');
    console.log('='.repeat(60) + '\n');

    const response2 = await laura.chat('Laura, ¿cuánto es 125 * 48?');
    console.log('👤 Usuario: Laura, ¿cuánto es 125 * 48?');
    console.log(`🤖 Laura: ${response2}\n`);

    // Ejemplo 3: Tomar notas
    console.log('='.repeat(60));
    console.log('Ejemplo 3: Recordatorios');
    console.log('='.repeat(60) + '\n');

    const response3 = await laura.chat(
      'Laura, recuérdame que tengo una reunión mañana a las 3 PM con el equipo de desarrollo'
    );
    console.log(
      '👤 Usuario: Laura, recuérdame que tengo una reunión mañana a las 3 PM'
    );
    console.log(`🤖 Laura: ${response3}\n`);

    // Ejemplo 4: Consultar recordatorios
    console.log('='.repeat(60));
    console.log('Ejemplo 4: Ver Recordatorios');
    console.log('='.repeat(60) + '\n');

    const response4 = await laura.chat('Laura, ¿qué recordatorios tengo?');
    console.log('👤 Usuario: Laura, ¿qué recordatorios tengo?');
    console.log(`🤖 Laura: ${response4}\n`);

    // Mostrar historial de conversación
    console.log('='.repeat(60));
    console.log('📊 Estadísticas de la Sesión');
    console.log('='.repeat(60) + '\n');

    const history = laura.getConversationHistory();
    console.log(`💬 Total de mensajes: ${history.length}`);
    console.log(`🔄 Interacciones: ${history.length / 2}\n`);

    // Mostrar memorias recientes
    const memories = await laura.getRecentMemories(5);
    console.log(`🧠 Memorias recientes: ${memories.length}`);
    memories.forEach((mem, i) => {
      console.log(`  ${i + 1}. ${mem.content.substring(0, 80)}...`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Demo completada exitosamente');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    logger.error('Error en demo', error as Error);
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main };
