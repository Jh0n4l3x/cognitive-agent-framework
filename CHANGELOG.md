# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Por Hacer
- Soporte para más proveedores LLM
- Panel de control web
- Modo multi-agente con coordinación
- Soporte para embeddings y búsqueda semántica
- Plugins de terceros

## [1.0.0] - 2025-11-03

### Añadido

#### Core Framework
- Sistema base de agentes con clase `Agent`
- Bus de eventos para comunicación entre componentes
- Sistema de errores personalizado con tipos específicos
- Logger configurable con Winston
- Carga de configuración desde archivos YAML

#### Proveedores LLM
- Integración con OpenAI (GPT-3.5, GPT-4)
- Integración con Anthropic (Claude)
- Integración con Ollama (modelos locales)
- Integración con OpenRouter (acceso a múltiples modelos)
- Sistema base extensible para nuevos proveedores

#### Sistema de Memoria
- Memoria a corto plazo (Short-term Memory)
- Memoria a largo plazo (Long-term Memory)
- Almacenamiento persistente en archivos JSON
- Gestión automática de contexto y límites

#### Gestión de Tareas
- Sistema de colas de tareas con prioridades
- Planificador de tareas con descomposición
- Estados de tareas (pending, running, completed, failed)
- Ejecución paralela y secuencial de tareas

#### Herramientas
- Sistema base de herramientas extensible
- `WebSearchTool` - Búsqueda web con DuckDuckGo
- `CalculatorTool` - Evaluación de expresiones matemáticas
- `FileSystemTool` - Operaciones de lectura/escritura
- `WeatherTool` - Información meteorológica
- Herramientas específicas para WhatsApp

#### Integraciones
- Integración completa con WhatsApp Web (whatsapp-web.js)
- Soporte para múltiples agentes en WhatsApp
- Gestión de sesiones y autenticación
- Comandos especiales y gestión de grupos

#### CLI y Utilidades
- Interfaz de línea de comandos interactiva
- Utilidades de configuración y helpers
- Integración con LangSmith para observabilidad
- Cargador de agentes desde YAML

#### Ejemplos y Documentación
- Ejemplo de agente de investigación
- Ejemplo de agente de tareas
- Demo de integración WhatsApp
- Configuraciones YAML de agentes de ejemplo
- Tests unitarios para componentes principales

#### Configuración del Proyecto
- Configuración TypeScript con modo estricto
- ESLint y Prettier para calidad de código
- Jest para testing
- Scripts npm para desarrollo y producción
- Configuración de tareas VS Code

### Características Técnicas
- TypeScript 5.3+ con tipos estrictos
- Soporte para Node.js 18+
- Sistema de módulos ES6
- Async/await en toda la codebase
- Manejo robusto de errores
- Logging estructurado

### Documentación
- README completo con guías de uso
- Ejemplos de código
- Configuraciones de ejemplo
- Comentarios JSDoc en APIs públicas

### Desarrollo
- Configuración completa de desarrollo
- Hot reload con ts-node
- Watch mode para desarrollo
- Testing automatizado
- Linting y formato automático

## [0.1.0] - 2025-10-15

### Añadido
- Estructura inicial del proyecto
- Configuración básica de TypeScript
- Primeras implementaciones de agentes
- Integración básica con OpenAI

---

## Tipos de Cambios

- **Añadido**: para nuevas funcionalidades
- **Cambiado**: para cambios en funcionalidad existente
- **Obsoleto**: para funcionalidades que serán eliminadas
- **Eliminado**: para funcionalidades eliminadas
- **Corregido**: para corrección de bugs
- **Seguridad**: para vulnerabilidades de seguridad

## Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/lang/es/):

- **MAJOR** (X.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.X.0): Nuevas funcionalidades compatibles con versiones anteriores
- **PATCH** (0.0.X): Correcciones de bugs compatibles con versiones anteriores

[Unreleased]: https://github.com/Jh0n4l3x/cognitive-agent-framework/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Jh0n4l3x/cognitive-agent-framework/releases/tag/v1.0.0
[0.1.0]: https://github.com/Jh0n4l3x/cognitive-agent-framework/releases/tag/v0.1.0
