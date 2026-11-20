import './App.css';

import { useState, useEffect, useRef } from 'react';

function ToDoApp() {

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");

    if (!savedTasks || savedTasks === "undefined") {
      return [];
    }

    return JSON.parse(savedTasks);
  })
  const [task, setTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [deadline, setDeadline] = useState("");
  const [toast, setToast] = useState("");
  const notifiedTasks = useRef(new Set());

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (toast === "") return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      const overdueTasks = tasks.filter((task) => {
        return (
          !task.completed &&
          task.deadline !== "" &&
          new Date(task.deadline) <= now &&
          !notifiedTasks.current.has(task.id)
        );
      });

      if (overdueTasks.length > 0) {
        overdueTasks.forEach((task) => {
          notifiedTasks.current.add(task.id);
        });

        setToast(
          overdueTasks.map((task) => `${task.title} is overdue!`).join(", ")
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tasks]);

  function handleAddTask() {
    if (task.trim() === "") {
      alert("Enter a task");
      return;
    }

    if (deadline === "") {
      alert("Select a deadline");
      return;
    }

    if (new Date(deadline) < new Date()) {
      alert("Select a future date and time");
      return;
    }

    if (tasks.some((item) => 
      item.title.toLowerCase() === task.trim().toLowerCase() &&
      item.id !== editingTaskId))
    {
    alert("Task already exists");
    return;
    }

    if (editingTaskId != null) {
      const updatedTasks = tasks.map((item) =>
      item.id === editingTaskId  
      ? { 
          ...item, 
          title: task.trim(), 
          deadline : deadline
        }
      : item);

    setTasks(updatedTasks);
    setEditingTaskId(null);
    setTask("");
    setDeadline("");
    setToast("Task updated successfully!");
    return;
  }

    const newTask = {
      id : Date.now(),
      title : task.trim(),
      completed : false,
      deadline : deadline
    };

    setTasks([...tasks, newTask])
    setTask("");
    setDeadline("");
    setToast("Task added successfully!");
  }

  function handleDeleteTask(id) {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    setToast("Task deleted successfully!");
  }

  function handleToggleComplete(id) {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          completed : !task.completed
        };
      }
      
      return task;

    });

    const selectedTask = tasks.find((task) => task.id === id);

    setToast(
      selectedTask.completed ?
      "Task marked as incomplete!"
      : "Task completed successfully!"
    )
    setTasks(updatedTasks);
  };

  function handleEditTask(id) {
    const selectedTask = tasks.find((task) => task.id === id);
    setTask(selectedTask.title);
    setDeadline(selectedTask.deadline);
    setEditingTaskId(id);
  }

  function getCurrentDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  
return (
    <div className="todo-container">

      
      <header className="todo-header">
        <h1> My ToDos </h1>
        
      </header>

      
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

      
      <div className="todo-form">

        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter your task..."
        />

        <input
          type="datetime-local"
          value={deadline}
          min={getCurrentDateTime()}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button onClick={handleAddTask}>
          {editingTaskId !== null ? "Update Task" : "Add Task"}
        </button>

      </div>

      <p>My Tasks: {tasks.length}</p>

      <div className="task-list">

        {tasks.map((item) => {

          const isOverdue =
            !item.completed &&
            item.deadline !== "" &&
            new Date(item.deadline) < new Date();

          const status = item.completed
            ? "Completed"
            : isOverdue
              ? "Overdue"
              : "Pending";

          return (
            <div className="task-card" key={item.id}>

              <div className="task-info">

                <h3 className={item.completed ? "completed-task" : ""}>
                  {item.title}
                </h3>

                <p>
                  Deadline: {new Date(item.deadline).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                  })}
                </p>

                <span className={`task-status ${status.toLowerCase()}`}>
                  {status}
                </span>

              </div>

              <div className="task-actions">

                <button onClick={() => handleEditTask(item.id)}>
                  Edit
                </button>

                <button onClick={() => handleToggleComplete(item.id)}>
                  {item.completed ? "Undo" : "Complete"}
                </button>

                <button onClick={() => handleDeleteTask(item.id)}>
                  Delete
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );


}

export default ToDoApp;

