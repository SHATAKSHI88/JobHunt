import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/authSlice'
import { Loader2, Briefcase, UploadCloud } from 'lucide-react'

const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: ""
    });
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }
    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });
            if (res.data.success) {
                navigate("/login");
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
            <div className='min-h-[calc(100vh-4rem)] grid lg:grid-cols-2'>
                <div className='hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12'>
                    <Link to="/" className='flex items-center gap-2'>
                        <span className='flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/15'>
                            <Briefcase className='h-4 w-4' />
                        </span>
                        <span className='font-heading text-xl font-extrabold'>JobHunt</span>
                    </Link>
                    <div>
                        <h2 className='font-heading text-3xl font-extrabold leading-tight'>Create your account.<br />It takes less than a minute.</h2>
                        <p className='mt-4 text-primary-foreground/80 max-w-sm'>Whether you're hiring or job hunting, JobHunt gets you there faster.</p>
                    </div>
                    <p className='text-sm text-primary-foreground/60'>© {new Date().getFullYear()} JobHunt</p>
                </div>

                <div className='flex items-center justify-center p-6'>
                    <form onSubmit={submitHandler} className='w-full max-w-sm'>
                        <h1 className='font-heading font-extrabold text-2xl mb-1'>Sign up</h1>
                        <p className='text-sm text-muted-foreground mb-6'>Let's get your account set up.</p>

                        <div className='space-y-1.5'>
                            <Label htmlFor="fullname">Full name</Label>
                            <Input id="fullname" type="text" value={input.fullname} name="fullname" onChange={changeEventHandler} placeholder="Jordan Patel" required />
                        </div>
                        <div className='space-y-1.5 mt-4'>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={input.email} name="email" onChange={changeEventHandler} placeholder="you@example.com" required />
                        </div>
                        <div className='space-y-1.5 mt-4'>
                            <Label htmlFor="phoneNumber">Phone number</Label>
                            <Input id="phoneNumber" type="text" value={input.phoneNumber} name="phoneNumber" onChange={changeEventHandler} placeholder="8080808080" required />
                        </div>
                        <div className='space-y-1.5 mt-4'>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={input.password} name="password" onChange={changeEventHandler} placeholder="At least 6 characters" required minLength={6} />
                        </div>

                        <fieldset className='mt-5'>
                            <legend className='text-sm font-medium mb-2'>I am a</legend>
                            <div className='grid grid-cols-2 gap-3'>
                                {["student", "recruiter"].map((role) => (
                                    <label
                                        key={role}
                                        className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm capitalize cursor-pointer transition-colors ${input.role === role ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:bg-muted'}`}
                                    >
                                        <input type="radio" name="role" value={role} checked={input.role === role} onChange={changeEventHandler} className="sr-only" />
                                        {role}
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <div className='space-y-1.5 mt-4'>
                            <Label htmlFor="file">Profile photo</Label>
                            <label htmlFor="file" className='flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-colors'>
                                <UploadCloud className='h-4 w-4' />
                                {input.file ? input.file.name : "Choose a photo (optional)"}
                            </label>
                            <input id="file" type="file" accept="image/*" onChange={changeFileHandler} className="hidden" />
                        </div>

                        {
                            loading ? (
                                <Button className="w-full mt-6" disabled><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait</Button>
                            ) : (
                                <Button type="submit" className="w-full mt-6">Create account</Button>
                            )
                        }
                        <p className='text-sm text-muted-foreground text-center mt-4'>
                            Already have an account? <Link to="/login" className='text-primary font-medium hover:underline'>Log in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup
