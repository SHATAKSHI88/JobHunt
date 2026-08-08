import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Mail, X, Loader2, ArrowRight } from 'lucide-react'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'

const VerifyBanner = () => {
    const { user } = useSelector(store => store.auth);
    const [dismissed, setDismissed] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    // undefined covers accounts that existed before this field was added —
    // treat those as verified rather than nagging everyone retroactively
    if (!user || user.isVerified !== false || dismissed) return null;

    const resend = async () => {
        try {
            setSending(true);
            const res = await axios.post(`${USER_API_END_POINT}/resend-verification`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setSent(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't resend the email.");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className='relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-b border-amber-500/25'>
            <div
                className='pointer-events-none absolute inset-0 opacity-[0.5]'
                style={{
                    backgroundImage: "radial-gradient(circle, rgb(217 119 6 / 0.15) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                }}
            />
            <div className='relative max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2.5 min-w-0'>
                    <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400'>
                        <Mail className='h-3.5 w-3.5' />
                    </span>
                    <p className='text-sm text-amber-900 dark:text-amber-200 truncate'>
                        <span className='font-medium'>Verify your email</span>
                        <span className='hidden sm:inline text-amber-800/80 dark:text-amber-300/70'> — get status updates and job alerts sent straight to your inbox.</span>
                    </p>
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                    {
                        sent ? (
                            <span className='text-xs font-medium text-amber-800 dark:text-amber-300'>Check your inbox</span>
                        ) : (
                            <button
                                onClick={resend}
                                disabled={sending}
                                className='flex items-center gap-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3.5 py-1.5 transition-colors disabled:opacity-60'
                            >
                                {sending ? <Loader2 className='h-3 w-3 animate-spin' /> : <>Resend email <ArrowRight className='h-3 w-3' /></>}
                            </button>
                        )
                    }
                    <button
                        onClick={() => setDismissed(true)}
                        aria-label="Dismiss"
                        className='flex h-6 w-6 items-center justify-center rounded-full text-amber-700/70 hover:text-amber-900 hover:bg-amber-500/15 dark:text-amber-400/70 dark:hover:text-amber-200 transition-colors'
                    >
                        <X className='h-3.5 w-3.5' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyBanner
