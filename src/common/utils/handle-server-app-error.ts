import {ResponseType} from "common/types";
import {Dispatch} from "redux";
import {appAction} from "app/app-reducer";

/**
 * Данная функция обрабатывает ошибки, которые могут возникнуть при взаимодействии с сервером.
 * @param data  - ответ от сервера в формате ResponseType<D>
 * @param dispatch - функция для отправки сообщений в store Redux
 * @param showError - флаг, указывающий, нужно ли отображать ошибки в пользовательском интерфейсе
*/
export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch, showError = true) => {
    if (showError) {
        dispatch(appAction.setAppError( {error: data.messages.length ?  data.messages[0] : 'Some error occurred'} ))
    }
}