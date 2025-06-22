# 🚀 Guía de Configuración - Plataforma Colaborativa de Estudio

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18+
- **Java** 17+
- **Python** 3.9+
- **PostgreSQL** 13+
- **Redis** 6+

---

## 🔑 **CONFIGURACIÓN DE API KEYS (OBLIGATORIO)**

### 1. **Google Gemini API (Para Agente de IA)**

#### Obtener API Key:

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key generada

#### Configurar en el proyecto:

```bash
cd python-agent
cp env_example.txt .env
```

Edita el archivo `.env` y añade tu API key:

```env
GOOGLE_API_KEY=tu-api-key-de-gemini-aqui
```

### 2. **Pinecone API (Para Vector Database - Opcional)**

#### Obtener API Key:

1. Ve a [Pinecone](https://www.pinecone.io/)
2. Crea una cuenta gratuita
3. Ve a "API Keys" en el dashboard
4. Copia tu API key y environment

#### Configurar:

```env
PINECONE_API_KEY=tu-api-key-de-pinecone-aqui
PINECONE_ENVIRONMENT=tu-environment-de-pinecone
PINECONE_INDEX_NAME=study-platform-index
```

---

## 🛠️ **INSTALACIÓN PASO A PASO**

### 1. **Configurar Backend (Spring Boot)**

```bash
cd api_v2

# Configurar base de datos en application.properties
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Edita `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/study_platform
spring.datasource.username=tu-usuario-postgres
spring.datasource.password=tu-password-postgres
jwt.secret=tu-jwt-secret-super-seguro
```

```bash
# Ejecutar backend
./gradlew bootRun
```

### 2. **Configurar Frontend (Next.js)**

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

Edita `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

```bash
# Ejecutar frontend
npm run dev
```

### 3. **Configurar Servidor WebSocket**

```bash
cd real-time-example

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Edita `.env`:

```env
PORT=3001
JWT_SECRET=el-mismo-jwt-secret-del-backend
REDIS_URL=redis://localhost:6379
```

```bash
# Ejecutar servidor WebSocket
npm run dev
```

### 4. **Configurar Agente Python**

```bash
cd python-agent

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (ya hecho arriba)
# Asegúrate de que .env contiene GOOGLE_API_KEY
```

```bash
# Ejecutar agente Python
python agent_v2.py
```

---

## 🧪 **VERIFICAR INSTALACIÓN**

### Ejecutar todos los tests:

```bash
# Desde el directorio raíz del proyecto
./run-tests.sh
```

### Verificar servicios individualmente:

```bash
# Backend API
curl http://localhost:8080/swagger-ui.html

# Frontend
curl http://localhost:3000

# WebSocket
curl http://localhost:3001

# Agente Python
curl http://localhost:5000/docs
```

---

## 🔧 **SOLUCIÓN DE PROBLEMAS COMUNES**

### ❌ Error: "GOOGLE_API_KEY no configurada"

**Solución:**

1. Verifica que el archivo `.env` existe en `python-agent/`
2. Verifica que contiene `GOOGLE_API_KEY=tu-api-key`
3. Reinicia el agente Python

### ❌ Error: "Connection refused" en PostgreSQL

**Solución:**

1. Asegúrate de que PostgreSQL está ejecutándose
2. Verifica las credenciales en `application.properties`
3. Crea la base de datos: `createdb study_platform`

### ❌ Error: "Redis connection failed"

**Solución:**

1. Instala Redis: `sudo apt install redis-server` (Ubuntu)
2. Inicia Redis: `sudo systemctl start redis-server`
3. Verifica: `redis-cli ping` (debe responder "PONG")

### ❌ Error: "Port already in use"

**Solución:**

1. Verifica puertos en uso: `lsof -i :puerto`
2. Mata procesos si es necesario: `kill -9 PID`
3. O cambia el puerto en la configuración

---

## 📊 **CONFIGURACIÓN DE BASE DE DATOS**

### Crear base de datos PostgreSQL:

```sql
-- Conectar como superusuario
sudo -u postgres psql

-- Crear base de datos y usuario
CREATE DATABASE study_platform;
CREATE USER study_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE study_platform TO study_user;
```

### Ejecutar migraciones:

```bash
cd api_v2
./gradlew flywayMigrate
```

---

## 🌐 **CONFIGURACIÓN DE PRODUCCIÓN**

### Variables de entorno adicionales para producción:

#### Backend:

```properties
spring.profiles.active=prod
spring.datasource.url=jdbc:postgresql://tu-servidor:5432/study_platform
server.port=8080
logging.level.com.example.api_v2=INFO
```

#### Frontend:

```env
NODE_ENV=production
NEXTAUTH_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
```

#### Agente Python:

```env
DEBUG=False
HOST=0.0.0.0
PORT=5000
LOG_LEVEL=WARNING
```

---

## 📚 **RECURSOS ADICIONALES**

- [Documentación API](http://localhost:8080/swagger-ui.html)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Spring Boot Reference](https://spring.io/projects/spring-boot)

---

## 🆘 **SOPORTE**

Si encuentras problemas:

1. **Revisa los logs** de cada servicio
2. **Verifica las configuraciones** de variables de entorno
3. **Ejecuta los tests** para identificar problemas: `./run-tests.sh`
4. **Consulta la documentación** de cada tecnología

---

## ✅ **CHECKLIST DE CONFIGURACIÓN**

- [ ] PostgreSQL instalado y ejecutándose
- [ ] Redis instalado y ejecutándose
- [ ] API Key de Google Gemini configurada
- [ ] Variables de entorno configuradas en todos los servicios
- [ ] Dependencias instaladas (npm install, pip install)
- [ ] Base de datos creada y migrada
- [ ] Todos los servicios ejecutándose sin errores
- [ ] Tests pasando: `./run-tests.sh`

¡Una vez completado este checklist, tu plataforma estará lista para usar! 🎉
