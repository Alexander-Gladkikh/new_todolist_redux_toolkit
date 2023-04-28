import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {FilterValuesType, todolistActions, todolistsThunks} from 'features/todolists-list/todolists/todolists-reducer'
import {taskThunk} from 'features/todolists-list/tasks/tasks-reducer'
import {Grid, Paper} from '@mui/material'
import {Todolist} from 'features/todolists-list/todolists/Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {selectIsLoggedIn} from "features/auth/auth.selector";
import {selectorTasks, selectorTodolists} from "features/todolists-list/todolists/todolists.selector";
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


  const {changeTodolistFilter} = useActions(todolistActions)

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return;
    }
    fetchTodolists({})
  }, [])



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
                changeFilter={changeFilter}
                removeTodolist={removeTodolist}
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
