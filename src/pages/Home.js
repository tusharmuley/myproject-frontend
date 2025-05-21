import { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  const token = localStorage.getItem("access");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchTasks = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/tasks/`, { headers })
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title,
      status: selectedTask?.status || "pending",
      priority,
      deadline,
    };

    const url = selectedTask
      ? `${process.env.REACT_APP_API_URL}/tasks/update/${selectedTask.id}/`
      : `${process.env.REACT_APP_API_URL}/tasks/create/`;

    const method = selectedTask ? axios.put : axios.post;

    method(url, payload, { headers })
      .then(() => {
        setTitle("");
        setPriority("medium");
        setDeadline("");
        setSelectedTask(null);
        fetchTasks();
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/tasks/delete/${id}/`, {
          headers,
        })
        .then(fetchTasks)
        .catch((err) => console.error(err));
    }
  };

  const handleToggleStatus = (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";

    axios
      .put(
        `${process.env.REACT_APP_API_URL}/tasks/update/${task.id}/`,
        { ...task, status: newStatus },
        { headers }
      )
      .then(fetchTasks)
      .catch((err) => console.error(err));
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setPriority(task.priority);
    setDeadline(task.deadline);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((task) => task.status === filter);

  return (
    <div className="container">
      <div className="header-bar">
        <h1 className="heading">🗂️ My Task Manager</h1>
        <button className="logout-btn" onClick={logout}>
          🔒 Logout
        </button>
      </div>

      
      <form onSubmit={handleSubmit} className="task-form">
        <h2>{selectedTask ? "✏️ Edit Task" : "➕ Add New Task"}</h2>

        <div className="form-group">
          <label>Task Name:</label>
          <input
            type="text"
            value={title}
            placeholder="Enter task title"
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Deadline:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Priority:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low 🔵</option>
            <option value="medium">Medium 🟡</option>
            <option value="high">High 🔴</option>
          </select>
        </div>

        <div className="form-buttons">
          <button type="submit">
            {selectedTask ? "Update Task" : "Add Task"}
          </button>
          {selectedTask && (
            <button
              type="button"
              className="cancel"
              onClick={() => {
                setSelectedTask(null);
                setTitle("");
                setPriority("medium");
                setDeadline("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>


      <div className="filter-box">
        <label>Filter by Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className={`task-item ${task.status}`}>
            <div className="task-info">
              <h3>{task.title}</h3>
              <p>
                <strong>Deadline:</strong> {task.deadline} |{" "}
                <strong>Priority:</strong> {task.priority} |{" "}
                <strong>Status:</strong> {task.status}
              </p>
            </div>
            <div className="buttons">
              <button onClick={() => handleEdit(task)}>Edit</button>
              <button onClick={() => handleToggleStatus(task)}>Toggle</button>
              <button
                onClick={() => handleDelete(task.id)}
                className="delete"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      
    </div>
  );
}

export default Home;
