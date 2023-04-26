import {Dispatch} from "redux";
import axios, {AxiosError} from "axios";
import {appAction} from "app/app-reducer";


/**
 * Обрабатывает ошибки, которые могут возникнуть при взаимодействии с сервером или сетью, и отправляет сообщения об ошибке в Redux store.
 * @param {unknown} e - Ошибка, которую необходимо обработать.
 * @param {Dispatch} dispatch - Функция, которая используется для отправки действий (actions) в Redux store.
 * @return {void}
 */
export const handleServerNetworkError = (e: unknown, dispatch: Dispatch) => {
  const err = e as Error | AxiosError<{ error: string }>
  if (axios.isAxiosError(err)) {
    const error = err.message ? err.message : 'Some error occurred'
    dispatch(appAction.setAppError({error}))
  } else {
    dispatch(appAction.setAppError({error: `Native error ${err.message}`}))
  }
}