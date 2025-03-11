import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookIcon, FolderIcon, StickyNoteIcon } from "lucide-react";
import FlashcardTabs from "@/components/collection/FlashcardTabs";
import CollectionStats from "@/components/collection/CollectionStats";
import CollectionResources from "@/components/collection/CollectionResources";
import CollectionNotes from "@/components/collection/CollectionNotes";

export default function CollectionTabs({ collection, isLoading }) {
  return (
    <Tabs defaultValue="flashcards" className="w-full max-w-[full]">
      <TabsList className="inline-flex h-12 items-center justify-center rounded-full mx-auto mb-8 border dark:border-zinc-800/20 shadow-xl shadow-purple-500/5 backdrop-blur-sm bg-white/5">
        <TabsTrigger
          value="flashcards"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
        >
          Flashcards
        </TabsTrigger>
        <TabsTrigger
          value="stats"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
        >
          <BookIcon className="size-4" />
          Estadísticas
        </TabsTrigger>
        <TabsTrigger
          value="resources"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
        >
          <FolderIcon className="size-4" />
          Recursos
        </TabsTrigger>
        <TabsTrigger
          value="notes"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
        >
          <StickyNoteIcon className="size-4" />
          Notas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="flashcards">
        <FlashcardTabs collection={collection} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="stats">
        <CollectionStats collection={collection} />
      </TabsContent>

      <TabsContent value="resources">
        <CollectionResources collection={collection} />
      </TabsContent>

      <TabsContent value="notes">
        <CollectionNotes />
      </TabsContent>
    </Tabs>
  );
}
