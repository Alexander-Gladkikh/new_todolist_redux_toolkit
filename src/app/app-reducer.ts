import {Dispatch} from 'redux'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {authAPI} from "features/auth/auth-api";
import {createAppAsyncThunk, handleServerNetworkError} from "common/utils";



// export const initializeAppTC = () => (dispatch: Dispatch) => {
//   authAPI.me().then(res => {
//     if (res.data.resultCode === 0) {
//       dispatch(appAction.setAppInitialized({isInitialized: true}));
//     } else {
//
//     }
//     dispatch(appAction.setAppInitialized({isInitialized: true}));
//   })
// }

const initialState = {
  status: 'idle' as RequestStatusType,
  error: null as null | string,
  isInitialized: false
}
export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AppInitialStateType = typeof initialState

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status
    },
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error
    },
    setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
      state.isInitialized = action.payload.isInitialized
    }
  }
})

export const appReducer = slice.reducer
export const appAction = slice.actions




