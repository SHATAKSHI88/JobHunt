import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { LogOut, User2, Briefcase } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import ThemeToggle from './ThemeToggle'

const navLinkClass = ({ isActive }) =>
    `relative py-1 transition-colors hover:text-foreground ${
        isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
    }`

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong.");
        }
    }

    return (
        <header className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4'>
                <Link to="/" className='flex items-center gap-2'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                        <Briefcase className='h-4 w-4' />
                    </span>
                    <h1 className='font-heading text-xl font-extrabold tracking-tight'>
                        Job<span className='text-primary'>Hunt</span>
                    </h1>
                </Link>

                <div className='flex items-center gap-8'>
                    <nav>
                        <ul className='flex font-medium items-center gap-6 text-sm'>
                            {
                                user && user.role === 'recruiter' ? (
                                    <>
                                        <li><NavLink to="/admin/dashboard" className={navLinkClass}>Dashboard</NavLink></li>
                                        <li><NavLink to="/admin/companies" className={navLinkClass}>Companies</NavLink></li>
                                        <li><NavLink to="/admin/jobs" className={navLinkClass}>Jobs</NavLink></li>
                                    </>
                                ) : (
                                    <>
                                        <li><NavLink to="/" end className={navLinkClass}>Home</NavLink></li>
                                        <li><NavLink to="/jobs" className={navLinkClass}>Jobs</NavLink></li>
                                        <li><NavLink to="/browse" className={navLinkClass}>Browse</NavLink></li>
                                    </>
                                )
                            }
                        </ul>
                    </nav>

                    <ThemeToggle />

                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline">Login</Button></Link>
                                <Link to="/signup"><Button>Signup</Button></Link>
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="cursor-pointer h-9 w-9 ring-1 ring-border">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                        <AvatarFallback>{user?.fullname?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div>
                                        <div className='flex gap-3'>
                                            <Avatar className="h-11 w-11">
                                                <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                                <AvatarFallback>{user?.fullname?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className='font-semibold'>{user?.fullname}</h4>
                                                <p className='text-sm text-muted-foreground line-clamp-1'>{user?.profile?.bio || user?.email}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col mt-4 gap-1'>
                                            {
                                                user && user.role === 'student' && (
                                                    <Link to="/profile" className='flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors'>
                                                        <User2 className='h-4 w-4' />
                                                        View Profile
                                                    </Link>
                                                )
                                            }
                                            <button onClick={logoutHandler} className='flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left hover:bg-muted transition-colors'>
                                                <LogOut className='h-4 w-4' />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )
                    }
                </div>
            </div>
        </header>
    )
}

export default Navbar
