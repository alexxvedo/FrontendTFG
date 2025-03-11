import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { WorkspaceUsersList } from "@/components/workspace/workspace-users-list";

export default function Members({ activeWorkspace }) {
  return (
    <Card className="relative overflow-hidden border-gray-200/10 dark:border-gray-700/20 bg-background/50 dark:bg-gray-800/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-pink-500/3 to-gray-500/2 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/3 rounded-xl pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">Usuarios del Workspace</CardTitle>
        <CardDescription className="text-muted-foreground dark:text-gray-400">
          Gestiona los miembros y sus permisos en el workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <WorkspaceUsersList workspaceId={activeWorkspace?.id} />
      </CardContent>
    </Card>
  );
}
