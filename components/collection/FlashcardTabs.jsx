import { useState, useEffect, useMemo } from "react";
import FlashcardEditor from "@/components/flashcards/FlashcardEditor";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "@/store/user-store/user-store";
import { useApi } from "@/lib/api";
import {
  CheckCircle,
  Clock,
  Plus,
  Search,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Filter,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function FlashcardTabs({
  collection,
  isLoading: initialLoading,
  canEdit,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(initialLoading);
  const user = useUserStore((state) => state.user);
  const api = useApi();
  const [flashcardsWithProgress, setFlashcardsWithProgress] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFlashcard, setExpandedFlashcard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9; // 3x3 grid
  const [flippedCards, setFlippedCards] = useState({});
  const [flashcardToEdit, setFlashcardToEdit] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Helper function to strip HTML tags and get plain text
  const stripHtml = (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  // Helper function to remove accents/diacritical marks
  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Filter flashcards based on active filter and search query
  const filteredFlashcards = useMemo(() => {
    // Usar las flashcards con progreso individual si están disponibles, de lo contrario usar las de la colección
    const cardsToFilter =
      flashcardsWithProgress.length > 0
        ? flashcardsWithProgress
        : collection?.flashcards || [];

    if (cardsToFilter.length === 0) return [];

    // First filter by status - ahora refleja el progreso individual del usuario
    // Los estados de las flashcards ahora vienen del progreso individual del usuario
    // y no del estado general de la flashcard
    let filtered = cardsToFilter;
    if (activeFilter === "mastered") {
      filtered = filtered.filter((card) => {
        return card.easeFactor > 3.5;
      });
    } else if (activeFilter === "learning") {
      filtered = filtered.filter((card) => {
        return card.easeFactor <= 3.5;
      });
    } else if (activeFilter === "new") {
      filtered = filtered.filter((card) => {
        return card.reviewCount === 0;
      });
    }

    // Then filter by search query if it exists
    if (searchQuery.trim()) {
      const query = removeAccents(searchQuery.toLowerCase());
      filtered = filtered.filter((card) => {
        // Create temporary elements to extract text content from HTML
        const questionText = card.question
          ? removeAccents(stripHtml(card.question).toLowerCase())
          : "";
        const answerText = card.answer
          ? removeAccents(stripHtml(card.answer).toLowerCase())
          : "";

        // Check if either question or answer contains the search query
        return questionText.includes(query) || answerText.includes(query);
      });
    }

    return filtered;
  }, [collection?.flashcards, activeFilter, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredFlashcards.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredFlashcards.slice(
    indexOfFirstCard,
    indexOfLastCard
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Estado ya declarado arriba

  // Cargar flashcards con progreso individual del usuario
  useEffect(() => {
    const loadFlashcardsWithProgress = async () => {
      if (collection?.id && user?.email) {
        try {
          setIsLoading(true);
          const workspaceId =
            collection.workspaceId || collection.workspace?.id;

          if (!workspaceId) {
            console.error("No se pudo obtener el workspaceId de la colección");
            return;
          }

          // Usar el email del usuario en lugar del ID
          const response = await api.flashcards.listByCollection(
            workspaceId,
            collection.id,
            user.email
          );
          console.log("Flashcards con progreso individual:", response.data);
          setFlashcardsWithProgress(response.data);
        } catch (error) {
          console.error("Error al cargar las flashcards con progreso:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadFlashcardsWithProgress();

    // Configurar un intervalo para refrescar las flashcards cada 60 segundos
    const refreshInterval = setInterval(() => {
      if (collection?.id && user?.email) {
        loadFlashcardsWithProgress();
      }
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [collection?.id, user?.email]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  // Toggle card flip
  const toggleCardFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Render a single flashcard
  const renderFlashcard = (flashcard, index) => {
    const isFlipped = flippedCards[flashcard.id] || false;

    // Estilos CSS para el efecto de giro
    const perspectiveStyle = { perspective: "1000px" };
    const preserve3dStyle = { transformStyle: "preserve-3d" };
    const backfaceHiddenStyle = { backfaceVisibility: "hidden" };
    const rotateY180Style = { transform: "rotateY(180deg)" };

    return (
      <motion.div
        key={flashcard.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="h-[250px] group"
        layout
      >
        <div className="relative h-full w-full" style={perspectiveStyle}>
          <motion.div
            className="h-full w-full relative transition-all duration-300"
            style={preserve3dStyle}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{
              duration: 0.3,
              ease: "linear",
            }}
          >
            {/* Front side - Question */}
            <Card
              className="h-full w-full overflow-hidden absolute transition-all duration-200 bg-white/5 dark:bg-[#161622] backdrop-blur-sm border-2 border-zinc-200/30 dark:border-zinc-700/60 hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-500/10 group-hover:translate-y-[-2px]"
              style={backfaceHiddenStyle}
            >
              {/* Floating orb effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-10 -left-20 w-40 h-40 bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />

              {/* Buttons container - only visible on hover */}
              <div className="absolute top-3 right-3 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Edit button - only visible if canEdit is true */}
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlashcardToEdit(flashcard);
                      setIsEditorOpen(true);
                    }}
                    className="p-1.5 rounded-full bg-white/10 dark:bg-blue-500/20 hover:bg-white/20 dark:hover:bg-blue-500/30 text-zinc-600 dark:text-blue-400 transition-colors"
                    aria-label="Editar tarjeta"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}

                {/* Expand button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFlashcard(flashcard);
                  }}
                  className="p-1.5 rounded-full bg-white/10 dark:bg-zinc-800/50 hover:bg-white/20 dark:hover:bg-zinc-700/70 text-zinc-600 dark:text-zinc-300 transition-colors"
                  aria-label="Expandir tarjeta"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-pink-900/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardContent
                className="p-4 h-full flex flex-col justify-between relative cursor-pointer"
                onClick={() => toggleCardFlip(flashcard.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-400 to-purple-400"></div>
                    <h3 className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-wide">
                      Pregunta
                    </h3>
                  </div>
                  <div
                    className="text-base font-medium text-zinc-900 dark:text-white prose dark:prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: flashcard.question }}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-200/20 dark:border-zinc-800/30">
                  {flashcard.status && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          flashcard.status === "completada"
                            ? "bg-emerald-100/10 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                            : flashcard.status === "revision"
                            ? "bg-amber-100/10 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-amber-500/20"
                            : "bg-red-100/10 text-red-500 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-red-500/20"
                        }`}
                      >
                        {flashcard.status === "completada"
                          ? "Hecha"
                          : flashcard.status === "revision"
                          ? "Para repasar"
                          : "Sin hacer"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Avatar className="h-8 w-8 ring-2 ring-purple-500/30 dark:ring-purple-500/30">
                      <AvatarImage
                        src={flashcard.createdBy?.image || null}
                        alt={flashcard.createdBy?.name || "Usuario"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                        {flashcard.createdBy?.name?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-gray-400">
                        {flashcard.createdBy?.name || "Usuario"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-gray-400">
                        Creador
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back side - Answer */}
            <Card
              className="h-full w-full overflow-hidden absolute transition-all duration-200 bg-white/5 dark:bg-[#161622] backdrop-blur-sm border-2 border-zinc-200/30 dark:border-zinc-700/60 hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-500/10 group-hover:translate-y-[-2px]"
              style={{ ...backfaceHiddenStyle, ...rotateY180Style }}
            >
              {/* Floating orb effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-10 -left-20 w-40 h-40 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />

              {/* Expand button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedFlashcard(flashcard);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 dark:bg-zinc-800/50 hover:bg-white/20 dark:hover:bg-zinc-700/70 text-zinc-600 dark:text-zinc-300 transition-colors z-10"
                aria-label="Expandir tarjeta"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-blue-900/10 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardContent
                className="p-4 h-full flex flex-col justify-between relative cursor-pointer"
                onClick={() => toggleCardFlip(flashcard.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-purple-400 to-pink-400"></div>
                    <h3 className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-wide">
                      Respuesta
                    </h3>
                  </div>
                  <div
                    className="text-base text-zinc-700 dark:text-gray-300 prose dark:prose-invert prose-sm max-w-none [&_mark]:bg-yellow-200/80 dark:[&_mark]:bg-yellow-500/20"
                    dangerouslySetInnerHTML={{ __html: flashcard.answer }}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-200/20 dark:border-zinc-800/30">
                  {flashcard.status && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          flashcard.status === "completada"
                            ? "bg-emerald-100/10 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                            : flashcard.status === "revision"
                            ? "bg-amber-100/10 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-amber-500/20"
                            : "bg-red-100/10 text-red-500 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-red-500/20"
                        }`}
                      >
                        {flashcard.status === "completada"
                          ? "Hecha"
                          : flashcard.status === "revision"
                          ? "Para repasar"
                          : "Sin hacer"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Avatar className="h-8 w-8 ring-2 ring-purple-500/30 dark:ring-purple-500/30">
                      <AvatarImage
                        src={flashcard.createdBy?.image || null}
                        alt={flashcard.createdBy?.name || "Usuario"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                        {flashcard.createdBy?.name?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-gray-400">
                        {flashcard.createdBy?.name || "Usuario"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-gray-400">
                        Creador
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Render empty state based on current filter
  const renderEmptyState = () => {
    switch (activeFilter) {
      case "mastered":
        return (
          <div className="text-center py-12 px-4 bg-white/10 dark:bg-zinc-800/20 rounded-xl border border-zinc-200/30 dark:border-zinc-700/30 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              No hay flashcards dominadas
            </h3>
            <p className="text-zinc-500 dark:text-gray-400 max-w-md mx-auto">
              Todavía no has dominado ninguna flashcard. ¡Continúa estudiando
              para dominar el contenido!
            </p>
          </div>
        );
      case "learning":
        return (
          <div className="text-center py-12 px-4 bg-white/10 dark:bg-zinc-800/20 rounded-xl border border-zinc-200/30 dark:border-zinc-700/30 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100/50 dark:bg-amber-900/20 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              No hay flashcards en aprendizaje
            </h3>
            <p className="text-zinc-500 dark:text-gray-400 max-w-md mx-auto">
              No tienes flashcards en proceso de aprendizaje. ¡Comienza a
              estudiar para ver tu progreso aquí!
            </p>
          </div>
        );
      case "new":
        return (
          <div className="text-center py-12 px-4 bg-white/10 dark:bg-zinc-800/20 rounded-xl border border-zinc-200/30 dark:border-zinc-700/30 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100/50 dark:bg-blue-900/20 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              No hay flashcards nuevas
            </h3>
            <p className="text-zinc-500 dark:text-gray-400 max-w-md mx-auto">
              No tienes flashcards nuevas. ¡Crea nuevas flashcards para ampliar
              tu colección!
            </p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12 px-4 bg-white/10 dark:bg-zinc-800/20 rounded-xl border border-zinc-200/30 dark:border-zinc-700/30 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100/50 dark:bg-purple-900/20 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              No hay flashcards
            </h3>
            <p className="text-zinc-500 dark:text-gray-400 max-w-md mx-auto">
              No hay flashcards en esta colección. ¡Crea una nueva flashcard
              para empezar!
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="rounded-2xl min-h-full max-h-full bg-white/5 dark:bg-zinc-900/20 backdrop-blur-sm border border-zinc-200/30 dark:border-zinc-800/30 p-6 shadow-xl shadow-purple-500/5">
        {/* Search and filter bar */}
        <div className="mb-8">
          <div className="flex flex-wrap md:flex-nowrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Filter dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-zinc-200/20 dark:border-zinc-700/30",
                      activeFilter === "all" &&
                        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/30",
                      activeFilter === "mastered" &&
                        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/30",
                      activeFilter === "learning" &&
                        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/30",
                      activeFilter === "new" &&
                        "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 dark:border-indigo-500/30"
                    )}
                  >
                    {activeFilter === "all" && (
                      <span className="flex items-center gap-2">
                        <Filter className="h-4 w-4" /> Todas
                      </span>
                    )}
                    {activeFilter === "mastered" && (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Dominadas
                      </span>
                    )}
                    {activeFilter === "learning" && (
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Aprendiendo
                      </span>
                    )}
                    {activeFilter === "new" && (
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Nuevas
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <DropdownMenuCheckboxItem
                    checked={activeFilter === "all"}
                    onCheckedChange={() => setActiveFilter("all")}
                    className={cn(
                      "cursor-pointer",
                      activeFilter === "all" && "bg-blue-50 dark:bg-blue-950/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-blue-500" />
                      <span>Todas</span>
                      <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
                        {collection?.flashcards?.length || 0}
                      </span>
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilter === "mastered"}
                    onCheckedChange={() => setActiveFilter("mastered")}
                    className={cn(
                      "cursor-pointer",
                      activeFilter === "mastered" &&
                        "bg-emerald-50 dark:bg-emerald-950/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Dominadas</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilter === "learning"}
                    onCheckedChange={() => setActiveFilter("learning")}
                    className={cn(
                      "cursor-pointer",
                      activeFilter === "learning" &&
                        "bg-amber-50 dark:bg-amber-950/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span>Aprendiendo</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilter === "new"}
                    onCheckedChange={() => setActiveFilter("new")}
                    className={cn(
                      "cursor-pointer",
                      activeFilter === "new" && "bg-blue-50 dark:bg-blue-950/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-blue-500" />
                      <span>Nuevas</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search input */}
              <div className="relative flex-1 md:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar flashcards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 dark:bg-zinc-800/50 border border-zinc-200/20 dark:border-zinc-700/30 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Edit button - only visible if canEdit is true - Modern Design */}
            {canEdit && (
              <button
                onClick={() => {
                  setFlashcardToEdit(null);
                  setIsEditorOpen(true);
                }}
                className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-xl px-5 py-2.5 font-medium shadow-lg hover:shadow-green-500/30 transition-all duration-300 border border-green-400/20"
              >
                {/* Button background effects */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
                    <Plus className="h-3.5 w-3.5" fill="currentColor" />
                  </div>
                  <span className="relative">Crear flashcard</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Flashcards content */}
        <div className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredFlashcards.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1 px-2 h-[calc(100vh-280px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pt-2">
                  <AnimatePresence
                    mode="wait"
                    key={activeFilter + searchQuery + currentPage}
                  >
                    {currentCards.map((flashcard, index) =>
                      renderFlashcard(flashcard, index)
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 ">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-full transition-all ${
                        currentPage === 1
                          ? "text-zinc-500 dark:text-zinc-600 cursor-not-allowed"
                          : "bg-white/10 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-white/20 dark:hover:bg-zinc-800/70 hover:text-purple-500 dark:hover:text-purple-400"
                      }`}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        // Show limited page numbers with ellipsis
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                                currentPage === pageNumber
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                  : "bg-white/10 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-white/20 dark:hover:bg-zinc-800/70"
                              }`}
                              aria-label={`Ir a página ${pageNumber}`}
                              aria-current={
                                currentPage === pageNumber ? "page" : undefined
                              }
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          (pageNumber === 2 && currentPage > 3) ||
                          (pageNumber === totalPages - 1 &&
                            currentPage < totalPages - 2)
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="w-9 h-9 flex items-center justify-center text-zinc-500 dark:text-zinc-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-full transition-all ${
                        currentPage === totalPages
                          ? "text-zinc-500 dark:text-zinc-600 cursor-not-allowed"
                          : "bg-white/10 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-white/20 dark:hover:bg-zinc-800/70 hover:text-purple-500 dark:hover:text-purple-400"
                      }`}
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded flashcard dialog */}
      <Dialog
        open={!!expandedFlashcard}
        onOpenChange={(open) => !open && setExpandedFlashcard(null)}
      >
        <DialogContent className="sm:max-w-[800px] p-0 bg-white/5 dark:bg-[#0A0A0F]/95 backdrop-blur-md border border-zinc-200/20 dark:border-zinc-800/40 shadow-xl shadow-purple-500/10">
          {expandedFlashcard && (
            <div className="relative overflow-hidden">
              {/* Floating orb effects for dialog */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl" />
              <div className="absolute bottom-20 -left-40 w-80 h-80 bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-3xl" />

              <DialogHeader className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Flashcard
                  </DialogTitle>
                </div>
              </DialogHeader>

              <div className="p-6">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-blue-400 to-purple-400"></div>
                    <h3 className="font-semibold text-base bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-wide">
                      Pregunta
                    </h3>
                  </div>
                  <div
                    className="text-lg font-medium text-zinc-900 dark:text-white prose dark:prose-invert prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: expandedFlashcard.question,
                    }}
                  />
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-purple-400 to-pink-400"></div>
                    <h3 className="font-semibold text-base bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-wide">
                      Respuesta
                    </h3>
                  </div>
                  <div
                    className="text-base text-zinc-700 dark:text-gray-300 prose dark:prose-invert prose-lg max-w-none [&_mark]:bg-yellow-200/80 dark:[&_mark]:bg-yellow-500/20"
                    dangerouslySetInnerHTML={{
                      __html: expandedFlashcard.answer,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-200/20 dark:border-zinc-800/30">
                  {expandedFlashcard.status && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          expandedFlashcard.status === "done"
                            ? "bg-emerald-100/10 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-emerald-500/20"
                            : expandedFlashcard.status === "review"
                            ? "bg-amber-100/10 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-amber-500/20"
                            : "bg-red-100/10 text-red-500 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-red-500/20"
                        }`}
                      >
                        {expandedFlashcard.status === "done"
                          ? "Completada"
                          : expandedFlashcard.status === "review"
                          ? "Para repasar"
                          : "Sin hacer"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/30 dark:ring-purple-500/30">
                      <AvatarImage
                        src={expandedFlashcard.createdBy?.image || null}
                        alt={expandedFlashcard.createdBy?.name || "Usuario"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium text-lg">
                        {expandedFlashcard.createdBy?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {expandedFlashcard.createdBy?.name || "Usuario"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-gray-400">
                        Creador
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor de flashcards */}
      {canEdit && (
        <FlashcardEditor
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          collection={collection}
          flashcardToEdit={flashcardToEdit}
          onFlashcardAdded={() => {
            // Recargar la colección después de editar una flashcard
            setFlashcardToEdit(null);
          }}
        />
      )}
    </>
  );
}
