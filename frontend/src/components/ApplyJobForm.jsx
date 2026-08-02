import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import Navbar from './shared/Navbar'
import PageTransition from './shared/PageTransition'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { useDispatch, useSelector } from 'react-redux'
import { setSingleJob } from '@/redux/jobSlice'
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant'
import { ArrowLeft, Loader2, Send } from 'lucide-react'

const ApplyJobForm = () => {
    const { id: jobId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    const [job, setJob] = useState(null);
    const [loadingJob, setLoadingJob] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        gender: '',
        hasDisability: '',
        disabilityDetails: '',
        hasRelativeAtCompany: '',
        relativeDetails: '',
        nationality: '',
        agreedToTerms: false,
    });

    useEffect(() => {
        if (!user) {
            toast.info("Log in to apply for this job.");
            navigate("/login");
            return;
        }
        const fetchJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    setJob(res.data.job);
                    const alreadyApplied = res.data.job.applications?.some(a => a.applicant === user?._id);
                    if (alreadyApplied) {
                        toast.info("You've already applied for this job.");
                        navigate(`/description/${jobId}`);
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Couldn't load this job.");
            } finally {
                setLoadingJob(false);
            }
        }
        fetchJob();
    }, [jobId, user]);

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!form.gender) {
            toast.error("Please select a gender option.");
            return;
        }
        if (form.hasDisability === '') {
            toast.error("Please answer whether you're a person with a disability.");
            return;
        }
        if (form.hasDisability === 'yes' && !form.disabilityDetails.trim()) {
            toast.error("Please share a few details about your disability.");
            return;
        }
        if (form.hasRelativeAtCompany === '') {
            toast.error("Please answer whether you have a relative at this company.");
            return;
        }
        if (!form.nationality.trim()) {
            toast.error("Nationality is required.");
            return;
        }
        if (!form.agreedToTerms) {
            toast.error("You must agree to the terms and conditions to apply.");
            return;
        }

        setSubmitting(true);
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {
                gender: form.gender,
                hasDisability: form.hasDisability === 'yes',
                disabilityDetails: form.disabilityDetails,
                hasRelativeAtCompany: form.hasRelativeAtCompany === 'yes',
                relativeDetails: form.relativeDetails,
                nationality: form.nationality,
                agreedToTerms: form.agreedToTerms,
            });
            if (res.data.success) {
                toast.success(res.data.message);
                if (job) {
                    dispatch(setSingleJob({ ...job, applications: [...(job.applications || []), { applicant: user?._id }] }));
                }
                navigate(`/description/${jobId}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't submit your application.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingJob) {
        return (
            <div>
                <Navbar />
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <PageTransition>
                <div className="max-w-2xl mx-auto px-4 my-10">
                    <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-4" onClick={() => navigate(`/description/${jobId}`)}>
                        <ArrowLeft className="h-4 w-4" /> Back to job
                    </Button>

                    <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                        <h1 className="font-heading font-extrabold text-2xl">Apply for {job?.title}</h1>
                        <p className="text-muted-foreground text-sm mt-1">{job?.company?.name} · {job?.location}</p>
                        <p className="text-sm text-muted-foreground mt-4">
                            Just a few quick questions before we submit your application.
                        </p>

                        <form onSubmit={submitHandler} className="space-y-6 mt-6">
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <RadioGroup value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })} className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="male" /> Male
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="female" /> Female
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="prefer_not_to_say" /> Prefer not to say
                                    </label>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label>Are you a person with a disability?</Label>
                                <RadioGroup value={form.hasDisability} onValueChange={(v) => setForm({ ...form, hasDisability: v })} className="flex gap-6">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="yes" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="no" /> No
                                    </label>
                                </RadioGroup>
                                {form.hasDisability === 'yes' && (
                                    <Textarea
                                        placeholder="Please share a few details — this helps us arrange any accommodations you might need."
                                        value={form.disabilityDetails}
                                        onChange={(e) => setForm({ ...form, disabilityDetails: e.target.value })}
                                        className="mt-2"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Do you have a relative who works at this company?</Label>
                                <RadioGroup value={form.hasRelativeAtCompany} onValueChange={(v) => setForm({ ...form, hasRelativeAtCompany: v })} className="flex gap-6">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="yes" /> Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="no" /> No
                                    </label>
                                </RadioGroup>
                                {form.hasRelativeAtCompany === 'yes' && (
                                    <Textarea
                                        placeholder="Optional — name and relation (e.g. 'Jane Doe, sister')"
                                        value={form.relativeDetails}
                                        onChange={(e) => setForm({ ...form, relativeDetails: e.target.value })}
                                        className="mt-2"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nationality">Nationality</Label>
                                <Input
                                    id="nationality"
                                    placeholder="e.g. Indian"
                                    value={form.nationality}
                                    onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                                />
                            </div>

                            <label className="flex items-start gap-2.5 text-sm cursor-pointer pt-2 border-t border-border">
                                <input
                                    type="checkbox"
                                    checked={form.agreedToTerms}
                                    onChange={(e) => setForm({ ...form, agreedToTerms: e.target.checked })}
                                    className="mt-0.5 h-4 w-4 rounded border-input accent-primary shrink-0"
                                />
                                <span className="text-muted-foreground">
                                    I agree to the <span className="text-foreground font-medium">terms and conditions</span> and confirm that the information I've provided is accurate.
                                </span>
                            </label>

                            <Button type="submit" className="w-full gap-2" disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                {submitting ? "Submitting..." : "Submit application"}
                            </Button>
                        </form>
                    </div>
                </div>
            </PageTransition>
        </div>
    )
}

export default ApplyJobForm
