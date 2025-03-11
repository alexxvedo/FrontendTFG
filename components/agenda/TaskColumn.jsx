import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, CalendarIcon, UserIcon, GripVertical } from "lucide-react";
import { format } from "date-fns";

const priorityColors = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

const Task = ({ task, columnId, setEditingTask }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group p-4 mb-3 bg-card hover:bg-accent/50 rounded-lg border shadow-sm transition-all duration-200 cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => setEditingTask(task)}
    >
      <div className="flex items-start gap-2">
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 mt-1 text-muted-foreground/50 group-hover:text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="font-medium">{task.title}</div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            <Badge
              variant="secondary"
              className={priorityColors[task.priority]}
            >
              {task.priority}
            </Badge>
            {task.dueDate && (
              <Badge variant="outline" className="gap-1">
                <CalendarIcon className="w-3 h-3" />
                {format(task.dueDate, "MMM d")}
              </Badge>
            )}
            {task.assignee && (
              <Badge variant="outline" className="gap-1">
                <UserIcon className="w-3 h-3" />
                {task.assignee}
              </Badge>
            )}
          </div>
          {task.subTasks.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {task.subTasks.filter((st) => st.completed).length} of{" "}
              {task.subTasks.length} subtasks completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskColumn = ({
  columnId,
  tasks,
  addTask,
  setNewTaskTitle,
  newTaskTitle,
  setEditingTask,
}) => {
  return (
    <div className="h-full">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Add new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addTask(columnId);
              }
            }}
          />
          <Button size="icon" onClick={() => addTask(columnId)}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {tasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              columnId={columnId}
              setEditingTask={setEditingTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskColumn;
