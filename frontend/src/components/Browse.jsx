import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import PageTransition from './shared/PageTransition'
import Job from './Job';
import Pagination from './shared/Pagination';
import { Skeleton } from './ui/skeleton';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { SearchX } from 'lucide-react';
import EmptyState from './shared/EmptyState';
import CreateAlertDialog from './CreateAlertDialog';
import { Button } from './ui/button';
import { BellPlus } from 'lucide-react';

const Browse = () => {
    const [page, setPage] = useState(1);
    const [alertOpen, setAlertOpen] = useState(false);
    const { allJobs, searchedQuery, isLoading, pagination } = useSelector(store => store.job);
    const dispatch = useDispatch();

    useGetAllJobs(page);

    useEffect(() => {
        setPage(1);
    }, [searchedQuery]);

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        }
    }, [])

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <div>
            <Navbar />
            <PageTransition>
            <div className='max-w-7xl mx-auto px-4 my-10'>
                <div className='flex items-start justify-between gap-3 mb-8'>
                    <div>
                        <h1 className='font-heading font-extrabold text-2xl'>
                            {searchedQuery ? `Results for "${searchedQuery}"` : "Search results"}
                        </h1>
                        <p className='text-muted-foreground text-sm mt-1'>{isLoading ? "Searching…" : `${pagination.totalJobs} job${pagination.totalJobs === 1 ? "" : "s"} found`}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)} className="shrink-0">
                        <BellPlus className='h-3.5 w-3.5 mr-1.5' /> Create alert
                    </Button>
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
                        <div className='border border-dashed border-border rounded-lg'>
                            <EmptyState
                                variant="search"
                                title="Nothing matches that search"
                                description="Try a broader keyword."
                            />
                        </div>
                    ) : (
                        <>
                            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                                {allJobs.map((job) => <Job key={job._id} job={job} />)}
                            </div>
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )
                }
            </div>
        </PageTransition>
        <CreateAlertDialog
            open={alertOpen}
            setOpen={setAlertOpen}
            criteria={{ keyword: searchedQuery, location: "", jobType: "" }}
        />
        </div>
    )
}

export default Browse
