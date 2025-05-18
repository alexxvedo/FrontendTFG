"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  Clock,
  Star,
  Target,
  Trophy,
  ChevronRight,
  Calendar,
  MessageSquare,
  Zap,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DeleteWorkspaceDialog from "@/components/workspace/delete-workspace-dialog";
import useApi from "@/lib/api";

export function WorkspacesSection({ userStats }) {
  // Usando toast de sonner directamente
  const router = useRouter();
  const [localWorkspaces, setLocalWorkspaces] = useState([]);
  const [workspacePermissions, setWorkspacePermissions] = useState({});
  const { data: session } = useSession();
  const api = useApi();
  
  // Handle workspace deletion
  const handleDeleteWorkspace = (workspaceId) => {
    // Remove the workspace from the local state
    setLocalWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    // Refresh the page to update the workspaces list
    router.refresh();
  };
  
  // Cargar los permisos de los workspaces
  useEffect(() => {
    if (!session?.user?.email || localWorkspaces.length === 0) return;
    
    const loadPermissions = async () => {
      const permissions = {};
      
      for (const workspace of localWorkspaces) {
        try {
          if (!workspace.id) continue;
          
          const response = await api.workspaces.getUsers(workspace.id);
          const users = response?.data || [];
          const currentUser = users.find(u => u.email === session.user.email);
          
          if (currentUser) {
            permissions[workspace.id] = currentUser.permissionType;
          }
        } catch (error) {
          console.error(`Error al cargar permisos para workspace ${workspace.id}:`, error);
        }
      }
      
      setWorkspacePermissions(permissions);
    };
    
    loadPermissions();
  }, [localWorkspaces, session?.user?.email, api.workspaces]);
  if (!userStats) return null;

  // Parse workspace contributions from the backend format
  // Format: "name:description:collections:members:activityLevel:lastActive:contributions"
  const workspaces = localWorkspaces.length > 0 ? localWorkspaces : [];
  if (localWorkspaces.length === 0 && userStats?.workspaceContributions && typeof userStats.workspaceContributions === 'object') {
    Object.entries(userStats.workspaceContributions).forEach(([key, contributions]) => {
      const parts = key.split(':');
      if (parts.length >= 7) {
        workspaces.push({
          id: parts[7] || `workspace-${workspaces.length + 1}`, // Use real ID if available
          name: parts[0],
          description: parts[1],
          collections: parseInt(parts[2]) || 0,
          members: parseInt(parts[3]) || 0,
          activityLevel: parseInt(parts[4]) || 0,
          lastActive: parts[5],
          contributions: parseInt(parts[6]) || 0,
          achievements: ['Active Contributor', 'Team Player']
        });
      }
    });
    
    // Initialize local state with parsed workspaces
    if (workspaces.length > 0 && localWorkspaces.length === 0) {
      setLocalWorkspaces(workspaces);
    }
  }
  
  const totalWorkspaces = userStats?.totalWorkspaces || 0;
  const activeWorkspaces = userStats?.activeWorkspaces || 0;

  const workspaceStats = {
    totalWorkspaces,
    activeWorkspaces,
    totalCollections: workspaces.reduce(
      (acc, workspace) => acc + (workspace.collections || 0),
      0
    ),
    totalMembers: workspaces.reduce(
      (acc, workspace) => acc + (workspace.members || 0),
      0
    ),
  };

  return (
    <div className="space-y-8">
      {/* Workspaces Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-400">Total Workspaces</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {workspaceStats.totalWorkspaces}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Active Workspaces</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {workspaceStats.activeWorkspaces}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">Collections</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {workspaceStats.totalCollections}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">Total Members</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {workspaceStats.totalMembers}
          </p>
        </div>
      </div>

      {/* Workspaces List */}
      <div className="space-y-4">
        {workspaces.map((workspace, index) => {
          const activityPercentage = workspace.activityLevel || 0;
          const color = 
            activityPercentage >= 75 ? "from-green-400 to-emerald-400" :
            activityPercentage >= 50 ? "from-blue-400 to-cyan-400" :
            activityPercentage >= 25 ? "from-yellow-400 to-amber-400" :
            "from-red-400 to-rose-400";

          return (
            <div
              key={workspace.id || index}
              className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        {workspace.name}
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                      </h3>
                      <p className="text-sm text-gray-400">{workspace.description}</p>
                    </div>
                    <div>
                      <DeleteWorkspaceDialog 
                        workspace={workspace} 
                        onDelete={() => handleDeleteWorkspace(workspace.id)}
                        userPermission={workspacePermissions[workspace.id]}
                      />
                    </div>
                  </div>

                  {/* Workspace Stats */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Activity Level</span>
                        <span>{activityPercentage}%</span>
                      </div>
                      <Progress
                        value={activityPercentage}
                        className="h-1.5 bg-zinc-800"
                      />
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{workspace.collections || 0} collections</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{workspace.totalCards || 0} cards</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{workspace.members || 0} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Last active: {workspace.lastActive || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        <span>{workspace.contributions || 0} contributions</span>
                      </div>
                    </div>

                    {/* Workspace Achievements */}
                    {workspace.achievements && workspace.achievements.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {workspace.achievements.map((achievement, achievementIndex) => (
                          <Badge
                            key={achievementIndex}
                            className={`bg-gradient-to-r ${color} border-none`}
                          >
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {workspaces.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No workspaces found</p>
            <p className="text-sm text-gray-500">Join or create a workspace to start collaborating</p>
          </div>
        )}
      </div>
    </div>
  );
}
