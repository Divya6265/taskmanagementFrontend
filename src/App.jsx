import { useEffect, useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import Login from './Components/Login'
import Manager from './Components/Manager'
import Admin from './Components/Admin'
import Employee from './Components/Employee'
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux'


function App() {
  
  const accountDetails = useSelector((state) => state.account.value)
  const [socket, setSocket] = useState(null)

  
  useEffect(() => {

    if(accountDetails){
      const websocket = new io(import.meta.env.VITE_URL, {
        autoConnect: true,
        reconnection: true,
      });
      
      websocket.on("connect", () => {
        websocket.emit("connected")
        setSocket(websocket)
      })
      websocket.on("disconnect", () => {
        setSocket("")
        console.log("disconnected")
      })
    
      return () => {
        websocket.off('connect')
      }  
    }
  }, [accountDetails])
  
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>}></Route>
      <Route path='/admin/dashboard' element={<Admin />}></Route>
      <Route path='/manager/dashboard' element={<Manager socket={socket} />}></Route>
      <Route path='/employee/dashboard' element={<Employee socket={socket} />}></Route>
    </Routes>
    </BrowserRouter>


    </>
  )
}

export default App
