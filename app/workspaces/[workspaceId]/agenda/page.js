"use client";
import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarIcon,
  UserIcon,
  PlusIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from "lucide-react";

import TaskColumn from "@/components/agenda/TaskColumn";

const priorityColors = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

const statusColors = {
  "To Do": "bg-background hover:bg-accent/50",
  "In Progress": "bg-background hover:bg-accent/50",
  Done: "bg-background hover:bg-accent/50",
};

const statusIcons = {
  "To Do": Circle,
  "In Progress": Clock,
  Done: CheckCircle2,
};

export default function DraggableBoard() {
  const [columns, setColumns] = useState({
    "To Do": [],
    "In Progress": [],
    Done: [],
  });
  const [editingTask, setEditingTask] = useState(null);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [newTaskTitles, setNewTaskTitles] = useState({
    "To Do": "",
    "In Progress": "",
    Done: "",
  });

  const addTask = (status) => {
    if (newTaskTitles[status].trim() === "") return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitles[status],
      description: "",
      status,
      dueDate: null,
      assignee: "",
      priority: "medium",
      subTasks: [],
    };

    setColumns((prevColumns) => ({
      ...prevColumns,
      [status]: [...prevColumns[status], newTask],
    }));
    setNewTaskTitles((prev) => ({
      ...prev,
      [status]: "",
    }));
  };

  const moveTask = (sourceColumn, sourceIndex, destinationColumn, destinationIndex) => {
    const taskToMove = columns[sourceColumn][sourceIndex];
    const newSourceColumn = [...columns[sourceColumn]];
    const newDestinationColumn = [...columns[destinationColumn]];

    // Eliminar la tarea de la columna origen
    newSourceColumn.splice(sourceIndex, 1);

    // Actualizar el estado de la tarea si cambia de columna
    if (sourceColumn !== destinationColumn) {
      taskToMove.status = destinationColumn;
    }

    // Insertar la tarea en la columna destino
    newDestinationColumn.splice(destinationIndex, 0, taskToMove);

    setColumns((prevColumns) => ({
      ...prevColumns,
      [sourceColumn]: newSourceColumn,
      [destinationColumn]: newDestinationColumn,
    }));
  };

  const updateTask = (updatedTask) => {
    setColumns((prevColumns) => ({
      ...prevColumns,
      [updatedTask.status]: prevColumns[updatedTask.status].map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      ),
    }));
    setEditingTask(null);
  };

  const addSubTask = () => {
    if (editingTask && newSubTaskTitle.trim() !== "") {
      const newSubTask = {
        id: Date.now(),
        title: newSubTaskTitle,
        completed: false,
      };
      setEditingTask({
        ...editingTask,
        subTasks: [...editingTask.subTasks, newSubTask],
      });
      setNewSubTaskTitle("");
    }
  };

  const toggleSubTask = (subTaskId) => {
    if (editingTask) {
      const updatedSubTasks = editingTask.subTasks.map((subTask) =>
        subTask.id === subTaskId
          ? { ...subTask, completed: !subTask.completed }
          : subTask
      );
      setEditingTask({ ...editingTask, subTasks: updatedSubTasks });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="px-6 pt-4 min-h-full  bg-background">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">Task Board</h1>
            <p className="text-muted-foreground mt-2">
              Organize and track your tasks efficiently
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-4 py-1">
              <Clock className="w-4 h-4 mr-2" />
              {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
          {Object.keys(columns).map((columnId) => (
            <Card
              key={columnId}
              className={`${statusColors[columnId]} border shadow-md`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {React.createElement(statusIcons[columnId], {
                      className: "w-5 h-5 text-muted-foreground",
                    })}
                    <CardTitle className="text-lg font-semibold">
                      {columnId}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="px-2 py-1">
                    {columns[columnId].length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-15rem)]">
                  <TaskColumn
                    columnId={columnId}
                    title={columnId}
                    tasks={columns[columnId]}
                    addTask={() => addTask(columnId)}
                    newTaskTitle={newTaskTitles[columnId]}
                    setNewTaskTitle={(value) =>
                      setNewTaskTitles((prev) => ({
                        ...prev,
                        [columnId]: value,
                      }))
                    }
                    moveTask={moveTask}
                    setEditingTask={setEditingTask}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog
          open={editingTask !== null}
          onOpenChange={() => setEditingTask(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Edit Task
              </DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="description"
                    className="text-right font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right font-medium">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, status: e.target.value })
                    }
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right font-medium">
                    Due Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`col-span-3 justify-start text-left font-normal ${
                          !editingTask.dueDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingTask.dueDate ? (
                          format(editingTask.dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingTask.dueDate}
                        onSelect={(date) =>
                          setEditingTask({ ...editingTask, dueDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignee" className="text-right font-medium">
                    Assignee
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="assignee"
                      value={editingTask.assignee}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          assignee: e.target.value,
                        })
                      }
                      placeholder="Enter assignee name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right font-medium">
                    Priority
                  </Label>
                  <select
                    id="priority"
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value,
                      })
                    }
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right font-medium">Subtasks</Label>
                  <div className="col-span-3">
                    <div className="space-y-3 mb-4">
                      {editingTask.subTasks.map((subTask) => (
                        <div
                          key={subTask.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent"
                        >
                          <Checkbox
                            id={`subtask-${subTask.id}`}
                            checked={subTask.completed}
                            onCheckedChange={() => toggleSubTask(subTask.id)}
                          />
                          <Label
                            htmlFor={`subtask-${subTask.id}`}
                            className={`flex-grow ${
                              subTask.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {subTask.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a subtask..."
                        value={newSubTaskTitle}
                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        onClick={addSubTask}
                        size="sm"
                        variant="secondary"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingTask && updateTask(editingTask)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}
