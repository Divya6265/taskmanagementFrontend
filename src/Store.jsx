import {configureStore} from '@reduxjs/toolkit'
import accountDetails from './UserSlice'

export default configureStore({
    reducer: {
        account : accountDetails,
    },
})
