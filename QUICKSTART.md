# 🚀 Guía de Inicio Rápido

Comienza a usar el Cognitive Agent Framework en minutos.

## 📋 Pre-requisitos

- **Node.js** 18 o superior
- **npm** o **yarn**
- Cuenta de API en al menos un proveedor LLM (OpenAI, Anthropic, etc.)

## ⚡ Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Jh0n4l3x/cognitive-agent-framework.git
cd cognitive-agent-framework
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Edita `.env` y añade tus claves API:

```env
# Elige al menos un proveedor LLM
OPENAI_API_KEY=sk-tu-clave-aqui
ANTHROPIC_API_KEY=sk-ant-tu-clave-aqui

# Para modelos locales con Ollama (opcional)
OLLAMA_BASE_URL=http://localhost:11434

# Para OpenRouter (opcional)
OPENROUTER_API_KEY=sk-or-tu-clave-aqui
```

### 4. Compilar el Proyecto

```bash
npm run build
```

## 🎯 Tu Primer Agente

### Opción A: Usar un Agente Pre-configurado

Ejecuta uno de los ejemplos incluidos:

```bash
# Agente de investigación con OpenAI
npm run example:research

# Agente de gestión de tareas
npm run example:task
```

### Opción B: Crear un Agente desde Código

Crea un archivo `mi-agente.ts`:

```typescript
import { Agent } from './src/core/agent';
import { OpenAIProvider } from './src/llm/openai';
import { CalculatorTool, WebSearchTool } from './src/tools/builtin';

async function main() {
  // 1. Configurar el proveedor LLM
  const llmProvider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4',
    temperature: 0.7
  });

  // 2. Crear el agente con herramientas
  const agent = new Agent({
    name: 'Asistente Personal',
    description: 'Un asistente útil con capacidades de búsqueda y cálculo',
    llmProvider,
    systemPrompt: 'Eres un asistente personal útil y amigable.',
    tools: [
      new WebSearchTool(),
      new CalculatorTool()
    ]
  });

  // 3. Interactuar con el agente
  const respuesta = await agent.run(
    '¿Cuál es la población de España multiplicada por 2?'
  );
  
  console.log(respuesta);
}

main().catch(console.error);
```

Ejecuta tu agente:

```bash
npx ts-node mi-agente.ts
```

### Opción C: Crear un Agente con YAML

Crea `agents/mi-agente.yaml`:

```yaml
name: Mi Agente Personalizado
description: Un agente configurado mediante YAML

llm:
  provider: openai
  model: gpt-4
  temperature: 0.7
  maxTokens: 1000

systemPrompt: |
  Eres un asistente experto en programación TypeScript.
  Ayudas a los desarrolladores con código, debugging y mejores prácticas.

tools:
  - web_search
  - calculator

memory:
  enabled: true
  maxShortTermMessages: 20
```

Usa el agente desde código:

```typescript
import { loadAgentFromYAML } from './src/utils/yaml_loader';

async function main() {
  const agent = await loadAgentFromYAML('agents/mi-agente.yaml');
  const respuesta = await agent.run('¿Cómo creo una interfaz en TypeScript?');
  console.log(respuesta);
}

main().catch(console.error);
```

## 🛠️ Usar Herramientas

Las herramientas extienden las capacidades del agente:

```typescript
import { Agent } from './src/core/agent';
import { 
  WebSearchTool, 
  CalculatorTool,
  FileSystemTool,
  WeatherTool 
} from './src/tools/builtin';

const agent = new Agent({
  name: 'Super Agente',
  llmProvider,
  tools: [
    new WebSearchTool(),      // Búsqueda web
    new CalculatorTool(),     // Cálculos matemáticos
    new FileSystemTool(),     // Leer/escribir archivos
    new WeatherTool()         // Información del clima
  ]
});

// El agente elegirá automáticamente la herramienta correcta
await agent.run('¿Qué temperatura hace en Madrid?');
await agent.run('Calcula 15% de 850');
await agent.run('Busca las últimas noticias sobre IA');
```

## 💬 Integración WhatsApp (Opcional)

### 1. Configurar el Agente

Edita `agents/laura.yaml` o crea tu propio agente.

### 2. Iniciar la Integración

```bash
npm run whatsapp
```

### 3. Escanear el Código QR

1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración** > **Dispositivos vinculados**
3. Escanea el código QR que aparece en la terminal

### 4. Enviar Mensajes

Envía un mensaje al número vinculado:

```
Hola Laura, ¿cómo estás?
```

El agente responderá automáticamente.

## 🧪 Ejecutar Tests

Verifica que todo funciona correctamente:

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

## 🔍 Siguiente Pasos

### Explorar Ejemplos

```bash
# Ver todos los ejemplos disponibles
ls examples/

# Ejecutar ejemplos específicos
npm run example:research
npm run example:task
npm run demo:laura
```

### Usar el CLI Interactivo

```bash
npm run cli
```

Esto abrirá un menú interactivo para:
- Seleccionar agentes
- Configurar parámetros
- Ejecutar consultas
- Ver historial

### Crear Herramientas Personalizadas

```typescript
import { Tool } from './src/tools/base';

class MiHerramienta extends Tool {
  name = 'mi_herramienta';
  description = 'Descripción de lo que hace mi herramienta';

  async execute(input: string): Promise<string> {
    // Tu lógica aquí
    return `Resultado: ${input}`;
  }
}

// Úsala en un agente
const agent = new Agent({
  name: 'Agente con Herramienta Personalizada',
  llmProvider,
  tools: [new MiHerramienta()]
});
```

### Gestionar Memoria

```typescript
import { Agent } from './src/core/agent';

const agent = new Agent({
  name: 'Agente con Memoria',
  llmProvider,
  enableMemory: true
});

// Primera interacción
await agent.run('Mi nombre es Juan');

// Segunda interacción - el agente recuerda
await agent.run('¿Cuál es mi nombre?');
// Respuesta: "Tu nombre es Juan"
```

### Sistema de Tareas

```typescript
import { TaskQueue, Task } from './src/tasks';

const queue = new TaskQueue();

// Añadir tareas
queue.addTask(new Task({
  id: 'task-1',
  description: 'Investigar sobre TypeScript',
  priority: 1
}));

queue.addTask(new Task({
  id: 'task-2',
  description: 'Escribir documentación',
  priority: 2
}));

// Procesar tareas
while (!queue.isEmpty()) {
  const task = queue.getNextTask();
  if (task) {
    const result = await agent.run(task.description);
    console.log(result);
  }
}
```

## 📚 Recursos Adicionales

- **[README completo](README.md)** - Documentación detallada
- **[Guía de contribución](CONTRIBUTING.md)** - Cómo contribuir
- **[Ejemplos](examples/)** - Código de ejemplo
- **[API Reference]** - Documentación de API (próximamente)

## ❓ Problemas Comunes

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "API key not found"

Verifica que tu archivo `.env` existe y contiene las claves correctas:

```bash
# Ver variables de entorno cargadas
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY)"
```

### WhatsApp no conecta

1. Asegúrate de que WhatsApp Web funciona en tu navegador
2. Elimina la carpeta `.wwebjs_auth/` y vuelve a escanear el QR
3. Verifica tu conexión a internet

### Tests fallan

```bash
# Limpiar caché de Jest
npm test -- --clearCache

# Ejecutar tests específicos
npm test -- tests/tools.test.ts
```

## 💡 Consejos

- **Desarrollo**: Usa `npm run watch` para compilación automática
- **Debugging**: Activa logs detallados en `.env`: `LOG_LEVEL=debug`
- **Rendimiento**: Usa modelos más pequeños para desarrollo rápido
- **Costos**: Monitorea el uso de API con tu proveedor LLM

## 🆘 Necesitas Ayuda?

- 💬 [Discusiones](../../discussions) - Pregunta a la comunidad
- 🐛 [Issues](../../issues) - Reporta bugs
- 📖 [Wiki](../../wiki) - Documentación extendida

---

**¡Feliz codificación!** 🎉

