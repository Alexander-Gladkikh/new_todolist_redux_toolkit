import {appAction} from 'app/app-reducer'
import {authAPI, LoginParamsType} from 'common/api/todolists-api'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunk} from "app/store";
import {todolistActions} from "features/TodolistsList/todolists-reducer";
import {handleServerAppError} from "common/utils/handle-server-app-error";
import {handleServerNetworkError} from "common/utils/handle-server-network-error";

const initialState = {
    isLoggedIn: false
}

export type InitialStateType = typeof initialState

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsLoggedIn: (state, action:PayloadAction<{isLoggedIn: boolean}>) => {
      state.isLoggedIn = action.payload.isLoggedIn
    }
  }
})

export const authReducer = slice.reducer
export const authActions = slice.actions

// thunks
export const loginTC = (data: LoginParamsType): AppThunk => dispatch => {
    dispatch(appAction.setAppStatus({status: 'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(authActions.setIsLoggedIn({ isLoggedIn: true}))
              dispatch(appAction.setAppStatus({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const logoutTC = ():  AppThunk => dispatch => {
  dispatch(appAction.setAppStatus({status: 'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
              dispatch(authActions.setIsLoggedIn({ isLoggedIn: false}))
              dispatch(appAction.setAppStatus({status: 'succeeded'}))
              dispatch(todolistActions.clearTodosData({}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}


