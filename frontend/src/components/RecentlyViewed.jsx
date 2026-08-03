import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecentlyViewed } from '@/lib/recentlyViewed'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { avatarColor, jobTypeAccent } from '@/lib/jobType'
import { History } from 'lucide-react'

const RecentlyViewed = () => {
    const [jobs, setJobs] = useState([]);
    const navigate = useNavigate();

    // re-read on mount so it reflects whatever's been viewed this session,
    // including jobs viewed after this component last rendered
    useEffect(() => {
        setJobs(getRecentlyViewed());
    }, []);

    if (jobs.length === 0) return null;

    return (
        <section className='max-w-7xl mx-auto px-4 mt-10'>
            <h2 className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4'>
                <History className='h-4 w-4' /> Recently viewed
            </h2>
            <div className='flex gap-3 overflow-x-auto scroll-thin pb-2'>
                {jobs.map((job) => (
                    <button
                        key={job._id}
                        onClick={() => navigate(`/description/${job._id}`)}
                        className={`group flex items-center gap-3 shrink-0 w-64 p-3 rounded-lg border border-l-4 ${jobTypeAccent(job?.jobType)} border-border bg-card hover:shadow-md transition-shadow text-left`}
                    >
                        <Avatar className="h-9 w-9 rounded-md border border-border shrink-0">
                            <AvatarImage src={job?.company?.logo} />
                            <AvatarFallback className={`rounded-md text-xs font-heading font-bold ${avatarColor(job?.company?.name)}`}>
                                {job?.company?.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0'>
                            <p className='text-sm font-semibold truncate group-hover:text-primary transition-colors'>{job.title}</p>
                            <p className='text-xs text-muted-foreground truncate'>{job.company?.name}</p>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    )
}

export default RecentlyViewed
