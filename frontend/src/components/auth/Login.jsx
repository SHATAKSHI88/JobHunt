import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import PageTransition from '../shared/PageTransition'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { PasswordInput } from '../ui/password-input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import { Loader2, Briefcase, CheckCircle2 } from 'lucide-react'

const highlights = [
    "Track every application in one place",
    "Get notified the moment your status changes",
    "Save roles and come back to them anytime",
]

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            dispatch(setLoading(false));
        }
    }
    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [])

    return (
        <div>
            <Navbar />
            <PageTransition>
            <div className='min-h-[calc(100vh-4rem)] grid lg:grid-cols-2'>
                {/* Left panel */}
                <div className='hidden lg:flex relative flex-col justify-between overflow-hidden bg-[#123a8a] p-12'>
                    {/* decorative background */}
                    <div
                        className='pointer-events-none absolute inset-0 opacity-[0.15]'
                        style={{
                            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                    />
                    <div className='pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl' />
                    <div className='pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl' />

                    <Link to="/" className='relative flex items-center gap-2 z-10'>
                        <span className='flex h-9 w-9 items-center justify-center rounded-md bg-white/15 backdrop-blur'>
                            <Briefcase className='h-4 w-4 text-white' />
                        </span>
                        <span className='font-heading text-xl font-extrabold text-white'>JobHunt</span>
                    </Link>

                    <div className='relative z-10'>
                        <h2 className='font-heading text-4xl font-extrabold leading-tight text-white'>
                            Welcome back.<br />Your next opportunity is waiting.
                        </h2>
                        <p className='mt-4 text-white/70 max-w-sm'>
                            Sign in to keep track of your applications, or manage your open roles as a recruiter.
                        </p>
                        <ul className='mt-8 space-y-3'>
                            {highlights.map((item) => (
                                <li key={item} className='flex items-center gap-2.5 text-white/90 text-sm'>
                                    <CheckCircle2 className='h-4 w-4 text-emerald-300 shrink-0' />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className='relative z-10 text-sm text-white/50'>© {new Date().getFullYear()} JobHunt</p>
                </div>

                {/* Right panel */}
                <div className='flex items-center justify-center p-6'>
                    <form onSubmit={submitHandler} className='w-full max-w-sm'>
                        <h1 className='font-heading font-extrabold text-2xl mb-1'>Log in</h1>
                        <p className='text-sm text-muted-foreground mb-6'>Enter your details to access your account.</p>

                        <div className='space-y-1.5'>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={input.email}
                                name="email"
                                onChange={changeEventHandler}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className='space-y-1.5 mt-4'>
                            <div className='flex items-center justify-between'>
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className='text-xs text-primary hover:underline'>Forgot password?</Link>
                            </div>
                            <PasswordInput
                                id="password"
                                value={input.password}
                                name="password"
                                onChange={changeEventHandler}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <fieldset className='mt-5'>
                            <legend className='text-sm font-medium mb-2'>I am a</legend>
                            <div className='grid grid-cols-2 gap-3'>
                                {["student", "recruiter"].map((role) => (
                                    <label
                                        key={role}
                                        className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm capitalize cursor-pointer transition-colors ${input.role === role ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:bg-muted'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role}
                                            checked={input.role === role}
                                            onChange={changeEventHandler}
                                            className="sr-only"
                                        />
                                        {role}
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {
                            loading ? (
                                <Button className="w-full mt-6" disabled><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait</Button>
                            ) : (
                                <Button type="submit" className="w-full mt-6">Log in</Button>
                            )
                        }
                        <p className='text-sm text-muted-foreground text-center mt-4'>
                            Don't have an account? <Link to="/signup" className='text-primary font-medium hover:underline'>Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </PageTransition>
        </div>
    )
}

export default Login
