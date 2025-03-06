import React, { useRef } from "react";
import { useDrop, useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, CalendarIcon, UserIcon, GripVertical } from "lucide-react";
import { format } from "date-fns";

const ItemTypes = {
  TASK: "TASK"
};

const priorityColors = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

const Task = ({ task, index, columnId, moveTask, setEditingTask }) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { 
      id: task.id,
      index,
      columnId
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const dragColumn = item.columnId;
      const hoverIndex = index;
      const hoverColumn = columnId;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragColumn === hoverColumn) {
        return;
      }

      moveTask(dragColumn, dragIndex, hoverColumn, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
      item.columnId = hoverColumn;
    }
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`group p-4 mb-3 bg-card hover:bg-accent/50 rounded-lg border shadow-sm transition-all duration-200 cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={() => setEditingTask(task)}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 mt-1 text-muted-foreground/50 group-hover:text-muted-foreground" />
        <div className="flex-1 space-y-3">
          <div className="font-medium">{task.title}</div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary" className={priorityColors[task.priority]}>
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
  moveTask,
  setEditingTask,
}) => {
  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop(item) {
      const dragIndex = item.index;
      const dragColumn = item.columnId;
      const hoverIndex = tasks.length;
      const hoverColumn = columnId;

      // Don't replace items with themselves
      if (dragColumn === hoverColumn) {
        return;
      }

      moveTask(dragColumn, dragIndex, hoverColumn, hoverIndex);
    }
  });

  return (
    <div ref={drop} className="h-full">
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
          {tasks.map((task, index) => (
            <Task
              key={task.id}
              task={task}
              index={index}
              columnId={columnId}
              moveTask={moveTask}
              setEditingTask={setEditingTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskColumn;
