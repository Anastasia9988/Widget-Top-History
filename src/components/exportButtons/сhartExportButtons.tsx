import React, { useCallback } from 'react';
import './chartExportButtons.css'

interface ChartExportButtonsProps {
    chartRef: React.RefObject<any>;
    labels: string[];
    datasets: Array<{ label: string; data: number[] }>;
}

const ChartExportButtons: React.FC<ChartExportButtonsProps> = ({ chartRef, labels, datasets }) => {

    const handleExportPNG = useCallback(() => {
        if (chartRef.current) {
            const chartInstance = chartRef.current.chart || chartRef.current;
            if (chartInstance && chartInstance.toBase64Image) {
                const url = chartInstance.toBase64Image();
                const link = document.createElement('a');
                link.href = url;
                link.download = 'chart.png';
                link.click();
            }
        }
    }, [chartRef]);

    const handleExportCSV = useCallback(() => {
        if (!labels.length || !datasets.length) return;
        let csv = 'Date;' + datasets.map(ds => `"${ds.label}"`).join(';') + '\n';
        labels.forEach((date, rowIdx) => {
            csv += date;
            datasets.forEach(ds => {
                csv += ';' + (ds.data[rowIdx] ?? '');
            });
            csv += '\n';
        });

        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'chart_data.csv';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, [labels, datasets]);

    return (
        <div className="chart-export-buttons">
            <button
                className="chart-export-btn"
                onClick={handleExportPNG}
            >
                Экспорт в PNG
            </button>
            <button
                className="chart-export-btn"
                onClick={handleExportCSV}
            >
                Экспорт в CSV
            </button>
        </div>
    );
};

export default ChartExportButtons;
