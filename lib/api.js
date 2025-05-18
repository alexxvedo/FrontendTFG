import axios from "axios";
import { API_BASE_URL } from "./config";
import { getSession } from "next-auth/react";

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enviar cookies con cada solicitud
});

// Variable para almacenar el token de autenticación en memoria
let authToken = null;

// Función para establecer el token de autenticación
export const setAuthToken = (token) => {
  authToken = token;
};

// Interceptor para añadir el token de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    // Evitar bucles infinitos: no añadir token a las llamadas de autenticación
    if (config.url && config.url.includes("/auth/")) {
      return config;
    }

    // Usar el token almacenado en memoria si está disponible
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    } else if (typeof window !== "undefined") {
      // Intentar obtener el token del localStorage como fallback
      try {
        const token = localStorage.getItem("auth-token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error al obtener el token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Exportar la instancia de axios directamente
export const api = axiosInstance;

// Exportar el hook useApi como default export
export const useApi = () => {
  return {
    users: {
      getUser: (userId) => axiosInstance.get(`/users/${userId}`),

      createUser: (user) => axiosInstance.post(`/users`, user),

      updateUser: (userId, user) => axiosInstance.put(`/users/${userId}`, user),

      deleteUser: (userId) => axiosInstance.delete(`/users/${userId}`),
    },

    activity: {
      getActivity: (workspaceId) =>
        axiosInstance.get(`/workspaces/${workspaceId}/activity`),
    },

    chat: {
      getWorkspaceChat: (workspaceId) =>
        axiosInstance.get(`/chat/workspace/${workspaceId}`),

      sendMessage: (workspaceId, content, senderEmail) =>
        axiosInstance.post(`/chat/workspace/${workspaceId}/message`, {
          content,
          senderEmail,
        }),
    },

    collections: {
      listByWorkspace: (workspaceId) =>
        axiosInstance.get(`/workspaces/${workspaceId}/collections`),

      get: (workspaceId, collectionId) =>
        axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}`
        ),

      create: (workspaceId, collection, email) =>
        axiosInstance.post(
          `/workspaces/${workspaceId}/collections/user/${email}`,
          collection
        ),

      update: (workspaceId, collectionId, collection) =>
        axiosInstance.put(
          `/workspaces/${workspaceId}/collections/${collectionId}`,
          collection
        ),

      delete: (workspaceId, collectionId) =>
        axiosInstance.delete(
          `/workspaces/${workspaceId}/collections/${collectionId}`
        ),

      generateAIFlashcards: (workspaceId, collectionId, data) =>
        axiosInstance.post(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards/generate`,
          data
        ),
    },

    agent: {
      getPdfPages: (collectionId, documentId) =>
        axiosInstance.get(`/agent/pdf-pages/${collectionId}/${documentId}`),

      generateFlashcardsFromDocument: (
        collectionId,
        documentId,
        numFlashcards = 5
      ) =>
        axiosInstance.post(`/agent/${collectionId}/flashcards/${documentId}`, {
          numFlashcards,
        }),

      generateFlashcardsFromCollection: (collectionId, numFlashcards = 5) =>
        axiosInstance.get(
          `/agent/${collectionId}/flashcards?numFlashcards=${numFlashcards}`
        ),

      askQuestion: (collectionId, question) =>
        axiosInstance.post(`/agent/ask-agent`, { collectionId, question }),

      generateFlashcards: async (
        collectionId,
        documentId,
        numFlashcards = 5
      ) => {
        const response = await axiosInstance.get(
          `/agent/${collectionId}/flashcards/${documentId}`,
          {
            params: { numFlashcards },
          }
        );
        return response.data;
      },

      generateBriefSummaryFromDocument: async (collectionId, documentId) => {
        const response = await axiosInstance.get(
          `/agent/${collectionId}/brief-summary/${documentId}`
        );
        return response.data;
      },

      generateLongSummaryFromDocument: async (collectionId, documentId) => {
        const response = await axiosInstance.get(
          `/agent/${collectionId}/long-summary/${documentId}`
        );
        return response.data;
      },
    },

    flashcards: {
      listByCollection: (workspaceId, collectionId) =>
        axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards`
        ),

      create: (workspaceId, collectionId, flashcard, email) =>
        axiosInstance.post(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards/user/${email}`,
          flashcard
        ),

      update: (workspaceId, collectionId, flashcardId, flashcard) =>
        axiosInstance.put(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards/${flashcardId}`,
          flashcard
        ),

      delete: (workspaceId, collectionId, flashcardId) =>
        axiosInstance.delete(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards/${flashcardId}`
        ),

      updateProgress: (workspaceId, collectionId, flashcardId, data) =>
        axiosInstance.put(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards/${flashcardId}/progress`,
          data
        ),

      getStats: (workspaceId, collectionId) =>
        axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards/stats`
        ),

      updateProgress: (progressData) =>
        axiosInstance.put(`/flashcards/progress`, progressData),

      getFlashcardsForReview: (workspaceId, collectionId) =>
        axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards/review`
        ),

      submitReview: (workspaceId, collectionId, flashcardId, reviewData) =>
        axiosInstance.put(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards/${flashcardId}/review`,
          reviewData
        ),

      getForReview: (workspaceId, collectionId) =>
        axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}/flashcards/review`
        ),
    },

    studySessions: {
      create: (data) => axiosInstance.post("/study-sessions", data),

      get: (id) => axiosInstance.get(`/study-sessions/${id}`),

      addActivity: (sessionId, flashcardId, data) =>
        axiosInstance.post(
          `/study-sessions/${sessionId}/activities?flashcardId=${flashcardId}`,
          data
        ),

      complete: (id) => axiosInstance.post(`/study-sessions/${id}/complete`),
    },

    workspaces: {
      listByUser: (email) => axiosInstance.get(`/workspaces/user/${email}`),

      get: (id) => axiosInstance.get(`/workspaces/${id}`),

      create: (email, workspace) =>
        axiosInstance.post(`/workspaces/user/${email}`, workspace, {
          headers: {
            "Content-Type": "application/json",
          },
        }),

      update: (id, workspace) =>
        axiosInstance.put(`/workspaces/${id}`, workspace),

      delete: (id) => axiosInstance.delete(`/workspaces/${id}`),

      invite: (workspaceId, inviteData) =>
        axiosInstance.post(
          `/workspace-invitations/workspaces/${workspaceId}/invite`,
          inviteData
        ),

      verifyInvite: (token) =>
        axiosInstance.post(`/workspace-invitations/verify`, { token }),

      getInvitesByWorkspace: (workspaceId) =>
        axiosInstance.get(`/workspace-invitations/workspaces/${workspaceId}`),

      deleteInvite: (inviteId) =>
        axiosInstance.delete(`/workspace-invitations/${inviteId}`),

      // Para invitaciones enviadas por el propietario del workspace
      join: (workspaceId, email, permissionType) =>
        axiosInstance.post(
          `/workspaces/${workspaceId}/join/${email}/${permissionType}`
        ),

      // Nuevo método para unirse a través de una invitación
      joinByInvite: (workspaceId, email, permissionType) =>
        axiosInstance.post(
          `/workspaces/join-by-invite/${workspaceId}/${email}/${permissionType}`
        ),

      getUsers: (workspaceId) =>
        axiosInstance.get(`/workspaces/${workspaceId}/users`),
    },

    workspacePermissions: {
      invite: (data) =>
        axiosInstance.post(`/workspace-permissions/invite`, data),

      list: (workspaceId) =>
        axiosInstance.get(`/workspace-permissions/${workspaceId}/users`),

      update: (workspaceId, userId, data) =>
        axiosInstance.put(
          `/workspace-permissions/${workspaceId}/users/${userId}`,
          data
        ),

      remove: (workspaceId, userId) =>
        axiosInstance.delete(
          `/workspace-permissions/${workspaceId}/users/${userId}`
        ),
    },

    resources: {
      list: (workspaceId, collectionId) =>
        axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}/documents`
        ),

      upload: (workspaceId, collectionId, formData) => {
        return axiosInstance.post(
          `/workspaces/${workspaceId}/collections/${collectionId}/documents/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      },

      download: async (workspaceId, collectionId, documentId) => {
        const response = await axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}/documents/${documentId}`,
          { responseType: "blob", withCredentials: true } // Asegura que la respuesta sea un archivo binario
        );

        // Extraer encabezados manualmente
        const contentDisposition =
          response.headers["content-disposition"] ||
          response.headers["Content-Disposition"];
        console.log("📄 Content-Disposition en API:", contentDisposition);

        return {
          data: response.data,
          headers: response.headers,
          contentDisposition: contentDisposition, // Lo pasamos explícitamente a page.js
        };
      },

      delete: (workspaceId, collectionId, documentId) =>
        axiosInstance.delete(
          `/workspaces/${workspaceId}/collections/${collectionId}/documents/${documentId}`
        ),
    },

    notes: {
      getAll: (workspaceId, collectionId) =>
        axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}/notes`
        ),

      get: (workspaceId, collectionId, noteId) =>
        axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}/notes/${noteId}`
        ),

      create: (workspaceId, collectionId, email, noteData) =>
        axiosInstance.post(
          `/workspaces/${workspaceId}/collections/${collectionId}/notes/user/${email}`,
          noteData
        ),

      getNotes: async (workspaceId, collectionId) => {
        const response = await axiosInstance.get(
          `/workspaces/${workspaceId}/collections/${collectionId}/notes`
        );
        return response.data;
      },

      deleteNote: async (workspaceId, collectionId, noteId) => {
        const response = await axiosInstance.delete(
          `/workspaces/${workspaceId}/collections/${collectionId}/notes/${noteId}`
        );
        return response.data;
      },
      update: async (workspaceId, collectionId, noteId, noteData) =>
        axiosInstance.put(
          `/workspaces/${workspaceId}/collections/${collectionId}/notes/${noteId}`,
          noteData
        ),
    },

    tasks: {
      getByWorkspace: (workspaceId) =>
        axiosInstance.get(`workspace/${workspaceId}/tasks/`),

      getByStatus: (workspaceId, status) =>
        axiosInstance.get(`workspace/${workspaceId}/tasks/status/${status}`),

      getById: (workspaceId, taskId) =>
        axiosInstance.get(`workspace/${workspaceId}/tasks/${taskId}`),

      create: (workspaceId, createdById, taskData) =>
        axiosInstance.post(
          `workspace/${workspaceId}/tasks/user/${createdById}`,
          taskData
        ),

      update: (taskId, workspaceId, taskData) =>
        axiosInstance.put(`workspace/${workspaceId}/tasks/${taskId}`, taskData),
      delete: (workspaceId, taskId) =>
        axiosInstance.delete(`workspace/${workspaceId}/tasks/${taskId}`),

      getByUser: (workspaceId, userId) =>
        axiosInstance.get(`/tasks/user/${userId}`),
    },

    userStats: {
      getUserStats: async (email) => {
        const response = await axiosInstance.get(`/user/stats/${email}`);
        return response.data;
      },
      achievementCompleted: async (userId, achievementId) => {
        const response = await axiosInstance.post(
          `/user/stats/${userId}/achievement-completed?achievementId=${achievementId}`
        );
        return response.data;
      },
    },

    userActivity: {
      getRecentActivity: async (userId) => {
        const response = await axiosInstance.get(
          `/users/activity/recent/${userId}`
        );
        return response.data;
      },
      getWeeklyStats: async (userId) => {
        const response = await axiosInstance.get(
          `/users/activity/weekly/${userId}`
        );
        return response.data;
      },
      getMonthlyStats: async (userId) => {
        const response = await axiosInstance.get(
          `/users/activity/monthly/${userId}`
        );
        return response.data;
      },
    },
  };
};

export default useApi;
