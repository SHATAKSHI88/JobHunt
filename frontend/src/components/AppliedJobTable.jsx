import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'
import { FileX2 } from 'lucide-react'

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
    const { allAppliedJobs } = useSelector(store => store.job);

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
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id} className="hover:bg-muted/40 transition-colors">
                                <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(appliedJob?.createdAt)}</TableCell>
                                <TableCell className="font-medium">{appliedJob.job?.title}</TableCell>
                                <TableCell className="text-muted-foreground">{appliedJob.job?.company?.name}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className={statusStyles[appliedJob.status] || statusStyles.pending}>
                                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusDot[appliedJob.status] || statusDot.pending}`} />
                                        {appliedJob.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable
