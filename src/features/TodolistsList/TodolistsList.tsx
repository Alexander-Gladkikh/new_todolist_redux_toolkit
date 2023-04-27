import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {
  FilterValuesType,
  todolistActions, todolistsThunks
} from './todolists-reducer'
import {taskThunk} from './tasks-reducer'
import {Grid, Paper} from '@mui/material'
import {Todolist} from './Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {useAppDispatch} from 'common/hooks/useAppDispatch';
import {selectIsLoggedIn} from "features/Login/auth.selector";
import {selectorTasks, selectorTodolists} from "features/TodolistsList/todolists.selector";
import {AddItemForm} from "components/AddItemForm/AddItemForm";
import {TaskStatuses} from "common/enums";
import {useActions} from "common/hooks/useActions";

type PropsType = {
  demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {

  const todolists = useSelector(selectorTodolists)
  const tasks = useSelector(selectorTasks)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const {
    fetchTodolists,
    removeTodolist: removeTodolistThunk,
    addTodolist: addTodolistThunk,
    changeTodolistTitle: changeTodolistTitleThunk
  } = useActions(todolistsThunks)

  const {
    removeTask: removeTaskThunk,
    addTask: addTaskThunk,
    updateTask: updateTaskThunk
  } = useActions(taskThunk)

  const {changeTodolistFilter} = useActions(todolistActions)

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return;
    }
    fetchTodolists()
  }, [])

  const removeTask = (taskId: string, todolistId: string) => removeTaskThunk({taskId, todolistId})

  const addTask = (title: string, todolistId: string) => addTaskThunk({title, todolistId})

  const changeStatus = (taskId: string, status: TaskStatuses, todolistId: string) => updateTaskThunk({taskId, domainModel: {status}, todolistId})

  const changeTaskTitle = (taskId: string, title: string, todolistId: string) => updateTaskThunk({taskId, domainModel: {title}, todolistId})

  const changeFilter = (value: FilterValuesType, todolistId: string) => changeTodolistFilter({id: todolistId, filter: value})

  const removeTodolist = (id: string) => removeTodolistThunk(id)

  const changeTodolistTitle = (id: string, title: string) => changeTodolistTitleThunk({id, title})

  const addTodolist = (title: string) => addTodolistThunk(title)

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
