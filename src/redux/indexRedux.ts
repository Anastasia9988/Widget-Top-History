import { configureStore } from '@reduxjs/toolkit';
import historyReducer from './slices/historySlice'
import geoReducer from './slices/geoSlice'
import categoriesReducer from './slices/categoriesSlice'



export const store = configureStore({
    reducer: {
        history: historyReducer,
        geo: geoReducer,
        categories: categoriesReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;