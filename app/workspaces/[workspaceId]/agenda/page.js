"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  GripVertical,
  Clock,
  PlusIcon,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import Background from "@/components/background/background";
import { useApi } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useWorkspaceSocket } from "@/components/workspace/workspace-socket-provider";
import { CheckSquare } from "lucide-react";

function DroppableColumn({ columnId, children }) {
  const { setNodeRef } = useDroppable({ id: columnId });
  return (
    <div ref={setNodeRef} className="flex-1">
      {children}
    </div>
  );
}

function EditTaskDialog({ task, isOpen, onClose, onSave }) {
  const [editedTask, setEditedTask] = useState({
    ...task,
    subtasks: task.subtasks || [],
    priority: task.priority || "medium",
    assignedTo: task.assignedTo || null,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
  });
  const [newSubtask, setNewSubtask] = useState("");
  const [workspaceUsers, setWorkspaceUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const subtasksContainerRef = useRef(null);
  const api = useApi();
  const params = useParams();
  const workspaceId = params?.workspaceId;

  // Cargar los usuarios del workspace
  useEffect(() => {
    const loadWorkspaceUsers = async () => {
      if (!workspaceId) return;

      setIsLoadingUsers(true);
      try {
        const response = await api.workspaces.getUsers(workspaceId);
        if (response.data) {
          console.log("Usuarios del workspace:", response.data);
          setWorkspaceUsers(response.data);
        }
      } catch (error) {
        console.error("Error al cargar los usuarios del workspace:", error);
        toast.error("No se pudieron cargar los usuarios del workspace");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadWorkspaceUsers();
  }, [workspaceId]);

  const handleSave = () => {
    console.log("Guardando tarea con asignación:", editedTask.assignedTo);
    onSave(editedTask);
    onClose();
  };

  const addSubtask = () => {
    if (newSubtask.trim() === "") return;
    setEditedTask({
      ...editedTask,
      subtasks: [
        ...editedTask.subtasks,
        {
          id: `temp-${Date.now()}`,
          title: newSubtask,
          completed: false,
        },
      ],
    });
    setNewSubtask("");

    // Scroll to the bottom of the subtasks container
    if (subtasksContainerRef.current) {
      setTimeout(() => {
        subtasksContainerRef.current.scrollTop =
          subtasksContainerRef.current.scrollHeight;
      }, 100);
    }
  };

  const toggleSubtask = (subtaskId) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks.map((subtask) =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      ),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-md border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Editar Tarea
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título
            </Label>
            <Input
              id="title"
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
              className="bg-background/50 backdrop-blur-sm border-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={editedTask.description || ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
              className="min-h-[100px] bg-background/50 backdrop-blur-sm border-gray-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Estado
              </Label>
              <Select
                value={editedTask.status}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, status: value })
                }
              >
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-gray-800">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border-gray-800">
                  <SelectItem value="To Do">Por hacer</SelectItem>
                  <SelectItem value="In Progress">En progreso</SelectItem>
                  <SelectItem value="Done">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Prioridad
              </Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, priority: value })
                }
              >
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-gray-800">
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border-gray-800">
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium">
              Fecha de vencimiento
            </Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCalendar(!showCalendar)}
                className={cn(
                  "w-full justify-start text-left font-normal bg-background/50 backdrop-blur-sm border-gray-800",
                  !editedTask.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {editedTask.dueDate ? (
                  format(new Date(editedTask.dueDate), "PPP", { locale: es })
                ) : (
                  <span>Sin fecha</span>
                )}
              </Button>
              {showCalendar && (
                <div className="absolute z-50 mt-1 w-auto bg-background/95 backdrop-blur-md border border-gray-800 rounded-md shadow-lg">
                  <Calendar
                    mode="single"
                    selected={
                      editedTask.dueDate
                        ? new Date(editedTask.dueDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      setEditedTask({ ...editedTask, dueDate: date });
                      setShowCalendar(false);
                    }}
                    initialFocus
                    locale={es}
                    className="bg-transparent"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignedTo" className="text-sm font-medium">
              Asignado a
            </Label>
            <Select
              value={editedTask.assignedTo || ""}
              onValueChange={(value) =>
                setEditedTask({
                  ...editedTask,
                  assignedTo: value || null,
                })
              }
            >
              <SelectTrigger className="bg-background/50 backdrop-blur-sm border-gray-800">
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md border-gray-800">
                <SelectItem value="no-assign">Sin asignar</SelectItem>
                {workspaceUsers.map((user) => (
                  <SelectItem key={user.email} value={user.email}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{user.name || user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Subtareas</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Nueva subtarea"
                  className="h-8 text-sm bg-background/50 backdrop-blur-sm border-gray-800"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addSubtask}
                  className="h-8 px-2 "
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div
              ref={subtasksContainerRef}
              className="space-y-2 max-h-[150px] overflow-y-auto pr-2 bg-background/30 p-3 rounded-md border border-gray-800/50"
            >
              {editedTask.subtasks.map((subtask, index) => (
                <div
                  key={subtask.id || index}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={`subtask-${index}`}
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(subtask.id)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <Input
                    value={subtask.title}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        subtasks: editedTask.subtasks.map((st, i) =>
                          i === index ? { ...st, title: e.target.value } : st
                        ),
                      })
                    }
                    className="flex-1 h-8 bg-background/50 backdrop-blur-sm border-gray-800"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setEditedTask({
                        ...editedTask,
                        subtasks: editedTask.subtasks.filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              {editedTask.subtasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay subtareas
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="destructive"
              onClick={onClose}
              className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50"
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              Guardar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DraggableBoard() {
  const [columns, setColumns] = useState({
    "To Do": [],
    "In Progress": [],
    Done: [],
  });

  const [newTaskTitles, setNewTaskTitles] = useState({
    "To Do": "",
    "In Progress": "",
    Done: "",
  });

  const [activeTask, setActiveTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [workspaceUsers, setWorkspaceUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario
  const [canEdit, setCanEdit] = useState(false); // Estado para indicar si el usuario puede editar
  const api = useApi();
  const { data: session } = useSession();
  const params = useParams();
  const workspaceId = params?.workspaceId;

  // Socket para tiempo real
  const {
    socket,
    isConnected,
    agendaUsers,
    joinAgenda,
    leaveAgenda,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitTaskMoved,
    requestAgendaUsers,
  } = useWorkspaceSocket();

  const [activeTaskImageError, setActiveTaskImageError] = useState(false);

  // Resetear el error de imagen cuando cambia la tarea activa
  useEffect(() => {
    setActiveTaskImageError(false);
  }, [activeTask]);

  // Cargar tareas al iniciar y unirse a la agenda
  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceUsers().then(() => {
        loadTasks();
      });
    }
  }, [workspaceId]);

  // Unirse a la agenda cuando el socket esté conectado
  useEffect(() => {
    if (isConnected && workspaceId) {
      joinAgenda();
      requestAgendaUsers();
    }

    // Salir de la agenda al desmontar
    return () => {
      if (isConnected && workspaceId) {
        leaveAgenda();
      }
    };
  }, [isConnected, workspaceId, joinAgenda, leaveAgenda, requestAgendaUsers]);

  // Cargar los usuarios del workspace y verificar permisos del usuario actual
  const loadWorkspaceUsers = async () => {
    setIsLoading(true);
    try {
      // Cargar los usuarios del workspace
      const usersResponse = await api.workspaces.getUsers(workspaceId);
      console.log("Usuarios: ", usersResponse);
      console.log("Usuario actual: ", session.user);
      console.log("POLLAAAAAAS");

      if (usersResponse.data) {
        setWorkspaceUsers(usersResponse.data);
        // Comprobar los permisos del usuario actual
        const user = usersResponse.data.filter(
          (user) => user.email === session.user?.email
        )[0];
        console.log("Usuario filtrado: ", user);
        console.log("Permisos del usuario actual: ", user.permissionType);

        setUserRole(user.permissionType);

        if (user.permissionType == "EDITOR" || user.permissionType == "OWNER") {
          setCanEdit(true);
        }
      }
    } catch (error) {
      console.error("Error al cargar los datos del workspace:", error);
      toast.error("No se pudieron cargar los datos del workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await api.tasks.getByWorkspace(workspaceId);
      if (response.data) {
        // Convertir las tareas al formato esperado por el componente
        const formattedTasks = response.data.map((task) => ({
          id: task.id.toString(), // Asegurarse de que el ID sea un string
          title: task.title,
          description: task.description || "",
          status:
            task.status === "TODO"
              ? "To Do"
              : task.status === "IN_PROGRESS"
              ? "In Progress"
              : "Done",
          priority: (task.priority || "MEDIUM").toLowerCase(),
          subtasks: Array.isArray(task.subtasks)
            ? task.subtasks.map((st) => ({
                id: st.id.toString(), // Asegurarse de que el ID sea un string
                title: st.title,
                completed: st.completed,
              }))
            : [],
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          assignedTo: task.assignedToId,
          assignedToUser: task.assignedToUser || null, // Guardar información del usuario asignado si existe
        }));

        // Organizar las tareas por estado
        const tasksByStatus = {
          "To Do": formattedTasks.filter((task) => task.status === "To Do"),
          "In Progress": formattedTasks.filter(
            (task) => task.status === "In Progress"
          ),
          Done: formattedTasks.filter((task) => task.status === "Done"),
        };
        setColumns(tasksByStatus);
      }
    } catch (error) {
      console.error("Error al cargar las tareas:", error);
      toast.error("No se pudieron cargar las tareas");
    }
  };

  // Escuchar eventos específicos de tareas del socket para actualizaciones en tiempo real
  useEffect(() => {
    if (!socket || !isConnected || !workspaceId) return;

    const handleTaskCreated = (data) => {
      console.log("Evento task_created recibido:", data);
      if (data.task && data.createdBy?.email !== session?.user?.email) {
        // Solo actualizar si no es el usuario actual quien creó la tarea
        loadTasks();
      }
    };

    const handleTaskUpdated = (data) => {
      console.log("Evento task_updated recibido:", data);
      if (data.task && data.updatedBy?.email !== session?.user?.email) {
        // Solo actualizar si no es el usuario actual quien actualizó la tarea
        loadTasks();
      }
    };

    const handleTaskDeleted = (data) => {
      console.log("Evento task_deleted recibido:", data);
      if (data.deletedBy?.email !== session?.user?.email) {
        // Solo actualizar si no es el usuario actual quien eliminó la tarea
        loadTasks();
      }
    };

    const handleTaskMoved = (data) => {
      console.log("Evento task_moved recibido:", data);
      if (data.movedBy?.email !== session?.user?.email) {
        // Solo actualizar si no es el usuario actual quien movió la tarea
        loadTasks();
      }
    };

    // Registrar eventos
    socket.on("task_created", handleTaskCreated);
    socket.on("task_updated", handleTaskUpdated);
    socket.on("task_deleted", handleTaskDeleted);
    socket.on("task_moved", handleTaskMoved);

    return () => {
      // Limpiar eventos
      socket.off("task_created", handleTaskCreated);
      socket.off("task_updated", handleTaskUpdated);
      socket.off("task_deleted", handleTaskDeleted);
      socket.off("task_moved", handleTaskMoved);
    };
  }, [socket, isConnected, workspaceId, session?.user?.email, loadTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const [columnId, taskId] = active.id.split("-");
    const task = columns[columnId]?.find(
      (t) => t.id.toString() === taskId.toString()
    );
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeIdStr = active.id;
    const overIdStr = over.id;

    const [activeContainer, activeTaskId] = activeIdStr.split("-");
    let overContainer = overIdStr;
    let overTaskId;

    // Si el over.id contiene un guión, significa que estamos sobre una tarea
    // Si no, estamos sobre una columna
    if (overIdStr.includes("-")) {
      [overContainer, overTaskId] = overIdStr.split("-");
    }

    if (!activeContainer || !overContainer) {
      return;
    }

    // Depurar el estado actual de las columnas
    if (columns[activeContainer] && columns[activeContainer].length > 0) {
      columns[activeContainer].forEach((task) => {
        console.log(
          `Tarea: ${task.title}, ID: ${task.id}, Tipo: ${typeof task.id}`
        );
      });
    }

    if (activeContainer === overContainer) {
      // Reordenar dentro de la misma columna
      // Por ahora, no implementamos persistencia del orden dentro de la misma columna
      // ya que requeriría un campo de orden en la base de datos
      console.log(
        "Reordenando dentro de la misma columna - funcionalidad pendiente"
      );
      return;
    } else {
      // Obtener la tarea antes de actualizar el estado
      const currentColumns = { ...columns };
      const sourceTasks = currentColumns[activeContainer] || [];

      // Intentar encontrar la tarea con diferentes comparaciones
      let taskToMove = sourceTasks.find(
        (task) => task.id.toString() === activeTaskId
      );
      if (!taskToMove) {
        taskToMove = sourceTasks.find(
          (task) => Number(task.id) === Number(activeTaskId)
        );
      }

      if (!taskToMove) {
        return;
      }

      // Actualizar inmediatamente la UI para el usuario actual
      setColumns((prev) => {
        const sourceTasks = prev[activeContainer] || [];
        const destinationTasks = prev[overContainer] || [];
        const taskIndex = sourceTasks.findIndex(
          (task) => task.id.toString() === activeTaskId.toString()
        );
        if (taskIndex === -1) {
          console.log("No se encontró la tarea, saliendo...");
          return prev;
        }
        const taskToMoveUI = sourceTasks[taskIndex];
        return {
          ...prev,
          [activeContainer]: [
            ...sourceTasks.slice(0, taskIndex),
            ...sourceTasks.slice(taskIndex + 1),
          ],
          [overContainer]: [
            ...destinationTasks,
            { ...taskToMoveUI, status: overContainer },
          ],
        };
      });

      // Luego actualizar en la base de datos
      try {
        // Mapeo de estados para el backend
        const statusMap = {
          "To Do": "TODO",
          "In Progress": "IN_PROGRESS",
          Done: "DONE",
        };

        if (taskToMove) {
          await api.tasks.update(taskToMove.id, workspaceId, {
            title: taskToMove.title,
            description: taskToMove.description,
            priority: taskToMove.priority?.toUpperCase() || "MEDIUM",
            status: statusMap[overContainer],
            dueDate: taskToMove.dueDate,
            assignedToId: taskToMove.assignedTo,
          });

          // Emitir evento de tarea movida en tiempo real
          emitTaskMoved(
            taskToMove.id,
            activeTask.status,
            overContainer,
            taskToMove
          );
        } else {
          console.error("No se encontró la tarea para actualizar");
        }
      } catch (error) {
        console.error("Error al actualizar el estado de la tarea:", error);
        toast.error("No se pudo actualizar el estado de la tarea");
        // Si hay error, revertir el cambio en la UI
        loadTasks();
      }
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleSaveTask = async (editedTask) => {
    // Mapeo de estados para el backend
    const statusMap = {
      "To Do": "TODO",
      "In Progress": "IN_PROGRESS",
      Done: "DONE",
    };

    try {
      // Preparar datos para la API
      const taskData = {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority.toUpperCase(),
        status: statusMap[editedTask.status] || statusMap["To Do"],
        dueDate: editedTask.dueDate,
        assignedToId: editedTask.assignedTo, // Usar el email como identificador
        subtasks: editedTask.subtasks.map((st) => ({
          title: st.title,
          completed: st.completed,
        })),
      };

      // Llamar a la API para actualizar la tarea
      await api.tasks.update(editedTask.id, workspaceId, taskData);

      // Emitir evento de tarea actualizada en tiempo real
      const changes = {};
      if (editedTask.title !== editingTask.title)
        changes.title = editedTask.title;
      if (editedTask.description !== editingTask.description)
        changes.description = editedTask.description;
      if (editedTask.priority !== editingTask.priority)
        changes.priority = editedTask.priority;
      if (editedTask.status !== editingTask.status)
        changes.status = editedTask.status;
      if (editedTask.dueDate !== editingTask.dueDate)
        changes.dueDate = editedTask.dueDate;
      if (editedTask.assignedTo !== editingTask.assignedTo)
        changes.assignedTo = editedTask.assignedTo;
      if (editedTask.subtasks !== editingTask.subtasks)
        changes.subtasks = editedTask.subtasks;

      emitTaskUpdated(editedTask, changes);

      // Actualizar estado local inmediatamente para el usuario actual
      setColumns((prev) => {
        const newColumns = { ...prev };
        if (editedTask.status !== editingTask.status) {
          // Mover tarea entre columnas
          newColumns[editingTask.status] = newColumns[
            editingTask.status
          ].filter((t) => t.id !== editedTask.id);
          newColumns[editedTask.status] = [
            ...newColumns[editedTask.status],
            editedTask,
          ];
        } else {
          // Actualizar tarea en la misma columna
          newColumns[editedTask.status] = newColumns[editedTask.status].map(
            (t) => (t.id === editedTask.id ? editedTask : t)
          );
        }
        return newColumns;
      });
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
      toast.error("No se pudo actualizar la tarea");
    }
  };

  const handleDeleteTask = async (task) => {
    try {
      await api.tasks.delete(workspaceId, task.id);

      // Emitir evento de tarea eliminada en tiempo real
      emitTaskDeleted(task.id);

      // Actualizar estado local inmediatamente para el usuario actual
      setColumns((prev) => {
        const newColumns = { ...prev };
        newColumns[task.status] = newColumns[task.status].filter(
          (t) => t.id !== task.id
        );
        return newColumns;
      });
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
      toast.error("No se pudo eliminar la tarea");
    }
  };

  const addTask = async (columnId) => {
    if (newTaskTitles[columnId].trim() === "") return;

    // Mapeo de estados para el backend
    const statusMap = {
      "To Do": "TODO",
      "In Progress": "IN_PROGRESS",
      Done: "DONE",
    };

    try {
      if (!workspaceId || !session?.user?.email) {
        throw new Error("Falta información del workspace o usuario");
      }

      // Crear la tarea en la base de datos
      const response = await api.tasks.create(workspaceId, session.user.email, {
        title: newTaskTitles[columnId],
        description: "",
        priority: "MEDIUM",
        status: statusMap[columnId],
        dueDate: null,
        assignedToId: null,
        subtasks: [],
      });

      // Obtener la tarea creada
      const createdTask = response.data;

      // Actualizar el estado local
      const newTask = {
        id: createdTask.id,
        title: createdTask.title,
        description: createdTask.description || "",
        status: columnId,
        priority: (createdTask.priority || "MEDIUM").toLowerCase(),
        subtasks: createdTask.subtasks || [],
        dueDate: createdTask.dueDate,
        assignedTo: createdTask.assignedToId,
      };

      // Emitir evento de tarea creada en tiempo real
      emitTaskCreated(newTask);

      // Actualizar estado local inmediatamente para el usuario actual
      setColumns((prev) => ({
        ...prev,
        [columnId]: [...prev[columnId], newTask],
      }));

      // Limpiar el input
      setNewTaskTitles((prev) => ({ ...prev, [columnId]: "" }));
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      toast.error("No se pudo crear la tarea");
    }
  };

  // Función para buscar un usuario por email
  const findUserByEmail = useCallback(
    (email) => {
      if (!email || !workspaceUsers || workspaceUsers.length === 0) return null;
      return workspaceUsers.find((user) => user.email === email) || null;
    },
    [workspaceUsers]
  );

  // Función para obtener la inicial del usuario
  const getUserInitial = useCallback(
    (email) => {
      const user = findUserByEmail(email);
      if (user && user.name) {
        return user.name.charAt(0).toUpperCase();
      }
      // Si no encontramos el usuario o no tiene nombre, usamos la primera letra del email
      return email ? email.charAt(0).toUpperCase() : "U";
    },
    [findUserByEmail]
  );

  // Función para obtener el nombre a mostrar del usuario
  const getUserDisplayName = useCallback(
    (email) => {
      const user = findUserByEmail(email);
      if (user && user.name) {
        return user.name.split(" ")[0]; // Primer nombre
      }
      // Si no encontramos el usuario o no tiene nombre, usamos la parte antes del @ del email
      return email ? email.split("@")[0] : "";
    },
    [findUserByEmail]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Background />
      <div className="p-6 min-h-screen pb-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Tareas</h1>
              <p className="text-gray-400 mt-2">
                Organiza y gestiona las tareas de tu equipo de forma eficiente
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Indicador de conexión */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-gray-400">
                  {isConnected ? "En línea" : "Desconectado"}
                </span>
              </div>

              {/* Usuarios en la agenda */}
              {agendaUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">En agenda:</span>
                  <div className="flex -space-x-2">
                    {agendaUsers.slice(0, 5).map((user, index) => (
                      <Avatar
                        key={user.email}
                        className="h-6 w-6 border-2 border-background"
                      >
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 text-xs">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    ))}
                    {agendaUsers.length > 5 && (
                      <div className="h-6 w-6 rounded-full bg-gray-700 border-2 border-background flex items-center justify-center">
                        <span className="text-xs text-gray-300">
                          +{agendaUsers.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">Cargando usuarios y tareas...</p>
              </div>
            </div>
          ) : (
            Object.keys(columns).map((columnId) => (
              <DroppableColumn key={columnId} columnId={columnId}>
                <Card className="h-full min-h-[300px] bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm border-gray-800/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {columnId}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-card/30 backdrop-blur-sm border-0"
                      >
                        {columns[columnId].length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Input
                        placeholder={`Añadir tarea a ${columnId}`}
                        value={newTaskTitles[columnId] || ""}
                        onChange={(e) =>
                          setNewTaskTitles((prev) => ({
                            ...prev,
                            [columnId]: e.target.value,
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addTask(columnId);
                          }
                        }}
                        className="flex-1 bg-background/50 backdrop-blur-sm border-gray-800/50"
                      />
                      <Button size="icon" onClick={() => addTask(columnId)}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[calc(100vh-18rem)] pr-2">
                      <SortableContext
                        items={columns[columnId].map(
                          (task) => `${columnId}-${task.id}`
                        )}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {columns[columnId].map((task) => (
                            <TaskItem
                              key={`${columnId}-${task.id}`}
                              task={task}
                              columnId={columnId}
                              onEditTask={handleEditTask}
                              onDeleteTask={handleDeleteTask}
                              findUserByEmail={findUserByEmail}
                              getUserInitial={getUserInitial}
                              getUserDisplayName={getUserDisplayName}
                              canEdit={canEdit} // Pasar el estado de permisos al componente TaskItem
                            />
                          ))}
                          {columns[columnId].length === 0 && (
                            <div className="p-8 text-center text-muted-foreground text-sm border-2 border-dashed border-gray-800/30 rounded-lg bg-background/20 backdrop-blur-sm">
                              Arrastra aquí
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </DroppableColumn>
            ))
          )}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="transform-none">
            <div
              className="group p-4 mb-3 bg-card rounded-lg border shadow-sm transition-all duration-200"
              style={{ width: "100%", maxWidth: "300px" }}
            >
              <div className="flex items-start gap-2">
                <div
                  className="cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-4 h-4 mt-1 text-muted-foreground/50 group-hover:text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="font-medium">{activeTask.title}</div>
                    <AlertCircle
                      className={`h-4 w-4 ${
                        activeTask.priority === "high"
                          ? "text-red-500"
                          : activeTask.priority === "medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    />
                  </div>
                  {activeTask.description && (
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {activeTask.description}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    {activeTask.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(activeTask.dueDate), "d MMM", {
                          locale: es,
                        })}
                      </div>
                    )}
                    {activeTask.assignedTo && (
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          {activeTask.assignedToUser?.image &&
                          !activeTaskImageError ? (
                            <AvatarImage
                              src={activeTask.assignedToUser.image}
                              alt={
                                activeTask.assignedToUser.name ||
                                activeTask.assignedTo
                              }
                              onError={() => setActiveTaskImageError(true)}
                            />
                          ) : (
                            <AvatarFallback>
                              {activeTask.assignedToUser?.name
                                ? activeTask.assignedToUser.name
                                    .charAt(0)
                                    .toUpperCase()
                                : activeTask.assignedTo.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="truncate max-w-[80px]">
                          {activeTask.assignedToUser?.name?.split(" ")[0] ||
                            activeTask.assignedTo.split("@")[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveTask}
        />
      )}
    </DndContext>
  );
}

function TaskItem({
  task,
  columnId,
  onEditTask,
  onDeleteTask,
  findUserByEmail,
  getUserInitial,
  getUserDisplayName,
  canEdit, // Nuevo prop para controlar si el usuario puede editar
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${columnId}-${task.id}`,
    disabled: !canEdit, // Deshabilitar el drag & drop si el usuario no puede editar
  });

  const [imageError, setImageError] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-blue-400";
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteTask(task);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group p-4 mb-3 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-lg border border-gray-800/50 shadow-lg hover:shadow-purple-900/10 transition-all duration-200 ${
        isDragging
          ? "opacity-50 scale-105 shadow-xl border-purple-500/50 z-50"
          : ""
      }`}
      onClick={() => onEditTask(task)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {canEdit && (
              <div
                className="cursor-grab active:cursor-grabbing"
                {...listeners}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
              </div>
            )}
            <h3 className="font-medium text-sm truncate">{task.title}</h3>

            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 ml-6">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3 ml-6">
            {task.priority && (
              <Badge
                variant="outline"
                className={`${getPriorityColor(
                  task.priority
                )} bg-card/30 backdrop-blur-sm border-0 text-[10px] px-2 py-0 h-5`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            )}

            {task.dueDate && (
              <Badge
                variant="outline"
                className="bg-card/30 backdrop-blur-sm border-0 text-[10px] px-2 py-0 h-5 text-blue-400"
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(new Date(task.dueDate), "d MMM")}
              </Badge>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <Badge
                variant="outline"
                className="bg-card/30 backdrop-blur-sm border-0 text-[10px] px-2 py-0 h-5 text-purple-400"
              >
                <CheckSquare className="mr-1 h-3 w-3" />
                {task.subtasks.filter((st) => st.completed).length}/
                {task.subtasks.length}
              </Badge>
            )}

            {task.assignedTo && (
              <div className="flex items-center gap-1 ml-auto">
                <Avatar className="h-5 w-5 border border-purple-900/30">
                  {task.assignedToUser?.image && !imageError ? (
                    <AvatarImage
                      src={task.assignedToUser.image}
                      alt={task.assignedToUser.name || task.assignedTo}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 text-[10px]">
                      {task.assignedToUser?.name
                        ? task.assignedToUser.name.charAt(0).toUpperCase()
                        : task.assignedTo.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="truncate max-w-[80px] text-xs text-muted-foreground">
                  {task.assignedToUser?.name?.split(" ")[0] ||
                    task.assignedTo.split("@")[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
