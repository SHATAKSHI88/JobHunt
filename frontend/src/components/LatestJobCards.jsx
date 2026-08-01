import React from 'react'
import { Badge } from './ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { useNavigate } from 'react-router-dom'
import { jobTypeAccent } from '@/lib/jobType'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/description/${job._id}`)}
            className={`group flex flex-col p-5 rounded-lg border border-l-4 ${jobTypeAccent(job?.jobType)} border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        >
            <div className='flex items-center gap-3'>
                <Avatar className="h-10 w-10 rounded-md border border-border">
                    <AvatarImage src={job?.company?.logo} />
                    <AvatarFallback className="rounded-md">{job?.company?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className='font-semibold text-sm leading-tight'>{job?.company?.name}</h2>
                    <p className='text-xs text-muted-foreground'>{job?.location || "India"}</p>
                </div>
            </div>
            <div className='mt-3'>
                <h1 className='font-heading font-bold text-lg leading-snug group-hover:text-primary transition-colors'>{job?.title}</h1>
                <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>{job?.description}</p>
            </div>
            <div className='flex items-center flex-wrap gap-1.5 mt-4'>
                <Badge variant="secondary" className="font-medium">{job?.position} positions</Badge>
                <Badge variant="secondary" className="font-medium">{job?.jobType}</Badge>
                <Badge variant="secondary" className="font-medium">₹{job?.salary} LPA</Badge>
            </div>
        </div>
    )
}

export default LatestJobCards
