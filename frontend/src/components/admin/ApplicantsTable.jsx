import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MoreHorizontal, Users, Video, XCircle, Sparkles, CheckCheck, X as XIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT, INTERVIEW_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import ScheduleInterviewDialog from './ScheduleInterviewDialog';
import { setInterviewForApplication } from '@/redux/interviewSlice';
import { setAllApplicants } from '@/redux/applicationSlice';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { applicants } = useSelector(store => store.application);
    const interviewsByApplication = useSelector(store => store.interview.byApplication);

    // For every accepted application, look up whether an interview already
    // exists so we can show "Reschedule" instead of "Schedule interview".
    useEffect(() => {
        const acceptedApps = applicants?.applications?.filter(a => a.status === 'accepted') || [];
        acceptedApps.forEach(async (app) => {
            if (interviewsByApplication[app._id] !== undefined) return; // already fetched
            try {
                axios.defaults.withCredentials = true;
                const res = await axios.get(`${INTERVIEW_API_END_POINT}/application/${app._id}`);
                dispatch(setInterviewForApplication({ applicationId: app._id, interview: res.data.interview }));
            } catch (error) {
                // non-fatal — the "Schedule interview" button just won't know about an existing one
            }
        });
    }, [applicants]);

    const cancelInterview = async (interviewId, applicationId) => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.patch(`${INTERVIEW_API_END_POINT}/${interviewId}/cancel`);
            if (res.data.success) {
                toast.success("Interview cancelled.");
                dispatch(setInterviewForApplication({ applicationId, interview: { ...interviewsByApplication[applicationId], status: 'cancelled' } }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't cancel the interview.");
        }
    }

    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            if (res.data.success) {
                toast.success(res.data.message);
                // Update locally instead of requiring a page refresh to see the new status.
                const updatedApplications = applicants.applications.map(app =>
                    app._id === id ? { ...app, status: status.toLowerCase() } : app
                );
                dispatch(setAllApplicants({ ...applicants, applications: updatedApplications }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't update status.");
        }
    }

    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    const toggleOne = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    }
    const allIds = (applicants?.applications || []).map((a) => a._id);
    const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;
    const toggleAll = () => {
        setSelectedIds(allSelected ? [] : allIds);
    }

    const bulkStatusHandler = async (status) => {
        if (selectedIds.length === 0) return;
        setBulkLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const results = await Promise.allSettled(
                selectedIds.map((id) => axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status }))
            );
            const succeededIds = selectedIds.filter((_, i) => results[i].status === "fulfilled");
            const failCount = results.length - succeededIds.length;

            const updatedApplications = applicants.applications.map((app) =>
                succeededIds.includes(app._id) ? { ...app, status: status.toLowerCase() } : app
            );
            dispatch(setAllApplicants({ ...applicants, applications: updatedApplications }));

            if (succeededIds.length > 0) {
                toast.success(`${succeededIds.length} applicant${succeededIds.length === 1 ? "" : "s"} marked ${status.toLowerCase()}.`);
            }
            if (failCount > 0) {
                toast.error(`${failCount} update${failCount === 1 ? "" : "s"} failed.`);
            }
            setSelectedIds([]);
        } finally {
            setBulkLoading(false);
        }
    }

    const matchBadge = (score) => {
        if (score === null || score === undefined) return null;
        const style = score >= 75
            ? "bg-accent/15 text-accent border-accent/30"
            : score >= 50
                ? "bg-yellow-500/15 text-yellow-600 border-yellow-500/30"
                : "bg-destructive/15 text-destructive border-destructive/30";
        return <Badge variant="outline" className={style}>{score}% match</Badge>;
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
        <>
        {
            selectedIds.length > 0 && (
                <div className='mb-3 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5'>
                    <p className='text-sm font-medium'>{selectedIds.length} selected</p>
                    <div className='flex items-center gap-2'>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} disabled={bulkLoading}>
                            <XIcon className='h-3.5 w-3.5 mr-1' /> Clear
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => bulkStatusHandler("Rejected")} disabled={bulkLoading}>
                            Reject
                        </Button>
                        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => bulkStatusHandler("Accepted")} disabled={bulkLoading}>
                            <CheckCheck className='h-3.5 w-3.5 mr-1' /> Accept
                        </Button>
                    </div>
                </div>
            )
        }
        <Table>
            <TableCaption>A list of everyone who's applied</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-10">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                            aria-label="Select all applicants"
                        />
                    </TableHead>
                    <TableHead>Full name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Screening</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interview</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    applicants.applications.map((item) => (
                        <TableRow key={item._id} className={selectedIds.includes(item._id) ? "bg-primary/5" : ""}>
                            <TableCell>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item._id)}
                                    onChange={() => toggleOne(item._id)}
                                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                                    aria-label={`Select ${item?.applicant?.fullname}`}
                                />
                            </TableCell>
                            <TableCell className="font-medium">
                                <button className="hover:text-primary hover:underline text-left" onClick={() => navigate(`/admin/applicants/${item._id}`)}>
                                    {item?.applicant?.fullname}
                                </button>
                            </TableCell>
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
                            <TableCell>
                                {item.matchScore !== null && item.matchScore !== undefined ? (
                                    <div className="flex flex-col gap-1">
                                        {matchBadge(item.matchScore)}
                                        {item.matchSummary && (
                                            <span className="text-xs text-muted-foreground max-w-[220px] line-clamp-2" title={item.matchSummary}>
                                                {item.matchSummary}
                                            </span>
                                        )}
                                    </div>
                                ) : <span className='text-muted-foreground text-sm'>—</span>}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                    <Badge variant="outline" className="font-normal">
                                        {item.gender === 'male' ? 'M' : item.gender === 'female' ? 'F' : 'PNTS'}
                                    </Badge>
                                    {item.nationality && (
                                        <span className="text-muted-foreground">{item.nationality}</span>
                                    )}
                                    {item.hasDisability && (
                                        <Badge variant="outline" className="font-normal" title={item.disabilityDetails}>PwD</Badge>
                                    )}
                                    {item.hasRelativeAtCompany && (
                                        <Badge variant="outline" className="font-normal" title={item.relativeDetails}>Referral</Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{item?.applicant?.createdAt?.split("T")[0]}</TableCell>
                            <TableCell>
                                {item.status === 'accepted' ? (
                                    <div className="flex flex-col gap-1">
                                        <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 w-fit">Accepted</Badge>
                                        {item.matchScore !== null && item.matchScore !== undefined && item.matchScore >= 70 && (
                                            <span className="text-xs text-muted-foreground">Auto-shortlisted by AI</span>
                                        )}
                                    </div>
                                ) : item.status === 'rejected' ? (
                                    <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 w-fit">Rejected</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground w-fit">Pending</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {item.status !== 'accepted' ? (
                                    <span className="text-muted-foreground text-sm">—</span>
                                ) : (() => {
                                    const interview = interviewsByApplication[item._id];
                                    if (!interview) {
                                        return <ScheduleInterviewDialog applicationId={item._id} onScheduled={(iv) => dispatch(setInterviewForApplication({ applicationId: item._id, interview: iv }))} />;
                                    }
                                    if (interview.status === 'cancelled') {
                                        return (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>
                                                <ScheduleInterviewDialog applicationId={item._id} onScheduled={(iv) => dispatch(setInterviewForApplication({ applicationId: item._id, interview: iv }))} />
                                            </div>
                                        );
                                    }
                                    const joinableFrom = new Date(new Date(interview.scheduledAt).getTime() - 10 * 60 * 1000);
                                    const canJoin = new Date() >= joinableFrom;
                                    return (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 gap-1">
                                                <Video className="h-3 w-3" />
                                                {new Date(interview.scheduledAt).toLocaleString()}
                                            </Badge>
                                            {canJoin && (
                                                <Button size="sm" className="gap-1.5" onClick={() => navigate(`/interview/${interview._id}`)}>
                                                    <Video className="h-3.5 w-3.5" /> Join
                                                </Button>
                                            )}
                                            <ScheduleInterviewDialog
                                                applicationId={item._id}
                                                existingInterview={interview}
                                                onScheduled={(iv) => dispatch(setInterviewForApplication({ applicationId: item._id, interview: iv }))}
                                            />
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Cancel interview" onClick={() => cancelInterview(interview._id, item._id)}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })()}
                            </TableCell>
                            <TableCell className="text-right">
                                <Popover>
                                    <PopoverTrigger className="p-1.5 rounded-md hover:bg-muted transition-colors">
                                        <MoreHorizontal className='h-4 w-4' />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-40 p-1">
                                        <button onClick={() => navigate(`/admin/applicants/${item._id}`)} className='flex items-center gap-2 w-full text-left px-2 py-2 rounded-md text-sm hover:bg-muted transition-colors'>
                                            <Sparkles className='h-4 w-4' />
                                            View details
                                        </button>
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
        </>
    )
}

export default ApplicantsTable
