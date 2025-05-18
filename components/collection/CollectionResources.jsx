"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  File,
  FileText,
  Image,
  FileType,
  Archive,
  Music,
  Video,
  Code,
  Table,
  XCircle,
  Download,
  Trash2,
  Upload,
  Plus,
  X,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
} from "lucide-react";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Función para obtener el icono según el tipo de archivo
const getFileIcon = (fileType, fileName) => {
  // Primero verificamos por extensión para casos especiales
  const extension = fileName?.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    return <FileType className="h-6 w-6" />;
  }

  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return <Archive className="h-6 w-6" />;
  }

  if (["xls", "xlsx", "csv"].includes(extension)) {
    return <Table className="h-6 w-6" />;
  }

  if (
    ["js", "jsx", "ts", "tsx", "html", "css", "py", "java", "php"].includes(
      extension
    )
  ) {
    return <Code className="h-6 w-6" />;
  }

  // Luego verificamos por tipo MIME
  if (fileType?.startsWith("image/")) {
    return <Image className="h-6 w-6" />;
  }

  if (fileType?.startsWith("text/")) {
    return <FileText className="h-6 w-6" />;
  }

  if (fileType?.startsWith("audio/")) {
    return <Music className="h-6 w-6" />;
  }

  if (fileType?.startsWith("video/")) {
    return <Video className="h-6 w-6" />;
  }

  // Icono por defecto
  return <File className="h-6 w-6" />;
};

// Función para determinar si un archivo puede tener vista previa
const canPreview = (fileType, fileName) => {
  const extension = fileName?.split(".").pop()?.toLowerCase();

  // Imágenes
  if (fileType?.startsWith("image/")) {
    return true;
  }

  // PDFs
  if (extension === "pdf" || fileType === "application/pdf") {
    return true;
  }

  // Archivos de texto
  if (
    fileType?.startsWith("text/") ||
    ["txt", "md", "json", "csv"].includes(extension)
  ) {
    return true;
  }

  // Audio
  if (fileType?.startsWith("audio/")) {
    return true;
  }

  // Video
  if (fileType?.startsWith("video/")) {
    return true;
  }

  return false;
};

// Componente de vista previa
const ResourcePreview = ({
  resource,
  onClose,
  api,
  collectionId,
  workspaceId,
}) => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const response = await api.resources.download(
          workspaceId,
          collectionId,
          resource.id
        );

        if (!response || !response.data) {
          throw new Error("La respuesta de la API es inválida o vacía");
        }

        // Convertir a URL para vista previa
        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        const url = URL.createObjectURL(blob);
        setPreviewData(url);
      } catch (err) {
        console.error("Error loading preview:", err);
        setError("No se pudo cargar la vista previa");
      } finally {
        setLoading(false);
      }
    };

    if (resource && canPreview(resource.type, resource.fileName)) {
      fetchPreview();
    } else {
      setError("Este tipo de archivo no permite vista previa");
      setLoading(false);
    }

    return () => {
      // Limpiar URL al desmontar
      if (previewData) {
        URL.revokeObjectURL(previewData);
      }
    };
  }, [resource, api, collectionId, workspaceId]);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
            {error}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Puedes descargar el archivo para verlo en tu dispositivo
          </p>
        </div>
      );
    }

    if (!previewData) return null;

    // Renderizar según el tipo de archivo
    if (resource.type?.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={previewData}
            alt={resource.fileName}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      );
    }

    if (
      resource.type === "application/pdf" ||
      resource.fileName?.endsWith(".pdf")
    ) {
      return (
        <div className="h-full w-full">
          <iframe
            src={previewData}
            className="w-full h-[70vh] rounded-lg"
            title={resource.fileName}
          />
        </div>
      );
    }

    if (resource.type?.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Music className="h-16 w-16 text-blue-500 mb-6" />
          <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-4">
            {resource.fileName}
          </p>
          <audio controls className="w-full max-w-md">
            <source src={previewData} type={resource.type} />
            Tu navegador no soporta la reproducción de audio
          </audio>
        </div>
      );
    }

    if (resource.type?.startsWith("video/")) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <video
            controls
            className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
          >
            <source src={previewData} type={resource.type} />
            Tu navegador no soporta la reproducción de video
          </video>
        </div>
      );
    }

    // Para archivos de texto
    if (
      resource.type?.startsWith("text/") ||
      ["txt", "md", "json", "csv"].includes(
        resource.fileName?.split(".").pop()?.toLowerCase()
      )
    ) {
      return (
        <div className="p-4 h-full">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 h-[70vh] overflow-auto">
            <pre className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
              {/* Aquí iría el contenido del texto, pero necesitaríamos convertir el blob a texto */}
              {/* Esto se implementaría completamente con la API real */}
              Vista previa de texto no disponible en esta versión
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <XCircle className="h-16 w-16 text-amber-500 mb-4" />
        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
          Vista previa no disponible
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Este tipo de archivo no permite vista previa en el navegador
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/5 dark:bg-zinc-900/20 backdrop-blur-sm border border-zinc-200/30 dark:border-zinc-800/30  shadow-xl shadow-purple-500/5 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/5 dark:bg-zinc-900/20 backdrop-blur-sm border border-zinc-200/30 dark:border-zinc-800/30 p-6 shadow-purple-500/5 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              {getFileIcon(resource.type, resource.fileName)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {resource.fileName}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatFileSize(resource.fileSize)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                api.resources.download(workspaceId, collectionId, resource.id)
              }
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
              title="Descargar"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="h-full">{renderPreview()}</div>
      </motion.div>
    </motion.div>
  );
};

export default function CollectionResources({
  collection,
  onResourceUploaded,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const fileInputRef = useRef(null);
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, size, date
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [selectedResource, setSelectedResource] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const api = useApi();

  useEffect(() => {
    if (collection?.id) {
      loadResources();
    }
  }, [collection?.id, collection?.workspaceId]);

  const loadResources = async () => {
    try {
      const response = await api.resources.list(
        collection.workspaceId,
        collection.id
      );
      setResources(response.data);
    } catch (error) {
      console.error("Error loading resources:", error);
      toast.error("Error al cargar los recursos");
    }
  };

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
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUploadingFiles = new Set([...uploadingFiles]);

    // Añadir los nombres de los archivos al conjunto de archivos en carga
    Array.from(files).forEach((file) => {
      newUploadingFiles.add(file.name);
    });

    setUploadingFiles(newUploadingFiles);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("file", file);
      });

      const response = await api.resources.upload(
        collection.workspaceId,
        collection.id,
        formData
      );

      // Obtener los recursos recién subidos
      const newResources = response?.data || [];

      // Actualizar la lista local de recursos
      loadResources();

      // Notificar al componente padre sobre los nuevos recursos
      if (onResourceUploaded && newResources.length > 0) {
        onResourceUploaded(newResources);
      }

      toast.success("Archivos subidos correctamente");
    } catch (error) {
      console.error("Error al subir archivos:", error);
      toast.error("Error al subir archivos");
    } finally {
      setIsUploading(false);
      setUploadingFiles(new Set());
    }
  };

  const handleDownload = async (documentId) => {
    try {
      // Obtener la respuesta con los encabezados
      const response = await api.resources.download(
        collection.workspaceId,
        collection.id,
        documentId
      );

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

  const handleDeleteResource = async (resourceId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este recurso?")) {
      try {
        await api.resources.delete(
          collection.workspaceId,
          collection.id,
          resourceId
        );
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
        toast.success("Recurso eliminado correctamente");
      } catch (error) {
        console.error("Error deleting resource:", error);
        toast.error("Error al eliminar el recurso");
      }
    }
  };

  const handlePreview = (resource) => {
    setSelectedResource(resource);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setSelectedResource(null);
    setShowPreview(false);
  };

  return (
    <div className="bg-white/5 dark:bg-zinc-900/20 backdrop-blur-sm border border-zinc-200/30 dark:border-zinc-800/30 p-6 shadow-xl shadow-purple-500/5 rounded-xl">
      {/* Barra superior con búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Recursos de la colección
        </h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar recursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title={
                sortOrder === "asc"
                  ? "Ordenar descendente"
                  : "Ordenar ascendente"
              }
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            >
              <option value="name">Nombre</option>
              <option value="size">Tamaño</option>
              <option value="date">Fecha</option>
            </select>
          </div>
        </div>
      </div>

      {/* Área de subida de archivos */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="mb-8 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800/50 p-8 text-center transition-colors duration-200 hover:border-blue-500/70 dark:hover:border-blue-400/70 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/10 dark:to-purple-900/10"
      >
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
          <div className="mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800/30 dark:to-purple-800/30 p-3">
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Arrastra tus archivos aquí
          </h3>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Seleccionar Archivos
          </button>
        </div>
      </motion.div>

      {/* Lista de recursos */}
      <div className="space-y-4">
        {/* Encabezado de la lista */}
        <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-800">
          <span>Nombre</span>
          <span>Tamaño</span>
        </div>

        {/* Recursos filtrados */}
        <AnimatePresence>
          {resources
            .filter((resource) =>
              resource.fileName
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => {
              if (sortBy === "name") {
                return sortOrder === "asc"
                  ? a.fileName.localeCompare(b.fileName)
                  : b.fileName.localeCompare(a.fileName);
              } else if (sortBy === "size") {
                return sortOrder === "asc"
                  ? a.fileSize - b.fileSize
                  : b.fileSize - a.fileSize;
              } else {
                // Por fecha (usaríamos la fecha real si estuviera disponible)
                return sortOrder === "asc" ? 1 : -1;
              }
            })
            .map((resource) => (
              <motion.div
                key={`resource-container-${resource.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl bg-white/90 dark:bg-zinc-800/70 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    {/* Icono basado en el tipo de archivo */}
                    <div
                      className={`rounded-lg p-2 ${
                        resource.type?.startsWith("image/")
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500"
                          : resource.type?.startsWith("video/")
                          ? "bg-rose-50 dark:bg-rose-900/20 text-rose-500"
                          : resource.type?.startsWith("audio/")
                          ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500"
                          : resource.fileName?.endsWith(".pdf")
                          ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                          : resource.fileName?.endsWith(".zip") ||
                            resource.fileName?.endsWith(".rar")
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-500"
                          : resource.fileName?.endsWith(".doc") ||
                            resource.fileName?.endsWith(".docx")
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                          : resource.fileName?.endsWith(".xls") ||
                            resource.fileName?.endsWith(".xlsx")
                          ? "bg-green-50 dark:bg-green-900/20 text-green-500"
                          : resource.fileName?.endsWith(".ppt") ||
                            resource.fileName?.endsWith(".pptx")
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                          : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500"
                      }`}
                    >
                      {getFileIcon(resource.type, resource.fileName)}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {resource.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date().toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatFileSize(resource.fileSize)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(resource.id)}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {canPreview(resource.type, resource.fileName) && (
                        <button
                          onClick={() => handlePreview(resource)}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-purple-50 hover:text-purple-600 dark:text-zinc-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
                          title="Vista previa"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Estado vacío */}
        {resources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl"
          >
            <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-4 mb-4">
              <File className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              No hay recursos
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
              Sube archivos para compartir con tus estudiantes o para tener
              material de referencia para esta colección
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Subir primer archivo
            </button>
          </motion.div>
        )}

        {/* Mensaje cuando no hay resultados de búsqueda */}
        {resources.length > 0 &&
          resources.filter((resource) =>
            resource.fileName.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl"
            >
              <Search className="h-8 w-8 text-blue-500 dark:text-blue-400 mb-4" />
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                No se encontraron resultados
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No hay archivos que coincidan con "{searchQuery}"
              </p>
            </motion.div>
          )}
      </div>

      {/* Indicador de carga */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl bg-white/90 dark:bg-zinc-800/80 p-4 shadow-lg border border-blue-200/50 dark:border-blue-800/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
            <h3 className="font-medium text-blue-700 dark:text-blue-300">
              Subiendo archivos
            </h3>
          </div>
          <div className="space-y-3">
            {Array.from(uploadingFiles).map((fileName) => (
              <div
                key={fileName}
                className="flex items-center justify-between rounded-lg bg-blue-50/80 dark:bg-blue-900/20 p-3 text-sm"
              >
                <div className="flex items-center gap-3 truncate max-w-[70%]">
                  <File className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="truncate text-zinc-700 dark:text-zinc-300">
                    {fileName}
                  </span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                  Subiendo...
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {showPreview && selectedResource && (
        <ResourcePreview
          resource={selectedResource}
          onClose={handleClosePreview}
          api={api}
          collectionId={collection.id}
          workspaceId={collection.workspaceId}
        />
      )}
    </div>
  );
}
