# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Cognitive Agent Framework (CAF)! Este documento proporciona pautas para contribuir al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas un ambiente respetuoso y acogedor para todos.

### Nuestro Compromiso

- Usar lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas con gracia
- Enfocarse en lo mejor para la comunidad
- Mostrar empatía hacia otros miembros

## 🎯 ¿Cómo puedo contribuir?

### Reportar Bugs

Antes de reportar un bug:

1. **Verifica** que el problema no haya sido reportado antes
2. **Asegúrate** de estar usando la última versión
3. **Recopila** información sobre el bug

Cuando reportes un bug, incluye:

- Descripción clara y descriptiva
- Pasos exactos para reproducir el problema
- Comportamiento esperado vs. actual
- Capturas de pantalla (si aplica)
- Versión de Node.js y del framework
- Sistema operativo

### Sugerir Mejoras

Las sugerencias de mejora son bienvenidas. Incluye:

- Descripción clara de la mejora
- Explicación de por qué sería útil
- Posibles implementaciones
- Ejemplos de uso

### Pull Requests

Las pull requests son la mejor forma de proponer cambios:

1. Fork el repositorio
2. Crea una rama desde `main`
3. Haz tus cambios
4. Asegúrate de que los tests pasen
5. Envía el pull request

## 🛠️ Proceso de Desarrollo

### Configuración del Entorno

1. **Fork y clona** el repositorio:
   ```bash
   git clone https://github.com/Jh0n4l3x/cognitive-agent-framework.git
   cd cognitive-agent-framework
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
   ```bash
   cp .env.example .env
   # Edita .env con tus claves API
   ```

4. **Compila el proyecto**:
   ```bash
   npm run build
   ```

### Flujo de Trabajo

1. **Crea una rama** para tu feature o bugfix:
   ```bash
   git checkout -b feature/mi-nueva-feature
   # o
   git checkout -b fix/bug-especifico
   ```

2. **Haz tus cambios** siguiendo los estándares de código

3. **Ejecuta los tests**:
   ```bash
   npm run test
   npm run lint
   npm run format:check
   ```

4. **Commit tus cambios** con mensajes descriptivos:
   ```bash
   git commit -m "feat: añade nueva funcionalidad X"
   ```

### Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactorización de código
- `test:` Añadir o modificar tests
- `chore:` Mantenimiento general

Ejemplos:
```
feat: añade soporte para modelo GPT-4 Turbo
fix: corrige pérdida de memoria en agente
docs: actualiza guía de instalación
refactor: mejora estructura de herramientas
test: añade tests para sistema de eventos
```

## 📏 Estándares de Código

### TypeScript

- Usa **TypeScript estricto** con tipos explícitos
- Evita `any`, usa tipos específicos o `unknown`
- Documenta funciones públicas con JSDoc
- Mantén funciones pequeñas y enfocadas

### Estilo de Código

Seguimos estas convenciones:

```typescript
// ✅ Bueno
interface AgentConfig {
  name: string;
  description: string;
  llmProvider: LLMProvider;
}

class MyAgent extends Agent {
  private readonly config: AgentConfig;

  constructor(config: AgentConfig) {
    super(config);
    this.config = config;
  }

  async processTask(task: Task): Promise<Result> {
    // Implementación
  }
}

// ❌ Malo
class myagent {
  config: any;
  
  ProcessTask(task) {
    // Sin tipos, sin async/await
  }
}
```

### Linting y Formato

- **ESLint**: Para análisis estático
  ```bash
  npm run lint
  npm run lint:fix
  ```

- **Prettier**: Para formato consistente
  ```bash
  npm run format
  npm run format:check
  ```

### Tests

- Escribe tests para nuevas funcionalidades
- Mantén cobertura de tests > 80%
- Usa nombres descriptivos para tests

```typescript
describe('Agent', () => {
  describe('run', () => {
    it('should execute task and return result', async () => {
      const agent = new Agent(config);
      const result = await agent.run('test query');
      expect(result).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const agent = new Agent(config);
      await expect(agent.run('')).rejects.toThrow();
    });
  });
});
```

### Documentación

- Documenta todas las APIs públicas
- Usa JSDoc para funciones y clases
- Actualiza README.md si es necesario
- Añade ejemplos de uso

```typescript
/**
 * Ejecuta una tarea en el agente
 * 
 * @param query - La consulta o tarea a ejecutar
 * @param options - Opciones adicionales de ejecución
 * @returns Promesa con el resultado de la ejecución
 * @throws {AgentError} Si la ejecución falla
 * 
 * @example
 * ```typescript
 * const result = await agent.run('¿Cuál es la capital de Francia?');
 * console.log(result);
 * ```
 */
async run(query: string, options?: RunOptions): Promise<string> {
  // Implementación
}
```

## 🔄 Proceso de Pull Request

### Antes de Enviar

1. ✅ Los tests pasan (`npm run test`)
2. ✅ El código pasa el linting (`npm run lint`)
3. ✅ El código está formateado (`npm run format`)
4. ✅ Has añadido tests para nuevas funcionalidades
5. ✅ Has actualizado la documentación
6. ✅ Has seguido las convenciones de commits

### Plantilla de PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que añade funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentación

## Checklist
- [ ] Tests pasan localmente
- [ ] Código sigue estándares del proyecto
- [ ] Documentación actualizada
- [ ] Sin warnings de linting
- [ ] Commits siguen convenciones

## Tests
Describe los tests que has añadido/modificado

## Capturas (si aplica)
```

### Revisión de Código

- Se requiere al menos una aprobación
- Todos los comentarios deben ser resueltos
- Tests de CI deben pasar
- Sin conflictos con `main`

## 🐛 Reportar Bugs

### Plantilla de Issue para Bugs

```markdown
**Descripción del Bug**
Descripción clara y concisa del bug

**Pasos para Reproducir**
1. Ir a '...'
2. Ejecutar '...'
3. Ver error

**Comportamiento Esperado**
Qué esperabas que pasara

**Comportamiento Actual**
Qué pasó en realidad

**Capturas de Pantalla**
Si aplica, añade capturas

**Entorno:**
- OS: [e.g. Windows 11]
- Node.js: [e.g. 18.17.0]
- TypeScript: [e.g. 5.3.3]
- Versión del Framework: [e.g. 1.0.0]

**Contexto Adicional**
Cualquier otra información relevante
```

## 💡 Sugerir Mejoras

### Plantilla de Issue para Features

```markdown
**¿Tu feature request está relacionada con un problema?**
Descripción clara del problema

**Solución Propuesta**
Descripción de lo que quieres que suceda

**Alternativas Consideradas**
Otras soluciones que has considerado

**Contexto Adicional**
Información adicional, capturas, etc.
```

## 🏷️ Áreas de Contribución

Buscamos ayuda especialmente en:

- 🔧 **Nuevas Herramientas**: Integración con APIs y servicios
- 🤖 **Proveedores LLM**: Soporte para nuevos modelos
- 📱 **Integraciones**: Telegram, Slack, Discord, etc.
- 📚 **Documentación**: Ejemplos, tutoriales, guías
- 🧪 **Tests**: Mejorar cobertura y casos edge
- 🐛 **Bug Fixes**: Correcciones y mejoras de estabilidad
- ⚡ **Rendimiento**: Optimizaciones y mejoras
- 🌍 **i18n**: Internacionalización

## 📞 ¿Necesitas Ayuda?

- 💬 [Discusiones en GitHub](../../discussions)
- 🐛 [Issues](../../issues)
- 📧 Contacta a los mantenedores

## 🙏 Reconocimientos

Todos los contribuidores serán reconocidos en el README.md y en las release notes.

---

**¡Gracias por contribuir al Cognitive Agent Framework!** 🎉
