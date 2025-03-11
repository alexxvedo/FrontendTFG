import axios from "axios";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const useApi = () => {
  return {
    users: {
      getUser: (userId) => api.get(`/users/${userId}`),

      createUser: (user) => api.post(`/users`, user),

      updateUser: (userId, user) => api.put(`/users/${userId}`, user),

      deleteUser: (userId) => api.delete(`/users/${userId}`),
    },

    chat: {
      getWorkspaceChat: (workspaceId) =>
        api.get(`/chat/workspace/${workspaceId}`),

      sendMessage: (workspaceId, content, senderEmail) =>
        api.post(`/chat/workspace/${workspaceId}/message`, {
          content,
          senderEmail,
        }),
    },

    collections: {
      listByWorkspace: (workspaceId) =>
        api.get(`/collections/workspace/${workspaceId}`),

      get: (workspaceId, collectionId) =>
        api.get(`/collections/workspace/${workspaceId}/${collectionId}`),

      create: (workspaceId, collection, email) =>
        api.post(
          `/collections/workspace/${workspaceId}/user/${email}`,
          collection
        ),

      update: (workspaceId, collectionId, collection) =>
        api.put(
          `/collections/workspace/${workspaceId}/${collectionId}`,
          collection
        ),

      delete: (workspaceId, collectionId) =>
        api.delete(`/collections/workspace/${workspaceId}/${collectionId}`),

      generateAIFlashcards: (collectionId, data) =>
        api.post(`/collections/${collectionId}/generate`, data),
    },

    agent: {
      getPdfPages: (collectionId, documentId) =>
        api.get(`/agent/pdf-pages/${collectionId}/${documentId}`),

      generateFlashcardsFromDocument: (
        collectionId,
        documentId,
        numFlashcards = 5
      ) =>
        api.post(`/agent/${collectionId}/flashcards/${documentId}`, {
          numFlashcards,
        }),

      generateFlashcardsFromCollection: (collectionId, numFlashcards = 5) =>
        api.get(
          `/agent/${collectionId}/flashcards?numFlashcards=${numFlashcards}`
        ),

      askQuestion: (collectionId, question) =>
        api.post(`/agent/ask-agent`, { collectionId, question }),

      generateFlashcards: async (
        collectionId,
        documentId,
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

      generateBriefSummaryFromDocument: async (collectionId, documentId) => {
        const response = await api.get(
          `/agent/${collectionId}/brief-summary/${documentId}`
        );
        return response.data;
      },

      generateLongSummaryFromDocument: async (collectionId, documentId) => {
        const response = await api.get(
          `/agent/${collectionId}/long-summary/${documentId}`
        );
        return response.data;
      },
    },

    flashcards: {
      listByCollection: (collectionId) =>
        api.get(`/collections/${collectionId}/flashcards`),

      create: (collectionId, flashcard, email) =>
        api.post(
          `/collections/${collectionId}/flashcards/user/${email}`,
          flashcard
        ),

      update: (collectionId, flashcardId, flashcard) =>
        api.put(
          `/collections/${collectionId}/flashcards/${flashcardId}`,
          flashcard
        ),

      delete: (collectionId, flashcardId) =>
        api.delete(`/collections/${collectionId}/flashcards/${flashcardId}`),

      updateProgress: (collectionId, flashcardId, data) =>
        api.put(
          `/collections/${collectionId}/flashcards/${flashcardId}/progress`,
          data
        ),

      getStats: (collectionId) => api.get(`/collections/${collectionId}/stats`),

      review: (collectionId, flashcardId, data) =>
        api.put(
          `/collections/${collectionId}/flashcards/${flashcardId}/review`,
          data
        ),

      getFlashcardsForReview: async (collectionId) => {
        const response = await api.get(
          `/collections/${collectionId}/flashcards/review`
        );
        return response.data;
      },

      submitReview: (flashcardId, reviewData) =>
        api.put(
          `/collections/${reviewData.collectionId}/flashcards/${flashcardId}/review`,
          reviewData
        ),

      getForReview: (collectionId) =>
        api.get(`/collections/${collectionId}/flashcards/review`),
    },

    studySessions: {
      create: (data) => api.post("/study-sessions", data),

      get: (id) => api.get(`/study-sessions/${id}`),

      addActivity: (sessionId, flashcardId, data) =>
        api.post(
          `/study-sessions/${sessionId}/activities?flashcardId=${flashcardId}`,
          data
        ),

      complete: (id) => api.post(`/study-sessions/${id}/complete`),
    },

    workspaces: {
      listByUser: (email) => api.get(`/workspaces/user/${email}`),

      get: (id) => api.get(`/workspaces/${id}`),

      create: (email, workspace) =>
        api.post(`/workspaces/user/${email}`, workspace),

      update: (id, workspace) => api.put(`/workspaces/${id}`, workspace),

      delete: (id) => api.delete(`/workspaces/${id}`),

      invitations: {
        create: (workspaceId, inviteeEmail) =>
          api.post(
            `/workspace-invitations/workspaces/${workspaceId}/invite`,
            null,
            {
              params: { inviteeEmail },
            }
          ),

        process: (token, action) =>
          api.post(`/workspace-invitations/${token}/${action}`),

        getPendingByEmail: (email) =>
          api.get(`/workspace-invitations/pending/email/${email}`),

        getPendingByWorkspace: (workspaceId) =>
          api.get(`/workspace-invitations/pending/workspace/${workspaceId}`),
      },

      join: (workspaceId, email, permissionType) =>
        api.post(`/workspaces/${workspaceId}/join/${email}/${permissionType}`),

      getUsers: (workspaceId) => api.get(`/workspaces/${workspaceId}/users`),
    },

    workspacePermissions: {
      invite: (data) => api.post(`/workspace-permissions/invite`, data),

      list: (workspaceId) =>
        api.get(`/workspace-permissions/${workspaceId}/users`),

      update: (workspaceId, userId, data) =>
        api.put(`/workspace-permissions/${workspaceId}/users/${userId}`, data),

      remove: (workspaceId, userId) =>
        api.delete(`/workspace-permissions/${workspaceId}/users/${userId}`),
    },

    resources: {
      list: (collectionId) => api.get(`/collections/${collectionId}/documents`),

      upload: (collectionId, file) => {
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

      download: async (collectionId, documentId) => {
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

      delete: (collectionId, documentId) =>
        api.delete(`/collections/${collectionId}/documents/${documentId}`),
    },

    notes: {
      createNote: async (collectionId, email, noteName, content) => {
        console.log(
          "collectionId",
          collectionId,
          "email",
          email,
          "noteName",
          noteName,
          "content",
          content
        );
        const response = await api.post(
          `${API_BASE_URL}/notes/${collectionId}/user/${email}`,
          {
            noteName,
            content,
          }
        );
        return response.data;
      },

      getNotes: async (collectionId) => {
        const response = await api.get(`${API_BASE_URL}/notes/${collectionId}`);
        return response.data;
      },

      deleteNote: async (collectionId, noteId) => {
        const response = await api.delete(
          `${API_BASE_URL}/notes/${collectionId}/${noteId}`
        );
        return response.data;
      },
    },
  };
};

export default useApi;
