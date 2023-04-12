import {useSelector} from "react-redux";
import {AppRootStateType} from "app/store";
import {TodolistDomainType} from "features/TodolistsList/todolists-reducer";

export const selectorTodolists = (state: AppRootStateType) => state.todolists
export const selectorTasks = (state: AppRootStateType) => state.tasks