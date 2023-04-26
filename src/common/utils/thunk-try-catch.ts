import { AppDispatch, AppRootStateType } from 'app/store';
import { handleServerNetworkError } from 'common/utils/handle-server-network-error';
import {BaseThunkAPI} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {appAction} from "app/app-reducer";
import {ResponseType} from "common/types";

export const thunkTryCatch = async (thunkAPI: BaseThunkAPI<AppRootStateType, any, AppDispatch, null | ResponseType>, logic: Function) => {
  const {dispatch, rejectWithValue} = thunkAPI
  dispatch(appAction.setAppStatus({status: 'loading'}))
  try {
    return await logic()
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  } finally {
    // в handleServerNetworkError можно удалить убирание крутилки
    dispatch(appAction.setAppStatus({status: 'idle'}))
  }
}
