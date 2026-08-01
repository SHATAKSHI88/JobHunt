import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import PageTransition from './shared/PageTransition'
import Job from './Job'
import { Skeleton } from './ui/skeleton'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { Bookmark } from 'lucide-react'

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                const res = await axios.get(`${USER_API_END_POINT}/saved-jobs`, { withCredentials: true });
                if (res.data.success) {
                    setSavedJobs(res.data.savedJobs);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetchSavedJobs();
    }, []);

    return (
        <div>
            <Navbar />
            <PageTransition>
            <div className='max-w-7xl mx-auto px-4 my-10'>
                <div className='mb-8'>
                    <h1 className='font-heading font-extrabold text-2xl'>Saved jobs</h1>
                    <p className='text-muted-foreground text-sm mt-1'>Roles you've bookmarked to come back to.</p>
                </div>

                {
                    loading ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className='p-5 rounded-lg border border-border bg-card space-y-3'>
                                    <Skeleton className='h-4 w-20' />
                                    <Skeleton className='h-10 w-10 rounded-md' />
                                    <Skeleton className='h-5 w-3/4' />
                                    <Skeleton className='h-4 w-full' />
                                </div>
                            ))}
                        </div>
                    ) : savedJobs.length <= 0 ? (
                        <div className='flex flex-col items-center justify-center text-center py-24 border border-dashed border-border rounded-lg'>
                            <Bookmark className='h-10 w-10 text-muted-foreground mb-3' />
                            <p className='font-semibold'>No saved jobs yet</p>
                            <p className='text-sm text-muted-foreground mt-1'>Tap the bookmark icon on any job to save it here.</p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                            {savedJobs.map((job) => <Job key={job._id} job={job} />)}
                        </div>
                    )
                }
            </div>
        </PageTransition>
        </div>
    )
}

export default SavedJobs
