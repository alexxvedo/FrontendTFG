# 🎓 Plataforma Colaborativa de Estudio con IA

## 📋 Descripción del Proyecto

Plataforma web colaborativa para el estudio asistido por inteligencia artificial, desarrollada como Trabajo de Fin de Grado. La aplicación permite a los usuarios crear espacios de trabajo colaborativos, gestionar materiales de estudio, generar flashcards automáticamente, y colaborar en tiempo real en notas y documentos.

### ✨ Características Principales

- 🤖 **Asistente de IA**: Generación automática de flashcards, resúmenes y preguntas
- 👥 **Colaboración en Tiempo Real**: Edición colaborativa de notas con sincronización de cursores
- 📚 **Gestión de Colecciones**: Organización de materiales de estudio por temas
- 🃏 **Sistema de Flashcards**: Aprendizaje con repetición espaciada
- 📄 **Procesamiento de Documentos**: Carga y análisis de PDFs, DOCX, TXT
- 🏢 **Workspaces Colaborativos**: Espacios compartidos para equipos de estudio
- 📊 **Estadísticas de Progreso**: Seguimiento del rendimiento de aprendizaje
- 🔒 **Autenticación Segura**: Sistema de autenticación con JWT

## 🏗️ Arquitectura del Sistema

### Frontend (Next.js 15)

```
frontend/
├── app/                    # App Router de Next.js 15
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades y configuraciones
├── hooks/                 # Custom hooks
└── styles/               # Estilos globales y CSS modules
```

### Backend API (Spring Boot 3.4)

```
api_v2/
├── src/main/java/com/example/api_v2/
│   ├── controller/        # Controladores REST
│   ├── service/           # Lógica de negocio
│   ├── repository/        # Acceso a datos (JPA)
│   ├── model/             # Entidades del dominio
│   ├── dto/               # Data Transfer Objects
│   ├── config/            # Configuraciones
│   └── security/          # Seguridad y autenticación
└── src/test/              # Tests unitarios e integración
```

### Servidor WebSocket (Node.js)

```
real-time-example/
├── src/
│   ├── modules/           # Módulos funcionales
│   ├── middleware/        # Middleware de autenticación
│   ├── services/          # Servicios (Redis, métricas)
│   └── utils/             # Utilidades
└── test/                  # Tests del servidor WebSocket
```

### Agente Python (IA)

```
python-agent/
├── agent_v2.py           # Lógica principal del agente
├── agent_functions.py    # Funciones específicas de IA
└── test_agent.py         # Tests del agente
```

## 🚀 Instalación y Configuración

> **📋 IMPORTANTE**: Para una guía de configuración completa y detallada, consulta [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### ⚡ Configuración Rápida

#### Prerrequisitos

- Node.js 18+, Java 17+, Python 3.9+, PostgreSQL 13+, Redis 6+

#### 🔑 **API Keys Requeridas:**

1. **Google Gemini API** (Obligatoria para IA): [Obtener aquí](https://makersuite.google.com/app/apikey)

> **Nota**: El proyecto usa PostgreSQL con pgvector para embeddings vectoriales (no requiere APIs externas adicionales)

#### 📦 Instalación:

```bash
# 1. Configurar Agente Python (PRIMERO - Requiere API key)
cd python-agent
cp env_example.txt .env
# Editar .env y añadir: GOOGLE_API_KEY=tu-api-key
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 2. Backend
cd ../api_v2
./gradlew bootRun

# 3. Frontend
cd ../frontend
npm install && npm run dev

# 4. WebSocket
cd ../real-time-example
npm install && npm run dev

# 5. Verificar instalación
cd .. && ./run-tests.sh
```

> **⚠️ Sin la API key de Google Gemini, las funciones de IA no funcionarán.**  
> Ver [SETUP_GUIDE.md](./SETUP_GUIDE.md) para instrucciones detalladas.

## 📚 Documentación de APIs

### API REST Principal

La documentación completa de la API está disponible en Swagger UI:

- **URL**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Spec**: `http://localhost:8080/v3/api-docs`

#### Endpoints Principales

##### Autenticación

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

##### Workspaces

```http
GET    /api/workspaces
POST   /api/workspaces
PUT    /api/workspaces/{id}
DELETE /api/workspaces/{id}
```

##### Colecciones

```http
GET    /api/workspaces/{workspaceId}/collections
POST   /api/workspaces/{workspaceId}/collections/user/{email}
PUT    /api/workspaces/{workspaceId}/collections/{collectionId}
DELETE /api/workspaces/{workspaceId}/collections/{collectionId}
```

##### Flashcards

```http
GET    /api/collections/{collectionId}/flashcards
POST   /api/collections/{collectionId}/flashcards
PUT    /api/flashcards/{id}
DELETE /api/flashcards/{id}
```

##### Documentos

```http
POST   /api/collections/{collectionId}/documents/upload
GET    /api/documents/{id}
DELETE /api/documents/{id}
```

### API del Agente Python

```http
POST   /generate-flashcards
POST   /generate-questions
POST   /generate-summary
POST   /answer-question
POST   /process-document
```

### WebSocket Events

#### Autenticación

```javascript
socket.auth = { token: "jwt-token" };
```

#### Chat en Tiempo Real

```javascript
// Unirse a workspace
socket.emit("join-workspace", workspaceId);

// Enviar mensaje
socket.emit("send-message", {
  content: "Mensaje",
  workspaceId: "workspace-123",
});

// Recibir mensajes
socket.on("new-message", (message) => {
  console.log("Nuevo mensaje:", message);
});
```

#### Colaboración en Notas

```javascript
// Actualizar nota
socket.emit("note-update", {
  noteId: "note-456",
  content: "Contenido actualizado",
});

// Posición del cursor
socket.emit("cursor-position", {
  noteId: "note-456",
  position: 42,
  selection: { start: 42, end: 50 },
});
```

## 🧪 Testing

### Backend (Spring Boot)

```bash
cd api_v2
./gradlew test
./gradlew test --tests="*ServiceTest"
```

### Agente Python

```bash
cd python-agent
python -m pytest test_agent.py -v
python -m pytest test_agent.py --cov=agent_v2
```

### Servidor WebSocket

```bash
cd real-time-example
npm test
npm run test:coverage
```

### Cobertura de Tests

- **Backend**: >80% cobertura en servicios críticos
- **Agente Python**: >75% cobertura en funciones de IA
- **WebSocket**: >70% cobertura en handlers principales

## 🔧 Configuración de Entorno

### Variables de Entorno - Frontend (.env.local)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Variables de Entorno - Backend (application.properties)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/study_platform
spring.datasource.username=postgres
spring.datasource.password=password
jwt.secret=your-jwt-secret
pinecone.api.key=your-pinecone-key
```

### Variables de Entorno - WebSocket (.env)

```env
PORT=3001
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
```

### Variables de Entorno - Agente Python (.env)

```env
GOOGLE_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-pinecone-env
```

## 📊 Base de Datos

### Modelo de Datos Principal

```sql
-- Usuarios
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workspaces
CREATE TABLE workspaces (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Colecciones
CREATE TABLE collections (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workspace_id BIGINT REFERENCES workspaces(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flashcards
CREATE TABLE flashcards (
    id BIGSERIAL PRIMARY KEY,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    difficulty VARCHAR(20),
    collection_id BIGINT REFERENCES collections(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Despliegue

### Docker Compose (Desarrollo)

```bash
docker-compose up -d
```

### Producción

```bash
# Frontend
npm run build
npm start

# Backend
./gradlew bootJar
java -jar build/libs/api_v2-0.0.1-SNAPSHOT.jar

# WebSocket
npm run start

# Agente Python
gunicorn -w 4 -b 0.0.0.0:5000 agent_v2:app
```

## 📈 Monitoreo y Métricas

### Métricas Disponibles

- Conexiones WebSocket activas
- Tiempo de respuesta de APIs
- Uso de memoria y CPU
- Errores y excepciones
- Actividad de usuarios

### Logs

- **Backend**: Logs estructurados con Logback
- **WebSocket**: Winston para logging
- **Agente**: Python logging module

## 🔒 Seguridad

### Medidas Implementadas

- Autenticación JWT con expiración
- Validación de entrada en todos los endpoints
- CORS configurado apropiadamente
- Rate limiting en APIs críticas
- Sanitización de datos de usuario
- Encriptación de contraseñas con bcrypt

### Consideraciones de Producción

- Usar HTTPS en todas las comunicaciones
- Configurar variables de entorno seguras
- Implementar monitoring de seguridad
- Realizar auditorías regulares de dependencias

## 🤝 Contribución

### Estructura de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato, punto y coma faltante
refactor: refactorización de código
test: agregar tests
chore: actualizar dependencias
```

### Flujo de Desarrollo

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Alejandro Vedo**

- Email: alejandro.vedo@estudiante.usc.es
- GitHub: [@alejandrovedo](https://github.com/alejandrovedo)
- Universidad: Universidad de Santiago de Compostela

## 🙏 Agradecimientos

- Tutor del TFG por la orientación y apoyo
- Comunidad open source por las herramientas utilizadas
- Compañeros de clase por el feedback y testing

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Spring Boot Reference](https://spring.io/projects/spring-boot)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Memoria del TFG](./memoria/Memoria_TFG_Completa.pdf)
- [Diagramas UML](./UML/)

---

_Desarrollado como Trabajo de Fin de Grado - Ingeniería Informática_  
_Universidad de Santiago de Compostela - 2025_
