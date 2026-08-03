import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import PageTransition from './shared/PageTransition'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { MapPin, Briefcase, Wallet, GraduationCap, Users, CalendarDays, CheckCircle2, Bookmark, BookmarkCheck } from 'lucide-react'
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import useSaveJob from '@/hooks/useSaveJob';
import Job from './Job';
import { Sparkles } from 'lucide-react';
import { avatarColor } from '@/lib/jobType';
import { recordRecentlyViewed } from '@/lib/recentlyViewed';

const infoRow = (Icon, label, value) => (
    <div className='flex items-start gap-3'>
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
            <Icon className='h-4 w-4' />
        </span>
        <div>
            <p className='text-xs text-muted-foreground'>{label}</p>
            <p className='font-medium'>{value}</p>
        </div>
    </div>
)

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [relatedJobs, setRelatedJobs] = useState([]);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isSaved, toggleSave, pending } = useSaveJob(jobId);

    const applyJobHandler = () => {
        if (!user) {
            toast.info("Log in to apply for this job.");
            navigate("/login");
            return;
        }
        navigate(`/jobs/${jobId}/apply`);
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id))
                    recordRecentlyViewed(res.data.job, user?._id);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    useEffect(() => {
        const fetchRelatedJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/related/${jobId}`);
                if (res.data.success) {
                    setRelatedJobs(res.data.relatedJobs);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchRelatedJobs();
    }, [jobId]);

    return (
        <div>
            <Navbar />
            <PageTransition>
            <div className='max-w-5xl mx-auto px-4 my-10 pb-24 sm:pb-10'>
                <div className='bg-card border border-border rounded-lg p-6 sm:p-8'>
                    <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
                        <div className='flex items-start gap-4'>
                            <Avatar className="h-14 w-14 rounded-md border border-border shrink-0">
                                <AvatarImage src={singleJob?.company?.logo} />
                                <AvatarFallback className={`rounded-md font-heading font-bold ${avatarColor(singleJob?.company?.name)}`}>{singleJob?.company?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className='font-heading font-extrabold text-xl sm:text-2xl leading-tight'>{singleJob?.title}</h1>
                                <p className='text-muted-foreground text-sm mt-1'>
                                    <Link to={`/companies/${singleJob?.company?._id}`} className='hover:text-primary hover:underline transition-colors'>
                                        {singleJob?.company?.name}
                                    </Link> · {singleJob?.location}
                                </p>
                                <div className='flex items-center flex-wrap gap-1.5 mt-3'>
                                    <Badge variant="secondary">{singleJob?.position} positions</Badge>
                                    <Badge variant="secondary">{singleJob?.jobType}</Badge>
                                    <Badge variant="secondary">₹{singleJob?.salary} LPA</Badge>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                            <Button
                                onClick={toggleSave}
                                disabled={pending}
                                variant="outline"
                                size="icon"
                                className={isSaved ? 'text-primary border-primary/40' : ''}
                                aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
                            >
                                {isSaved ? <BookmarkCheck className='h-4 w-4' /> : <Bookmark className='h-4 w-4' />}
                            </Button>
                            <Button
                                onClick={isApplied ? undefined : applyJobHandler}
                                disabled={isApplied}
                                size="lg"
                                className={`rounded-lg ${isApplied ? 'bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}>
                                {isApplied ? (<><CheckCircle2 className='h-4 w-4 mr-2' /> Already applied</>) : 'Apply now'}
                            </Button>
                        </div>
                    </div>

                    <div className='border-t border-border mt-6 pt-6'>
                        <h2 className='font-heading font-bold text-lg mb-4'>Job description</h2>
                        <p className='text-sm text-muted-foreground leading-relaxed'>{singleJob?.description}</p>
                    </div>

                    <div className='border-t border-border mt-6 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5'>
                        {infoRow(MapPin, "Location", singleJob?.location)}
                        {infoRow(Wallet, "Salary", `₹${singleJob?.salary} LPA`)}
                        {infoRow(GraduationCap, "Experience", `${singleJob?.experienceLevel ?? singleJob?.experience ?? "—"} yrs`)}
                        {infoRow(Users, "Total applicants", singleJob?.applications?.length ?? 0)}
                        {infoRow(Briefcase, "Job type", singleJob?.jobType)}
                        {infoRow(CalendarDays, "Posted", singleJob?.createdAt?.split("T")[0])}
                    </div>
                </div>

                {
                    relatedJobs.length > 0 && (
                        <div className='mt-8'>
                            <h2 className='font-heading font-bold text-lg mb-4 flex items-center gap-2'>
                                <Sparkles className='h-4 w-4 text-primary' /> Jobs like this
                            </h2>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                {relatedJobs.map((job) => <Job key={job._id} job={job} />)}
                            </div>
                        </div>
                    )
                }
            </div>

            {/* Sticky apply bar — mobile only, keeps the primary action reachable
                without scrolling back up, matching real job-board mobile UX */}
            <div className='sm:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3'>
                <div className='min-w-0 flex-1'>
                    <p className='font-semibold text-sm truncate'>{singleJob?.title}</p>
                    <p className='text-xs text-muted-foreground truncate'>{singleJob?.company?.name}</p>
                </div>
                <Button
                    onClick={toggleSave}
                    disabled={pending}
                    variant="outline"
                    size="icon"
                    className={`shrink-0 ${isSaved ? 'text-primary border-primary/40' : ''}`}
                    aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
                >
                    {isSaved ? <BookmarkCheck className='h-4 w-4' /> : <Bookmark className='h-4 w-4' />}
                </Button>
                <Button
                    onClick={isApplied ? undefined : applyJobHandler}
                    disabled={isApplied}
                    className={`shrink-0 rounded-lg ${isApplied ? 'bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}
                >
                    {isApplied ? "Applied" : "Apply now"}
                </Button>
            </div>
        </PageTransition>
        </div>
    )
}

export default JobDescription
