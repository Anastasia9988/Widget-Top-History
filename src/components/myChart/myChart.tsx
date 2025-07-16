import React, { useEffect, useRef, useMemo } from 'react'
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
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { loadHistory } from "../../redux/slices/historySlice";
import SUBCATEGORY_NAMES from "../../utils/subNames";
import { getColorByIndex } from '../../utils/colors';
import ChartExportButtons from "../exportButtons/сhartExportButtons";


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

export default function MyChart({
                            countryId,
                            dateFrom,
                            dateTo,
                            categoryIds,
                        }: MyChartProps) {
    // --- Хуки ---
    const dispatch = useAppDispatch();
    const { raw, status, error } = useAppSelector(state => state.history);
    const { items: categories } = useAppSelector(state => state.categories);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (countryId && dateFrom && dateTo && categoryIds.length > 0) {
            dispatch(loadHistory({ countryId, dateFrom, dateTo }))
        }
    }, [dispatch, countryId, dateFrom, dateTo, categoryIds]);

    // --- Мемоизированные вычисления для графика ---
    const filteredRaw = useMemo(() => {
        if (!raw) return {};
        return Object.fromEntries(
            Object.entries(raw).filter(([categoryId]) => categoryIds.includes(Number(categoryId)))
        );
    }, [raw, categoryIds]);

    const labels = useMemo(() => {
        return Array.from(
            new Set(
                Object.values(filteredRaw)
                    .flatMap(bySub => Object.values(bySub))
                    .flatMap(series => Object.keys(series))
            )
        ).sort();
    }, [filteredRaw]);

    const categoryNameMap = useMemo(() => (
        Object.fromEntries(categories.map(category => [String(category.id), category.name]))
    ), [categories]);

    const allCategorySubPairs = useMemo(() => {
        const pairs: Array<{ categoryId: string, subCategoryId: string }> = [];
        for (const categoryId in filteredRaw) {
            const bySubCategory = filteredRaw[categoryId];
            for (const subCategoryId in bySubCategory) {
                pairs.push({ categoryId, subCategoryId });
            }
        }
        return pairs;
    }, [filteredRaw]);

    const datasets = useMemo(() => allCategorySubPairs.map(({ categoryId, subCategoryId }, index) => {
        const series = filteredRaw[categoryId][subCategoryId] || {};

        const color = getColorByIndex(index);

        return {
            label:
                (categoryNameMap[categoryId] || `#${categoryId}`) +
                ' / ' +
                (SUBCATEGORY_NAMES[subCategoryId] || `#${subCategoryId}`),
            data: labels.map(date => series[date] ?? 0),
            borderWidth: 1.5,
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: false,
            spanGaps: true,
            borderColor: color,
            backgroundColor: color,
            pointBackgroundColor: color,
            pointBorderColor: color,
        };
    }), [allCategorySubPairs, filteredRaw, labels, categoryNameMap]);

    if (!countryId || categoryIds.length === 0) {
        return <div>Выберите хотя бы одну категорию</div>
    }
    if (status === 'loading') return <div>Загрузка графика…</div>
    if (status === 'failed')  return <div>Ошибка: {error}</div>
    if (!raw || Object.keys(raw).length === 0)
        return <div>Нет данных за выбранный период</div>
    if (!filteredRaw || Object.keys(filteredRaw).length === 0)
        return <div>Нет данных для выбранных категорий</div>
    if (labels.length === 0 || datasets.length === 0)
        return <div>Нет точек для построения графика</div>

    return (
        <div>
            <ChartExportButtons
                chartRef={chartRef}
                labels={labels}
                datasets={datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data,
                }))}
            />
            <div style={{ height: 400 }}>
                <Line
                    ref={chartRef}
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
        </div>
    );
}

