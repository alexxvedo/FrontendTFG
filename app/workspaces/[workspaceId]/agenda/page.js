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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  PencilIcon,
  Plus,
  Trash2,
} from "lucide-react";
import Background from "@/components/background/background";
import { useApi } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckSquare } from "lucide-react";

function DroppableColumn({ columnId, children }) {
  const { setNodeRef } = useDroppable({ id: columnId });
  return (
    <div ref={setNodeRef} className="flex-1">
      {children}
    </div>
  );
}

function Task({ task }) {
  return (
    <div className="p-4 mb-3 bg-card hover:bg-accent/50 rounded-lg border shadow-sm transition-colors">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="font-medium">{task.title}</div>
        </div>
      </div>
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
  const api = useApi();
  const { data: session } = useSession();
  const params = useParams();
  const workspaceId = params?.workspaceId;

  const [activeTaskImageError, setActiveTaskImageError] = useState(false);

  // Resetear el error de imagen cuando cambia la tarea activa
  useEffect(() => {
    setActiveTaskImageError(false);
  }, [activeTask]);

  // Cargar tareas al iniciar
  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceUsers().then(() => {
        loadTasks();
      });
    }
  }, [workspaceId]);

  // Cargar los usuarios del workspace
  const loadWorkspaceUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.workspaces.getUsers(workspaceId);
      if (response.data) {
        setWorkspaceUsers(response.data);
      }
    } catch (error) {
      console.error("Error al cargar los usuarios del workspace:", error);
      toast.error("No se pudieron cargar los usuarios del workspace");
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
      setColumns((prev) => {
        const tasks = [...prev[activeContainer]];

        // Encontrar los índices
        const activeIndex = tasks.findIndex(
          (task) => task.id.toString() === activeTaskId
        );

        // Si estamos sobre una tarea, encontrar su índice
        let overIndex = -1;
        if (overTaskId) {
          overIndex = tasks.findIndex(
            (task) => task.id.toString() === overTaskId
          );
        } else {
          // Si estamos sobre la columna, mover al final
          overIndex = tasks.length - 1;
        }

        if (activeIndex === -1) {
          return prev;
        }

        if (overIndex === -1) {
          return prev;
        }

        // Reordenar las tareas
        const taskToMove = tasks[activeIndex];
        tasks.splice(activeIndex, 1);
        tasks.splice(overIndex, 0, taskToMove);

        return {
          ...prev,
          [activeContainer]: tasks,
        };
      });
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

      // Primero actualizamos la UI
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
        const taskToMove = sourceTasks[taskIndex];
        return {
          ...prev,
          [activeContainer]: [
            ...sourceTasks.slice(0, taskIndex),
            ...sourceTasks.slice(taskIndex + 1),
          ],
          [overContainer]: [
            ...destinationTasks,
            { ...taskToMove, status: overContainer },
          ],
        };
      });

      // Luego actualizamos en la base de datos
      try {
        // Mapeo de estados para el backend
        const statusMap = {
          "To Do": "TODO",
          "In Progress": "IN_PROGRESS",
          Done: "DONE",
        };

        if (taskToMove) {
          await api.tasks.update(taskToMove.id, {
            title: taskToMove.title,
            description: taskToMove.description,
            priority: taskToMove.priority?.toUpperCase() || "MEDIUM",
            status: statusMap[overContainer],
            dueDate: taskToMove.dueDate,
            assignedToId: taskToMove.assignedTo,
          });
        } else {
          console.error("No se encontró la tarea para actualizar");
        }
      } catch (error) {
        console.error("Error al actualizar el estado de la tarea:", error);
        toast.error("No se pudo actualizar el estado de la tarea");
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
      await api.tasks.update(editedTask.id, taskData);

      // Actualizar el estado local
      setColumns((prev) => {
        const newColumns = { ...prev };
        if (editedTask.status !== editingTask.status) {
          newColumns[editingTask.status] = newColumns[
            editingTask.status
          ].filter((t) => t.id !== editedTask.id);
          newColumns[editedTask.status] = [
            ...newColumns[editedTask.status],
            editedTask,
          ];
        } else {
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
          <h1 className="text-3xl font-bold">Gestión de Tareas</h1>
          <p className="text-gray-400 mt-2">
            Organiza y gestiona las tareas de tu equipo de forma eficiente
          </p>
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
                              key={task.id}
                              task={task}
                              columnId={columnId}
                              onEditTask={handleEditTask}
                              findUserByEmail={findUserByEmail}
                              getUserInitial={getUserInitial}
                              getUserDisplayName={getUserDisplayName}
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
  findUserByEmail,
  getUserInitial,
  getUserDisplayName,
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
            <div
              className="cursor-grab active:cursor-grabbing"
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm truncate">{task.title}</h3>
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
