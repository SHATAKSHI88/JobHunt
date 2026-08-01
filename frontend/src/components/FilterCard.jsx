import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import { SlidersHorizontal, X } from 'lucide-react'

const filterData = [
    {
        filterType: "Location",
        array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"]
    },
    {
        filterType: "Industry",
        array: ["Frontend Developer", "Backend Developer", "FullStack Developer"]
    },
    {
        filterType: "Salary",
        array: ["0-40k", "42-1lakh", "1lakh to 5lakh"]
    },
]

const FilterCard = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const dispatch = useDispatch();
    const changeHandler = (value) => {
        setSelectedValue(value);
    }
    const clearFilters = () => setSelectedValue('');

    useEffect(() => {
        dispatch(setSearchedQuery(selectedValue));
    }, [selectedValue]);

    return (
        <div className='w-full bg-card border border-border rounded-lg p-4 sticky top-20'>
            <div className='flex items-center justify-between'>
                <h2 className='font-heading font-bold flex items-center gap-2'>
                    <SlidersHorizontal className='h-4 w-4 text-primary' />
                    Filters
                </h2>
                {selectedValue && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs text-muted-foreground">
                        <X className='h-3 w-3 mr-1' /> Clear
                    </Button>
                )}
            </div>

            <RadioGroup value={selectedValue} onValueChange={changeHandler} className="mt-2">
                {
                    filterData.map((data, index) => (
                        <div key={data.filterType} className={index > 0 ? "mt-5 pt-5 border-t border-border" : "mt-4"}>
                            <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2'>{data.filterType}</h3>
                            <div className="flex flex-col gap-2.5">
                                {
                                    data.array.map((item, idx) => {
                                        const itemId = `id${index}-${idx}`
                                        return (
                                            <div className='flex items-center space-x-2' key={itemId}>
                                                <RadioGroupItem value={item} id={itemId} />
                                                <Label htmlFor={itemId} className="text-sm font-normal cursor-pointer">{item}</Label>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    ))
                }
            </RadioGroup>
        </div>
    )
}

export default FilterCard
