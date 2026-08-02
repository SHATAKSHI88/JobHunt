import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FileX2, Video } from 'lucide-react'
import useGetMyInterviews from '@/hooks/useGetMyInterviews'

const statusStyles = {
    accepted: "bg-accent/15 text-accent border-accent/30",
    rejected: "bg-destructive/15 text-destructive border-destructive/30",
    pending: "bg-muted text-muted-foreground border-border",
}

const statusDot = {
    accepted: "bg-accent",
    rejected: "bg-destructive",
    pending: "bg-muted-foreground",
}

const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const AppliedJobTable = () => {
    const navigate = useNavigate();
    const { allAppliedJobs } = useSelector(store => store.job);
    const { myInterviews } = useSelector(store => store.interview);
    useGetMyInterviews();

    if (allAppliedJobs.length <= 0) {
        return (
            <div className='flex flex-col items-center justify-center text-center py-12 border border-dashed border-border rounded-lg'>
                <FileX2 className='h-8 w-8 text-muted-foreground mb-2' />
                <p className='text-sm text-muted-foreground'>You haven't applied to any jobs yet.</p>
            </div>
        )
    }

    return (
        <div className='overflow-x-auto'>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Interview</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.map((appliedJob) => {
                            const interview = myInterviews.find(iv => iv.application === appliedJob._id);
                            // Allow joining from 10 minutes before the scheduled time onward.
                            const joinableFrom = interview ? new Date(new Date(interview.scheduledAt).getTime() - 10 * 60 * 1000) : null;
                            const canJoin = interview?.status === 'scheduled' && joinableFrom && new Date() >= joinableFrom;

                            return (
                                <TableRow key={appliedJob._id} className="hover:bg-muted/40 transition-colors">
                                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(appliedJob?.createdAt)}</TableCell>
                                    <TableCell className="font-medium">{appliedJob.job?.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{appliedJob.job?.company?.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusStyles[appliedJob.status] || statusStyles.pending}>
                                            <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusDot[appliedJob.status] || statusDot.pending}`} />
                                            {appliedJob.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!interview || interview.status === 'cancelled' ? (
                                            <span className="text-muted-foreground text-sm">—</span>
                                        ) : canJoin ? (
                                            <Button size="sm" className="gap-1.5" onClick={() => navigate(`/interview/${interview._id}`)}>
                                                <Video className="h-3.5 w-3.5" /> Join
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(interview.scheduledAt).toLocaleString()}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable
