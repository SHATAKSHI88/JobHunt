import React from 'react'
import { Building2 } from 'lucide-react'

// Deterministic, tasteful color per company (not random) so a given
// company always gets the same badge color across renders.
const palette = [
    "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
]

const companies = [
    "TechNova", "Skyline Software", "Nimbus Cloud", "BrightPath Analytics", "GreenLeaf Consulting",
]

const TrustedBy = () => {
    return (
        <section className='border-b border-border bg-card'>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <p className='text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5'>
                    Companies hiring on JobHunt
                </p>
                <div className='flex flex-wrap items-center justify-center gap-3'>
                    {companies.map((name, i) => (
                        <div
                            key={name}
                            className='flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 hover:border-primary/40 transition-colors'
                        >
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${palette[i % palette.length]}`}>
                                <Building2 className='h-3 w-3' />
                            </span>
                            <span className='font-heading font-semibold text-sm text-foreground/80'>{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default TrustedBy
