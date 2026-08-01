import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import PageTransition from './shared/PageTransition'
import FilterCard from './FilterCard'
import Job from './Job';
import Pagination from './shared/Pagination';
import { Skeleton } from './ui/skeleton';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import useGetAllJobs from '@/hooks/useGetAllJobs';

const Jobs = () => {
    const [page, setPage] = useState(1);
    const { allJobs, isLoading, pagination, searchedQuery, filters } = useSelector(store => store.job);

    useGetAllJobs(page);

    // whenever the search term or filters change, jump back to page 1
    useEffect(() => {
        setPage(1);
    }, [searchedQuery, filters.location, filters.jobType, filters.minSalary, filters.maxSalary]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <div>
            <Navbar />
            <PageTransition>
            <div className='max-w-7xl mx-auto px-4 mt-6'>
                <div className='flex gap-6'>
                    <aside className='w-72 shrink-0 hidden md:block'>
                        <FilterCard />
                    </aside>

                    <div className='flex-1 min-w-0'>
                        <p className='text-sm text-muted-foreground mb-4'>
                            {isLoading ? "Searching…" : `${pagination.totalJobs} job${pagination.totalJobs === 1 ? "" : "s"} found`}
                        </p>

                        {
                            isLoading ? (
                                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-10'>
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
                                    <p className='font-semibold'>No jobs match your search</p>
                                    <p className='text-sm text-muted-foreground mt-1'>Try a different keyword or clear your filters.</p>
                                </div>
                            ) : (
                                <div className='pb-5'>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                                        {
                                            allJobs.map((job) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -12 }}
                                                    transition={{ duration: 0.25 }}
                                                    key={job?._id}>
                                                    <Job job={job} />
                                                </motion.div>
                                            ))
                                        }
                                    </div>
                                    <Pagination
                                        currentPage={pagination.currentPage}
                                        totalPages={pagination.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </PageTransition>
        </div>
    )
}

export default Jobs
