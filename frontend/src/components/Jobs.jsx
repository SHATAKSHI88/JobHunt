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
import EmptyState from './shared/EmptyState';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import CreateAlertDialog from './CreateAlertDialog';
import { Button } from './ui/button';
import { BellPlus } from 'lucide-react';

const Jobs = () => {
    const [page, setPage] = useState(1);
    const [alertOpen, setAlertOpen] = useState(false);
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
                        <div className='flex items-center justify-between mb-4 gap-3'>
                            <p className='text-sm text-muted-foreground'>
                                {isLoading ? "Searching…" : `${pagination.totalJobs} job${pagination.totalJobs === 1 ? "" : "s"} found`}
                            </p>
                            <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
                                <BellPlus className='h-3.5 w-3.5 mr-1.5' /> Create alert
                            </Button>
                        </div>

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
                                <div className='border border-dashed border-border rounded-lg'>
                                    <EmptyState
                                        variant="search"
                                        title="No jobs match your search"
                                        description="Try a different keyword or clear your filters."
                                    />
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
        <CreateAlertDialog
            open={alertOpen}
            setOpen={setAlertOpen}
            criteria={{ keyword: searchedQuery, location: filters.location, jobType: filters.jobType }}
        />
        </div>
    )
}

export default Jobs
