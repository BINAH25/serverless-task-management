import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateTask = ({ onCreate }) => {
  const [title, setTitle] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [deadline, setDeadline] = useState(""); 
  const [status, setStatus] = useState(""); 
  const [users, setUsers] = useState([]);  // To store the users fetched from the API
  const [assignedUser, setAssignedUser] = useState(""); // To store selected user for the task


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
        setUsers(pools); // Save the extracted users data
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
  
    fetchUsers();
  }, []);
  


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !deadline || !assignedUser) {
      alert("Please fill in all fields.");
      return;
    }

    const newTask = { 
      title, 
      description, 
      deadline, 
      status, 
      assignedUser,
      id: Date.now().toString()
    };
    
    onCreate(newTask);
    setTitle("");
    setDescription("");
    setDeadline("");
    setStatus(""); 
    setAssignedUser(""); // Reset the assigned user after task creation
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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

        {/* Dynamic Select Input for Users */}
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

        <button type="submit">Create Task</button>
      </form>
    </div>
  );
};

export default CreateTask;
