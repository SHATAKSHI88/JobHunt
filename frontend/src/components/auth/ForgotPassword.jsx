import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { Loader2, MailCheck } from 'lucide-react'

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/forgot-password`, { email });
            if (res.data.success) {
                setSent(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center min-h-[calc(100vh-4rem)] p-6'>
                <div className='w-full max-w-sm'>
                    {
                        sent ? (
                            <div className='text-center'>
                                <span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-4'>
                                    <MailCheck className='h-6 w-6' />
                                </span>
                                <h1 className='font-heading font-extrabold text-xl'>Check your email</h1>
                                <p className='text-sm text-muted-foreground mt-2'>
                                    If an account exists for <span className='font-medium text-foreground'>{email}</span>, we've sent a link to reset your password. It expires in 30 minutes.
                                </p>
                                <Link to="/login" className='text-sm text-primary hover:underline mt-6 inline-block'>Back to login</Link>
                            </div>
                        ) : (
                            <form onSubmit={submitHandler}>
                                <h1 className='font-heading font-extrabold text-2xl mb-1'>Forgot password</h1>
                                <p className='text-sm text-muted-foreground mb-6'>Enter the email on your account and we'll send you a reset link.</p>
                                <div className='space-y-1.5'>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                                </div>
                                {
                                    loading ? (
                                        <Button className="w-full mt-6" disabled><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Sending…</Button>
                                    ) : (
                                        <Button type="submit" className="w-full mt-6">Send reset link</Button>
                                    )
                                }
                                <p className='text-sm text-muted-foreground text-center mt-4'>
                                    <Link to="/login" className='text-primary hover:underline'>Back to login</Link>
                                </p>
                            </form>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
