import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import PageTransition from './shared/PageTransition'
import EmptyState from './shared/EmptyState'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { Bell, Trash2 } from 'lucide-react'
import axios from 'axios'
import { ALERTS_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const res = await axios.get(ALERTS_API_END_POINT, { withCredentials: true });
            if (res.data.success) setAlerts(res.data.alerts);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAlerts();
    }, []);

    const deleteHandler = async (id) => {
        try {
            const res = await axios.delete(`${ALERTS_API_END_POINT}/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setAlerts((prev) => prev.filter((a) => a._id !== id));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't delete this alert.");
        }
    }

    return (
        <div>
            <Navbar />
            <PageTransition>
                <div className='max-w-3xl mx-auto px-4 my-10'>
                    <div className='mb-6'>
                        <h1 className='font-heading font-extrabold text-2xl flex items-center gap-2'>
                            <Bell className='h-5 w-5 text-primary' /> Job alerts
                        </h1>
                        <p className='text-muted-foreground text-sm mt-1'>We'll email you when a new job matches one of these.</p>
                    </div>

                    {
                        loading ? (
                            <div className='space-y-3'>
                                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className='border border-dashed border-border rounded-lg'>
                                <EmptyState
                                    variant="search"
                                    title="No alerts yet"
                                    description="Search or filter jobs, then click 'Create alert' to get notified about new matches."
                                    action={<Link to="/jobs"><Button variant="outline" size="sm">Browse jobs</Button></Link>}
                                />
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {alerts.map((alert) => (
                                    <div key={alert._id} className='flex items-center justify-between gap-4 bg-card border border-border rounded-lg p-4'>
                                        <div>
                                            <p className='font-semibold'>{alert.label}</p>
                                            <div className='flex flex-wrap gap-1.5 mt-2'>
                                                {alert.keyword && <Badge variant="secondary">"{alert.keyword}"</Badge>}
                                                {alert.location && <Badge variant="secondary">{alert.location}</Badge>}
                                                {alert.jobType && <Badge variant="secondary">{alert.jobType}</Badge>}
                                                {!alert.keyword && !alert.location && !alert.jobType && <Badge variant="secondary">All jobs</Badge>}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => deleteHandler(alert._id)} className="text-muted-foreground hover:text-destructive shrink-0">
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>
            </PageTransition>
        </div>
    )
}

export default Alerts
