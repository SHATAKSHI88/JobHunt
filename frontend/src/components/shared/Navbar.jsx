import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { LogOut, User2, Briefcase, Bookmark, Menu, X, Search, Bell } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import ThemeToggle from './ThemeToggle'
import CommandPalette from './CommandPalette'
import RouteProgressBar from './RouteProgressBar'
import CompareBar from './CompareBar'

const navLinkClass = ({ isActive }) =>
    `relative py-1 transition-colors hover:text-foreground ${
        isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
    }`

const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
    }`

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = user && user.role === 'recruiter'
        ? [
            { to: "/admin/dashboard", label: "Dashboard" },
            { to: "/admin/companies", label: "Companies" },
            { to: "/admin/jobs", label: "Jobs" },
        ]
        : [
            { to: "/", label: "Home", end: true },
            { to: "/jobs", label: "Jobs" },
            { to: "/browse", label: "Browse" },
            { to: "/saved-jobs", label: "Saved" },
        ];

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
        } finally {
            setMobileOpen(false);
        }
    }

    return (
        <header className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
            <RouteProgressBar />
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4'>
                <Link to="/" className='flex items-center gap-2' onClick={() => setMobileOpen(false)}>
                    <span className='flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                        <Briefcase className='h-4 w-4' />
                    </span>
                    <h1 className='font-heading text-xl font-extrabold tracking-tight'>
                        Job<span className='text-primary'>Hunt</span>
                    </h1>
                </Link>

                {/* Desktop nav */}
                <div className='hidden md:flex items-center gap-8'>
                    <nav>
                        <ul className='flex font-medium items-center gap-6 text-sm'>
                            {navLinks.map((link) => (
                                <li key={link.to}>
                                    <NavLink to={link.to} end={link.end} className={navLinkClass}>{link.label}</NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <Button
                        variant="outline"
                        onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                        className="hidden md:flex items-center gap-2 text-muted-foreground font-normal h-9 px-3"
                    >
                        <Search className='h-3.5 w-3.5' />
                        <span className='hidden lg:inline'>Search</span>
                        <kbd className='hidden lg:inline-block ml-2 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border'>⌘K</kbd>
                    </Button>

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
                                                    <>
                                                        <Link to="/profile" className='flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors'>
                                                            <User2 className='h-4 w-4' />
                                                            View Profile
                                                        </Link>
                                                        <Link to="/saved-jobs" className='flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors'>
                                                            <Bookmark className='h-4 w-4' />
                                                            Saved Jobs
                                                        </Link>
                                                        <Link to="/alerts" className='flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors'>
                                                            <Bell className='h-4 w-4' />
                                                            Job Alerts
                                                        </Link>
                                                    </>
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

                {/* Mobile controls: theme toggle always visible, rest behind hamburger */}
                <div className='flex items-center gap-2 md:hidden'>
                    <ThemeToggle />
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        {mobileOpen ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
                    </Button>
                </div>
            </div>

            {/* Mobile menu panel */}
            {
                mobileOpen && (
                    <div className='md:hidden border-t border-border bg-background px-4 py-4'>
                        <button
                            onClick={() => { window.dispatchEvent(new Event("open-command-palette")); setMobileOpen(false); }}
                            className='flex w-full items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm text-muted-foreground mb-3'
                        >
                            <Search className='h-4 w-4' /> Search jobs & pages
                        </button>
                        <nav>
                            <ul className='flex flex-col gap-1'>
                                {navLinks.map((link) => (
                                    <li key={link.to}>
                                        <NavLink to={link.to} end={link.end} className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                                            {link.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className='border-t border-border mt-4 pt-4'>
                            {
                                !user ? (
                                    <div className='flex items-center gap-2'>
                                        <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full">Login</Button></Link>
                                        <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}><Button className="w-full">Signup</Button></Link>
                                    </div>
                                ) : (
                                    <div className='flex flex-col gap-1'>
                                        <div className='flex items-center gap-3 px-1 pb-3'>
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                                <AvatarFallback>{user?.fullname?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className='font-semibold text-sm'>{user?.fullname}</p>
                                                <p className='text-xs text-muted-foreground'>{user?.email}</p>
                                            </div>
                                        </div>
                                        {
                                            user.role === 'student' && (
                                                <>
                                                    <NavLink to="/profile" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                                                        <span className='flex items-center gap-2'><User2 className='h-4 w-4' /> View Profile</span>
                                                    </NavLink>
                                                    <NavLink to="/saved-jobs" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                                                        <span className='flex items-center gap-2'><Bookmark className='h-4 w-4' /> Saved Jobs</span>
                                                    </NavLink>
                                                    <NavLink to="/alerts" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>
                                                        <span className='flex items-center gap-2'><Bell className='h-4 w-4' /> Job Alerts</span>
                                                    </NavLink>
                                                </>
                                            )
                                        }
                                        <button onClick={logoutHandler} className='flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-left text-destructive hover:bg-destructive/10 transition-colors'>
                                            <LogOut className='h-4 w-4' />
                                            Logout
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }
            <CommandPalette />
            <CompareBar />
        </header>
    )
}

export default Navbar
