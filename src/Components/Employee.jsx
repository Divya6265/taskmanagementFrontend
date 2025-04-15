import React, { useState, useEffect } from 'react'
import axios from 'axios'
import EmpTask from './EmpTask'
import { toast } from 'react-toastify'
import Toast from './Toast'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../UserSlice'
import Graph from './Graph'
function Employee({ socket }) {
  const [loggedUser, setLoggedUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [taskid, setTaskid] = useState("")

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
    } else {
      navigate('/')
    }
  }, [accountDetails, navigate])

  useEffect(() => {
    socket?.on("NewUserConnected", (message) => {
      toast.info(message)
    })

    socket?.on("IsThereAnUpdatedTask", (task) => {
      if (task.assignedTo === loggedUser?.email) {
        setTasks((prev) => [...prev, task])
        toast.info("A New Task Added")
      }
    })

    socket?.on('IsThereAnUpdatedTaskEdit', (task) => {
      if (task.assignedTo === loggedUser?.email) {
        setTasks((prev) => (
          prev.map((currentTask) => (
            currentTask._id === task._id ? task : currentTask
          ))
        ))
      }
    })

    return () => {
      socket?.off("NewUserConnected")
      socket?.off("IsThereAnUpdatedTask")
      socket?.off("IsThereAnUpdatedTaskEdit")
    }
  }, [socket, loggedUser])

  useEffect(() => {
    if (!loggedUser?.email) return

    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_URL}employeeTasks/${loggedUser.email}`)
        if (res.data.tasks) {
          setTasks(res.data.tasks)
        }
      } catch (err) {
        console.log(err)
        toast.error("Failed to fetch tasks")
      }
    }
    fetchTasks()
  }, [loggedUser])

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
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

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tasks Section */}
        <Graph tasks={tasks}/>
        <section>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Your Tasks</h2>
              <span className="text-sm text-gray-500">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} assigned
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks assigned</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any tasks assigned to you yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {tasks.map(task => (
                  <EmpTask
                    key={task._id}
                    task={task}
                    setTasks={setTasks}
                    socket={socket}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Employee