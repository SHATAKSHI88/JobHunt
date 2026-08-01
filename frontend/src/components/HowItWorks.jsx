import React from 'react'
import { Search, FileEdit, CheckCircle2 } from 'lucide-react'

const steps = [
    {
        icon: Search,
        title: "Find the right role",
        description: "Search and filter thousands of real openings by location, type, and salary.",
    },
    {
        icon: FileEdit,
        title: "Apply in one click",
        description: "Build your profile once, then apply to roles instantly with your saved resume.",
    },
    {
        icon: CheckCircle2,
        title: "Track every application",
        description: "Get notified the moment a recruiter reviews, accepts, or updates your application.",
    },
]

const HowItWorks = () => {
    return (
        <section className='max-w-7xl mx-auto px-4 my-20'>
            <div className='text-center max-w-xl mx-auto mb-12'>
                <h2 className='font-heading text-3xl font-extrabold tracking-tight'>How JobHunt works</h2>
                <p className='text-muted-foreground text-sm mt-2'>From search to offer, in three simple steps.</p>
            </div>
            <div className='grid sm:grid-cols-3 gap-6'>
                {steps.map(({ icon: Icon, title, description }, i) => (
                    <div key={title} className='relative bg-card border border-border rounded-lg p-6'>
                        <span className='absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold'>
                            {i + 1}
                        </span>
                        <span className='flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary mb-4'>
                            <Icon className='h-5 w-5' />
                        </span>
                        <h3 className='font-heading font-bold mb-1.5'>{title}</h3>
                        <p className='text-sm text-muted-foreground leading-relaxed'>{description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default HowItWorks
