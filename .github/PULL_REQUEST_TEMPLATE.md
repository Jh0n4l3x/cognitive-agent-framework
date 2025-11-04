name: Pull Request
description: Contribuir código al proyecto
title: "[PR]: "
labels: ["needs-review"]

body:
  - type: markdown
    attributes:
      value: |
        ¡Gracias por contribuir! 
        Por favor completa la información a continuación para ayudarnos a revisar tu PR más eficientemente.

  - type: dropdown
    id: pr-type
    attributes:
      label: Tipo de PR
      description: ¿Qué tipo de cambio estás haciendo?
      multiple: true
      options:
        - Bug fix
        - Nueva funcionalidad
        - Breaking change
        - Mejora de rendimiento
        - Refactoring
        - Documentación
        - Tests
        - Build/CI
        - Otro
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Descripción
      description: Describe tus cambios en detalle
      placeholder: |
        Este PR añade/corrige/mejora...
        
        Los cambios incluyen:
        - Cambio 1
        - Cambio 2
    validations:
      required: true

  - type: textarea
    id: motivation
    attributes:
      label: Motivación y Contexto
      description: ¿Por qué es necesario este cambio? ¿Qué problema resuelve?
      placeholder: |
        Este cambio es necesario porque...
        Resuelve el issue #...
    validations:
      required: true

  - type: textarea
    id: changes
    attributes:
      label: Cambios Realizados
      description: Lista detallada de los cambios
      placeholder: |
        - Añadido: ...
        - Modificado: ...
        - Eliminado: ...
    validations:
      required: true

  - type: checkboxes
    id: checklist
    attributes:
      label: Checklist
      description: Por favor marca todas las opciones que apliquen
      options:
        - label: Mi código sigue los estándares del proyecto
          required: true
        - label: He realizado una auto-revisión de mi código
          required: true
        - label: He comentado mi código, particularmente en áreas complejas
          required: true
        - label: He actualizado la documentación según sea necesario
          required: true
        - label: Mis cambios no generan nuevos warnings
          required: true
        - label: He añadido tests que prueban que mi fix funciona o que mi funcionalidad funciona
          required: false
        - label: Los tests nuevos y existentes pasan localmente
          required: true
        - label: He ejecutado `npm run lint` sin errores
          required: true
        - label: He ejecutado `npm run format` en mi código
          required: true

  - type: textarea
    id: testing
    attributes:
      label: ¿Cómo se ha probado?
      description: Describe los tests que ejecutaste para verificar tus cambios
      placeholder: |
        - Test A: ...
        - Test B: ...
        
        Comandos ejecutados:
        ```bash
        npm run test
        npm run lint
        ```
    validations:
      required: true

  - type: textarea
    id: test-config
    attributes:
      label: Configuración de Testing
      description: Describe la configuración de pruebas
      placeholder: |
        - Sistema operativo: Windows/macOS/Linux
        - Node.js: v18.17.0
        - Proveedor LLM usado: OpenAI/Anthropic/Ollama
        - Modelo: gpt-4/claude-3-sonnet

  - type: checkboxes
    id: breaking-changes
    attributes:
      label: Cambios Breaking
      description: ¿Este PR introduce cambios breaking?
      options:
        - label: Sí, este PR introduce cambios breaking
        - label: No, este PR es totalmente compatible con versiones anteriores

  - type: textarea
    id: breaking-description
    attributes:
      label: Descripción de Cambios Breaking
      description: Si marcaste que hay cambios breaking, descríbelos aquí
      placeholder: |
        Los siguientes cambios breaking fueron introducidos:
        - Cambio 1: ...
        - Cambio 2: ...
        
        Guía de migración:
        - Paso 1: ...
        - Paso 2: ...

  - type: textarea
    id: dependencies
    attributes:
      label: Dependencias
      description: ¿Añade, actualiza o elimina alguna dependencia?
      placeholder: |
        - Añadidas: package@version
        - Actualizadas: package (v1.0.0 -> v2.0.0)
        - Eliminadas: old-package

  - type: dropdown
    id: area
    attributes:
      label: Área Afectada
      description: ¿Qué áreas del código afecta este PR?
      multiple: true
      options:
        - Core (Agent)
        - LLM Providers
        - Memory System
        - Task Management
        - Tools System
        - Integrations
        - Events
        - CLI
        - Tests
        - Documentation
        - Build/CI
        - Otro
    validations:
      required: true

  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots (si aplica)
      description: Añade screenshots para ayudar a explicar tus cambios

  - type: textarea
    id: performance
    attributes:
      label: Impacto en Rendimiento
      description: ¿Este cambio afecta el rendimiento?
      placeholder: |
        - Mejora el rendimiento en X%
        - No hay impacto en rendimiento
        - Puede afectar rendimiento en caso Y

  - type: checkboxes
    id: documentation
    attributes:
      label: Documentación
      description: ¿Qué documentación fue actualizada?
      options:
        - label: README.md
        - label: CONTRIBUTING.md
        - label: API documentation (JSDoc)
        - label: Code comments
        - label: Examples
        - label: CHANGELOG.md
        - label: No se requirió actualización de documentación

  - type: textarea
    id: related-issues
    attributes:
      label: Issues Relacionados
      description: Lista de issues relacionados
      placeholder: |
        Closes #123
        Related to #456
        Part of #789

  - type: textarea
    id: additional-notes
    attributes:
      label: Notas Adicionales
      description: Cualquier otra información relevante para los revisores
      placeholder: |
        - Nota 1
        - Nota 2
        - Áreas que necesitan especial atención

  - type: checkboxes
    id: review-areas
    attributes:
      label: Áreas que Necesitan Revisión Especial
      description: ¿Hay áreas específicas donde quieres feedback?
      options:
        - label: Arquitectura/Diseño
        - label: Rendimiento
        - label: Seguridad
        - label: Testing
        - label: Documentación
        - label: Manejo de errores
        - label: Nombres de variables/funciones
        - label: Todo el código necesita revisión general
