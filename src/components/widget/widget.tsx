import React, { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { loadCategories } from "../../redux/slices/categoriesSlice";
import { GeoItem, loadGeo } from "../../redux/slices/geoSlice";
import './widget.css'
import MyChart from "../myChart/myChart";

const CategoriesCheckboxList = React.memo(function CategoriesCheckboxList({
                                                                              categories,
                                                                              selectedCategoryIds,
                                                                              onChange,
                                                                          }: {
    categories: { id: number; name: string }[]
    selectedCategoryIds: number[]
    onChange: (newIds: number[]) => void
}) {
    const allChecked = categories.length > 0 && selectedCategoryIds.length === categories.length;
    const indeterminate = selectedCategoryIds.length > 0 && !allChecked;

    const handleToggleAll = useCallback(() => {
        if (allChecked) {
            onChange([]);
        } else {
            onChange(categories.map(c => c.id));
        }
    }, [allChecked, categories, onChange]);

    const handleToggle = useCallback((id: number) => {
        if (selectedCategoryIds.includes(id)) {
            onChange(selectedCategoryIds.filter(_id => _id !== id));
        } else {
            onChange([...selectedCategoryIds, id]);
        }
    }, [selectedCategoryIds, onChange]);

    return (
        <div className="categories-block">
            <div className="categories-title">Categories:</div>
            <div className="categories-list">
                <label className="category-checkbox">
                    <input
                        type="checkbox"
                        checked={allChecked}
                        ref={el => {
                            if (el) el.indeterminate = indeterminate;
                        }}
                        onChange={handleToggleAll}
                    />
                    <span>Выбрать все</span>
                </label>
                {categories.map(category => (
                    <label key={category.id} className="category-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(category.id)}
                            onChange={() => handleToggle(category.id)}
                        />
                        {category.name}
                    </label>
                ))}
            </div>
        </div>
    );
});

export default function Widget() {
    const dispatch = useAppDispatch();
    const { items: categories, status: catsStatus } = useAppSelector(s => s.categories)
    const { items: countries, status: geoStatus } = useAppSelector(s => s.geo);

    const today = new Date();
    const last30 = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30);
    const isoToday = today.toISOString().slice(0, 10);
    const isoLast30 = last30.toISOString().slice(0, 10);

    const [countryId, setCountryId] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>(isoLast30);
    const [dateTo, setDateTo] = useState<string>(isoToday);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [wasInitialized, setWasInitialized] = useState(false);

    useEffect(() => {
        dispatch(loadGeo());
        dispatch(loadCategories());
    }, [dispatch]);

    useEffect(() => {
        if (
            catsStatus === 'idle' &&
            categories.length > 0 &&
            selectedCategoryIds.length === 0 &&
            !wasInitialized
        ) {
            setSelectedCategoryIds(categories.map(c => c.id));
            setWasInitialized(true);
        }
    }, [catsStatus, categories, selectedCategoryIds.length, wasInitialized]);

    useEffect(() => {
        if (geoStatus === 'idle' && countries.length > 0 && !countryId) {
            setCountryId(String(countries[0].id));
        }
    }, [geoStatus, countries, countryId]);

    const handleCategoryChange = useCallback((newIds: number[]) => {
        setSelectedCategoryIds(newIds);
    }, []);

    return (
        <div className="widget-container">
            <div className="widget-header">Top History</div>
            <div className="select-row">
                {geoStatus === 'loading' ? (
                    <div>Loading countries…</div>
                ) : (
                    <select
                        className="date-input"
                        value={countryId}
                        onChange={e => setCountryId(e.target.value)}
                    >
                        {countries.map((c: GeoItem) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                )}
                <label>
                    From:{' '}
                    <input
                        type="date"
                        className="date-input"
                        value={dateFrom}
                        max={isoToday}
                        onChange={e => setDateFrom(e.target.value)}
                    />
                </label>
                <label>
                    To:{' '}
                    <input
                        type="date"
                        className="date-input"
                        value={dateTo}
                        max={isoToday}
                        onChange={e => setDateTo(e.target.value)}
                    />
                </label>
            </div>
            <CategoriesCheckboxList
                categories={categories}
                selectedCategoryIds={selectedCategoryIds}
                onChange={handleCategoryChange}
            />
            {countryId && (
                <MyChart
                    countryId={countryId}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    categoryIds={selectedCategoryIds}
                />
            )}
        </div>
    );
}
