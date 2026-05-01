import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // ---------------- STATE ----------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  // ---------------- AUTH ----------------
  const signup = async () => {
    await fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    alert("Signup done");
  };

  const login = async () => {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);

      // 🔥 ROLE nikaal rahe token se
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      localStorage.setItem("role", payload.role);
      setRole(payload.role);
      setToken(data.token);
    } else {
      alert("Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
  };

  // ---------------- USERS ----------------
  const getUsers = async () => {
    const res = await fetch("http://localhost:5000/users", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    setUsers(data);
  };

  // ---------------- TASKS ----------------
  const getTasks = async () => {
    const res = await fetch("http://localhost:5000/tasks", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    setTasks(data);
  };

  const createTask = async () => {
    await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ title, deadline, assignedTo }),
    });

    setTitle("");
    setDeadline("");
    setAssignedTo("");
    getTasks();
  };

  const toggleTask = async (id, status) => {
    const newStatus = status === "pending" ? "completed" : "pending";

    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    getTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });

    getTasks();
  };

  // ---------------- DRAG DROP (FIXED CLEAN) ----------------
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDrop = async (e, status) => {
    const id = e.dataTransfer.getData("taskId");

    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ status }),
    });

    getTasks();
  };

  // ---------------- FILTER ----------------
  const filteredTasks = tasks
    .filter((t) =>
      t.title?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((t) => {
      if (filter === "all") return true;
      return t.status === filter;
    });

  // ---------------- LOAD ----------------
  useEffect(() => {
    if (token) {
      getTasks();
      getUsers();
    }
  }, [token]);

  // ---------------- UI ----------------
  return (
    <div className="container">
      <h1>🚀 Task Manager Pro</h1>
      <p className="role-tag">
        {role === "admin" ? "👨‍💼 ADMIN" : "👨‍💻 MEMBER"}
      </p>

      {!token ? (
        <div className="card">
          <h2>Login / Signup</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="auth-buttons">
            <button onClick={login}>Login</button>
            <button onClick={signup}>Signup</button>
          </div>
        </div>
      ) : (
        <>
          {/* TOP BAR */}
          <div className="top-bar">
            <button onClick={logout}>Logout</button>
          </div>

          {/* ADD TASK */}
          {role === "admin" && (
            <div className="card">
              <h2>Add Task</h2>


              <input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />

              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Select User</option>
                {users
                  .filter((u) => u.email)
                  .map((u) => (
                    <option key={u._id} value={u.email}>
                      {u.email} ({u.role})
                    </option>
                  ))}
              </select>

              <button onClick={createTask}>+ Add Task</button>
            </div>)}

          {/* SEARCH + FILTER */}
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* TASK SECTIONS */}
          <div className="task-sections">
            {/* PENDING */}
            <div
              className="task-column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, "pending")}
            >
              <h3>⏳ Pending</h3>

              {filteredTasks
                .filter((t) => t.status === "pending")
                .map((task) => (
                  <div
                    key={task._id}
                    className="task-card"
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, task._id)
                    }
                  >
                    <b>{task.title}</b>
                    <p style={{ fontSize: "12px", opacity: 0.7 }}>
                      Assigned to: {task.assignedTo || "Not Assigned"}
                    </p>
                    <p>{task.deadline?.slice(0, 10)}</p>

                    <div className="btns">
                      <button
                        onClick={() =>
                          toggleTask(task._id, task.status)
                        }
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* COMPLETED */}
            <div
              className="task-column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, "completed")}
            >
              <h3>✅ Completed</h3>

              {filteredTasks
                .filter((t) => t.status === "completed")
                .map((task) => (
                  <div
                    key={task._id}
                    className="task-card"
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, task._id)
                    }
                  >
                    <b>{task.title}</b>
                    <p>{task.deadline?.slice(0, 10)}</p>

                    <div className="btns">
                      <button
                        onClick={() =>
                          toggleTask(task._id, task.status)
                        }
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;