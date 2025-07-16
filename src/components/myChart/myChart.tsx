// src/components/MyChart.tsx

import React, { useEffect } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { loadHistory } from '../redux/slices/historySlice'
import SUBCATEGORY_NAMES from '../utils/subNames'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

export interface MyChartProps {
    countryId: string
    dateFrom: string
    dateTo: string
    categoryIds: number[]
}

export function MyChart({
                            countryId,
                            dateFrom,
                            dateTo,
                            categoryIds,
                        }: MyChartProps) {
    const dispatch = useAppDispatch()
    const { raw, status, error } = useAppSelector(state => state.history)
    const { items: categories } = useAppSelector(state => state.categories)

    useEffect(() => {
        if (countryId && dateFrom && dateTo && categoryIds.length > 0) {
            dispatch(loadHistory({ countryId, dateFrom, dateTo }))
        }
    }, [dispatch, countryId, dateFrom, dateTo, categoryIds])

    if (!countryId || categoryIds.length === 0) {
        return <div>Выберите хотя бы одну категорию</div>
    }

    if (status === 'loading') return <div>Загрузка графика…</div>
    if (status === 'failed')  return <div>Ошибка: {error}</div>
    if (!raw || Object.keys(raw).length === 0)
        return <div>Нет данных за выбранный период</div>

    // --- Фильтрация raw только по выбранным категориям ---
    const filteredRaw = Object.fromEntries(
        Object.entries(raw).filter(([categoryId]) => categoryIds.includes(Number(categoryId)))
    )

    if (!filteredRaw || Object.keys(filteredRaw).length === 0)
        return <div>Нет данных для выбранных категорий</div>

    // Собираем все уникальные даты для оси X
    const labels = Array.from(
        new Set(
            Object.values(filteredRaw)
                .flatMap(bySub => Object.values(bySub))
                .flatMap(series => Object.keys(series))
        )
    ).sort()

    // Для быстрого поиска имени категории
    const categoryNameMap: Record<string, string> = Object.fromEntries(
        categories.map(category => [String(category.id), category.name])
    )

    // Собираем массив уникальных пар (категория, сабкатегория)
    const allCategorySubPairs: Array<{ categoryId: string, subCategoryId: string }> = []
    for (const categoryId in filteredRaw) {
        const bySubCategory = filteredRaw[categoryId]
        for (const subCategoryId in bySubCategory) {
            allCategorySubPairs.push({ categoryId, subCategoryId })
        }
    }

    // Формируем datasets для каждой пары (категория, сабкатегория)
    const datasets = allCategorySubPairs.map(({ categoryId, subCategoryId }) => {
        const series = filteredRaw[categoryId][subCategoryId] || {}

        return {
            label:
                (categoryNameMap[categoryId] || `#${categoryId}`) +
                ' / ' +
                (SUBCATEGORY_NAMES[subCategoryId] || `#${subCategoryId}`),
            data: labels.map(date => series[date] ?? 0),
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            fill: false,
            spanGaps: true,
        }
    })

    if (labels.length === 0 || datasets.length === 0)
        return <div>Нет точек для построения графика</div>

    return (
        <div style={{ height: 400, minWidth: 375 }}>
            <Line
                data={{ labels, datasets }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: 'Top History by Category & Subcategory' },
                        legend: { position: 'bottom' },
                        tooltip: { mode: 'index', intersect: false },
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Дата' },
                            ticks: { maxRotation: 45, minRotation: 45 },
                        },
                        y: {
                            title: { display: true, text: 'Значение' },
                            beginAtZero: true,
                        },
                    },
                }}
            />
        </div>
    )
}

export default MyChart
