import React from "react";

const UserList = ({ tasks, onUpdate }) => {
  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: "10px" }}>
            <p> Task Title: <strong>{task.title}</strong> </p>
            <p> Task Description: <strong> {task.description}</strong></p>
            <p>user: <strong>{task?.user}</strong></p>
            <p><strong>Deadline:</strong> {task.deadline}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <button onClick={() => onUpdate(task.id)}>Update</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
