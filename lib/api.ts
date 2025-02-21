import axios from "axios";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export function useApi() {
  return {
    users: {
      getUser: (userId: string) => api.get(`/users/${userId}`),
      createUser: (data: any) => api.post(`/users`, data),
    },

    collections: {
      listByWorkspace: (workspaceId: string) =>
        api.get(`/collections/workspace/${workspaceId}`),
      get: (workspaceId: string, collectionId: string) =>
        api.get(`/collections/workspace/${workspaceId}/${collectionId}`),
      create: (workspaceId: string, data: any, userId: string) =>
        api.post(`/collections/workspace/${workspaceId}/user/${userId}`, data),
      update: (workspaceId: string, collectionId: string, data: any) =>
        api.put(`/collections/workspace/${workspaceId}/${collectionId}`, data),
      delete: (workspaceId: string, collectionId: string) =>
        api.delete(`/collections/workspace/${workspaceId}/${collectionId}`),
      generateAIFlashcards: (collectionId: string, data: any) =>
        api.post(`/collections/${collectionId}/generate`, data),
    },
    agent: {
      getPdfPages: (collectionId: string, documentId: string) =>
        api.get(`/agent/pdf-pages/${collectionId}/${documentId}`),
      generateFlashcardsFromDocument: (
        collectionId: string,
        documentId: string,
        numFlashcards = 5
      ) =>
        api.post(`/agent/${collectionId}/flashcards/${documentId}`, {
          numFlashcards,
        }),
      generateFlashcardsFromCollection: (
        collectionId: string,
        numFlashcards = 5
      ) =>
        api.get(
          `/agent/${collectionId}/flashcards?numFlashcards=${numFlashcards}`
        ),
      askQuestion: (collectionId: string, question: string) =>
        api.post(`/agent/ask-agent`, { collectionId, question }),
      generateFlashcards: async (
        collectionId: string,
        documentId: string,
        numFlashcards = 5
      ) => {
        const response = await api.get(
          `/agent/${collectionId}/flashcards/${documentId}`,
          {
            params: { numFlashcards },
          }
        );
        return response.data;
      },
      generateBriefSummaryFromDocument: async (
        collectionId: string,
        documentId: string
      ) => {
        const response = await api.get(
          `/agent/${collectionId}/brief-summary/${documentId}`
        );
        return response.data;
      },
      generateLongSummaryFromDocument: async (
        collectionId: string,
        documentId: string
      ) => {
        const response = await api.get(
          `/agent/${collectionId}/long-summary/${documentId}`
        );
        return response.data;
      },
    },
    flashcards: {
      listByCollection: (collectionId: string) =>
        api.get(`/collections/${collectionId}/flashcards`),
      create: (collectionId: string, data: any, email: string) =>
        api.post(`/collections/${collectionId}/flashcards/user/${email}`, data),
      update: (collectionId: string, flashcardId: string, data: any) =>
        api.put(`/collections/${collectionId}/flashcards/${flashcardId}`, data),
      delete: (collectionId: string, flashcardId: string) =>
        api.delete(`/collections/${collectionId}/flashcards/${flashcardId}`),
      updateProgress: (collectionId: string, flashcardId: string, data: any) =>
        api.put(
          `/collections/${collectionId}/flashcards/${flashcardId}/progress`,
          data
        ),
      getStats: (collectionId: string) =>
        api.get(`/collections/${collectionId}/stats`),
      review: (collectionId: string, flashcardId: string, data: any) =>
        api.put(
          `/collections/${collectionId}/flashcards/${flashcardId}/review`,
          data
        ),
      getFlashcardsForReview: async (collectionId: string) => {
        const response = await api.get(
          `/collections/${collectionId}/flashcards/review`
        );
        return response.data;
      },
      submitReview: (flashcardId: string, reviewData: any) =>
        api.put(
          `/collections/${reviewData.collectionId}/flashcards/${flashcardId}/review`,
          reviewData
        ),
      getForReview: (collectionId: string) =>
        api.get(`/collections/${collectionId}/flashcards/review`),
    },
    studySessions: {
      create: (data: any) => api.post("/study-sessions", data),
      get: (id: string) => api.get(`/study-sessions/${id}`),
      addActivity: (sessionId: string, flashcardId: string, data: any) =>
        api.post(
          `/study-sessions/${sessionId}/activities?flashcardId=${flashcardId}`,
          data
        ),
      complete: (id: string) => api.post(`/study-sessions/${id}/complete`),
    },
    workspaces: {
      listByUser: (userId: string) => api.get(`/workspaces/user/${userId}`),
      get: (id: string) => api.get(`/workspaces/${id}`),
      create: (userId: string, data: any) =>
        api.post(`/workspaces/user/${userId}`, data),
      update: (id: string, data: any) => api.put(`/workspaces/${id}`, data),
      delete: (id: string) => api.delete(`/workspaces/${id}`),
      invitations: {
        create: (workspaceId: string, inviteeEmail: string) =>
          api.post(
            `/workspace-invitations/workspaces/${workspaceId}/invite`,
            null,
            {
              params: { inviteeEmail },
            }
          ),
        process: (token: string, action: string) =>
          api.post(`/workspace-invitations/${token}/${action}`),
        getPendingByEmail: (email: string) =>
          api.get(`/workspace-invitations/pending/email/${email}`),
        getPendingByWorkspace: (workspaceId: string) =>
          api.get(`/workspace-invitations/pending/workspace/${workspaceId}`),
      },
      join: (workspaceId: string, email: string, permissionType: string) =>
        api.post(`/workspaces/${workspaceId}/join/${email}/${permissionType}`),
      getUsers: (workspaceId: string) =>
        api.get(`/workspaces/${workspaceId}/users`),
    },
    workspacePermissions: {
      invite: (data: any) => api.post(`/workspace-permissions/invite`, data),
      list: (workspaceId: string) =>
        api.get(`/workspace-permissions/${workspaceId}/users`),
      update: (workspaceId: string, userId: string, data: any) =>
        api.put(`/workspace-permissions/${workspaceId}/users/${userId}`, data),
      remove: (workspaceId: string, userId: string) =>
        api.delete(`/workspace-permissions/${workspaceId}/users/${userId}`),
    },
    resources: {
      list: (collectionId: string) =>
        api.get(`/collections/${collectionId}/documents`),

      upload: (collectionId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return api.post(
          `/collections/${collectionId}/documents/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      },

      download: async (collectionId: string, documentId: string) => {
        const response = await api.get(
          `/collections/${collectionId}/documents/${documentId}`,
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

      delete: (collectionId: string, documentId: string) =>
        api.delete(`/collections/${collectionId}/documents/${documentId}`),
    },
    notes: {
      createNote: async (
        collectionId: string,
        userId: string,
        noteName: string,
        content: string
      ) => {
        const response = await api.post(
          `${API_BASE_URL}/notes/${collectionId}/user/${userId}`,
          {
            noteName,
            content,
          }
        );
        return response.data;
      },
      getNotes: async (collectionId: string) => {
        const response = await api.get(`${API_BASE_URL}/notes/${collectionId}`);
        return response.data;
      },
      deleteNote: async (collectionId: string, noteId: string) => {
        const response = await api.delete(
          `${API_BASE_URL}/notes/${collectionId}/${noteId}`
        );
        return response.data;
      },
    },
  };
}
