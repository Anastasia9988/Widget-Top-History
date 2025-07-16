import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {API_KEY, BASE_URL} from "../../API/config";


export interface GeoItem {
    id:   number
    code: string
    name: string
}

interface GeoState {
    items: GeoItem[]
    status: 'idle' | 'loading' | 'failed'
    error: string | null
}

const initialState: GeoState = {
    items: [],
    status: 'idle',
    error: null,
}

export const loadGeo = createAsyncThunk<GeoItem[], void, { rejectValue: string }>(
    'geo/load',
    async (_, { rejectWithValue }) => {
        const res = await fetch(`${BASE_URL}/v1/geo?B4NKGg=${API_KEY}`)
        if (!res.ok) return rejectWithValue(`Geo fetch failed ${res.status}`)
        const raw = await res.json() as any
        const list = Array.isArray(raw.data) ? raw.data : []
        const items: GeoItem[] = list.map((o: any) => ({
            id:   Number(o.id),
            code: String(o.code),
            name: String(o.name),
        }))

        return items
    }
)

const geoSlice = createSlice({
    name: 'geo',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadGeo.pending, state => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(loadGeo.fulfilled, (state, action: PayloadAction<GeoItem[]>) => {
                state.status = 'idle'
                state.items = action.payload
            })
            .addCase(loadGeo.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? 'Unknown error'
            })
    },
})

export default geoSlice.reducer