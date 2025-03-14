"use client";
import React, { useState, useRef } from "react";
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
} from "lucide-react";
import Background from "@/components/background/background";

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
  const subtasksContainerRef = useRef(null);

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  const addSubtask = () => {
    if (newSubtask.trim() === "") return;
    setEditedTask({
      ...editedTask,
      subtasks: [
        ...editedTask.subtasks,
        { id: Date.now(), title: newSubtask, completed: false },
      ],
    });
    setNewSubtask("");

    // Hacer scroll al final después de que se actualice el estado
    setTimeout(() => {
      if (subtasksContainerRef.current) {
        const container = subtasksContainerRef.current;
        container.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 100);
  };

  const toggleSubtask = (subtaskId) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      ),
    });
  };

  const users = [
    { id: "1", name: "Alex Vedo", image: "/avatars/alex.png" },
    { id: "2", name: "Usuario 2", image: "/avatars/user2.png" },
    { id: "3", name: "Usuario 3", image: "/avatars/user3.png" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Tarea</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={editedTask.title}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={editedTask.description || ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Prioridad</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Asignar a</Label>
              <Select
                value={editedTask.assignedTo || ""}
                onValueChange={(value) =>
                  setEditedTask({ ...editedTask, assignedTo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.image} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        {user.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Fecha límite</Label>
            <div className="relative">
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !editedTask.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedTask.dueDate ? (
                      format(editedTask.dueDate, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  style={{
                    zIndex: 9999,
                    position: "absolute",
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    boxShadow: "var(--shadow)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Calendar
                    mode="single"
                    selected={editedTask.dueDate}
                    onSelect={(date) => {
                      setEditedTask({ ...editedTask, dueDate: date });
                    }}
                    initialFocus
                    locale={es}
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Subtareas</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2" ref={subtasksContainerRef}>
                {editedTask.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => toggleSubtask(subtask.id)}
                    />
                    <span
                      className={
                        subtask.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Nueva subtarea"
                onKeyPress={(e) => e.key === "Enter" && addSubtask()}
              />
              <Button onClick={addSubtask} type="button" size="sm">
                Añadir
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const [activeContainer, activeTaskId] = active.id.split("-");
    const task = columns[activeContainer].find((t) => t.id === activeTaskId);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeIdStr = active.id;
    const overIdStr = over.id;

    const [activeContainer, activeTaskId] = activeIdStr.split("-");
    let overContainer = overIdStr;

    // Si el over.id contiene un guión, significa que estamos sobre una tarea
    // Si no, estamos sobre una columna
    if (overIdStr.includes("-")) {
      [overContainer] = overIdStr.split("-");
    }

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      setColumns((prev) => {
        const tasks = prev[activeContainer] || [];
        const oldIndex = tasks.findIndex((task) => task.id === activeTaskId);
        if (oldIndex === -1) return prev;
        return {
          ...prev,
          [activeContainer]: tasks,
        };
      });
    } else {
      setColumns((prev) => {
        const sourceTasks = prev[activeContainer] || [];
        const destinationTasks = prev[overContainer] || [];
        const taskIndex = sourceTasks.findIndex(
          (task) => task.id === activeTaskId
        );
        if (taskIndex === -1) return prev;
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
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleSaveTask = (editedTask) => {
    setColumns((prev) => {
      const newColumns = { ...prev };
      // Si la tarea cambió de columna
      if (editedTask.status !== editingTask.status) {
        // Eliminar de la columna anterior
        newColumns[editingTask.status] = newColumns[editingTask.status].filter(
          (t) => t.id !== editedTask.id
        );
        // Añadir a la nueva columna
        newColumns[editedTask.status] = [
          ...newColumns[editedTask.status],
          editedTask,
        ];
      } else {
        // Actualizar la tarea en la misma columna
        newColumns[editedTask.status] = newColumns[editedTask.status].map((t) =>
          t.id === editedTask.id ? editedTask : t
        );
      }
      return newColumns;
    });
  };

  const addTask = (columnId) => {
    if (newTaskTitles[columnId].trim() === "") return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitles[columnId],
      status: columnId,
      description: "",
      priority: "medium",
      subtasks: [],
      dueDate: null,
      assignedTo: null,
    };
    setColumns((prev) => ({
      ...prev,
      [columnId]: [...prev[columnId], newTask],
    }));
    setNewTaskTitles((prev) => ({ ...prev, [columnId]: "" }));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Background />
      <div className="p-6 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(columns).map((columnId) => (
            <DroppableColumn key={columnId} columnId={columnId}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">
                      {columnId}
                    </CardTitle>
                    <Badge variant="secondary">
                      {columns[columnId].length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Nueva tarea..."
                        value={newTaskTitles[columnId]}
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
                        className="flex-1"
                      />
                      <Button size="icon" onClick={() => addTask(columnId)}>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[calc(100vh-15rem)]">
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
                            />
                          ))}
                          {columns[columnId].length === 0 && (
                            <div className="p-8 text-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                              Arrastra aquí
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </DroppableColumn>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? <Task task={activeTask} /> : null}
      </DragOverlay>
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveTask}
        />
      )}
    </DndContext>
  );
}

function TaskItem({ task, columnId, onEditTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${columnId}-${task.id}`,
    data: {
      type: "Task",
      task,
      columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getCompletedSubtasks = () => {
    if (!task.subtasks?.length) return "";
    const completed = task.subtasks.filter((st) => st.completed).length;
    return `${completed}/${task.subtasks.length}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group p-4 mb-3 bg-card hover:bg-accent/50 rounded-lg border shadow-sm transition-all duration-200 ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => onEditTask(task)}
    >
      <div className="flex items-start gap-2">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 mt-1 text-muted-foreground/50 group-hover:text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="font-medium">{task.title}</div>
            <AlertCircle
              className={`h-4 w-4 ${getPriorityColor(task.priority)}`}
            />
          </div>
          {task.description && (
            <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </div>
          )}
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(task.dueDate), "d MMM", { locale: es })}
              </div>
            )}
            {task.assignedTo && (
              <Avatar className="h-5 w-5">
                <AvatarImage src={`/avatars/${task.assignedTo}.png`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
            {task.subtasks?.length > 0 && (
              <div className="flex items-center gap-1">
                <Checkbox className="h-3 w-3" checked={false} />
                {getCompletedSubtasks()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
