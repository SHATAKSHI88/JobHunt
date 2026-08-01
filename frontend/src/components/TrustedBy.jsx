import React from 'react'

// Text-based "trusted by" logo strip — deliberately monochrome/muted so it
// reads as a credibility signal rather than competing with real job cards.
const companies = [
    "TechNova", "Skyline Software", "Nimbus Cloud", "BrightPath Analytics", "GreenLeaf Consulting",
]

const TrustedBy = () => {
    return (
        <section className='border-b border-border bg-background'>
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <p className='text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5'>
                    Companies hiring on JobHunt
                </p>
                <div className='flex flex-wrap items-center justify-center gap-x-10 gap-y-3'>
                    {companies.map((name) => (
                        <span key={name} className='font-heading font-bold text-lg text-muted-foreground/60 hover:text-muted-foreground transition-colors'>
                            {name}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default TrustedBy
