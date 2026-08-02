import React from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { jobTypeAccent, isRecent, avatarColor } from '@/lib/jobType'
import useSaveJob from '@/hooks/useSaveJob'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    const { isSaved, toggleSave, pending } = useSaveJob(job?._id);

    return (
        <div
            onClick={() => navigate(`/description/${job._id}`)}
            className={`group relative flex flex-col p-5 rounded-lg border border-l-4 ${jobTypeAccent(job?.jobType)} border-border bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
        >
            <Button
                variant="ghost"
                size="icon"
                className={`absolute top-3 right-3 h-7 w-7 rounded-full ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
                onClick={toggleSave}
                disabled={pending}
            >
                {isSaved ? <BookmarkCheck className='h-4 w-4' /> : <Bookmark className='h-4 w-4' />}
            </Button>
            <div className='flex items-center gap-3'>
                <Avatar className="h-10 w-10 rounded-md border border-border">
                    <AvatarImage src={job?.company?.logo} />
                    <AvatarFallback className={`rounded-md font-heading font-bold ${avatarColor(job?.company?.name)}`}>
                        {job?.company?.name?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className='font-semibold text-sm leading-tight'>{job?.company?.name}</h2>
                    <p className='text-xs text-muted-foreground'>{job?.location || "India"}</p>
                </div>
            </div>
            <div className='mt-3 pr-6'>
                <h1 className='font-heading font-bold text-lg leading-snug group-hover:text-primary transition-colors'>{job?.title}</h1>
                <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>{job?.description}</p>
            </div>
            <div className='flex items-center flex-wrap gap-1.5 mt-4'>
                {
                    isRecent(job?.createdAt) && (
                        <Badge className="font-bold uppercase tracking-wide text-[10px] bg-accent text-accent-foreground hover:bg-accent">New</Badge>
                    )
                }
                <Badge variant="secondary" className="font-medium">{job?.position} positions</Badge>
                <Badge variant="secondary" className="font-medium">{job?.jobType}</Badge>
                <Badge variant="secondary" className="font-medium">₹{job?.salary} LPA</Badge>
            </div>
        </div>
    )
}

export default LatestJobCards
