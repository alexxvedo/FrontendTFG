# 🎓 FlashMaster Frontend

![Licencia](https://img.shields.io/badge/Licencia-CC%20BY--NC--SA%204.0-blue)
![Estado](https://img.shields.io/badge/Estado-Activo-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue)

## 📋 Descripción

Frontend de la plataforma FlashMaster, una aplicación web colaborativa para el estudio asistido por inteligencia artificial. Desarrollada con Next.js 15, React 18 y TypeScript, proporciona una interfaz moderna y responsiva para gestionar espacios de trabajo, colecciones de estudio, flashcards y colaboración en tiempo real.

## ✨ Características Principales

### 🎯 Funcionalidades Core

- **Dashboard Intuitivo**: Vista general de workspaces y colecciones
- **Gestión de Workspaces**: Crear, editar y administrar espacios de trabajo
- **Sistema de Colecciones**: Organizar materiales de estudio por temas
- **Flashcards Interactivas**: Crear y estudiar con repetición espaciada
- **Editor de Notas**: Notas colaborativas en tiempo real
- **Chat en Vivo**: Comunicación instantánea entre usuarios
- **Agenda y Tareas**: Gestión de actividades y recordatorios

### 🤖 Integración con IA

- **Generación Automática**: Flashcards y preguntas desde documentos
- **Resúmenes Inteligentes**: Extracción de puntos clave
- **Asistente de Estudio**: Preguntas y respuestas contextuales
- **Análisis de Documentos**: Procesamiento de PDFs, DOCX y TXT

### 👥 Colaboración

- **Edición Simultánea**: Múltiples usuarios en tiempo real
- **Sincronización de Cursor**: Visualización de actividad de otros usuarios
- **Compartir Recursos**: Documentos y materiales entre miembros
- **Sistema de Invitaciones**: Gestión de permisos y acceso

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **UI Library**: React 18 con hooks
- **Styling**: TailwindCSS + CSS Modules
- **Estado**: Zustand + React Context
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client
- **Formularios**: React Hook Form + Zod
- **UI Components**: Radix UI + Shadcn/ui

### Estructura del Proyecto

```
frontend/
├── app/                    # App Router (Next.js 15)
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── context/           # React Context Providers
│   ├── globals.css        # Estilos globales
│   ├── layout.js          # Layout principal
│   ├── login/             # Páginas de autenticación
│   ├── providers/         # Providers de contexto
│   ├── unauthorized/      # Páginas de error
│   ├── utils/             # Utilidades del servidor
│   └── workspaces/        # Páginas de workspaces
├── components/            # Componentes React
│   ├── agenda/           # Componentes de agenda
│   ├── agent/            # Componentes de IA
│   ├── chat/             # Componentes de chat
│   ├── collection/       # Componentes de colecciones
│   ├── collections/      # Lista de colecciones
│   ├── dashboard/        # Componentes del dashboard
│   ├── flashcards/       # Componentes de flashcards
│   ├── notes/            # Componentes de notas
│   ├── pomodoro/         # Componentes de pomodoro
│   ├── ui/               # Componentes de UI base
│   ├── unauthorized/     # Componentes de error
│   ├── user/             # Componentes de usuario
│   ├── workspace/        # Componentes de workspace
│   ├── app-sidebar.tsx   # Sidebar principal
│   ├── nav-main.jsx      # Navegación principal
│   └── nav-projects.jsx  # Navegación de proyectos
├── hooks/                # Custom React Hooks
│   ├── use-mobile.tsx    # Hook para detección móvil
│   └── useNoteUsers.js   # Hook para usuarios de notas
├── lib/                  # Utilidades y configuraciones
│   ├── api.js            # Cliente HTTP
│   ├── config.ts         # Configuraciones
│   └── utils.ts          # Utilidades generales
├── prisma/               # Esquemas de base de datos
├── public/               # Archivos estáticos
├── server/               # Configuraciones del servidor
├── store/                # Estado global (Zustand)
└── styles/               # Estilos adicionales
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18.0 o superior
- npm, yarn o pnpm
- Acceso a la API backend (puerto 8080)
- Servidor WebSocket (puerto 3001)

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd frontend

# 2. Instalar dependencias
npm install
# o
yarn install
# o
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las URLs de API y WebSocket

# 4. Ejecutar en modo desarrollo
npm run dev
# o
yarn dev
# o
pnpm dev
```

### Variables de Entorno

Crear archivo `.env.local`:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Autenticación
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos TypeScript

# Testing
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con cobertura

# Utilidades
npm run format       # Formatear código con Prettier
npm run clean        # Limpiar archivos generados
```

## 🎨 Componentes Principales

### Dashboard

- **Workspace Overview**: Vista general de espacios de trabajo
- **Recent Collections**: Colecciones recientes
- **Activity Feed**: Actividad reciente del usuario
- **Quick Actions**: Acciones rápidas (crear, buscar)

### Gestión de Colecciones

- **Collection Grid**: Vista en cuadrícula de colecciones
- **Collection Card**: Tarjeta individual con metadatos
- **Collection Editor**: Editor de propiedades de colección
- **Document Upload**: Carga de documentos con drag & drop

### Sistema de Flashcards

- **Flashcard Creator**: Creador manual de flashcards
- **Study Session**: Sesión de estudio con diferentes modos
- **Progress Tracker**: Seguimiento del progreso
- **Spaced Repetition**: Algoritmo de repetición espaciada

### Colaboración en Tiempo Real

- **Real-time Editor**: Editor colaborativo de notas
- **Cursor Sync**: Sincronización de posiciones de cursor
- **User Presence**: Indicadores de usuarios activos
- **Chat Interface**: Chat integrado en workspaces

## 🔧 Configuración Avanzada

### Personalización de Temas

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          // ... más colores personalizados
        },
      },
    },
  },
};
```

### Configuración de WebSocket

```typescript
// lib/socket.ts
import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
  autoConnect: false,
  auth: {
    token: getAuthToken(),
  },
});
```

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de React](https://react.dev)
- [Documentación de TailwindCSS](https://tailwindcss.com/docs)
- [Guía de TypeScript](https://www.typescriptlang.org/docs)

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](./LICENSE.md).

## 👨‍💻 Autor

**Alejandro Vedo Godines** - [GitHub](https://github.com/tu-usuario)

Trabajo de Fin de Grado - Universidad de Santiago de Compostela

---

⭐ Si este proyecto te ha sido útil, ¡dale una estrella al repositorio!
