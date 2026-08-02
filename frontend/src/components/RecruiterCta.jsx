import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import { ArrowRight, Building2 } from 'lucide-react'

const RecruiterCta = () => {
    const { user } = useSelector(store => store.auth);
    // Only worth showing to logged-out visitors or students — a recruiter
    // already has their own dashboard link in the nav.
    if (user?.role === 'recruiter') return null;

    return (
        <section className='max-w-7xl mx-auto px-4 my-20'>
            <div className='relative overflow-hidden rounded-xl bg-primary px-8 py-12 sm:px-14 text-center'>
                <div
                    className='pointer-events-none absolute inset-0 opacity-[0.12]'
                    style={{
                        backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                        backgroundSize: "22px 22px",
                    }}
                />
                <div className='relative'>
                    <span className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 mb-4'>
                        <Building2 className='h-5 w-5 text-white' />
                    </span>
                    <h2 className='font-heading text-2xl sm:text-3xl font-extrabold text-white'>Hiring? Post a job in minutes.</h2>
                    <p className='text-white/70 max-w-md mx-auto mt-2 text-sm'>
                        Reach thousands of active candidates and manage every applicant from one dashboard.
                    </p>
                    <Link to={user ? "/admin/companies" : "/signup"}>
                        <Button size="lg" variant="secondary" className="mt-6">
                            {user ? "Post a job" : "Get started as a recruiter"} <ArrowRight className='h-4 w-4 ml-2' />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default RecruiterCta
