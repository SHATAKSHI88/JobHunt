import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { removeFromCompare, clearCompare } from '@/redux/compareSlice'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { avatarColor } from '@/lib/jobType'
import { GitCompare, X } from 'lucide-react'

const CompareBar = () => {
    const { items } = useSelector(store => store.compare);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // don't clutter the comparison page itself with its own trigger bar
    if (items.length === 0 || location.pathname === '/compare') return null;

    return (
        <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-card border border-border rounded-full shadow-lg pl-3 pr-2 py-2'>
            <div className='flex -space-x-2'>
                {items.map((job) => (
                    <div key={job._id} className='relative group'>
                        <Avatar className="h-8 w-8 border-2 border-card">
                            <AvatarImage src={job.company?.logo} />
                            <AvatarFallback className={`text-xs font-bold ${avatarColor(job.company?.name)}`}>
                                {job.company?.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            onClick={() => dispatch(removeFromCompare(job._id))}
                            className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                            aria-label={`Remove ${job.title} from comparison`}
                        >
                            <X className='h-2.5 w-2.5' />
                        </button>
                    </div>
                ))}
            </div>
            <span className='text-sm text-muted-foreground pr-1'>{items.length} selected</span>
            <Button size="sm" onClick={() => navigate('/compare')} disabled={items.length < 2}>
                <GitCompare className='h-3.5 w-3.5 mr-1.5' /> Compare
            </Button>
            <Button size="sm" variant="ghost" onClick={() => dispatch(clearCompare())} className="text-muted-foreground">
                Clear
            </Button>
        </div>
    )
}

export default CompareBar
