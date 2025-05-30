import { useEffect, useState,useRef  } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all"); // new priority filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [userFilter, setUserFilter] = useState("all"); // all | created | assigned
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState(null); 
  const [selectedFile, setSelectedFile] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef();



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
    console.log('assinged to vlue',assignedTo)
    e.preventDefault();
    const payload = {
      title,
      description,
      status: selectedTask?.status || "pending",
      priority,
      deadline,
      assigned_to:assignedTo
    };

    const url = selectedTask
      ? `${process.env.REACT_APP_API_URL}/tasks/update/${selectedTask.id}/`
      : `${process.env.REACT_APP_API_URL}/tasks/create/`;

    const method = selectedTask ? axios.put : axios.post;

    method(url, payload, { headers })
      .then(() => {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDeadline("");
        setSelectedTask(null);
        setShowModal(false);
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
        { ...task,
          status: newStatus ,
          assigned_to: task.assigned_to?.id || null,
          created_by: task.created_by?.id || null
        },
        { headers }
      )
      .then(fetchTasks)
      .catch((err) => console.error(err));
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDeadline(task.deadline);
    setShowModal(true);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // ⏱️ 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);


  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filter === "all" || task.status === filter;
    const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter;

    const searchMatch =
      task.title.toLowerCase().includes(debouncedQuery) ||
      task.description.toLowerCase().includes(debouncedQuery) ||
      task.status.toLowerCase().includes(debouncedQuery) ||
      task.priority.toLowerCase().includes(debouncedQuery);

    const userMatch =
      userFilter === "all" ||
      (userFilter === "created" && task.created_by?.id === profile?.id) ||
      (userFilter === "assigned" && task.assigned_to?.id === profile?.id);

    return statusMatch && priorityMatch && searchMatch && userMatch;
  });





  useEffect(() => {
    // Fetch current profile
    axios.get(`${process.env.REACT_APP_API_URL}/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setProfile(res.data))
    .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleUpload(file);
      setShowPopup(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/upload-picture/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      alert('Profile picture updated!');
      window.location.reload();
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    }
  };

  const fetchUsers = async (query = "") => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/getusers/?search=${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    setUserOptions(data);
  };

  const [searchTerm, setSearchTerm] = useState(""); // what user types
  const [assignedTo, setAssignedTo] = useState("");
  const [userOptions, setUserOptions] = useState([]);

  // 👇 DEBOUNCE LOGIC
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 0) {
        fetchUsers(searchTerm);
      } else {
        setUserOptions([]); // if search empty, clear
      }
    }, 500); // wait 500ms after typing stops

    return () => clearTimeout(delayDebounce); // clear timeout if user types again
  }, [searchTerm]);


  const clearFilters = () => {
    setFilter("all");           // Status filter
    setPriorityFilter("all");   // Priority filter
    setUserFilter("all");       // Created/Assigned filter
    setSearchQuery("");         // Search box
  };

  


  return (
  <>
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-20 border-b pb-4 header_section">
        <h1 className="text-3xl font-extrabold">🗂️ My Task Manager</h1>
        <div className="profile-wrapper relative inline-block">
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt="Profile"
              className="profile-img"
              onClick={() => setShowPopup((prev) => !prev)}
              title="Click to open profile options"
            />
          ) : (
            <div
              className="profile-img no-image"
              onClick={() => setShowPopup((prev) => !prev)}
              title="Click to open profile options"
            >
              <span style={{fontSize:"35px"}}>👤</span>
            </div>
          )}

          {showPopup && (
            <div className="profile-popup" ref={popupRef}>
              <label
                htmlFor="profile-upload"
                className="popup-item"
                onClick={() => handleFileChange}
              >
                Change Profile
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => {
                  logout();
                  setShowPopup(false);
                }}
                className="popup-item logout-btn"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="main-layout">
        <div className="task-list-section">
          <div className="filter-box">
            <div>
              <label>Search: </label>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              />
            </div>
            
            <div>
              <button
                className="create-btn"
                onClick={() => {
                  setSelectedTask(null);
                  setShowModal(true);
                }}
              >
                ➕ Create Task
              </button>
            </div>
          </div>
          <div className="filter-box">
            <div>
              <label>Filter by Status: </label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label>Priority: </label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label>User Role : </label>
              <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="created">Created by Me</option>
                <option value="assigned">Assigned to Me</option>
              </select>
            </div>
            <div>
              <button onClick={clearFilters}>
                Clear Filters
              </button>

            </div>
            

          </div>

          {filteredTasks.length === 0 ? (
            <div className="no-tasks">🚫 No tasks found. Create a task!</div>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <li key={task.id} className={`task-item-container ${task.status}`}>
                  <div className="task-item">
                    <div className="task-info">
                      <h3>{task.title}</h3>
                      <p>
                        <strong>Deadline:</strong> {task.deadline} |{' '}
                        <strong>Priority:</strong> {task.priority} |{' '}
                        <strong>Status:</strong> {task.status}
                      </p>
                      <p>
                        <strong>Created by:</strong> {task.created_by?.username||""} |{' '}
                        <strong> Assigned by:</strong> {task.assigned_to?.username||""}
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
                  </div>
                  <div className="task-description">
                    <p>
                      <strong>Description:</strong> {task.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
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
                  <label>Description:</label>
                  <input
                    type="text"
                    value={description}
                    placeholder="Enter task description"
                    onChange={(e) => setDescription(e.target.value)}
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
                  <label>Assigned to:</label>

                  {/* INPUT FIELD for typing/searching user */}
                  <input
                    type="text"
                    placeholder="Search user..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setAssignedTo(""); // Clear selected when typing
                    }}
                  />

                  {/* DROPDOWN with all matched users */}
                  {userOptions.length > 0 ? (
                    <select
                      value={assignedTo}
                      onChange={(e) => {
                        const selectedUserId = e.target.value;
                        setAssignedTo(selectedUserId);

                        const selectedUser = userOptions.find(
                          (u) => u.id.toString() === selectedUserId
                        );

                        if (selectedUser) {
                          setSearchTerm(selectedUser.username); // show name in input
                        }
                      }}
                    >
                      <option value="">Select a user</option>
                      {userOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select disabled>
                      <option>No users found</option>
                    </select>
                  )}
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
                  <button
                    type="button"
                    className="cancel"
                    onClick={() => {
                      setSelectedTask(null);
                      setTitle("");
                      setDescription("");
                      setPriority("medium");
                      setDeadline("");
                      setShowModal(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  );  

}

export default Home;
