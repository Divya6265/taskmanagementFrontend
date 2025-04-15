import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import Toast from './Toast';
import { logout } from '../UserSlice';
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Graph from './Graph';
function Manager({ socket }) {


    const accountDetails = useSelector((state) => state.account.value)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        if (accountDetails) {
            if (accountDetails.role === "Manager") {
                navigate('/manage/dashboard')
            } else if (accountDetails.role === "Employee") {
                navigate('/employee/dashboard')
            } else if (accountDetails.role === "Admin") {
                navigate('/admin/dashboard')
            }

            setLoggedUser(accountDetails)
            setAssignedBy(accountDetails?._id)

            const employee = async () => {
                const res = await axios.get("http://127.0.0.1:8000/employees")
                if (res.data.users) {
                    setEmployees(res.data.users)
                }
            }
            employee()
        } else {
            navigate('/')
        }
    }, [accountDetails])


    const [loggedUser, setLoggedUser] = useState(null)
    const [title, setTitle] = useState("")
    const [status, setStatus] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("")
    const [assignedBy, setAssignedBy] = useState("")
    const [assignedTo, setAssignedTo] = useState("")
    const [employees, setEmployees] = useState([])
    const [tasks, setTasks] = useState([])
    const [mode, setMode] = useState(false)
    const [taskid, setTaskid] = useState("")

    const [filterByAssignedTo, setFilterByAssignedTo] = useState("")
    const [filterByStatus, setFilterByStatus] = useState("")
    const [filterByPriority, setFilterByPriority] = useState("")

    const handleFiltercClear = () => {
        setFilterByAssignedTo("")
        setFilterByStatus("")
        setFilterByPriority("")
    }

    useEffect(() => {
        socket?.on("NewUserConnected", (message) => {
            console.log(message)
            toast.info(message);
        })
        socket?.on("IsthereAnUpdatedTaskStatus", (task) => {
            console.log(task, "i hadd mana")
            if (task.assignedBy === loggedUser?._id) {
                setTasks((prev) => (
                    prev.map((currentTask) => (
                        currentTask._id === task._id ? task : currentTask
                    ))
                ))
                toast.info("Status had Updated");
            }
        })

        return () => {
            socket?.off("NewUserConnected")
            socket?.off("IsthereAnUpdatedTaskStatus")
        }
    }, [socket])


    useEffect(() => {
        if (!loggedUser?._id) return
        const fetchTasks = async () => {
            const res = await axios.get("http://127.0.0.1:8000/managerTasks/" + loggedUser._id)
            if (res.data.tasks) {
                setTasks(res.data.tasks)
            }
        }
        fetchTasks()
    }, [loggedUser])

    const handleCreate = async () => {
        try {
            console.log(title, description, status, priority, assignedBy, assignedTo)
            if (!title || !description || !status || !priority || !assignedBy || !assignedTo) {
                alert("Please fill all fields")
                return
            }
            const res = await axios.post('http://127.0.0.1:8000/create', {
                title,
                status,
                description,
                priority,
                assignedTo,
                assignedBy
            }, {
                headers: {
                    Authorization: "Bearer " + loggedUser.token
                }
            })

            const { title: T, description: D, status: S, priority: P, assignedTo: A, _id: id } = res.data.task

            socket?.emit("IhadAnUpdatedTask", {
                ...res.data.task
            })

            setTasks((prev) => {
                const data = [...prev,
                { title: T, description: D, status: S, priority: P, assignedTo: A, _id: id }
                ]
                return data
            })
            console.log(res, "task added")

        } catch (err) {
            console.log(err)
        }
        clearForm()
    }

    const clearForm = () => {
        setTitle("")
        setStatus("")
        setDescription("")
        setPriority("")
        setAssignedTo("")
        setTaskid("")
    }

    const handleForm = (id) => {
        const task = tasks.find(task => task._id === id)

        if (task) {
            console.log(task._id, "form")
            setTaskid(id)
            setTitle(task.title)
            setStatus(task.status)
            setDescription(task.description)
            setPriority(task.priority)
            setAssignedTo(task.assignedTo)
        }

        setMode(true)
    }
    const handleEdit = async () => {
        console.log(title, description, status, priority, assignedBy, assignedTo)
        try {
            if (!title || !description || !status || !priority || !assignedBy || !assignedTo) {
                alert("Please fill all fields")
                return
            }
            const res = await axios.put("http://127.0.0.1:8000/update/" + taskid, {
                title,
                status,
                description,
                priority,
                assignedTo,
                assignedBy
            }, {
                headers: {
                    Authorization: "Bearer " + loggedUser.token
                }
            })
            socket?.emit("IhadAnUpdatedTaskEdit", {
                ...res.data.task
            })

            setTasks((prev) => {
                const data = prev.map(task => (
                    task._id === taskid ? { ...res.data.task } : task
                ))
                return data
            })
            setMode(false)

        } catch (err) {
            console.log(err)
        }
        clearForm()
    }

    const filteredTasks = tasks.filter(task => {
        return (
            (!filterByAssignedTo || task.assignedTo === filterByAssignedTo) &&
            (!filterByPriority || task.priority === filterByPriority) &&
            (!filterByStatus || task.status === filterByStatus)
        )
    })
    return (
        <div className="min-h-screen bg-gray-100">
            <Toast />
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">{accountDetails?.email}</span>
                        <button
                            onClick={() => dispatch(logout())}
                            className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto py-3">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <Graph tasks={tasks} />
                </div>
                {/* Task Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">

                    <h2 className="text-xl font-semibold mb-4">{mode ? "Update Task" : "Assign New Task"}</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={title}
                                onChange={(e) => { setTitle(e.target.value) }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                name="description"
                                id="description"
                                value={description}
                                onChange={(e) => { setDescription(e.target.value) }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                id="status"
                                value={status}
                                onChange={(e) => { setStatus(e.target.value) }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Status</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="Priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                name="Priority"
                                id="Priority"
                                value={priority}
                                onChange={(e) => { setPriority(e.target.value) }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                            <select
                                name="assignedTo"
                                id="assignedTo"
                                value={assignedTo}
                                onChange={(e) => { setAssignedTo(e.target.value) }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Assignee</option>
                                {employees.map(employee => (
                                    <option key={employee._id} value={employee.email}>{employee.email}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => { mode ? handleEdit() : handleCreate() }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                            >
                                {mode ? "Update Task" : "Assign Task"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Filter Tasks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                id="status"
                                value={filterByStatus}
                                onChange={(e) => setFilterByStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Status</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                id="priority"
                                value={filterByPriority}
                                onChange={(e) => setFilterByPriority(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                            <select
                                name="employee"
                                id="employee"
                                value={filterByAssignedTo}
                                onChange={(e) => setFilterByAssignedTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Assignee</option>
                                {employees.map(employee => (
                                    <option key={employee._id} value={employee.email}>{employee.email}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFiltercClear}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Tasks</h2>
                    {filteredTasks.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No Tasks Found</p>
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
                                        <tr key={task._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                        task.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedTo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => { handleForm(task._id) }}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
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
            </div>
        </div>
    )
}

export default Manager