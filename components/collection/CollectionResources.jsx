"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/api";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default function CollectionResources({ collection }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const fileInputRef = useRef(null);
  const [resources, setResources] = useState([]);

  const api = useApi();

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await api.resources.list(collection.id);
        setResources(response.data);
      } catch (error) {
        console.error("Error loading resources:", error);
        toast.error("Error al cargar los recursos");
      }
    };

    if (collection?.id) {
      loadResources();
    }
  }, [collection?.id]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files?.length) {
      handleFileUpload(files);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileUpload = async (files) => {
    try {
      setIsUploading(true);
      const uploadedFiles = [];

      for (const file of files) {
        setUploadingFiles((prev) => new Set([...prev, file.name]));
        try {
          const response = await api.resources.upload(collection.id, file);
          uploadedFiles.push({
            id: response.data.id,
            fileName: file.name,
            fileSize: file.size,
            type: file.type,
          });
        } finally {
          setUploadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(file.name);
            return newSet;
          });
        }
      }

      setResources((prev) => [...prev, ...uploadedFiles]);
      toast.success("Archivos subidos correctamente");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error al subir los archivos");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      // Obtener la respuesta con los encabezados
      const response = await api.resources.download(collection.id, documentId);

      if (!response || !response.data) {
        throw new Error("❌ La respuesta de la API es inválida o vacía");
      }

      // Obtener el nombre del archivo desde Content-Disposition
      const contentDisposition =
        response.headers["content-disposition"] ||
        response.headers["Content-Disposition"];

      let fileName = `archivo_${documentId}`; // Nombre por defecto

      if (contentDisposition) {
        // Buscar filename*=UTF-8''nombre.ext (si está codificado)
        let match = contentDisposition.match(/filename\*?=(UTF-8'')?([^;"']+)/);
        if (match && match[2]) {
          fileName = decodeURIComponent(match[2]);
        } else {
          // Si no está codificado, buscar filename="nombre.ext"
          match = contentDisposition.match(/filename="(.+?)"/);
          if (match && match[1]) {
            fileName = match[1];
          }
        }
      }

      // Crear un Blob con la respuesta
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Crear un enlace para descargar el archivo
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("✅ Archivo descargado correctamente");
    } catch (error) {
      console.error("❌ Error downloading file:", error);
      toast.error("Error al descargar el archivo");
    }
  };

  const handleDeleteFile = async (documentId) => {
    try {
      await api.resources.delete(collection.id, documentId);
      setResources((prev) => prev.filter((r) => r.id !== documentId));
      toast.success("Archivo eliminado correctamente");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error al eliminar el archivo");
    }
  };

  return (
    <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-xl shadow-purple-500/5">
      {/* Área de subida de archivos */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="mb-8 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center transition-colors duration-200 hover:border-purple-500/50 dark:hover:border-purple-400/50"
      >
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-4"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L14.5 2z" />
            <path d="M15 3v6h6" />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Arrastra tus archivos aquí
          </h3>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            o haz clic para seleccionar archivos
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Seleccionar Archivos
          </button>
        </div>
      </div>

      {/* Lista de recursos */}
      <div className="space-y-4">
        {/* Encabezado de la lista */}
        <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span>Nombre</span>
          <span>Tamaño</span>
        </div>

        {/* Recursos */}
        {resources.map((resource) => (
          <div
            key={`resource-container-${resource.id}`}
            className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm"
          >
            <div
              key={`resource-item-${resource.id}`}
              className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3">
                {/* Icono basado en el tipo de archivo */}
                <div className="rounded-lg bg-purple-50 dark:bg-purple-950/50 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-500 dark:text-purple-400"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L14.5 2z" />
                    <path d="M15 3v6h6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {resource.fileName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Subido {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatFileSize(resource.fileSize)}
                </span>
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleDownload(resource.id)}
                    className="rounded-lg p-1 text-zinc-500 hover:bg-purple-50 hover:text-purple-600 dark:text-zinc-400 dark:hover:bg-purple-950/50 dark:hover:text-purple-400"
                    title="Descargar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteFile(resource.id)}
                    className="rounded-lg p-1 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    title="Eliminar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Estado vacío */}
        {resources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L14.5 2z" />
              <path d="M15 3v6h6" />
            </svg>
            <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              No hay recursos
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sube archivos para empezar
            </p>
          </div>
        )}
      </div>

      {/* Indicador de carga */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
            <span>Subiendo archivos...</span>
          </div>
          <div className="mt-2 space-y-2">
            {Array.from(uploadingFiles).map((fileName) => (
              <div
                key={fileName}
                className="flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 p-2 text-sm"
              >
                <span className="truncate max-w-[200px]">{fileName}</span>
                <span className="text-purple-500 dark:text-purple-400">
                  Subiendo...
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
