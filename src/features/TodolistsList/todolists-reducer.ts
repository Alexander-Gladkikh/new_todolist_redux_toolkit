import {todolistsAPI, TodolistType} from 'api/todolists-api'
import {appAction, RequestStatusType} from 'app/app-reducer'
import {handleServerNetworkError} from 'utils/error-utils'
import {AppThunk} from 'app/store';
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {fetchTasksTC} from "features/TodolistsList/tasks-reducer";

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        removeTodoList: (state, action: PayloadAction<{id: string}>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state.splice(index, 1)
        },
        addTodolist: (state, action: PayloadAction<{todolist: TodolistType}>) => {
            const newTodoList: TodolistDomainType = {...action.payload.todolist, filter: 'all', entityStatus: 'idle'}
            state.unshift(newTodoList)
        },
        changeTodolistTitle: (state, action: PayloadAction<{id: string, title: string}>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.title = action.payload.title
            }
        },
        changeTodolistFilter: (state, action: PayloadAction<{id: string, filter: FilterValuesType}>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.filter = action.payload.filter
            }
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{id: string, entityStatus: RequestStatusType}>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.entityStatus = action.payload.entityStatus
            }
        },
        setTodolists: (state, action: PayloadAction<{todolists: Array<TodolistType>}>) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        }
    }
})

export const todolistReducer = slice.reducer
export const todolistActions = slice.actions
// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return dispatch => {
        dispatch(appAction.setAppStatus({status: 'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(todolistActions.setTodolists({ todolists: res.data}))
                dispatch(appAction.setAppStatus({status: 'succeeded'}))
                return res.data
            })
          .then((todos) => {
              todos.forEach((tl) => {
                  dispatch(fetchTasksTC(tl.id))
              })
          })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}
export const removeTodolistTC = (todolistId: string): AppThunk => {
    return dispatch => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(appAction.setAppStatus({status: 'loading'}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        dispatch(todolistActions.changeTodolistEntityStatus({ id: todolistId, entityStatus: 'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(todolistActions.removeTodoList({id: todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(appAction.setAppStatus({status: 'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string): AppThunk => {
    return dispatch => {
        dispatch(appAction.setAppStatus({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(todolistActions.addTodolist({ todolist: res.data.data.item }))
                dispatch(appAction.setAppStatus({status: 'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
    return dispatch => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(todolistActions.changeTodolistTitle({id: id, title: title}))
            })
    }
}

// types

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
