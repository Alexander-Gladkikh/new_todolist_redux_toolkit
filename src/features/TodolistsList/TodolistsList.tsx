import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {
  addTodolistTC,
  changeTodolistTitleTC,
  FilterValuesType,
  removeTodolistTC,
  todolistActions, todosThunks
} from './todolists-reducer'
import { taskThunk } from './tasks-reducer'
import {Grid, Paper} from '@mui/material'
import {Todolist} from './Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {useAppDispatch} from 'common/hooks/useAppDispatch';
import {selectIsLoggedIn} from "features/Login/auth.selector";
import {selectorTasks, selectorTodolists} from "features/TodolistsList/todolists.selector";
import {AddItemForm} from "components/AddItemForm/AddItemForm";
import {TaskStatuses} from "common/enums";

type PropsType = {
  demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {

  const todolists = useSelector(selectorTodolists)
  const tasks = useSelector(selectorTasks)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return;
    }
    const thunk = todosThunks.fetchTodolists()
    dispatch(thunk)
  }, [])

  const removeTask = useCallback(function (taskId: string, todolistId: string) {
    const thunk = taskThunk.removeTask({taskId, todolistId} )
    dispatch(thunk)
  }, [])

  const addTask = useCallback(function (title: string, todolistId: string) {
    const thunk = taskThunk.addTask( { title, todolistId })
    dispatch(thunk)
  }, [])

  const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
    const thunk = taskThunk.updateTask({taskId,domainModel: {status}, todolistId})
    dispatch(thunk)
  }, [])

  const changeTaskTitle = useCallback(function (taskId: string, title: string, todolistId: string) {
    const thunk = taskThunk.updateTask({ taskId, domainModel: {title}, todolistId})
    dispatch(thunk)
  }, [])

  const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
    const action = todolistActions.changeTodolistFilter({id: todolistId, filter: value})
    dispatch(action)
  }, [])

  const removeTodolist = useCallback(function (id: string) {
    const thunk = removeTodolistTC(id)
    dispatch(thunk)
  }, [])

  const changeTodolistTitle = useCallback(function (id: string, title: string) {
    const thunk = changeTodolistTitleTC(id, title)
    dispatch(thunk)
  }, [])

  const addTodolist = useCallback((title: string) => {
    const thunk = addTodolistTC(title)
    dispatch(thunk)
  }, [dispatch])

  if (!isLoggedIn) {
    return <Navigate to={"/login"}/>
  }

  return <>
    <Grid container style={{padding: '20px'}}>
      <AddItemForm addItem={addTodolist}/>
    </Grid>
    <Grid container spacing={3}>
      {
        todolists.map(tl => {
          let allTodolistTasks = tasks[tl.id]

          return <Grid item key={tl.id}>
            <Paper style={{padding: '10px'}}>
              <Todolist
                todolist={tl}
                tasks={allTodolistTasks}
                removeTask={removeTask}
                changeFilter={changeFilter}
                addTask={addTask}
                changeTaskStatus={changeStatus}
                removeTodolist={removeTodolist}
                changeTaskTitle={changeTaskTitle}
                changeTodolistTitle={changeTodolistTitle}
                demo={demo}
              />
            </Paper>
          </Grid>
        })
      }
    </Grid>
  </>
}
