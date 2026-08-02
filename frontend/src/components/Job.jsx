import React from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck, MapPin } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { jobTypeAccent, daysAgo, isRecent } from '@/lib/jobType'
import useSaveJob from '@/hooks/useSaveJob'

const Job = ({ job }) => {
    const navigate = useNavigate();
    const { isSaved, toggleSave, pending } = useSaveJob(job?._id);

    return (
        <div className={`group flex flex-col p-5 rounded-lg border border-l-4 ${jobTypeAccent(job?.jobType)} border-border bg-card shadow-sm hover:shadow-md transition-shadow`}>
            <div className='flex items-center justify-between'>
                <p className='text-xs text-muted-foreground'>{daysAgo(job?.createdAt)}</p>
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

            <div className='flex items-center gap-3 my-3'>
                <Avatar className="h-11 w-11 rounded-md border border-border">
                    <AvatarImage src={job?.company?.logo} />
                    <AvatarFallback className="rounded-md">{job?.company?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className='font-semibold leading-tight'>{job?.company?.name}</h2>
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
                {
                    isRecent(job?.createdAt) && (
                        <Badge className="font-bold uppercase tracking-wide text-[10px] bg-accent text-accent-foreground hover:bg-accent">New</Badge>
                    )
                }
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
