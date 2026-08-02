import React from 'react'

// Simple, theme-aware line-art illustrations (stroke uses currentColor so
// they automatically adapt to light/dark mode) for empty states across the
// app, replacing plain icon+text placeholders.
const variants = {
    search: (
        <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="20" y="24" width="70" height="16" rx="4" className="fill-muted" />
            <rect x="20" y="48" width="90" height="16" rx="4" className="fill-muted" />
            <rect x="20" y="72" width="55" height="16" rx="4" className="fill-muted" />
            <circle cx="112" cy="66" r="26" stroke="currentColor" strokeWidth="4" className="text-primary" />
            <line x1="131" y1="85" x2="148" y2="102" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-primary" />
        </svg>
    ),
    bookmark: (
        <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="30" y="14" width="60" height="92" rx="6" className="fill-muted" />
            <path d="M62 14H90V60L76 50L62 60V14Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" className="text-primary fill-card" />
            <circle cx="118" cy="88" r="18" className="fill-accent/15" />
            <path d="M111 88L116 93L126 82" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
        </svg>
    ),
    applications: (
        <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="24" y="34" width="76" height="58" rx="6" className="fill-muted" />
            <rect x="44" y="24" width="36" height="16" rx="4" stroke="currentColor" strokeWidth="4" className="text-primary fill-card" />
            <line x1="38" y1="58" x2="86" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-border" />
            <line x1="38" y1="70" x2="72" y2="70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-border" />
            <circle cx="120" cy="76" r="20" className="fill-accent/15" />
            <path d="M112 76L118 82L130 68" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
        </svg>
    ),
}

const EmptyState = ({ variant = "search", title, description, action }) => {
    return (
        <div className='flex flex-col items-center justify-center text-center py-16 px-6'>
            <div className='w-40 h-32 mb-4'>
                {variants[variant] || variants.search}
            </div>
            <p className='font-semibold'>{title}</p>
            {description && <p className='text-sm text-muted-foreground mt-1 max-w-xs'>{description}</p>}
            {action && <div className='mt-4'>{action}</div>}
        </div>
    )
}

export default EmptyState
