import { jwtDecode } from "jwt-decode";
import { useAuth } from "react-oidc-context";
import axios from "axios";
import React, { useState, useEffect,useMemo } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateTask from "./components/create";
import UpdateTask from "./components/update";
import TaskList from "./components/taskList";
import UserList from "./components/userList";
import UserTaskUpdate from "./components/userTaskUpdate";
import './App.css';

function TaskPage({ 
  tasks, 
  currentTask, 
  addTask, 
  deleteTask, 
  updateTask, 
  handleUpdateClick, 
  isAdmin, 
  signOut, 
  isLoading 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      <div className="navbar">
        <h1>Task Management</h1>
        <div className="navbar-buttons">
          {isAdmin && (
            <button className="button" onClick={toggleModal}>Create Task</button>
          )}
          <button className="button" onClick={signOut}>Sign Out</button>
        </div>
      </div>
      <div className="App">
        <div className="content">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : isAdmin ? (
            <>
              <div className="task-list">
                <TaskList
                  tasks={tasks}
                  onDelete={deleteTask}  
                  onUpdate={handleUpdateClick} 
                />
              </div>
              {currentTask && (
                <div>
                  <h2>Update Task</h2>
                  <UpdateTask task={currentTask} onUpdate={updateTask} />
                </div>
              )}
              {isModalOpen && (
                <div className="modal-overlay" onClick={toggleModal}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button" onClick={toggleModal}>X</button>
                    <CreateTask onCreate={addTask} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <UserList 
                tasks={tasks}
                onUpdate={handleUpdateClick} 
              />
              {currentTask && (
                <div>
                  <h2>Update Task</h2>
                  <UserTaskUpdate task={currentTask} onUpdate={updateTask} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function App() {
  const auth = useAuth();
  const signOutRedirect = () => {
    const clientId = "39hbuk21og9eem43kqcbjahntj";
    const logoutUri = "https://main.ddd5qcl8obvzi.amplifyapp.com/";
    const cognitoDomain = "https://eu-west-1ow8e4f5yr.auth.eu-west-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = useMemo(() => {
    if (auth.isAuthenticated && auth.user) {
      const decodedToken = jwtDecode(auth.user.id_token);
      const groups = decodedToken["cognito:groups"] || [];
      
      return groups.includes("admin");
    }
    return false; 
  }, [auth.isAuthenticated, auth.user]);

  useEffect(() => {
  }, [isAdmin]);

  useEffect(() => {
    setIsLoading(false);
  }, []);
  
  const fetchTasks = async () => {
    if (!auth.isAuthenticated) return;
  
    setIsLoading(true);
    try {
      let response;
  
      if (isAdmin) {
        response = await axios.get(
          "https://xe2szfp9ji.execute-api.eu-west-1.amazonaws.com/get-tasks",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
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
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchTasks();
  }, [auth.isAuthenticated]);

  const addTask = async (newTask) => {
    if (!isAdmin) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!isAdmin) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (updatedTask) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    <>
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
                signOut={signOutRedirect}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/"
            element={
              <div className="notAuthenticated">
                <div className="sign-in-container">
                  <h2>Welcome Back!</h2>
                  <p>Please sign in to access your tasks.</p>
                  <button className="sign-in-button" onClick={() => auth.signinRedirect()}>
                    Sign In
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
