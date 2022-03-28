import {TasksStateType} from '../App';
import {v1} from 'uuid';
import {AddTodolistActionType, RemoveTodolistActionType, SetTodolistsACType} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";

export type RemoveTaskActionType = {
    type: 'REMOVE-TASK',
    todolistId: string
    taskId: string
}

export type AddTaskActionType = ReturnType<typeof addTaskAC>

export type ChangeTaskStatusActionType = {
    type: 'CHANGE-TASK-STATUS',
    todolistId: string
    taskId: string
    status: TaskStatuses
}

export type ChangeTaskTitleActionType = {
    type: 'CHANGE-TASK-TITLE',
    todolistId: string
    taskId: string
    title: string
}

type ActionsType = RemoveTaskActionType
    | AddTaskActionType
    | ChangeTaskStatusActionType
    | ChangeTaskTitleActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsACType
    | SetTasksACType

const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case 'SET-TODOLISTS': {
            const copyState = {...state}
            action.todolists.forEach((tl) => {
                copyState[tl.id] = []
            })
            return copyState
        }
        case 'REMOVE-TASK': {
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId];
            const newTasks = tasks.filter(t => t.id !== action.taskId);
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case 'ADD-TASK': {
            return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
        }
        case 'CHANGE-TASK-STATUS': {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, status: action.status} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'CHANGE-TASK-TITLE': {
            let todolistTasks = state[action.todolistId];
            // найдём нужную таску:
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.todolistId]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        case 'SET-TASKS': {
            return {...state, [action.todolistId]: action.tasks}
        }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType) => {
    return {type: 'ADD-TASK', task} as const
}
export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string): ChangeTaskStatusActionType => {
    return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId}
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string): ChangeTaskTitleActionType => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId}
}

type SetTasksACType = ReturnType<typeof setTasksAC>

export const setTasksAC = (todolistId: string, tasks: Array<TaskType>) => {
    return {type: 'SET-TASKS', todolistId, tasks} as const
}

export const setTasksTC = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.getTasks(todolistId)
            .then(res => dispatch(setTasksAC(todolistId, res.data.items)))
    }
}

export const removeTaskTC = (taskId: string, todolistId: string,) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.deleteTask(taskId, todolistId)
            .then(res => dispatch(removeTaskAC(taskId, todolistId)))
    }
}

export const addTaskTC = (todolistId: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.createTask(todolistId, title)
            .then(res => dispatch(addTaskAC(res.data.data.item)))
    }
}

export const updateTaskStatusTC = (todolistId: string, taskId: string, status: TaskStatuses) => (dispatch: Dispatch, getState: () => AppRootStateType) => {

    const appState = getState()
    const tasksApp = appState.tasks
    const tasksForCurrentTodolist = tasksApp[todolistId]
    const clickedTask = tasksForCurrentTodolist.find(t => t.id === taskId)

    if (clickedTask) {
        const model: UpdateTaskModelType = {
            title: clickedTask.title,
            status,
            priority: clickedTask.priority,
            startDate: clickedTask.startDate,
            deadline: clickedTask.deadline,
            description: clickedTask.description
        }
        todolistsAPI.updateTask(todolistId, taskId, model)
            .then(res => dispatch(changeTaskStatusAC(taskId, status, todolistId)))
    }
}
export const updateTaskTitleTC = (todolistId: string, taskId: string, title: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {

    const appState = getState()
    const tasksApp = appState.tasks
    const tasksForCurrentTodolist = tasksApp[todolistId]
    const clickedTask = tasksForCurrentTodolist.find(t => t.id === taskId)

    if (clickedTask) {
        const model: UpdateTaskModelType = {
            title: title,
            status: clickedTask.status,
            priority: clickedTask.priority,
            startDate: clickedTask.startDate,
            deadline: clickedTask.deadline,
            description: clickedTask.description
        }
        todolistsAPI.updateTask(todolistId, taskId, model)
            .then(res => dispatch(changeTaskTitleAC(taskId, title, todolistId)))
    }
}




















