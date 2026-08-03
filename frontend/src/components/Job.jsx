import React from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck, MapPin, GitCompare } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { jobTypeAccent, daysAgo, isRecent, avatarColor } from '@/lib/jobType'
import useSaveJob from '@/hooks/useSaveJob'
import { toggleCompare, MAX_COMPARE_ITEMS } from '@/redux/compareSlice'
import { toast } from 'sonner'

const Job = ({ job }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isSaved, toggleSave, pending } = useSaveJob(job?._id);
    const { items: compareItems } = useSelector(store => store.compare);
    const isComparing = compareItems.some((j) => j._id === job?._id);

    const compareHandler = () => {
        if (!isComparing && compareItems.length >= MAX_COMPARE_ITEMS) {
            toast.info(`You can compare up to ${MAX_COMPARE_ITEMS} jobs at a time.`);
            return;
        }
        dispatch(toggleCompare({
            _id: job._id,
            title: job.title,
            location: job.location,
            jobType: job.jobType,
            salary: job.salary,
            position: job.position,
            experienceLevel: job.experienceLevel,
            requirements: job.requirements,
            createdAt: job.createdAt,
            company: { _id: job.company?._id, name: job.company?.name, logo: job.company?.logo },
        }));
    }

    return (
        <div className={`group flex flex-col p-5 rounded-lg border border-l-4 ${jobTypeAccent(job?.jobType)} ${isComparing ? 'border-primary ring-1 ring-primary/30' : 'border-border'} bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <p className='text-xs text-muted-foreground'>{daysAgo(job?.createdAt)}</p>
                    {
                        isRecent(job?.createdAt) && (
                            <Badge className="font-bold uppercase tracking-wide text-[10px] px-1.5 py-0 h-4 bg-accent text-accent-foreground hover:bg-accent">New</Badge>
                        )
                    }
                </div>
                <div className='flex items-center gap-1'>
                    <Button
                        variant="ghost"
                        className={`rounded-full h-8 w-8 ${isComparing ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                        size="icon"
                        aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
                        onClick={compareHandler}
                    >
                        <GitCompare className='h-4 w-4' />
                    </Button>
                    <Button
                        variant="ghost"
                        className={`rounded-full h-8 w-8 ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                        size="icon"
                        aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
                        onClick={toggleSave}
                        disabled={pending}
                    >
                        {isSaved ? <BookmarkCheck className='h-4 w-4' /> : <Bookmark className='h-4 w-4' />}
                    </Button>
                </div>
            </div>

            <div className='flex items-center gap-3 my-3'>
                <Avatar className="h-11 w-11 rounded-md border border-border">
                    <AvatarImage src={job?.company?.logo} />
                    <AvatarFallback className={`rounded-md font-heading font-bold ${avatarColor(job?.company?.name)}`}>
                        {job?.company?.name?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className='font-semibold leading-tight'>
                        <Link
                            to={`/companies/${job?.company?._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className='hover:text-primary hover:underline transition-colors'
                        >
                            {job?.company?.name}
                        </Link>
                    </h2>
                    <p className='text-xs text-muted-foreground flex items-center gap-1 mt-0.5'>
                        <MapPin className='h-3 w-3' /> {job?.location || "India"}
                    </p>
                </div>
            </div>

            <div className='flex-1'>
                <h1 className='font-heading font-bold text-lg leading-snug group-hover:text-primary transition-colors'>{job?.title}</h1>
                <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>{job?.description}</p>
            </div>

            <div className='flex items-center flex-wrap gap-1.5 mt-4'>
                <Badge variant="secondary" className="font-medium">{job?.position} positions</Badge>
                <Badge variant="secondary" className="font-medium">{job?.jobType}</Badge>
                <Badge variant="secondary" className="font-medium">₹{job?.salary} LPA</Badge>
            </div>

            <div className='flex items-center gap-3 mt-4 pt-4 border-t border-border'>
                <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline" className="flex-1">Details</Button>
                <Button
                    onClick={toggleSave}
                    disabled={pending}
                    className={`flex-1 ${isSaved ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}
                >
                    {isSaved ? 'Saved' : 'Save for later'}
                </Button>
            </div>
        </div>
    )
}

export default Job
