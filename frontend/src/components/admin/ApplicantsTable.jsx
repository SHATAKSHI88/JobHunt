import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);

    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't update status.");
        }
    }

    if (!applicants?.applications?.length) {
        return (
            <div className='flex flex-col items-center justify-center text-center py-16'>
                <Users className='h-8 w-8 text-muted-foreground mb-2' />
                <p className='text-sm text-muted-foreground'>No one has applied yet.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableCaption>A list of everyone who's applied</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Full name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    applicants.applications.map((item) => (
                        <TableRow key={item._id}>
                            <TableCell className="font-medium">{item?.applicant?.fullname}</TableCell>
                            <TableCell className="text-muted-foreground">{item?.applicant?.email}</TableCell>
                            <TableCell className="text-muted-foreground">{item?.applicant?.phoneNumber}</TableCell>
                            <TableCell>
                                {
                                    item.applicant?.profile?.resume ? (
                                        <a className="text-primary hover:underline" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">
                                            {item?.applicant?.profile?.resumeOriginalName || "View resume"}
                                        </a>
                                    ) : <span className='text-muted-foreground'>—</span>
                                }
                            </TableCell>
                            <TableCell className="text-muted-foreground">{item?.applicant?.createdAt?.split("T")[0]}</TableCell>
                            <TableCell className="text-right">
                                <Popover>
                                    <PopoverTrigger className="p-1.5 rounded-md hover:bg-muted transition-colors">
                                        <MoreHorizontal className='h-4 w-4' />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-36 p-1">
                                        {
                                            shortlistingStatus.map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => statusHandler(status, item?._id)}
                                                    className='flex w-full text-left items-center px-2 py-2 rounded-md text-sm hover:bg-muted transition-colors'
                                                >
                                                    {status}
                                                </button>
                                            ))
                                        }
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

export default ApplicantsTable
