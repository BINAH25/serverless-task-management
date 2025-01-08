import React, { useState, useEffect } from "react";
import axios from "axios";

const UpdateTask = ({ task, onUpdate }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [deadline, setDeadline] = useState(task.deadline);
  const [status, setStatus] = useState(task.status);
  const [users, setUsers] = useState([]);  
  const [assignedUser, setAssignedUser] = useState(task?.user);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDeadline(task.deadline);
    setStatus(task.status);
    setAssignedUser(task?.user)
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedTask = { ...task, title, description, deadline, status, assignedUser };
    onUpdate(updatedTask);
  };


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://2nmzght1z9.execute-api.eu-west-1.amazonaws.com/getUsers",
          {
            headers: {
              "Content-Type": "application/json", // Just the content-type
            },
          }
        );
        
        // Assuming response.data is an array of user objects
        const pools = response.data.map(user => ({
          email: user.Attributes.find(attribute => attribute.Name === 'email')?.Value,
          username: user.Username
        }));
        
        console.log(pools); // Logs the array of extracted email and username objects
        setUsers(pools); // Save the extracted users data
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
  
    fetchUsers();
  }, []);
  


  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          required
        />
        <textarea
          value={description}
          required
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={assignedUser}
          onChange={(e) => setAssignedUser(e.target.value)}
          required
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.email} value={user.email}>
              {user.username} {user.email}
            </option>
          ))}
        </select>
        <button type="submit">Update Task</button>
      </form>
    </div>
  );
};

export default UpdateTask;
