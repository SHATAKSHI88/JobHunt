import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search, Briefcase, Building2, Users } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const stats = [
    { icon: Briefcase, label: "Live roles", value: "1,200+" },
    { icon: Building2, label: "Companies hiring", value: "300+" },
    { icon: Users, label: "Candidates placed", value: "8,500+" },
]

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (e) => {
        e.preventDefault();
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <section className='relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background'>
            <div className='max-w-7xl mx-auto px-4 py-20 text-center'>
                <span className='inline-flex mx-auto px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold'>
                    Trusted by job seekers and recruiters
                </span>
                <h1 className='font-heading text-4xl sm:text-5xl font-extrabold tracking-tight mt-6'>
                    Search, apply & <br className='hidden sm:block' />
                    get your <span className='text-primary'>next role</span>
                </h1>
                <p className='text-muted-foreground max-w-xl mx-auto mt-4'>
                    JobHunt connects candidates with real openings from real companies —
                    no noise, just roles worth applying to.
                </p>

                <form onSubmit={searchJobHandler} className='flex w-full max-w-xl shadow-sm border border-border bg-card pl-4 rounded-full items-center gap-2 mx-auto mt-8'>
                    <Search className='h-4 w-4 text-muted-foreground shrink-0' />
                    <input
                        type="text"
                        placeholder='Job title, keyword, or company'
                        onChange={(e) => setQuery(e.target.value)}
                        className='outline-none border-none w-full bg-transparent py-3 text-sm placeholder:text-muted-foreground'
                    />
                    <Button type="submit" className="rounded-full px-6">
                        Search
                    </Button>
                </form>

                <dl className='flex flex-wrap justify-center gap-x-10 gap-y-4 mt-14'>
                    {stats.map(({ icon: Icon, label, value }) => (
                        <div key={label} className='flex items-center gap-2.5'>
                            <span className='flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary'>
                                <Icon className='h-4 w-4' />
                            </span>
                            <div className='text-left'>
                                <dt className='text-xs text-muted-foreground'>{label}</dt>
                                <dd className='font-heading font-bold leading-tight'>{value}</dd>
                            </div>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    )
}

export default HeroSection
