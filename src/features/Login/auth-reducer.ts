import {appAction} from 'app/app-reducer'
import {createSlice} from "@reduxjs/toolkit";
import {createAppAsyncThunk, handleServerAppError, handleServerNetworkError} from "common/utils";
import {authAPI, LoginParamsType} from "features/Login/auth-api";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {ResultCode} from "common/enums";

export const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>
('auth/login', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI
  try {
    dispatch(appAction.setAppStatus({status: 'loading'}))
    const res = await authAPI.login(arg)
    if (res.data.resultCode === 0) {
      dispatch(appAction.setAppStatus({status: 'succeeded'}))
      return {isLoggedIn: true}
    } else {
      handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export const logout = createAppAsyncThunk<{isLoggedIn: false}, void>
('auth/logout', async (_, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI
  try {
    dispatch(appAction.setAppStatus({status: 'loading'}))
    const res = await authAPI.logout()
    if (res.data.resultCode === 0) {
      dispatch(clearTasksAndTodolists())
      dispatch(appAction.setAppStatus({status: 'succeeded'}))
      return {isLoggedIn: false}
    } else {
      handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export const initializeApp = createAppAsyncThunk<{isLoggedIn: boolean}, void>
('app/initializeApp', async (_, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI
  try {
    const res = await authAPI.me()
    if (res.data.resultCode === ResultCode.Success) {
      return {isLoggedIn: true};
    }
    else {
      return rejectWithValue(null)
    }
} catch (e) {
  handleServerNetworkError(e, dispatch)
  return rejectWithValue(null)
}
finally {
    dispatch(appAction.setAppInitialized({isInitialized: true}));
  }
})

const initialState = {
  isLoggedIn: false
}

export type InitialStateType = typeof initialState

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
  }
})

export const authReducer = slice.reducer
export const authThunk = {login, logout, initializeApp}





