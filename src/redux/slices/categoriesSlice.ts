import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { API_KEY, BASE_URL } from '../../API/config'

export interface CategoryItem {
    id:   number
    name: string
}

interface CategoriesState {
    items: CategoryItem[]
    status: 'idle' | 'loading' | 'failed'
    error: string | null
}

const initialState: CategoriesState = {
    items: [],
    status: 'idle',
    error: null,
}

export const loadCategories = createAsyncThunk<
    CategoryItem[],
    void,
    { rejectValue: string }
>(
    'categories/load',
    async (_, { rejectWithValue }) => {
        const res = await fetch(`${BASE_URL}/v1/applicationCategory?platform=1&B4NKGg=${API_KEY}`)
        if (!res.ok) return rejectWithValue(`Categories fetch failed ${res.status}`)
        const raw = await res.json() as any
        const list = Array.isArray(raw.data) ? raw.data : raw
        return list.map((o: any) => ({
            id:   Number(o.id),
            name: String(o.name),
        }))
    }
)

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadCategories.pending, state => {
                state.status = 'loading'
                state.error  = null
            })
            .addCase(
                loadCategories.fulfilled,
                (state, action: PayloadAction<CategoryItem[]>) => {
                    state.status = 'idle'
                    state.items  = action.payload
                }
            )
            .addCase(loadCategories.rejected, (state, action) => {
                state.status = 'failed'
                state.error  = action.payload ?? 'Unknown error'
            })
    },
})

export default categoriesSlice.reducer
