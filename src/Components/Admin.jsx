import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../UserSlice'

function Admin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("")
    const [message, setMessage] = useState("")
    const [isError, setIsError] = useState(false)
    const [loggedUser, setLoggedUser] = useState(null)
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

    const handleSignup = async () => {
        try {
            if (email && password && role) {
                const res = await axios.post('http://127.0.0.1:8000/signup', {
                    email, password, role
                })
                if (res.status) {
                    setMessage("User created successfully!")
                    setIsError(false)
                }
            } else {
                setMessage("Please fill all fields")
                setIsError(true)
            }
        } catch (err) {
            setMessage("Error creating user: User may already exist")
            setIsError(true)
        }
        setEmail("")
        setPassword("")
        setRole("")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center">
            <header className="w-full bg-white shadow-md">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">{accountDetails?.email}</span>
                        <button
                            onClick={() => dispatch(logout())}
                            className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="flex-1 w-full max-w-4xl py-8 px-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        <h2 className="text-2xl font-bold">Add New Users</h2>
                        <p className="mt-1 opacity-90">Create accounts for managers and employees</p>
                    </div>
                    
                    <div className="p-6 md:p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg ${isError ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {message}
                            </div>
                        )}

                        <form className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem]"
                                >
                                    <option value="">Select Role</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Employee">Employee</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleSignup}
                                    className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Admin