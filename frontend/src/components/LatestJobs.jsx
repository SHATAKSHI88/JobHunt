import React from 'react'
import LatestJobCards from './LatestJobCards';
import { Skeleton } from './ui/skeleton';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const LatestJobs = () => {
    const { allJobs, isLoading } = useSelector(store => store.job);

    return (
        <section className='max-w-7xl mx-auto px-4 my-16'>
            <div className='flex items-end justify-between mb-6'>
                <div>
                    <h2 className='font-heading text-3xl font-extrabold tracking-tight'>
                        <span className='text-primary'>Latest &amp; top</span> job openings
                    </h2>
                    <p className='text-muted-foreground text-sm mt-1'>Freshly posted roles from companies actively hiring.</p>
                </div>
                <Link to="/jobs" className='hidden sm:block'>
                    <Button variant="outline">View all jobs</Button>
                </Link>
            </div>

            {
                isLoading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className='p-5 rounded-lg border border-border bg-card space-y-3'>
                                <div className='flex items-center gap-3'>
                                    <Skeleton className='h-10 w-10 rounded-md' />
                                    <Skeleton className='h-4 w-24' />
                                </div>
                                <Skeleton className='h-5 w-3/4' />
                                <Skeleton className='h-4 w-full' />
                                <Skeleton className='h-4 w-2/3' />
                            </div>
                        ))}
                    </div>
                ) : allJobs.length <= 0 ? (
                    <div className='text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground'>
                        No jobs available right now — check back soon.
                    </div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                        {allJobs?.slice(0, 6).map((job) => <LatestJobCards key={job._id} job={job} />)}
                    </div>
                )
            }
        </section>
    )
}

export default LatestJobs
