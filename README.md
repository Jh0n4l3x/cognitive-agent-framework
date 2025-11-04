# 🧠 Cognitive Agent Framework (CAF)


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

Un framework TypeScript moderno y extensible para crear agentes cognitivos con integración LLM, gestión de tareas, sistema de memoria y ejecución de herramientas.

## 🌟 Características

- 🤖 **Multi-Agente**: Soporte para múltiples agentes trabajando de forma independiente o colaborativa
- 🧠 **Integración LLM**: Compatible con OpenAI, Anthropic, Ollama y OpenRouter
- 📝 **Sistema de Memoria**: Memoria a corto y largo plazo para contexto persistente
- 🔧 **Herramientas Extensibles**: Sistema de herramientas personalizable con herramientas integradas
- 📋 **Gestión de Tareas**: Planificación y ejecución de tareas complejas
- 💬 **Integración WhatsApp**: Agentes conversacionales vía WhatsApp Web
- 🎯 **Sistema de Eventos**: Bus de eventos para comunicación entre agentes
- 📊 **Observabilidad**: Integración con LangSmith para trazabilidad
- ⚙️ **Configuración YAML**: Definición de agentes mediante archivos YAML

## 📦 Instalación

```bash
npm install
```

### Requisitos

- Node.js 18 o superior
- TypeScript 5.3 o superior
- Cuenta de API para al menos un proveedor LLM (OpenAI, Anthropic, etc.)

## 🚀 Inicio Rápido

### 1. Configuración de Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura tus claves API:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# LLM Provider API Keys
OPENAI_API_KEY=tu-clave-aqui
ANTHROPIC_API_KEY=tu-clave-aqui
OPENROUTER_API_KEY=tu-clave-aqui

# Ollama Configuration (local)
OLLAMA_BASE_URL=http://localhost:11434

# LangSmith (opcional)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=tu-clave-aqui
LANGCHAIN_PROJECT=cognitive-agents
```

### 2. Compilar el Proyecto

```bash
npm run build
```

### 3. Ejecutar un Ejemplo

```bash
# Agente de investigación
npm run example:research

# Agente de tareas
npm run example:task

# Demo de Laura (WhatsApp)
npm run demo:laura
```

## 📚 Uso

### Crear un Agente Simple

```typescript
import { Agent } from './src/core/agent';
import { OpenAIProvider } from './src/llm/openai';

const llmProvider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4'
});

const agent = new Agent({
  name: 'Assistant',
  description: 'Un asistente útil',
  llmProvider,
  systemPrompt: 'Eres un asistente útil y amigable.',
  tools: []
});

const response = await agent.run('¿Cuál es la capital de Francia?');
console.log(response);
```

### Definir Agentes con YAML

Crea un archivo `agents/mi-agente.yaml`:

```yaml
name: Mi Agente
description: Un agente personalizado
llm:
  provider: openai
  model: gpt-4
  temperature: 0.7
systemPrompt: |
  Eres un agente especializado en...
tools:
  - web_search
  - calculator
memory:
  enabled: true
  maxShortTermMessages: 20
```

Carga el agente:

```typescript
import { loadAgentFromYAML } from './src/utils/yaml_loader';

const agent = await loadAgentFromYAML('agents/mi-agente.yaml');
const response = await agent.run('Tu consulta aquí');
```

### Usar Herramientas

```typescript
import { Agent } from './src/core/agent';
import { WebSearchTool, CalculatorTool } from './src/tools/builtin';

const agent = new Agent({
  name: 'Research Assistant',
  llmProvider,
  tools: [
    new WebSearchTool(),
    new CalculatorTool()
  ]
});

const response = await agent.run(
  '¿Cuánto es el PIB de España en 2024 multiplicado por 1.5?'
);
```

### Integración WhatsApp

```typescript
import { WhatsAppIntegration } from './src/integrations/whatsapp';

const whatsapp = new WhatsAppIntegration({
  agentsDir: './agents',
  defaultAgent: 'laura'
});

await whatsapp.initialize();
```

## 🏗️ Arquitectura

```
cognitive-agent-framework/
├── src/
│   ├── core/           # Núcleo del framework (Agent)
│   ├── llm/            # Proveedores LLM (OpenAI, Anthropic, Ollama, OpenRouter)
│   ├── memory/         # Sistema de memoria (corto/largo plazo)
│   ├── tasks/          # Gestión de tareas y planificación
│   ├── tools/          # Herramientas del sistema
│   ├── events/         # Sistema de eventos
│   ├── integrations/   # Integraciones (WhatsApp)
│   ├── types/          # Tipos TypeScript
│   └── utils/          # Utilidades
├── agents/             # Configuraciones YAML de agentes
├── examples/           # Ejemplos de uso
└── tests/              # Tests unitarios
```

## 🔧 Herramientas Disponibles

- **WebSearchTool**: Búsqueda web usando DuckDuckGo
- **CalculatorTool**: Evaluación de expresiones matemáticas
- **FileSystemTool**: Lectura/escritura de archivos
- **WeatherTool**: Información meteorológica
- **WhatsAppTools**: Envío de mensajes y gestión de grupos

## 📖 Scripts Disponibles

```bash
# Desarrollo
npm run build          # Compilar TypeScript
npm run watch          # Compilar en modo watch
npm run dev            # Ejecutar en modo desarrollo

# Testing
npm run test           # Ejecutar tests
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Cobertura de tests

# Calidad de Código
npm run lint           # Verificar código
npm run lint:fix       # Corregir problemas automáticamente
npm run format         # Formatear código
npm run format:check   # Verificar formato

# Ejemplos
npm run example:research  # Ejecutar agente de investigación
npm run example:task      # Ejecutar agente de tareas
npm run demo:laura        # Ejecutar demo de WhatsApp

# CLI
npm run cli            # Interfaz de línea de comandos
npm run agent          # Ejecutar agente interactivo
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue los estándares de código TypeScript
- Ejecuta `npm run lint` y `npm run format` antes de hacer commit
- Añade tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [LangChain](https://www.langchain.com/) - Framework de referencia
- [OpenAI](https://openai.com/) - Modelos GPT
- [Anthropic](https://www.anthropic.com/) - Claude
- [Ollama](https://ollama.ai/) - Modelos locales
- [whatsapp-web.js](https://wwebjs.dev/) - Integración WhatsApp

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

- 🐛 [Reportar un bug](../../issues)
- 💡 [Solicitar una característica](../../issues)
- 💬 [Discusiones](../../discussions)

## 🗺️ Roadmap

- [ ] Soporte para más proveedores LLM
- [ ] Herramientas de integración con bases de datos
- [ ] Panel de control web
- [ ] Modo multi-agente con coordinación
- [ ] Soporte para embeddings y búsqueda semántica
- [ ] Plugins de terceros
- [ ] Documentación interactiva

---

**Desarrollado con ❤️ usando TypeScript**
