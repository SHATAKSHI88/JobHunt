import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { setFilters, resetFilters } from '@/redux/jobSlice'
import useGetFilterOptions from '@/hooks/useGetFilterOptions'
import { SlidersHorizontal, X } from 'lucide-react'

const ALL = "__all__";

const FilterCard = () => {
    useGetFilterOptions();
    const dispatch = useDispatch();
    const { filterOptions, filters } = useSelector(store => store.job);
    const { locations, jobTypes, salaryRange } = filterOptions;

    const [minSalary, setMinSalary] = useState(filters.minSalary);
    const [maxSalary, setMaxSalary] = useState(filters.maxSalary);

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
        dispatch(resetFilters());
    }

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
                        <RadioGroup
                            value={filters.location || ALL}
                            onValueChange={(value) => dispatch(setFilters({ location: value === ALL ? "" : value }))}
                            className="flex flex-col gap-2.5"
                        >
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value={ALL} id="loc-all" />
                                <Label htmlFor="loc-all" className="text-sm font-normal cursor-pointer">All locations</Label>
                            </div>
                            {locations.map((loc) => (
                                <div className='flex items-center space-x-2' key={loc}>
                                    <RadioGroupItem value={loc} id={`loc-${loc}`} />
                                    <Label htmlFor={`loc-${loc}`} className="text-sm font-normal cursor-pointer">{loc}</Label>
                                </div>
                            ))}
                        </RadioGroup>
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
