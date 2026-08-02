import React, { useEffect, useMemo, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { setFilters, resetFilters } from '@/redux/jobSlice'
import useGetFilterOptions from '@/hooks/useGetFilterOptions'
import { SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react'

const ALL = "__all__";
const VISIBLE_COUNT = 6;

const FilterCard = () => {
    useGetFilterOptions();
    const dispatch = useDispatch();
    const { filterOptions, filters } = useSelector(store => store.job);
    const { locations, jobTypes, salaryRange } = filterOptions;

    const [minSalary, setMinSalary] = useState(filters.minSalary);
    const [maxSalary, setMaxSalary] = useState(filters.maxSalary);
    const [locationSearch, setLocationSearch] = useState("");
    const [showAllLocations, setShowAllLocations] = useState(false);

    // keep local salary inputs in sync if filters get cleared elsewhere
    useEffect(() => {
        setMinSalary(filters.minSalary);
        setMaxSalary(filters.maxSalary);
    }, [filters.minSalary, filters.maxSalary]);

    const applySalary = () => {
        dispatch(setFilters({ minSalary, maxSalary }));
    }

    const hasActiveFilters = filters.location || filters.jobType || filters.minSalary || filters.maxSalary;

    const clearAll = () => {
        setMinSalary("");
        setMaxSalary("");
        setLocationSearch("");
        dispatch(resetFilters());
    }

    // filter by search text, then cap how many render unless "show all" is on —
    // avoids a long, messy, unbounded list dominating the sidebar
    const filteredLocations = useMemo(
        () => locations.filter((loc) => loc.toLowerCase().includes(locationSearch.toLowerCase())),
        [locations, locationSearch]
    );
    const visibleLocations = showAllLocations ? filteredLocations : filteredLocations.slice(0, VISIBLE_COUNT);
    const hiddenCount = filteredLocations.length - visibleLocations.length;

    return (
        <div className='w-full bg-card border border-border rounded-lg p-4 sticky top-20'>
            <div className='flex items-center justify-between'>
                <h2 className='font-heading font-bold flex items-center gap-2'>
                    <SlidersHorizontal className='h-4 w-4 text-primary' />
                    Filters
                </h2>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 px-2 text-xs text-muted-foreground">
                        <X className='h-3 w-3 mr-1' /> Clear
                    </Button>
                )}
            </div>

            {/* Location */}
            <div className='mt-4'>
                <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2'>Location</h3>
                {
                    locations.length === 0 ? (
                        <p className='text-xs text-muted-foreground'>No locations yet.</p>
                    ) : (
                        <>
                            {
                                locations.length > VISIBLE_COUNT && (
                                    <div className='relative mb-2.5'>
                                        <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
                                        <Input
                                            value={locationSearch}
                                            onChange={(e) => setLocationSearch(e.target.value)}
                                            placeholder="Search locations"
                                            className="h-8 pl-8 text-sm"
                                        />
                                    </div>
                                )
                            }
                            <RadioGroup
                                value={filters.location || ALL}
                                onValueChange={(value) => dispatch(setFilters({ location: value === ALL ? "" : value }))}
                                className="flex flex-col gap-2.5 max-h-64 overflow-y-auto scroll-thin pr-1"
                            >
                                {
                                    !locationSearch && (
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value={ALL} id="loc-all" />
                                            <Label htmlFor="loc-all" className="text-sm font-normal cursor-pointer">All locations</Label>
                                        </div>
                                    )
                                }
                                {
                                    visibleLocations.length === 0 ? (
                                        <p className='text-xs text-muted-foreground py-1'>No matches.</p>
                                    ) : visibleLocations.map((loc) => (
                                        <div className='flex items-center space-x-2' key={loc}>
                                            <RadioGroupItem value={loc} id={`loc-${loc}`} />
                                            <Label htmlFor={`loc-${loc}`} className="text-sm font-normal cursor-pointer truncate">{loc}</Label>
                                        </div>
                                    ))
                                }
                            </RadioGroup>
                            {
                                hiddenCount > 0 && (
                                    <button
                                        onClick={() => setShowAllLocations(true)}
                                        className='flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline'
                                    >
                                        <ChevronDown className='h-3 w-3' /> Show {hiddenCount} more
                                    </button>
                                )
                            }
                            {
                                showAllLocations && filteredLocations.length > VISIBLE_COUNT && (
                                    <button
                                        onClick={() => setShowAllLocations(false)}
                                        className='text-xs text-muted-foreground mt-2 hover:underline'
                                    >
                                        Show less
                                    </button>
                                )
                            }
                        </>
                    )
                }
            </div>

            {/* Job type */}
            <div className='mt-5 pt-5 border-t border-border'>
                <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2'>Job type</h3>
                {
                    jobTypes.length === 0 ? (
                        <p className='text-xs text-muted-foreground'>No job types yet.</p>
                    ) : (
                        <RadioGroup
                            value={filters.jobType || ALL}
                            onValueChange={(value) => dispatch(setFilters({ jobType: value === ALL ? "" : value }))}
                            className="flex flex-col gap-2.5"
                        >
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value={ALL} id="type-all" />
                                <Label htmlFor="type-all" className="text-sm font-normal cursor-pointer">All types</Label>
                            </div>
                            {jobTypes.map((type) => (
                                <div className='flex items-center space-x-2' key={type}>
                                    <RadioGroupItem value={type} id={`type-${type}`} />
                                    <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">{type}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )
                }
            </div>

            {/* Salary */}
            <div className='mt-5 pt-5 border-t border-border'>
                <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2'>Salary (LPA)</h3>
                {
                    salaryRange.max > 0 && (
                        <p className='text-xs text-muted-foreground mb-2'>Range in data: ₹{salaryRange.min} – ₹{salaryRange.max} LPA</p>
                    )
                }
                <div className='flex items-center gap-2'>
                    <Input
                        type="number"
                        placeholder="Min"
                        value={minSalary}
                        onChange={(e) => setMinSalary(e.target.value)}
                        onBlur={applySalary}
                        className="h-9"
                    />
                    <span className='text-muted-foreground text-sm'>–</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(e.target.value)}
                        onBlur={applySalary}
                        className="h-9"
                    />
                </div>
            </div>
        </div>
    )
}

export default FilterCard
