import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Badge } from '../ui/badge'
import { Eye, MoreHorizontal, Trash2, Inbox, Pencil } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { setAllAdminJobs } from '@/redux/jobSlice'

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);

    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const filteredJobs = allAdminJobs.filter((job) => {
            if (!searchJobByText) {
                return true;
            };
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase());

        });
        setFilterJobs(filteredJobs);
    }, [allAdminJobs, searchJobByText])

    const deleteHandler = async (jobId) => {
        if (!window.confirm("Delete this job posting? This can't be undone.")) return;
        try {
            const res = await axios.delete(`${JOB_API_END_POINT}/delete/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setAllAdminJobs(allAdminJobs.filter((job) => job._id !== jobId)));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't delete this job.");
        }
    }

    if (filterJobs?.length <= 0) {
        return (
            <div className='flex flex-col items-center justify-center text-center py-16'>
                <Inbox className='h-8 w-8 text-muted-foreground mb-2' />
                <p className='text-sm text-muted-foreground'>No jobs posted yet.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableCaption>A list of your recently posted jobs</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    filterJobs?.map((job) => (
                        <TableRow key={job._id} className="cursor-pointer" onClick={() => navigate(`/admin/jobs/${job._id}`)}>
                            <TableCell className='flex items-center gap-2'>
                                <Avatar className="h-7 w-7 rounded-md">
                                    <AvatarImage src={job?.company?.logo} />
                                    <AvatarFallback className="rounded-md text-xs">{job?.company?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                {job?.company?.name}
                            </TableCell>
                            <TableCell className="font-medium">{job?.title}</TableCell>
                            <TableCell><Badge variant="secondary">{job?.applications?.length ?? 0}</Badge></TableCell>
                            <TableCell className="text-muted-foreground">{job?.createdAt?.split("T")[0]}</TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <Popover>
                                    <PopoverTrigger className="p-1.5 rounded-md hover:bg-muted transition-colors"><MoreHorizontal className='h-4 w-4' /></PopoverTrigger>
                                    <PopoverContent className="w-40 p-1">
                                        <button onClick={() => navigate(`/admin/jobs/${job._id}`)} className='flex items-center gap-2 w-full text-left px-2 py-2 rounded-md text-sm hover:bg-muted transition-colors'>
                                            <Pencil className='h-4 w-4' />
                                            View / edit
                                        </button>
                                        <button onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} className='flex items-center gap-2 w-full text-left px-2 py-2 rounded-md text-sm hover:bg-muted transition-colors'>
                                            <Eye className='h-4 w-4' />
                                            Applicants
                                        </button>
                                        <button onClick={() => deleteHandler(job._id)} className='flex items-center gap-2 w-full text-left px-2 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors'>
                                            <Trash2 className='h-4 w-4' />
                                            Delete
                                        </button>
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}

export default AdminJobsTable
