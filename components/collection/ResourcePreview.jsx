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

export default ResourcePreview;
