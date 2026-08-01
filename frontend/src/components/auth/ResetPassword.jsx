import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords don't match.");
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/reset-password/${token}`, { password });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/login");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "This link is invalid or expired.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center min-h-[calc(100vh-4rem)] p-6'>
                <form onSubmit={submitHandler} className='w-full max-w-sm'>
                    <h1 className='font-heading font-extrabold text-2xl mb-1'>Set a new password</h1>
                    <p className='text-sm text-muted-foreground mb-6'>Choose a new password for your account.</p>

                    <div className='space-y-1.5'>
                        <Label htmlFor="password">New password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} />
                    </div>
                    <div className='space-y-1.5 mt-4'>
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required minLength={6} />
                    </div>

                    {
                        loading ? (
                            <Button className="w-full mt-6" disabled><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Updating…</Button>
                        ) : (
                            <Button type="submit" className="w-full mt-6">Reset password</Button>
                        )
                    }
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
