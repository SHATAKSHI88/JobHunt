import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import Navbar from '../shared/Navbar'
import PageTransition from '../shared/PageTransition'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import ScheduleInterviewDialog from './ScheduleInterviewDialog'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { ArrowLeft, Sparkles, Loader2, FileText, Mail, Phone, CalendarDays, RotateCw, ClipboardList, Globe2, Accessibility, Users2 } from 'lucide-react'

const genderLabel = { male: "Male", female: "Female", prefer_not_to_say: "Prefer not to say" };

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

const scoreColor = (score, max) => {
    const pct = (score / max) * 100;
    if (pct >= 75) return "bg-accent";
    if (pct >= 50) return "bg-yellow-500";
    return "bg-destructive";
}

const SkillBar = ({ skill, score, comment }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{skill}</span>
            <span className="text-muted-foreground">{score}/10</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${scoreColor(score, 10)}`} style={{ width: `${(score / 10) * 100}%` }} />
        </div>
        {comment && <p className="text-xs text-muted-foreground">{comment}</p>}
    </div>
)

const ApplicantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    const fetchApplication = async () => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.get(`${APPLICATION_API_END_POINT}/${id}`);
            if (res.data.success) setApplication(res.data.application);
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't load this applicant.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchApplication(); }, [id]);

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/${id}/analyze`);
            if (res.data.success) {
                setApplication(prev => ({ ...prev, detailedAnalysis: res.data.detailedAnalysis }));
                toast.success("Analysis ready.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't generate the analysis.");
        } finally {
            setAnalyzing(false);
        }
    }

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    if (!application) {
        return (
            <div>
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 my-10 text-center">
                    <p className="text-muted-foreground">Applicant not found.</p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" /> Go back
                    </Button>
                </div>
            </div>
        )
    }

    const {
        applicant, job, matchScore, matchSummary, detailedAnalysis, status,
        gender, hasDisability, disabilityDetails, hasRelativeAtCompany, relativeDetails, nationality,
    } = application;

    return (
        <div>
            <Navbar />
            <PageTransition>
                <div className="max-w-4xl mx-auto px-4 my-10 space-y-6">
                    <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" /> Back to applicants
                    </Button>

                    <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <h1 className="font-heading font-extrabold text-2xl">{applicant?.fullname}</h1>
                                <p className="text-muted-foreground text-sm mt-1">Applied for {job?.title} at {job?.company?.name}</p>
                                <div className="flex items-center flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {applicant?.email}</span>
                                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {applicant?.phoneNumber}</span>
                                    <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Applied {application?.createdAt?.split("T")[0]}</span>
                                </div>
                            </div>
                            <Badge variant="outline" className={
                                status === 'accepted' ? "bg-accent/15 text-accent border-accent/30 w-fit"
                                : status === 'rejected' ? "bg-destructive/15 text-destructive border-destructive/30 w-fit"
                                : "text-muted-foreground w-fit"
                            }>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                        </div>

                        {applicant?.profile?.resume && (
                            <a href={applicant.profile.resume} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline">
                                <FileText className="h-4 w-4" /> {applicant.profile.resumeOriginalName || "View resume"}
                            </a>
                        )}

                        {applicant?.profile?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {applicant.profile.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                            </div>
                        )}

                        {status === 'accepted' && (
                            <div className="mt-5 pt-5 border-t border-border">
                                <ScheduleInterviewDialog applicationId={application._id} />
                            </div>
                        )}
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                        <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" /> Screening answers
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {infoRow(Users2, "Gender", genderLabel[gender] || "—")}
                            {infoRow(Globe2, "Nationality", nationality || "—")}
                            <div className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <Accessibility className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">Person with disability</p>
                                    <p className="font-medium">{hasDisability ? "Yes" : "No"}</p>
                                    {hasDisability && disabilityDetails && (
                                        <p className="text-sm text-muted-foreground mt-1">{disabilityDetails}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <Users2 className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">Relative at this company</p>
                                    <p className="font-medium">{hasRelativeAtCompany ? "Yes" : "No"}</p>
                                    {hasRelativeAtCompany && relativeDetails && (
                                        <p className="text-sm text-muted-foreground mt-1">{relativeDetails}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {matchScore !== null && matchScore !== undefined && (
                        <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                            <h2 className="font-heading font-bold text-lg mb-3">Quick match score</h2>
                            <div className="flex items-center gap-3">
                                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                    <div className={`h-full rounded-full ${scoreColor(matchScore, 100)}`} style={{ width: `${matchScore}%` }} />
                                </div>
                                <span className="text-sm font-medium shrink-0">{matchScore}%</span>
                            </div>
                            {matchSummary && <p className="text-sm text-muted-foreground mt-2">{matchSummary}</p>}
                            <p className="text-xs text-muted-foreground mt-3">Generated automatically when this candidate applied.</p>
                        </div>
                    )}

                    <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" /> AI skill breakdown
                            </h2>
                            {!job?.jdText ? null : (
                                <Button size="sm" variant="outline" className="gap-1.5" onClick={runAnalysis} disabled={analyzing}>
                                    {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : detailedAnalysis?.generatedAt ? <RotateCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                                    {analyzing ? "Analyzing..." : detailedAnalysis?.generatedAt ? "Re-analyze" : "Analyze with AI"}
                                </Button>
                            )}
                        </div>

                        {!job?.jdText ? (
                            <p className="text-sm text-muted-foreground">
                                This job doesn't have a JD PDF attached, so there's nothing to score the resume against. Edit the job posting to add one.
                            </p>
                        ) : !detailedAnalysis?.generatedAt ? (
                            <p className="text-sm text-muted-foreground">
                                Get a skill-by-skill breakdown of how well this resume matches each requirement, scored out of 10.
                            </p>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex items-center gap-3 pb-4 border-b border-border">
                                    <span className="text-3xl font-heading font-extrabold">{detailedAnalysis.overallScore}</span>
                                    <span className="text-muted-foreground text-sm">/ 10 overall fit</span>
                                </div>
                                {detailedAnalysis.overallSummary && (
                                    <p className="text-sm text-muted-foreground">{detailedAnalysis.overallSummary}</p>
                                )}
                                <div className="space-y-4">
                                    {detailedAnalysis.skillScores?.map((s, i) => (
                                        <SkillBar key={i} skill={s.skill} score={s.score} comment={s.comment} />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last generated {new Date(detailedAnalysis.generatedAt).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </PageTransition>
        </div>
    )
}

export default ApplicantDetail
