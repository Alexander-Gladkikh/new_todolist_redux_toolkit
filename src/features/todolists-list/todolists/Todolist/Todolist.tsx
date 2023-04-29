import React, {FC, memo, useCallback, useEffect} from 'react'
import {AddItemForm} from 'components/AddItemForm/AddItemForm'
import {EditableSpan} from 'components/EditableSpan/EditableSpan'
import {Task} from 'features/todolists-list/todolists/Todolist/Task/Task'
import {
    FilterValuesType, todolistActions,
    TodolistDomainType,
    todolistsThunks
} from 'features/todolists-list/todolists/todolists-reducer'
import {Button, IconButton} from '@mui/material'
import {Delete} from '@mui/icons-material'
import {TaskType} from "features/todolists-list/todolists/todolist-api";
import {TaskStatuses} from "common/enums";
import {taskThunk} from "features/todolists-list/tasks/tasks-reducer";
import {useActions} from "common/hooks/useActions";

type PropsType = {
    todolist: TodolistDomainType
    tasks: Array<TaskType>
    demo?: boolean
}


export const Todolist: FC<PropsType> = memo(({demo = false, todolist, tasks}) => {

    const {fetchTasks, addTask} = useActions(taskThunk)
    const {removeTodolist, changeTodolistTitle} = useActions(todolistsThunks)
    const {changeTodolistFilter} = useActions(todolistActions)



    useEffect(() => {
        fetchTasks(todolist.id)
    }, [])

    const addTaskCallback = (title: string) => {
        addTask({ title, todolistId: todolist.id})
    }

    const removeTodolistHandler = () => {
        removeTodolist(todolist.id)
    }
    const changeTodolistTitleHandler = (title: string) => {
        changeTodolistTitle({id: todolist.id, title})
    }

    const onAllClickHandler = () => changeTodolistFilter({ filter: 'all', id: todolist.id })
    const onActiveClickHandler = () => changeTodolistFilter({ filter: 'active', id: todolist.id})
    const onCompletedClickHandler = () => changeTodolistFilter({ filter: 'completed', id: todolist.id})


    let tasksForTodolist = tasks

    if (todolist.filter === 'active') {
        tasksForTodolist = tasks.filter(t => t.status === TaskStatuses.New)
    }
    if (todolist.filter === 'completed') {
        tasksForTodolist = tasks.filter(t => t.status === TaskStatuses.Completed)
    }

    return <div>
        <h3><EditableSpan value={todolist.title} onChange={changeTodolistTitleHandler}/>
            <IconButton onClick={removeTodolistHandler} disabled={todolist.entityStatus === 'loading'}>
                <Delete/>
            </IconButton>
        </h3>
        <AddItemForm addItem={addTaskCallback} disabled={todolist.entityStatus === 'loading'}/>
        <div>
            {
                tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={todolist.id}
                />)
            }
        </div>
        <div style={{paddingTop: '10px'}}>
            <Button variant={todolist.filter === 'all' ? 'outlined' : 'text'}
                    onClick={onAllClickHandler}
                    color={'inherit'}
            >All
            </Button>
            <Button variant={todolist.filter === 'active' ? 'outlined' : 'text'}
                    onClick={onActiveClickHandler}
                    color={'primary'}>Active
            </Button>
            <Button variant={todolist.filter === 'completed' ? 'outlined' : 'text'}
                    onClick={onCompletedClickHandler}
                    color={'secondary'}>Completed
            </Button>
        </div>
    </div>
})


