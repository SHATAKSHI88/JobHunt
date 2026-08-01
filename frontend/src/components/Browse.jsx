import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { Skeleton } from './ui/skeleton';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { SearchX } from 'lucide-react';

const Browse = () => {
    useGetAllJobs();
    const { allJobs, searchedQuery, isLoading } = useSelector(store => store.job);
    const dispatch = useDispatch();
    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        }
    }, [])
    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 my-10'>
                <div className='mb-8'>
                    <h1 className='font-heading font-extrabold text-2xl'>
                        {searchedQuery ? `Results for "${searchedQuery}"` : "Search results"}
                    </h1>
                    <p className='text-muted-foreground text-sm mt-1'>{isLoading ? "Searching…" : `${allJobs.length} job${allJobs.length === 1 ? "" : "s"} found`}</p>
                </div>

                {
                    isLoading ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className='p-5 rounded-lg border border-border bg-card space-y-3'>
                                    <Skeleton className='h-4 w-20' />
                                    <Skeleton className='h-10 w-10 rounded-md' />
                                    <Skeleton className='h-5 w-3/4' />
                                    <Skeleton className='h-4 w-full' />
                                </div>
                            ))}
                        </div>
                    ) : allJobs.length <= 0 ? (
                        <div className='flex flex-col items-center justify-center text-center py-24 border border-dashed border-border rounded-lg'>
                            <SearchX className='h-10 w-10 text-muted-foreground mb-3' />
                            <p className='font-semibold'>Nothing matches that search</p>
                            <p className='text-sm text-muted-foreground mt-1'>Try a broader keyword.</p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                            {allJobs.map((job) => <Job key={job._id} job={job} />)}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Browse
