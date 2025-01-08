import { jwtDecode } from "jwt-decode";
import { useAuth } from "react-oidc-context";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateTask from "./components/create";
import UpdateTask from "./components/update";
import TaskList from "./components/taskList";
import UserList from "./components/userList";

import './App.css';

const TaskPage = ({ tasks, currentTask, addTask, deleteTask, updateTask, handleUpdateClick, isAdmin, signOut }) => {
  return (
    <div className="App">
      {isAdmin && (
        <div className="create-task">
          <h2>Create Task</h2>
          <CreateTask onCreate={addTask} />
          {currentTask && (
            <div>
              <h2>Update Task</h2>
              <UpdateTask task={currentTask} onUpdate={updateTask} />
            </div>
          )}
        </div>
      )}
      <div className="task-list">
        <h1>Task List</h1>
        <button className="button" onClick={signOut}>Sign Out</button>
        <TaskList
          tasks={tasks}
          onDelete={isAdmin ? deleteTask : null}
          onUpdate={isAdmin ? handleUpdateClick : null}
        />
      </div>
    </div>
  );
};


function App() {
  const auth = useAuth();
  const signOutRedirect = () => {
    const clientId = "39hbuk21og9eem43kqcbjahntj";
    const logoutUri = "http://localhost:5173/";
    const cognitoDomain = "https://eu-west-1ow8e4f5yr.auth.eu-west-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const decodedToken = jwtDecode(auth.user.id_token);
      const groups = decodedToken["cognito:groups"] || [];
      if (groups.includes("admin")){
        setIsAdmin(true);
      }
    }
  }, [auth.isAuthenticated, auth.user]);

  const fetchTasks = async () => {
    if (!auth.isAuthenticated) return;
  
    try {
      let response;
  
      if (isAdmin) {
        // Admin fetches all tasks
        response = await axios.get(
          "https://xe2szfp9ji.execute-api.eu-west-1.amazonaws.com/get-tasks",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Regular users fetch their own tasks
        const email = auth.user?.profile.email;
        response = await axios.get(
          `https://xe2szfp9ji.execute-api.eu-west-1.amazonaws.com/get-tasks?email=${email}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
  
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  

  useEffect(() => {
    fetchTasks();
  }, [auth.isAuthenticated]);

  const addTask = async (newTask) => {
    if (!isAdmin) return;

    try {
      const response = await axios.post(
        "https://s2wth2ph3k.execute-api.eu-west-1.amazonaws.com/createTasks",
        newTask,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const createdTask = response.data.task;
      setTasks((prevTasks) => [...prevTasks, createdTask]);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!isAdmin) return;

    try {
      await axios.delete("https://zizj83kr4f.execute-api.eu-west-1.amazonaws.com/deleteTask", {
        data: { id: taskId },
        headers: {
          "Content-Type": "application/json",
        },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTask = async (updatedTask) => {
    if (!isAdmin) return;

    try {
      await axios.put(
        "https://u9yel048j4.execute-api.eu-west-1.amazonaws.com/updateTask",
        updatedTask,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      );
      setCurrentTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleUpdateClick = (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    setCurrentTask(task);
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/tasks"
          element={
            <TaskPage
              tasks={tasks}
              currentTask={currentTask}
              addTask={addTask}
              deleteTask={deleteTask}
              updateTask={updateTask}
              handleUpdateClick={handleUpdateClick}
              isAdmin={isAdmin}
              signOut={signOutRedirect} // Pass the signoutRedirect method
            />
          }
        />
        <Route
          path="/"
          element={
            <div className="notAuthenticated">
              <button className="button" onClick={() => auth.signinRedirect()}>Sign In</button>
              {/* <button  className="button" onClick={() => auth.signoutRedirect()}>Sign Out</button> */}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
