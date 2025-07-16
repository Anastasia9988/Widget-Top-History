import {RawHistory,} from '../redux/slices/historySlice'
import { API_KEY, BASE_URL }        from './config'

export async function fetchTopHistoryRaw(
    countryId: string,
    dateFrom:  string,
    dateTo:    string
): Promise<RawHistory> {
    const url = `${BASE_URL}/package/top_history/9379/${countryId}` +
        `?date_from=${dateFrom}` +
        `&date_to=${dateTo}` +
        `&platforms=1` +
        `&B4NKGg=${API_KEY}`

    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`History load failed: ${resp.status}`)
    const json = await resp.json() as any
    return json.data || {}
}


