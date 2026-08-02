import React, { useMemo, useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen, FileText, CalendarDays, UploadCloud, CheckCircle2 } from 'lucide-react'
import { Badge } from './ui/badge'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import PageTransition from './shared/PageTransition'

const memberSince = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { allAppliedJobs } = useSelector(store => store.job);

    const stats = useMemo(() => {
        const total = allAppliedJobs.length;
        const pending = allAppliedJobs.filter((a) => a.status === 'pending').length;
        const accepted = allAppliedJobs.filter((a) => a.status === 'accepted').length;
        const rejected = allAppliedJobs.filter((a) => a.status === 'rejected').length;
        return { total, pending, accepted, rejected };
    }, [allAppliedJobs]);

    // simple, honest completeness meter — encourages filling out a profile
    // without pretending to know anything the user hasn't told us
    const completeness = useMemo(() => {
        const checks = [
            !!user?.profile?.profilePhoto,
            !!user?.profile?.bio,
            !!user?.profile?.skills?.length,
            !!user?.profile?.resume,
            !!user?.phoneNumber,
        ];
        const done = checks.filter(Boolean).length;
        return Math.round((done / checks.length) * 100);
    }, [user]);

    return (
        <div>
            <Navbar />
            <PageTransition>
            <div className='max-w-4xl mx-auto px-4'>
                <div className='bg-card border border-border rounded-lg my-6 overflow-hidden'>
                    {/* cover banner */}
                    <div className='relative h-28 bg-gradient-to-r from-primary to-primary/70'>
                        <div
                            className='absolute inset-0 opacity-[0.15]'
                            style={{
                                backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                                backgroundSize: "20px 20px",
                            }}
                        />
                    </div>

                    <div className='px-6 sm:px-8 pb-6 sm:pb-8'>
                        <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12'>
                            <div className='flex items-end gap-4'>
                                <Avatar className="h-24 w-24 border-4 border-card shadow-lg ring-1 ring-black/5">
                                    <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                    <AvatarFallback className="text-2xl font-heading font-bold bg-primary text-primary-foreground">
                                        {user?.fullname?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='pb-1'>
                                    <h1 className='font-heading font-extrabold text-xl'>{user?.fullname}</h1>
                                    {
                                        memberSince(user?.createdAt) && (
                                            <p className='text-xs text-muted-foreground flex items-center gap-1 mt-0.5'>
                                                <CalendarDays className='h-3 w-3' /> Member since {memberSince(user?.createdAt)}
                                            </p>
                                        )
                                    }
                                </div>
                            </div>
                            <Button onClick={() => setOpen(true)} variant="outline" className="self-start sm:self-auto">
                                <Pen className='h-4 w-4 mr-2' /> Edit profile
                            </Button>
                        </div>

                        <p className='text-muted-foreground text-sm mt-4'>{user?.profile?.bio || "No bio added yet — tell recruiters a bit about yourself."}</p>

                        {/* profile completeness */}
                        {
                            completeness < 100 && (
                                <div className='mt-5 rounded-md bg-muted/50 border border-border p-3'>
                                    <div className='flex items-center justify-between text-xs mb-1.5'>
                                        <span className='font-medium'>Profile completeness</span>
                                        <span className='text-muted-foreground'>{completeness}%</span>
                                    </div>
                                    <div className='h-1.5 w-full rounded-full bg-border overflow-hidden'>
                                        <div className='h-full rounded-full bg-primary transition-all duration-500' style={{ width: `${completeness}%` }} />
                                    </div>
                                </div>
                            )
                        }

                        <div className='grid sm:grid-cols-2 gap-3 my-6'>
                            <div className='flex items-center gap-3 text-sm'>
                                <Mail className='h-4 w-4 text-muted-foreground' />
                                <span>{user?.email}</span>
                            </div>
                            <div className='flex items-center gap-3 text-sm'>
                                <Contact className='h-4 w-4 text-muted-foreground' />
                                <span>{user?.phoneNumber || "—"}</span>
                            </div>
                        </div>

                        <div className='border-t border-border pt-6'>
                            <h2 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2'>Skills</h2>
                            <div className='flex flex-wrap items-center gap-2'>
                                {
                                    user?.profile?.skills?.length ? user.profile.skills.map((item, index) => (
                                        <Badge key={index} variant="secondary">{item}</Badge>
                                    )) : <span className='text-sm text-muted-foreground'>No skills added yet.</span>
                                }
                            </div>
                        </div>

                        <div className='border-t border-border mt-6 pt-6'>
                            <h2 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2'>Resume</h2>
                            {
                                user?.profile?.resume ? (
                                    <a target='_blank' rel="noopener noreferrer" href={user.profile.resume} className='inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium'>
                                        <FileText className='h-4 w-4' /> {user?.profile?.resumeOriginalName}
                                    </a>
                                ) : (
                                    <Button onClick={() => setOpen(true)} variant="outline" size="sm">
                                        <UploadCloud className='h-3.5 w-3.5 mr-2' /> Upload resume
                                    </Button>
                                )
                            }
                        </div>
                    </div>
                </div>

                <div className='bg-card border border-border rounded-lg mb-10 p-6 sm:p-8'>
                    <div className='flex items-center justify-between mb-4 flex-wrap gap-3'>
                        <h2 className='font-heading font-bold text-lg'>Applied jobs</h2>
                        {
                            stats.total > 0 && (
                                <div className='flex items-center gap-2 text-xs'>
                                    <span className='px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium'>{stats.total} total</span>
                                    <span className='px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium'>{stats.pending} pending</span>
                                    <span className='px-2.5 py-1 rounded-full bg-accent/15 text-accent font-medium flex items-center gap-1'>
                                        <CheckCircle2 className='h-3 w-3' /> {stats.accepted} accepted
                                    </span>
                                </div>
                            )
                        }
                    </div>
                    <AppliedJobTable />
                </div>
            </div>
            </PageTransition>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile
