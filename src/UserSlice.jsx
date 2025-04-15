import {createSlice} from '@reduxjs/toolkit'

const accountDetails = JSON.parse(localStorage.getItem('user_info')) || null

const UserSlice = createSlice({
    name : 'account',
    initialState : {
        value : accountDetails
    },
    reducers : {
        login : (state, action) => {
            state.value = action.payload
            console.log( state, "login")
        },
        logout : (state) => {
            state.value = null
            localStorage.setItem('user_info',null)
        }
    }
})

export const {login, logout} = UserSlice.actions

export default UserSlice.reducer