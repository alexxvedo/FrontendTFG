import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const FlashcardList = memo(({ flashcards }) => {
  return (
    <ScrollArea className="h-[calc(100vh-20rem)] px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        <AnimatePresence>
          {flashcards.map((flashcard) => (
            <motion.div
              key={flashcard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              layout
              className="h-[300px] group"
            >
              <Card className="h-full overflow-hidden relative transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-pink-400/10 hover:border-purple-500/20 dark:hover:border-pink-400/20 group-hover:translate-y-[-2px]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 h-full flex flex-col justify-between relative">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-sm text-purple-600 dark:text-purple-400">
                      Pregunta
                    </h3>
                    <div
                      className="text-base text-zinc-900 dark:text-zinc-100 prose dark:prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: flashcard.question }}
                    />
                  </div>
                  <div className="flex-1 min-h-0">
                    <h3 className="font-medium mb-2 text-sm text-purple-600 dark:text-purple-400">
                      Respuesta
                    </h3>
                    <div
                      className="text-base text-zinc-700 dark:text-zinc-300 line-clamp-4 overflow-hidden prose dark:prose-invert prose-sm max-w-none [&_mark]:bg-yellow-200 dark:[&_mark]:bg-yellow-500/20"
                      dangerouslySetInnerHTML={{ __html: flashcard.answer }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    {flashcard.status && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            flashcard.status === "done"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : flashcard.status === "review"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                              : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400"
                          }`}
                        >
                          {flashcard.status === "done"
                            ? "Completada"
                            : flashcard.status === "review"
                            ? "Para repasar"
                            : "Sin hacer"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-zinc-900">
                        <AvatarImage 
                          src={flashcard.createdBy?.image || null} 
                          alt={flashcard.createdBy?.name || 'Usuario'} 
                        />
                        <AvatarFallback>
                          {flashcard.createdBy?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                        {flashcard.createdBy?.name || "Usuario"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
});

FlashcardList.displayName = "FlashcardList";

export default FlashcardList;
