import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from './shared/Navbar'
import { Button } from './ui/button'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '@/redux/authSlice'

const VerifyEmail = () => {
    const { token } = useParams();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const [status, setStatus] = useState("verifying"); // verifying | success | error
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.post(`${USER_API_END_POINT}/verify-email/${token}`);
                if (res.data.success) {
                    setStatus("success");
                    // if the verifying user is already logged in on this device,
                    // reflect the verified state immediately without a re-login
                    if (user) {
                        dispatch(setUser({ ...user, isVerified: true }));
                    }
                }
            } catch (error) {
                setStatus("error");
                setMessage(error.response?.data?.message || "This link is invalid or has expired.");
            }
        }
        verify();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center min-h-[calc(100vh-4rem)] p-6'>
                <div className='w-full max-w-sm text-center'>
                    {
                        status === "verifying" && (
                            <>
                                <Loader2 className='h-8 w-8 animate-spin text-primary mx-auto mb-4' />
                                <p className='text-muted-foreground'>Verifying your email…</p>
                            </>
                        )
                    }
                    {
                        status === "success" && (
                            <>
                                <span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-4'>
                                    <CheckCircle2 className='h-6 w-6' />
                                </span>
                                <h1 className='font-heading font-extrabold text-xl'>Email verified</h1>
                                <p className='text-sm text-muted-foreground mt-2'>Your account is now fully set up.</p>
                                <Link to="/"><Button className="mt-6">Go to homepage</Button></Link>
                            </>
                        )
                    }
                    {
                        status === "error" && (
                            <>
                                <span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4'>
                                    <XCircle className='h-6 w-6' />
                                </span>
                                <h1 className='font-heading font-extrabold text-xl'>Verification failed</h1>
                                <p className='text-sm text-muted-foreground mt-2'>{message}</p>
                                <Link to="/"><Button variant="outline" className="mt-6">Go to homepage</Button></Link>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail
