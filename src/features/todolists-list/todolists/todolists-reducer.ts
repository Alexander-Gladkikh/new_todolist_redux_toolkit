import {appAction, RequestStatusType} from 'app/app-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {todolistsAPI, TodolistType, UpdateTodolistTitleArgType} from "features/todolists-list/todolists/todolist-api";
import {createAppAsyncThunk, handleServerAppError} from "common/utils";
import {ResultCode} from "common/enums";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {thunkTryCatch} from "common/utils/thunk-try-catch";

const initialState: Array<TodolistDomainType> = []

const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, void>
('todo/fetchTodolists', async () => {
    const res = await todolistsAPI.getTodolists()
    return {todolists: res.data}
})

const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>
('todo/addTodolist', async (title, {rejectWithValue}) => {
    const res = await todolistsAPI.createTodolist(title)
    if (res.data.resultCode === ResultCode.Success) {
      return {todolist: res.data.data.item}
    } else {
      return rejectWithValue({data: res.data, showGlobalError: false})
    }
})

const removeTodolist = createAppAsyncThunk<{ id: string }, string>
('todo/removeTodolist', async (id, {dispatch, rejectWithValue}) => {
      const res = await todolistsAPI.deleteTodolist(id)
      if (res.data.resultCode === ResultCode.Success) {
        return {id}
      } else {
        return rejectWithValue({data: res.data, showGlobalError: true})
      }
})

const changeTodolistTitle = createAppAsyncThunk<UpdateTodolistTitleArgType, UpdateTodolistTitleArgType>
('todo/changeTodolistTitle', async (arg, {dispatch, rejectWithValue}) => {
    const res = await todolistsAPI.updateTodolist(arg)
    if (res.data.resultCode === ResultCode.Success) {
      return arg
    } else {
      return rejectWithValue({data: res.data, showGlobalError: true})
    }
})

const slice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
      const todo = state.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.filter = action.payload.filter
      }
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
      const todo = state.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.entityStatus = action.payload.entityStatus
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        const newTodolist: TodolistDomainType = {
          ...action.payload.todolist,
          filter: 'all',
          entityStatus: 'idle'
        }
        state.unshift(newTodolist)
      })
      .addCase(removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex(todo => todo.id === action.payload.id)
        if (index !== -1) state.splice(index, 1)
      })
      .addCase(changeTodolistTitle.fulfilled, (state, action) => {
        const todo = state.find(todo => todo.id === action.payload.id)
        if (todo) {
          todo.title = action.payload.title
        }
      })
      .addCase(clearTasksAndTodolists, () => {
        return []
      })
  }
})

export const todolistReducer = slice.reducer
export const todolistActions = slice.actions
export const todolistsThunks = {fetchTodolists, addTodolist, removeTodolist, changeTodolistTitle}
// thunks

// types

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}

