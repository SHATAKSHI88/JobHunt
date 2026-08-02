import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../ui/command'
import {
    Home, Briefcase, Compass, Bookmark, User2, Building2,
    LayoutDashboard, PlusCircle, Loader2, MapPin,
} from 'lucide-react'
import { JOB_API_END_POINT } from '@/utils/constant'

const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);

    // global ⌘K / Ctrl+K to open, from anywhere in the app — plus a custom
    // event so a visible button (e.g. in the navbar) can open it too
    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        const openViaEvent = () => setOpen(true);
        document.addEventListener("keydown", down);
        window.addEventListener("open-command-palette", openViaEvent);
        return () => {
            document.removeEventListener("keydown", down);
            window.removeEventListener("open-command-palette", openViaEvent);
        };
    }, []);

    // debounced job search as the user types
    useEffect(() => {
        if (!open || !query.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        const handle = setTimeout(async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${encodeURIComponent(query)}&limit=5`);
                if (res.data.success) setResults(res.data.jobs);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(handle);
    }, [query, open]);

    const go = useCallback((path) => {
        navigate(path);
        setOpen(false);
        setQuery("");
    }, [navigate]);

    const studentLinks = [
        { label: "Home", icon: Home, path: "/" },
        { label: "Browse jobs", icon: Briefcase, path: "/jobs" },
        { label: "Search", icon: Compass, path: "/browse" },
        { label: "Saved jobs", icon: Bookmark, path: "/saved-jobs" },
        { label: "Your profile", icon: User2, path: "/profile" },
    ];
    const recruiterLinks = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { label: "Companies", icon: Building2, path: "/admin/companies" },
        { label: "Manage jobs", icon: Briefcase, path: "/admin/jobs" },
        { label: "Post a job", icon: PlusCircle, path: "/admin/jobs/create" },
    ];
    const navLinks = user?.role === 'recruiter' ? recruiterLinks : studentLinks;

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Search jobs, or jump to a page…"
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                <CommandEmpty>
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                        </span>
                    ) : "No results found."}
                </CommandEmpty>

                {
                    results.length > 0 && (
                        <CommandGroup heading="Jobs">
                            {results.map((job) => (
                                <CommandItem
                                    key={job._id}
                                    value={`job-${job._id}-${job.title}`}
                                    onSelect={() => go(`/description/${job._id}`)}
                                >
                                    <Briefcase className="mr-2 h-4 w-4 text-primary shrink-0" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate">{job.title}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                            {job.company?.name} <MapPin className="h-3 w-3 shrink-0" /> {job.location}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )
                }

                <CommandGroup heading="Go to">
                    {navLinks.map(({ label, icon: Icon, path }) => (
                        <CommandItem key={path} value={label} onSelect={() => go(path)}>
                            <Icon className="mr-2 h-4 w-4 shrink-0" />
                            {label}
                        </CommandItem>
                    ))}
                    {
                        !user && (
                            <CommandItem value="login" onSelect={() => go("/login")}>
                                <User2 className="mr-2 h-4 w-4 shrink-0" />
                                Log in
                            </CommandItem>
                        )
                    }
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}

export default CommandPalette
