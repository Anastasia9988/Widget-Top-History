import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { fetchTopHistoryRaw } from '../../API/api'

export type RawHistory = Record<
    string,
    Record<string, Record<string, number>>
>


interface HistoryState {
    raw:    RawHistory | null
    status: 'idle' | 'loading' | 'failed'
    error:  string | null
}

const initialState: HistoryState = {
    raw:    null,
    status: 'idle',
    error:  null,
}

export const loadHistory = createAsyncThunk<
    RawHistory,
    { countryId: string; dateFrom: string; dateTo: string },
    { rejectValue: string }
>(
    'history/load',
    async ({ countryId, dateFrom, dateTo }, { rejectWithValue }) => {
        try {
            return await fetchTopHistoryRaw(countryId, dateFrom, dateTo)
        } catch (e: any) {
            return rejectWithValue(e.message)
        }
    }
)

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {

    },
    extraReducers: builder => {
        builder
            .addCase(loadHistory.pending, state => {
                state.status = 'loading'
                state.error  = null
            })
            .addCase(
                loadHistory.fulfilled,
                (state, action: PayloadAction<RawHistory>) => {
                    state.status = 'idle'
                    state.raw    = action.payload
                }
            )
            .addCase(loadHistory.rejected, (state, action) => {
                state.status = 'failed'
                state.error  = action.payload ?? 'Unknown error'
            })
    },
})

export default historySlice.reducer
