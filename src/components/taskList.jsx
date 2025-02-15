import React from "react";

const TaskList = ({ tasks, onDelete, onUpdate }) => {
  return (
    <div>
      <h2>Task List</h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id}>
            <p>Task Title: <strong>{task.title}</strong></p>
            <p>Task Description: <strong>{task.description}</strong></p>
            <p>User: <strong>{task?.user}</strong></p>
            <p><strong>Deadline:</strong> {task.deadline}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <button onClick={() => onUpdate(task.id)}>Update</button>
            <button onClick={() => onDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
