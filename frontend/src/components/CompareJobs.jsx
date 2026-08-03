import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from './shared/Navbar'
import PageTransition from './shared/PageTransition'
import EmptyState from './shared/EmptyState'
import { Button } from './ui/button'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { avatarColor } from '@/lib/jobType'
import { removeFromCompare, clearCompare } from '@/redux/compareSlice'
import { X, MapPin, GitCompare } from 'lucide-react'

const rowLabel = "px-4 py-3 text-sm font-medium text-muted-foreground bg-muted/40 sticky left-0";
const cell = "px-4 py-3 text-sm align-top";

const CompareJobs = () => {
    const { items } = useSelector(store => store.compare);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div>
                <Navbar />
                <PageTransition>
                    <div className='max-w-3xl mx-auto px-4 my-10'>
                        <div className='border border-dashed border-border rounded-lg'>
                            <EmptyState
                                variant="search"
                                title="Nothing to compare yet"
                                description="Tap the compare icon on any job card to add it here — pick 2 or 3 to see them side by side."
                                action={<Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>Browse jobs</Button>}
                            />
                        </div>
                    </div>
                </PageTransition>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <PageTransition>
                <div className='max-w-6xl mx-auto px-4 my-10'>
                    <div className='flex items-center justify-between mb-6 flex-wrap gap-3'>
                        <h1 className='font-heading font-extrabold text-2xl flex items-center gap-2'>
                            <GitCompare className='h-5 w-5 text-primary' /> Compare jobs
                        </h1>
                        <Button variant="outline" size="sm" onClick={() => dispatch(clearCompare())}>Clear all</Button>
                    </div>

                    <div className='overflow-x-auto border border-border rounded-lg'>
                        <table className='w-full border-collapse'>
                            <thead>
                                <tr className='border-b border-border'>
                                    <th className={`${rowLabel} text-left`}>&nbsp;</th>
                                    {items.map((job) => (
                                        <th key={job._id} className='px-4 py-4 text-left min-w-[220px] border-l border-border'>
                                            <div className='flex items-start justify-between gap-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Avatar className="h-9 w-9 rounded-md border border-border shrink-0">
                                                        <AvatarImage src={job.company?.logo} />
                                                        <AvatarFallback className={`rounded-md text-xs font-bold ${avatarColor(job.company?.name)}`}>
                                                            {job.company?.name?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className='min-w-0'>
                                                        <p className='font-semibold text-sm leading-tight truncate max-w-[140px]'>{job.title}</p>
                                                        <p className='text-xs text-muted-foreground truncate max-w-[140px]'>{job.company?.name}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => dispatch(removeFromCompare(job._id))} className='text-muted-foreground hover:text-destructive shrink-0' aria-label="Remove from comparison">
                                                    <X className='h-4 w-4' />
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='border-b border-border'>
                                    <td className={rowLabel}>Salary</td>
                                    {items.map((job) => (
                                        <td key={job._id} className={`${cell} border-l border-border font-semibold`}>₹{job.salary} LPA</td>
                                    ))}
                                </tr>
                                <tr className='border-b border-border'>
                                    <td className={rowLabel}>Location</td>
                                    {items.map((job) => (
                                        <td key={job._id} className={`${cell} border-l border-border`}>
                                            <span className='flex items-center gap-1'><MapPin className='h-3 w-3 text-muted-foreground' /> {job.location}</span>
                                        </td>
                                    ))}
                                </tr>
                                <tr className='border-b border-border'>
                                    <td className={rowLabel}>Job type</td>
                                    {items.map((job) => (
                                        <td key={job._id} className={`${cell} border-l border-border`}>{job.jobType}</td>
                                    ))}
                                </tr>
                                <tr className='border-b border-border'>
                                    <td className={rowLabel}>Experience</td>
                                    {items.map((job) => (
                                        <td key={job._id} className={`${cell} border-l border-border`}>{job.experienceLevel ?? "—"} yrs</td>
                                    ))}
                                </tr>
                                <tr className='border-b border-border'>
                                    <td className={rowLabel}>Positions</td>
                                    {items.map((job) => (
                                        <td key={job._id} className={`${cell} border-l border-border`}>{job.position}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className={rowLabel}>Requirements</td>
                                    {items.map((job) => (
                                        <td key={job._id} className={`${cell} border-l border-border`}>
                                            <div className='flex flex-wrap gap-1'>
                                                {job.requirements?.length ? job.requirements.map((r) => (
                                                    <span key={r} className='px-1.5 py-0.5 rounded bg-muted text-xs'>{r}</span>
                                                )) : <span className='text-muted-foreground text-xs'>—</span>}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                                <tr className='border-t border-border'>
                                    <td className={rowLabel}>&nbsp;</td>
                                    {items.map((job) => (
                                        <td key={job._id} className={`${cell} border-l border-border`}>
                                            <Button size="sm" className="w-full" onClick={() => navigate(`/description/${job._id}`)}>View job</Button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </PageTransition>
        </div>
    )
}

export default CompareJobs
