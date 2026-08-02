import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import Navbar from '../shared/Navbar'
import PageTransition from '../shared/PageTransition'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { JOB_API_END_POINT } from '@/utils/constant'
import {
    ArrowLeft, MapPin, Briefcase, Wallet, GraduationCap, Users, FileText,
    Upload, Loader2, Pencil, X, Check
} from 'lucide-react'

const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];

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

const AdminJobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [input, setInput] = useState(null);
    const [jdFile, setJdFile] = useState(null);

    const fetchJob = async () => {
        try {
            const res = await axios.get(`${JOB_API_END_POINT}/get/${id}`, { withCredentials: true });
            if (res.data.success) {
                setJob(res.data.job);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't load this job.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchJob(); }, [id]);

    const startEditing = () => {
        setInput({
            title: job.title,
            description: job.description,
            requirements: (job.requirements || []).join(", "),
            salary: job.salary,
            location: job.location,
            jobType: job.jobType,
            experience: job.experienceLevel,
            position: job.position,
        });
        setJdFile(null);
        setEditing(true);
    }

    const changeEventHandler = (e) => setInput({ ...input, [e.target.name]: e.target.value });
    const jobTypeChangeHandler = (value) => setInput({ ...input, jobType: value });

    const jdFileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type !== "application/pdf") {
            toast.error("Job description must be a PDF file.");
            e.target.value = "";
            return;
        }
        setJdFile(file || null);
    };

    const saveHandler = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(input).forEach(([key, value]) => formData.append(key, value));
            if (jdFile) formData.append("jdFile", jdFile);

            const res = await axios.put(`${JOB_API_END_POINT}/update/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setJob(res.data.job);
                setEditing(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't save changes.");
        } finally {
            setSaving(false);
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

    if (!job) {
        return (
            <div>
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 my-10 text-center">
                    <p className="text-muted-foreground">Job not found.</p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" /> Go back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <PageTransition>
                <div className="max-w-4xl mx-auto px-4 my-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => navigate("/admin/jobs")}>
                            <ArrowLeft className="h-4 w-4" /> Back to your jobs
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/admin/jobs/${id}/applicants`)}>
                                <Users className="h-3.5 w-3.5" /> View applicants
                            </Button>
                            {!editing && (
                                <Button size="sm" className="gap-1.5" onClick={startEditing}>
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                </Button>
                            )}
                        </div>
                    </div>

                    {!editing ? (
                        <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                            <h1 className="font-heading font-extrabold text-2xl">{job.title}</h1>
                            <p className="text-muted-foreground text-sm mt-1">{job.company?.name} · {job.location}</p>
                            <div className="flex items-center flex-wrap gap-1.5 mt-3">
                                <Badge variant="secondary">{job.position} positions</Badge>
                                <Badge variant="secondary">{job.jobType}</Badge>
                                <Badge variant="secondary">₹{job.salary} LPA</Badge>
                                <Badge variant="secondary">{job.experienceLevel} yrs exp</Badge>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                                {infoRow(MapPin, "Location", job.location)}
                                {infoRow(Briefcase, "Job type", job.jobType)}
                                {infoRow(Wallet, "Salary", `₹${job.salary} LPA`)}
                                {infoRow(GraduationCap, "Experience required", `${job.experienceLevel} years`)}
                            </div>

                            <div className="mt-6 pt-6 border-t border-border">
                                <h2 className="font-heading font-bold mb-2">Description</h2>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                            </div>

                            {job.requirements?.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-border">
                                    <h2 className="font-heading font-bold mb-2">Requirements</h2>
                                    <div className="flex flex-wrap gap-1.5">
                                        {job.requirements.map((r) => <Badge key={r} variant="outline">{r}</Badge>)}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-border">
                                <h2 className="font-heading font-bold mb-2">Job description PDF</h2>
                                {job.jdUrl ? (
                                    <a href={job.jdUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                                        <FileText className="h-4 w-4" /> {job.jdOriginalName || "View JD"}
                                    </a>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No JD attached — AI resume shortlisting is off for this job. Click Edit to add one.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={saveHandler} className="bg-card border border-border rounded-lg p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="font-heading font-extrabold text-2xl">Edit job</h1>
                                <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditing(false)}>
                                    <X className="h-3.5 w-3.5" /> Cancel
                                </Button>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Title</Label>
                                    <Input name="title" value={input.title} onChange={changeEventHandler} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Location</Label>
                                    <Input name="location" value={input.location} onChange={changeEventHandler} required />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Description</Label>
                                    <Input name="description" value={input.description} onChange={changeEventHandler} required />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Requirements <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
                                    <Input name="requirements" value={input.requirements} onChange={changeEventHandler} placeholder="React, Node.js, SQL" required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Salary (LPA)</Label>
                                    <Input type="number" name="salary" value={input.salary} onChange={changeEventHandler} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Experience (years)</Label>
                                    <Input type="number" name="experience" value={input.experience} onChange={changeEventHandler} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Job type</Label>
                                    <Select onValueChange={jobTypeChangeHandler} defaultValue={input.jobType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select job type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {jobTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Number of positions</Label>
                                    <Input type="number" min={1} name="position" value={input.position} onChange={changeEventHandler} required />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Job description PDF</Label>
                                    <div className="flex items-center gap-3">
                                        <label htmlFor="jdFileEdit" className="flex items-center gap-2 cursor-pointer text-sm border border-dashed border-border rounded-md px-3 py-2 hover:bg-muted transition-colors">
                                            <Upload className="h-4 w-4" />
                                            {jdFile ? jdFile.name : job.jdOriginalName ? "Replace PDF" : "Choose PDF"}
                                        </label>
                                        <input id="jdFileEdit" type="file" accept="application/pdf" className="hidden" onChange={jdFileChangeHandler} />
                                        {job.jdUrl && !jdFile && (
                                            <a href={job.jdUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                                Current: {job.jdOriginalName}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-6 gap-1.5" disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                {saving ? "Saving..." : "Save changes"}
                            </Button>
                        </form>
                    )}
                </div>
            </PageTransition>
        </div>
    )
}

export default AdminJobDetail
