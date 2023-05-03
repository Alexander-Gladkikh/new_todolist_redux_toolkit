import React, {FC, memo, useCallback, useEffect} from 'react'
import {AddItemForm} from 'components/AddItemForm/AddItemForm'
import {EditableSpan} from 'components/EditableSpan/EditableSpan'
import {Task} from 'features/todolists-list/todolists/Todolist/Tasks/Task/Task'
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
import {FilterTasksButtons} from "features/todolists-list/todolists/Todolist/FilterTasksButtons/FilterTasksButtons";
import {Tasks} from "features/todolists-list/todolists/Todolist/Tasks/Tasks";
import {TodolistTitle} from "features/todolists-list/todolists/Todolist/TodolistTitle/TodolistTitle";

type PropsType = {
    todolist: TodolistDomainType
    tasks: Array<TaskType>
    demo?: boolean
}


export const Todolist: FC<PropsType> = memo(({demo = false, todolist, tasks}) => {

    const {fetchTasks, addTask} = useActions(taskThunk)


    useEffect(() => {
        fetchTasks(todolist.id)
    }, [])

    const addTaskCallback = (title: string) => {
       return addTask({ title, todolistId: todolist.id}).unwrap()
    }



    return <div>
        <TodolistTitle todolist={todolist}/>
        <AddItemForm addItem={addTaskCallback} disabled={todolist.entityStatus === 'loading'}/>
        <Tasks todolist={todolist} tasks={tasks}/>
        <div style={{paddingTop: '10px'}}>
            <FilterTasksButtons todolist={todolist}/>
        </div>
    </div>
})


