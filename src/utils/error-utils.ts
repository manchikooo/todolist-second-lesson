import {AppActionsType, setAppErrorAC, setAppStatusAC} from "../app/app-reduser";
import {Dispatch} from "redux";
import {ResponseType} from "../api/todolists-api";

export const handleServerNetworkError = (dispatch: Dispatch<AppActionsType>, message: string) => {
    dispatch(setAppErrorAC(message))
    dispatch(setAppStatusAC('failed'))
}
export const handlerServerAppError = <T>(dispatch: Dispatch<AppActionsType>, data: ResponseType<T>) => {
    dispatch(setAppErrorAC(data.messages[0]))
}