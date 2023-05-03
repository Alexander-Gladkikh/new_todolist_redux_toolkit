import {todolistsThunks} from 'features/todolists-list/todolists/todolists-reducer'
import {appAction} from 'app/app-reducer'
import {createSlice} from "@reduxjs/toolkit";
import {createAppAsyncThunk} from "common/utils/create-app-async-thunk";
import {handleServerAppError} from "common/utils/handle-server-app-error";
import {
  AddTaskArgType,
  RemoveTaskArgType,
  TaskType,
  UpdateTaskArgType,
  UpdateTaskModelType
} from "features/todolists-list/todolists/todolist-api";
import {ResultCode, TaskPriorities, TaskStatuses} from "common/enums";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {thunkTryCatch} from "common/utils/thunk-try-catch";
import {taskAPI} from "features/todolists-list/tasks/task-api";

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[], todolistId: string }, string>
('tasks/fetchTasks', async (todolistId, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI
  return thunkTryCatch(thunkAPI, async () => {
    const res = await taskAPI.getTasks(todolistId)
    const tasks = res.data.items
    dispatch(appAction.setAppStatus({status: 'succeeded'}))
    return {tasks, todolistId}
  })
  })

const addTask = createAppAsyncThunk<{ task: TaskType }, AddTaskArgType>
('tasks/addTask', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI
return thunkTryCatch(thunkAPI, async  () => {
  const res = await taskAPI.createTask(arg)
  if (res.data.resultCode === ResultCode.Success) {
    const task = res.data.data.item
    return {task}
  } else {
    handleServerAppError(res.data, dispatch);
    return rejectWithValue(null)
  }
})
})

export const removeTask = createAppAsyncThunk<RemoveTaskArgType, RemoveTaskArgType>('task/removeTask', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI
  return thunkTryCatch(thunkAPI, async () => {
    const res = await taskAPI.deleteTask(arg)
    if (res.data.resultCode === ResultCode.Success) {
      dispatch(appAction.setAppStatus({status: 'succeeded'}))
      return arg
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  })
  })


const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType>
('task/updateTask', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue, getState} = thunkAPI
  return thunkTryCatch(thunkAPI, async () => {
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

    const res = await taskAPI.updateTask(arg.todolistId, arg.taskId, apiModel)
    if (res.data.resultCode === ResultCode.Success) {
      dispatch(appAction.setAppStatus({status: 'succeeded'}))
      return arg
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  })
  })



const initialState: TasksStateType = {}

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
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
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex(t => t.id === action.payload.taskId)
        if (index !== -1) tasks.splice(index, 1)
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = []
        })
      })
      .addCase(clearTasksAndTodolists, () => {
        return {}
      })
  }
})

export const tasksReducer = slice.reducer
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
