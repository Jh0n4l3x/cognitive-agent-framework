# 📋 Instalación Detallada

Guía completa de instalación del Cognitive Agent Framework para diferentes escenarios.

## 📑 Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación Básica](#instalación-básica)
- [Configuración de Proveedores LLM](#configuración-de-proveedores-llm)
- [Configuración Avanzada](#configuración-avanzada)
- [Instalación con Docker](#instalación-con-docker)
- [Troubleshooting](#troubleshooting)

## 💻 Requisitos del Sistema

### Requisitos Mínimos

- **Node.js**: 18.0.0 o superior
- **npm**: 9.0.0 o superior (incluido con Node.js)
- **RAM**: 2 GB mínimo
- **Espacio en Disco**: 500 MB para dependencias

### Requisitos Recomendados

- **Node.js**: 20.x LTS
- **npm**: 10.x
- **RAM**: 4 GB o más
- **Espacio en Disco**: 1 GB

### Sistemas Operativos Soportados

- ✅ Windows 10/11
- ✅ macOS 12.0 (Monterey) o superior
- ✅ Ubuntu 20.04 LTS o superior
- ✅ Debian 11 o superior
- ✅ Fedora 36 o superior
- ✅ WSL2 (Windows Subsystem for Linux)

## 🚀 Instalación Básica

### 1. Instalar Node.js

#### Windows

Descarga el instalador desde [nodejs.org](https://nodejs.org/)

```powershell
# Verificar instalación
node --version
npm --version
```

#### macOS

Usando Homebrew:

```bash
brew install node@20
```

O descarga desde [nodejs.org](https://nodejs.org/)

#### Linux (Ubuntu/Debian)

```bash
# Usando NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

#### Linux (Fedora)

```bash
sudo dnf install nodejs npm
```

### 2. Clonar el Repositorio

```bash
# HTTPS
git clone https://github.com/Jh0n4l3x/cognitive-agent-framework.git

# SSH
git clone git@github.com:Jh0n4l3x/cognitive-agent-framework.git

# Entrar al directorio
cd cognitive-agent-framework
```

### 3. Instalar Dependencias

```bash
# Usando npm (recomendado)
npm install

# O usando yarn
yarn install

# O usando pnpm
pnpm install
```

### 4. Compilar el Proyecto

```bash
npm run build
```

## 🔑 Configuración de Proveedores LLM

### Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

### OpenAI

1. Crea una cuenta en [OpenAI](https://platform.openai.com/)
2. Ve a [API Keys](https://platform.openai.com/api-keys)
3. Genera una nueva clave API
4. Añade a tu `.env`:

```env
OPENAI_API_KEY=sk-proj-tu-clave-aqui
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4
```

**Modelos disponibles:**
- `gpt-4` - Más capaz, más caro
- `gpt-4-turbo` - Rápido y económico
- `gpt-3.5-turbo` - Más económico

### Anthropic (Claude)

1. Crea una cuenta en [Anthropic](https://console.anthropic.com/)
2. Ve a [API Keys](https://console.anthropic.com/settings/keys)
3. Genera una nueva clave
4. Añade a tu `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-tu-clave-aqui
DEFAULT_LLM_PROVIDER=anthropic
DEFAULT_MODEL=claude-3-5-sonnet-20241022
```

**Modelos disponibles:**
- `claude-3-5-sonnet-20241022` - Más avanzado
- `claude-3-opus-20240229` - Máxima capacidad
- `claude-3-sonnet-20240229` - Balance calidad/precio

### Ollama (Local)

1. Instala Ollama desde [ollama.ai](https://ollama.ai/)
2. Descarga un modelo:

```bash
ollama pull llama2
ollama pull mistral
ollama pull codellama
```

3. Configura en `.env`:

```env
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_LLM_PROVIDER=ollama
DEFAULT_MODEL=llama2
```

### OpenRouter

1. Crea una cuenta en [OpenRouter](https://openrouter.ai/)
2. Ve a [Settings](https://openrouter.ai/settings/keys)
3. Genera una clave API
4. Añade a tu `.env`:

```env
OPENROUTER_API_KEY=sk-or-tu-clave-aqui
DEFAULT_LLM_PROVIDER=openrouter
DEFAULT_MODEL=openai/gpt-4
```

## ⚙️ Configuración Avanzada

### LangSmith (Observabilidad)

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=tu-clave-langsmith
LANGCHAIN_PROJECT=mi-proyecto
```

### Logging

```env
LOG_LEVEL=debug  # debug | info | warn | error
LOG_FILE=logs/agent.log
```

### Memory Configuration

```env
MEMORY_STORAGE_PATH=./memory_storage
MAX_MEMORY_ITEMS=100
```

### Performance Tuning

```env
DEFAULT_MAX_TOKENS=4096
DEFAULT_TEMPERATURE=0.7
TASK_TIMEOUT=300000
MAX_TASK_RETRIES=3
```

## 🐳 Instalación con Docker

### Dockerfile

Crea un `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

Crea `docker-compose.yml`:

```yaml
version: '3.8'

services:
  agent-framework:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./memory_storage:/app/memory_storage
      - ./logs:/app/logs
    restart: unless-stopped
```

### Ejecutar con Docker

```bash
# Construir imagen
docker build -t cognitive-agent-framework .

# Ejecutar contenedor
docker run -d \
  --name caf \
  -e OPENAI_API_KEY=tu-clave \
  -v $(pwd)/memory_storage:/app/memory_storage \
  cognitive-agent-framework

# Con Docker Compose
docker-compose up -d
```

## 🔧 Troubleshooting

### Error: "Cannot find module"

```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Permission denied"

```bash
# Linux/macOS - Arreglar permisos
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Error: "ENOSPC: System limit for number of file watchers reached"

```bash
# Linux - Aumentar límite de watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Error: Build falla en Windows

```powershell
# Instalar build tools
npm install --global windows-build-tools

# O usar Visual Studio Build Tools
# Descargar desde: https://visualstudio.microsoft.com/downloads/
```

### WhatsApp no conecta

```bash
# Limpiar sesión anterior
rm -rf .wwebjs_auth .wwebjs_cache

# Reintentar
npm run whatsapp
```

### Tests fallan

```bash
# Limpiar caché de Jest
npm test -- --clearCache

# Ejecutar con verbose
npm test -- --verbose

# Ejecutar tests específicos
npm test -- tests/tools.test.ts
```

### High Memory Usage

```env
# Limitar uso de memoria de Node.js
NODE_OPTIONS=--max-old-space-size=2048
```

### Problemas con TypeScript

```bash
# Limpiar build anterior
rm -rf dist

# Recompilar
npm run build

# Verificar configuración
npx tsc --showConfig
```

## 📊 Verificación de Instalación

Ejecuta este script para verificar tu instalación:

```bash
npm test
npm run lint
npm run build
```

Todo debería pasar sin errores.

## 🔄 Actualización

```bash
# Hacer pull de cambios
git pull origin main

# Reinstalar dependencias
npm install

# Recompilar
npm run build

# Verificar
npm test
```

## 🆘 Obtener Ayuda

Si tienes problemas:

1. 📖 Revisa la [documentación](README.md)
2. 🔍 Busca en [issues existentes](../../issues)
3. 💬 Pregunta en [discusiones](../../discussions)
4. 🐛 Abre un [nuevo issue](../../issues/new)

---

**¡Feliz instalación!** 🎉
