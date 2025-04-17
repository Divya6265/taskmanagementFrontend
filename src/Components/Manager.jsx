import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Toast from './Toast';
import { logout } from '../UserSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Graph from './Graph';

function Manager({ socket }) {
    const accountDetails = useSelector((state) => state.account.value);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [loggedUser, setLoggedUser] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        status: "",
        description: "",
        priority: "",
        assignedTo: ""
    });
    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [mode, setMode] = useState(false);
    const [taskId, setTaskId] = useState("");
    const [filters, setFilters] = useState({
        assignedTo: "",
        status: "",
        priority: ""
    });

    useEffect(() => {
        if (accountDetails) {
            // Redirect based on role
            if(accountDetails){
                if (accountDetails.role === "Manager") {
                    navigate('/manager/dashboard')
                } else if (accountDetails.role === "Employee") {
                    navigate('/employee/dashboard')
                } else if(accountDetails.role === "Admin"){
                    navigate('/admin/dashboard')
                }
            }

            setLoggedUser(accountDetails);
            
            // Fetch employees
            const fetchEmployees = async () => {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_URL}employees`);
                    if (res.data.users) {
                        setEmployees(res.data.users);
                    }
                } catch (error) {
                    console.error("Error fetching employees:", error);
                    toast.error("Failed to load employees");
                }
            };
            fetchEmployees();
        } else {
            navigate('/');
        }
    }, [accountDetails, navigate]);

    useEffect(() => {
        if (!loggedUser?._id) return;
        
        const fetchTasks = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_URL}managerTasks/${loggedUser._id}`);
                if (res.data.tasks) {
                    setTasks(res.data.tasks);
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
                toast.error("Failed to load tasks");
            }
        };
        fetchTasks();
    }, [loggedUser]);

    useEffect(() => {
        const handleNewUser = (message) => {
            console.log(message);
            toast.info(message);
        };

        const handleTaskUpdate = (task) => {
            if (task.assignedBy === loggedUser?._id) {
                setTasks(prev => prev.map(t => t._id === task._id ? task : t));
                toast.info("Task status updated");
            }
        };

        socket?.on("NewUserConnected", handleNewUser);
        socket?.on("IsthereAnUpdatedTaskStatus", handleTaskUpdate);

        return () => {
            socket?.off("NewUserConnected", handleNewUser);
            socket?.off("IsthereAnUpdatedTaskStatus", handleTaskUpdate);
        };
    }, [socket, loggedUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            assignedTo: "",
            status: "",
            priority: ""
        });
    };

    const clearForm = () => {
        setFormData({
            title: "",
            status: "",
            description: "",
            priority: "",
            assignedTo: ""
        });
        setTaskId("");
        setMode(false);
    };

    const handleCreate = async () => {
        try {
            if (!Object.values(formData).every(Boolean)) {
                toast.error("Please fill all fields");
                return;
            }

            const res = await axios.post(`${import.meta.env.VITE_URL}create`, {
                ...formData,
                assignedBy: loggedUser._id
            }, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });

            socket?.emit("IhadAnUpdatedTask", res.data.task);
            setTasks(prev => [...prev, res.data.task]);
            toast.success("Task created successfully");
            clearForm();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create task");
        }
    };

    const handleEdit = async () => {
        try {
            if (!Object.values(formData).every(Boolean)) {
                toast.error("Please fill all fields");
                return;
            }

            const res = await axios.put(`${import.meta.env.VITE_URL}update/${taskId}`, {
                ...formData,
                assignedBy: loggedUser._id
            }, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });

            socket?.emit("IhadAnUpdatedTaskEdit", res.data.task);
            setTasks(prev => prev.map(t => t._id === taskId ? res.data.task : t));
            toast.success("Task updated successfully");
            clearForm();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update task");
        }
    };

    const handleFormEdit = (id) => {
        const task = tasks.find(t => t._id === id);
        if (task) {
            setTaskId(id);
            setFormData({
                title: task.title,
                status: task.status,
                description: task.description,
                priority: task.priority,
                assignedTo: task.assignedTo
            });
            setMode(true);
        }
    };

    const filteredTasks = tasks.filter(task => {
        return (
            (!filters.assignedTo || task.assignedTo === filters.assignedTo) &&
            (!filters.priority || task.priority === filters.priority) &&
            (!filters.status || task.status === filters.status)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Toast />
            
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">{accountDetails?.email}</span>
                        <button
                            onClick={() => dispatch(logout())}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Analytics Section */}
                <section className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <Graph tasks={tasks} />
                    </div>
                </section>

                {/* Task Form Section */}
                <section className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">
                            {mode ? "Update Task" : "Create New Task"}
                        </h2>
                        
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Task title"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Task description"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="">Select Status</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="">Select Priority</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assign To</label>
                                <select
                                    id="assignedTo"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="">Select Assignee</option>
                                    {employees.map(employee => (
                                        <option key={employee._id} value={employee.email}>
                                            {employee.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={mode ? handleEdit : handleCreate}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    {mode ? "Update Task" : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Filter Section */}
                <section className="mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Filter Tasks</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    id="filter-status"
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="filter-priority" className="block text-sm font-medium text-gray-700">Priority</label>
                                <select
                                    id="filter-priority"
                                    name="priority"
                                    value={filters.priority}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="filter-assignedTo" className="block text-sm font-medium text-gray-700">Assignee</label>
                                <select
                                    id="filter-assignedTo"
                                    name="assignedTo"
                                    value={filters.assignedTo}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="">All Assignees</option>
                                    {employees.map(employee => (
                                        <option key={employee._id} value={employee.email}>
                                            {employee.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tasks List Section */}
                <section>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
                        </div>
                        
                        {filteredTasks.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">No tasks found matching your criteria</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTasks.map((task) => (
                                            <tr key={task._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{task.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                            task.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedTo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleFormEdit(task._id)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Manager;