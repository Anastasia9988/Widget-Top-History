import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import {AppDispatch, RootState} from "./indexRedux";



export const useAppDispatch = (): AppDispatch =>
    useDispatch<AppDispatch>()

export const useAppSelector: TypedUseSelectorHook<RootState> =
    useSelector
