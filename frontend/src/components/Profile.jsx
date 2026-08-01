import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen, FileText } from 'lucide-react'
import { Badge } from './ui/badge'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    return (
        <div>
            <Navbar />
            <div className='max-w-4xl mx-auto px-4'>
                <div className='bg-card border border-border rounded-lg my-6 p-6 sm:p-8'>
                    <div className='flex flex-col sm:flex-row justify-between gap-4'>
                        <div className='flex items-center gap-4'>
                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                                <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                <AvatarFallback className="text-xl">{user?.fullname?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className='font-heading font-extrabold text-xl'>{user?.fullname}</h1>
                                <p className='text-muted-foreground text-sm mt-1'>{user?.profile?.bio || "No bio added yet."}</p>
                            </div>
                        </div>
                        <Button onClick={() => setOpen(true)} variant="outline" className="self-start">
                            <Pen className='h-4 w-4 mr-2' /> Edit profile
                        </Button>
                    </div>

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
                            ) : <span className='text-sm text-muted-foreground'>No resume uploaded yet.</span>
                        }
                    </div>
                </div>

                <div className='bg-card border border-border rounded-lg mb-10 p-6 sm:p-8'>
                    <h2 className='font-heading font-bold text-lg mb-4'>Applied jobs</h2>
                    <AppliedJobTable />
                </div>
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile
