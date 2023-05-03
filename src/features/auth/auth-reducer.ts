import {appAction} from 'app/app-reducer'
import {createSlice} from "@reduxjs/toolkit";
import {createAppAsyncThunk} from "common/utils";
import {authAPI, LoginParamsType} from "features/auth/auth-api";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {ResultCode} from "common/enums";

export const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>
('auth/login', async (arg, {rejectWithValue}) => {
    const res = await authAPI.login(arg)
    if (res.data.resultCode === 0) {
      return {isLoggedIn: true}
    } else {
      const isShowAppError = !res.data.fieldsErrors.length
      return rejectWithValue({data: res.data, showGlobalError: isShowAppError})
    }
})

export const logout = createAppAsyncThunk<{isLoggedIn: false}, void>
('auth/logout', async (_, {dispatch, rejectWithValue}) => {
    const res = await authAPI.logout()
    if (res.data.resultCode === 0) {
      dispatch(clearTasksAndTodolists())
      return {isLoggedIn: false}
    } else {
      return rejectWithValue({data: res.data, showGlobalError: true})
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
      return rejectWithValue({data: res.data, showGlobalError: false})
    }
} finally {
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





