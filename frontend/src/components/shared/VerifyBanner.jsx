import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Mail, X, Loader2 } from 'lucide-react'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'

const VerifyBanner = () => {
    const { user } = useSelector(store => store.auth);
    const [dismissed, setDismissed] = useState(false);
    const [sending, setSending] = useState(false);

    // undefined covers accounts that existed before this field was added —
    // treat those as verified rather than nagging everyone retroactively
    if (!user || user.isVerified !== false || dismissed) return null;

    const resend = async () => {
        try {
            setSending(true);
            const res = await axios.post(`${USER_API_END_POINT}/resend-verification`, {}, { withCredentials: true });
            if (res.data.success) toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Couldn't resend the email.");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className='bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400'>
            <div className='max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm'>
                <span className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 shrink-0' />
                    Please verify your email to get the most out of your account.
                </span>
                <div className='flex items-center gap-3 shrink-0'>
                    <button onClick={resend} disabled={sending} className='font-medium hover:underline flex items-center gap-1.5'>
                        {sending && <Loader2 className='h-3 w-3 animate-spin' />}
                        Resend email
                    </button>
                    <button onClick={() => setDismissed(true)} aria-label="Dismiss">
                        <X className='h-4 w-4' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyBanner
