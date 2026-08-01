import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import axios from 'axios'
import { ANALYTICS_API_END_POINT } from '@/utils/constant'
import { Briefcase, Building2, Users, TrendingUp } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts'

const STATUS_COLORS = {
    pending: "#94a3b8",
    accepted: "#10b981",
    rejected: "#ef4444",
}

const StatCard = ({ icon: Icon, label, value }) => (
    <div className='bg-card border border-border rounded-lg p-5 flex items-center gap-4'>
        <span className='flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0'>
            <Icon className='h-5 w-5' />
        </span>
        <div>
            <p className='text-xs text-muted-foreground'>{label}</p>
            <p className='font-heading font-extrabold text-2xl leading-tight'>{value}</p>
        </div>
    </div>
)

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${ANALYTICS_API_END_POINT}/recruiter`, { withCredentials: true });
                if (res.data.success) {
                    setData(res.data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    const statusData = data ? [
        { name: "Pending", value: data.statusBreakdown.pending, color: STATUS_COLORS.pending },
        { name: "Accepted", value: data.statusBreakdown.accepted, color: STATUS_COLORS.accepted },
        { name: "Rejected", value: data.statusBreakdown.rejected, color: STATUS_COLORS.rejected },
    ].filter(d => d.value > 0) : [];

    return (
        <div>
            <Navbar />
            <div className='max-w-6xl mx-auto px-4 my-8'>
                <div className='mb-6'>
                    <h1 className='font-heading font-extrabold text-2xl'>Dashboard</h1>
                    <p className='text-muted-foreground text-sm mt-1'>A snapshot of your jobs and applicants.</p>
                </div>

                {
                    loading ? (
                        <div className='grid sm:grid-cols-3 gap-4 mb-6'>
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
                        </div>
                    ) : !data ? (
                        <p className='text-muted-foreground text-sm'>Couldn't load your analytics right now.</p>
                    ) : (
                        <>
                            <div className='grid sm:grid-cols-3 gap-4 mb-6'>
                                <StatCard icon={Briefcase} label="Jobs posted" value={data.totalJobs} />
                                <StatCard icon={Building2} label="Companies" value={data.totalCompanies} />
                                <StatCard icon={Users} label="Total applicants" value={data.totalApplicants} />
                            </div>

                            <div className='grid lg:grid-cols-3 gap-4'>
                                <div className='lg:col-span-2 bg-card border border-border rounded-lg p-5'>
                                    <h2 className='font-heading font-bold flex items-center gap-2 mb-4'>
                                        <TrendingUp className='h-4 w-4 text-primary' /> Applications, last 30 days
                                    </h2>
                                    {
                                        data.applicationsOverTime.length === 0 ? (
                                            <p className='text-sm text-muted-foreground py-16 text-center'>No applications in this window yet.</p>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={260}>
                                                <AreaChart data={data.applicationsOverTime}>
                                                    <defs>
                                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                                                    <Area type="monotone" dataKey="count" stroke="#2563eb" fill="url(#colorCount)" strokeWidth={2} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )
                                    }
                                </div>

                                <div className='bg-card border border-border rounded-lg p-5'>
                                    <h2 className='font-heading font-bold mb-4'>Application status</h2>
                                    {
                                        statusData.length === 0 ? (
                                            <p className='text-sm text-muted-foreground py-16 text-center'>No applicants yet.</p>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <PieChart>
                                                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                                                        {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )
                                    }
                                </div>
                            </div>

                            <div className='bg-card border border-border rounded-lg p-5 mt-4'>
                                <h2 className='font-heading font-bold mb-4'>Top jobs by applicants</h2>
                                {
                                    data.topJobs.length === 0 ? (
                                        <p className='text-sm text-muted-foreground py-10 text-center'>Post a job to start seeing applicants here.</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={Math.max(180, data.topJobs.length * 50)}>
                                            <BarChart data={data.topJobs} layout="vertical" margin={{ left: 24 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                                <YAxis type="category" dataKey="title" width={160} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                                                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                                                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={18} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )
                                }
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default Dashboard
