import {todolistActions, TodolistDomainType} from './todolists-reducer'
import {
  AddTaskArgType,
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI, UpdateTaskArgType,
  UpdateTaskModelType
} from 'api/todolists-api'
import {AppRootStateType, AppThunk} from 'app/store'
import {appAction} from 'app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {createAppAsyncThunk} from "utils/create-app-async-thunk";

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[], todolistId: string }, string>('tasks/fetchTasks',
  async (todolistId, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
      dispatch(appAction.setAppStatus({status: 'loading'}))
      const res = await todolistsAPI.getTasks(todolistId)
      const tasks = res.data.items
      dispatch(appAction.setAppStatus({status: 'succeeded'}))
      return {tasks, todolistId}
    } catch (error: any) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
    }
  })

const addTask = createAppAsyncThunk<{ task: TaskType }, AddTaskArgType>
('tasks/addTask', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI
  try {
    dispatch(appAction.setAppStatus({status: 'loading'}))
    const res = await todolistsAPI.createTask(arg)
    if (res.data.resultCode === 0) {
      const task = res.data.data.item
      dispatch(appAction.setAppStatus({status: 'succeeded'}))
      return {task}
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})



const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>('task/updateTask', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue, getState} = thunkAPI
  try {
    const state = getState()
    const task = state.tasks[arg.todolistId].find(t => t.id === arg.taskId)
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn('task not found in the state')
      return rejectWithValue(null)
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...arg.domainModel
    }

    const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel)
    if (res.data.resultCode === 0) {
      return arg
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export const removeTaskTC = (taskId: string, todolistId: string): AppThunk => dispatch => {
  todolistsAPI.deleteTask(todolistId, taskId)
    .then(res => {
      const action = tasksAction.removeTask({taskId, todolistId})
      dispatch(action)
    })
}

const initialState: TasksStateType = {}

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index !== -1) tasks.splice(index, 1)
    },
    addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
      const tasks = state[action.payload.task.todoListId]
      tasks.unshift(action.payload.task)
    },
    setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) => {
      state[action.payload.todolistId] = action.payload.tasks
    },
    clearTasksData: (state, action) => {
      return {}
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.task.todoListId]
        tasks.unshift(action.payload.task)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex(t => t.id === action.payload.taskId)
        if (index !== -1) {
          tasks[index] = {...tasks[index], ...action.payload.domainModel}
        }
      })
      .addCase(todolistActions.addTodolist, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistActions.removeTodoList, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach(tl => {
          state[tl.id] = []
        })
      })
      .addCase(todolistActions.clearTodosData, (state, action) => {
        return {}
      })
  }
})

export const tasksReducer = slice.reducer
export const tasksAction = slice.actions
export const taskThunk = {fetchTasks, addTask, updateTask}

export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}

