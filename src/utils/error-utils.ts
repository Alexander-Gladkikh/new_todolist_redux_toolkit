import {appAction} from 'app/app-reducer'
import {ResponseType} from 'api/todolists-api'
import {Dispatch} from 'redux'
import axios, {AxiosError} from "axios";

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
    if (data.messages.length) {
        dispatch(appAction.setAppError({error: data.messages[0]}))
    } else {
        dispatch(appAction.setAppError({error: 'Some error occurred'} ))
    }
    dispatch(appAction.setAppStatus({ status: 'failed' }))
}

export const handleServerNetworkError = (e: unknown, dispatch: Dispatch) => {
    const err = e as Error | AxiosError<{ error: string }>
    if (axios.isAxiosError(err)) {
        const error = err.message ? err.message : 'Some error occurred'
        dispatch(appAction.setAppError({error}))
    } else {
        dispatch(appAction.setAppError({error: `Native error ${err.message}`}))
    }
    dispatch(appAction.setAppStatus({status: 'failed'}))
}
