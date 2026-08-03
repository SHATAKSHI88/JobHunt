import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from './shared/Navbar'
import PageTransition from './shared/PageTransition'
import EmptyState from './shared/EmptyState'
import Job from './Job'
import { Skeleton } from './ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { MapPin, Globe, Briefcase } from 'lucide-react'
import { COMPANY_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant'
import { avatarColor } from '@/lib/jobType'

const CompanyProfile = () => {
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanyAndJobs = async () => {
            try {
                setLoading(true);
                const [companyRes, jobsRes] = await Promise.all([
                    axios.get(`${COMPANY_API_END_POINT}/get/${id}`, { withCredentials: true }),
                    axios.get(`${JOB_API_END_POINT}/get?company=${id}&limit=50`),
                ]);
                if (companyRes.data.success) setCompany(companyRes.data.company);
                if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetchCompanyAndJobs();
    }, [id]);

    return (
        <div>
            <Navbar />
            <PageTransition>
                <div className='max-w-5xl mx-auto px-4 my-10'>
                    {
                        loading ? (
                            <div className='bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4'>
                                <div className='flex items-center gap-4'>
                                    <Skeleton className='h-16 w-16 rounded-lg' />
                                    <div className='space-y-2'>
                                        <Skeleton className='h-5 w-40' />
                                        <Skeleton className='h-4 w-24' />
                                    </div>
                                </div>
                                <Skeleton className='h-4 w-full' />
                                <Skeleton className='h-4 w-2/3' />
                            </div>
                        ) : !company ? (
                            <EmptyState
                                variant="search"
                                title="Company not found"
                                description="This company profile doesn't exist or may have been removed."
                            />
                        ) : (
                            <>
                                <div className='bg-card border border-border rounded-lg p-6 sm:p-8'>
                                    <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                                        <Avatar className="h-16 w-16 rounded-lg border border-border">
                                            <AvatarImage src={company?.logo} />
                                            <AvatarFallback className={`rounded-lg text-xl font-heading font-bold ${avatarColor(company?.name)}`}>
                                                {company?.name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='flex-1'>
                                            <h1 className='font-heading font-extrabold text-xl'>{company?.name}</h1>
                                            <div className='flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground'>
                                                {
                                                    company?.location && (
                                                        <span className='flex items-center gap-1'><MapPin className='h-3.5 w-3.5' /> {company.location}</span>
                                                    )
                                                }
                                                {
                                                    company?.website && (
                                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className='flex items-center gap-1 text-primary hover:underline'>
                                                            <Globe className='h-3.5 w-3.5' /> Website
                                                        </a>
                                                    )
                                                }
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <Briefcase className='h-3 w-3' /> {jobs.length} open role{jobs.length === 1 ? "" : "s"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        company?.description && (
                                            <p className='text-sm text-muted-foreground leading-relaxed mt-5 pt-5 border-t border-border'>{company.description}</p>
                                        )
                                    }
                                </div>

                                <div className='mt-8'>
                                    <h2 className='font-heading font-bold text-lg mb-4'>Open roles at {company?.name}</h2>
                                    {
                                        jobs.length === 0 ? (
                                            <div className='border border-dashed border-border rounded-lg'>
                                                <EmptyState
                                                    variant="search"
                                                    title="No open roles right now"
                                                    description="Check back soon — this company may post new openings."
                                                />
                                            </div>
                                        ) : (
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                                {jobs.map((job) => <Job key={job._id} job={job} />)}
                                            </div>
                                        )
                                    }
                                </div>
                            </>
                        )
                    }
                </div>
            </PageTransition>
        </div>
    )
}

export default CompanyProfile
