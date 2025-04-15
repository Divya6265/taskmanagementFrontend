import React, { useEffect, useState } from 'react'
import axios from 'axios'

function EmpTask({ task, setTasks, socket }) {
    const [updatedStatus, setUpdatedStatus] = useState(task.status)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleStatus = async () => {
        setIsUpdating(true)
        try {
            const res = await axios.patch(`http://127.0.0.1:8000/updateEmpTask/${task._id}`, { 
                status: updatedStatus 
            })
            if (res.status) {
                setTasks((prev) => {
                    const data = prev.map(currentTask => (
                        currentTask._id === task._id ? { ...currentTask, status: updatedStatus } : currentTask
                    ))
                    return data
                })
                socket?.emit('IhadUpdatedTaskStatus', res.data.task)
                toast.success("Task status updated successfully")
            }
        } catch (err) {
            console.log(err)
            toast.error("Failed to update task status")
        } finally {
            setIsUpdating(false)
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800'
            case 'Medium': return 'bg-blue-100 text-blue-800'
            case 'Low': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority} Priority
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Assigned by ID : {task.assignedBy}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <select 
                        value={updatedStatus}
                        onChange={(e) => setUpdatedStatus(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    
                    <button
                        onClick={handleStatus}
                        disabled={isUpdating || updatedStatus === task.status}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                            isUpdating || updatedStatus === task.status 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmpTask