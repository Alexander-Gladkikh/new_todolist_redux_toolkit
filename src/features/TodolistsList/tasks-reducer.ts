import {todolistActions, todosThunks} from './todolists-reducer'
import {AppThunk} from 'app/store'
import {appAction} from 'app/app-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {createAppAsyncThunk} from "common/utils/create-app-async-thunk";
import {handleServerAppError} from "common/utils/handle-server-app-error";
import {handleServerNetworkError} from "common/utils/handle-server-network-error";
import {
  AddTaskArgType, RemoveTaskArgType,
  TaskType,
  todolistsAPI,
  UpdateTaskArgType,
  UpdateTaskModelType
} from "features/TodolistsList/todolist-api";
import {ResultCode, TaskPriorities, TaskStatuses} from "common/enums";

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[], todolistId: string }, string>
('tasks/fetchTasks', async (todolistId, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
      dispatch(appAction.setAppStatus({status: 'loading'}))
      const res = await todolistsAPI.getTasks(todolistId)
      const tasks = res.data.items
      dispatch(appAction.setAppStatus({status: 'succeeded'}))
      return {tasks, todolistId}
    } catch (error) {
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
    if (res.data.resultCode === ResultCode.Success) {
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

export const removeTask = createAppAsyncThunk<RemoveTaskArgType, RemoveTaskArgType>('task/removeTask', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI
  try {
    dispatch(appAction.setAppStatus({status: 'loading'}))
    const res = await todolistsAPI.deleteTask(arg)
    if (res.data.resultCode === ResultCode.Success) {
      dispatch(appAction.setAppStatus({status: 'succeeded'}))
      return arg
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  }
  catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>
('task/updateTask', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue, getState} = thunkAPI
  try {
    dispatch(appAction.setAppStatus({status: 'loading'}))
    const state = getState()
    const task = state.tasks[arg.todolistId].find(t => t.id === arg.taskId)
    if (!task) {
      dispatch(appAction.setAppError({error: 'task not found in the state'}))
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
    if (res.data.resultCode === ResultCode.Success) {
      dispatch(appAction.setAppStatus({status: 'succeeded'}))
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


const initialState: TasksStateType = {}

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
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
      .addCase(todosThunks.fetchTodolists.fulfilled, (state, action) => {
        action.payload.forEach((tl) => {
          state[tl.id] = []
        })
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex(t => t.id === action.payload.taskId)
        if (index !== -1) tasks.splice(index, 1)
      })
      .addCase(todolistActions.addTodolist, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistActions.removeTodoList, (state, action) => {
        delete state[action.payload.id]
      })
      // .addCase(todolistActions.setTodolists, (state, action) => {
      //   action.payload.todolists.forEach(tl => {
      //     state[tl.id] = []
      //   })
      // })
      .addCase(todolistActions.clearTodosData, (state, action) => {
        return {}
      })
  }
})

export const tasksReducer = slice.reducer
export const tasksAction = slice.actions
export const taskThunk = {fetchTasks, addTask, updateTask, removeTask}

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

