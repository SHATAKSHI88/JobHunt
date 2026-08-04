import React, { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Bell, CheckCheck, Briefcase, BellRing } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { NOTIFICATIONS_API_END_POINT } from '@/utils/constant'

const timeAgo = (iso) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const typeIcon = {
    application_status: CheckCheck,
    job_alert: Briefcase,
}

const NotificationBell = () => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(NOTIFICATIONS_API_END_POINT, { withCredentials: true });
            if (res.data.success) {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // poll every 45s while logged in, so the bell stays reasonably fresh
    // without hammering the server or needing websockets for this scale
    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 45000);
        return () => clearInterval(interval);
    }, [user?._id]);

    if (!user) return null;

    const openHandler = (isOpen) => {
        setOpen(isOpen);
        if (isOpen) fetchNotifications();
    }

    const clickNotification = async (n) => {
        setOpen(false);
        if (!n.read) {
            try {
                await axios.post(`${NOTIFICATIONS_API_END_POINT}/${n._id}/read`, {}, { withCredentials: true });
                setUnreadCount((c) => Math.max(0, c - 1));
            } catch (error) {
                console.log(error);
            }
        }
        if (n.link) navigate(n.link);
    }

    const markAllRead = async (e) => {
        e.stopPropagation();
        try {
            await axios.post(`${NOTIFICATIONS_API_END_POINT}/read-all`, {}, { withCredentials: true });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Popover open={open} onOpenChange={openHandler}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-full" aria-label="Notifications">
                    <Bell className='h-4 w-4' />
                    {
                        unreadCount > 0 && (
                            <span className='absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground'>
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )
                    }
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
                    <p className='font-semibold text-sm'>Notifications</p>
                    {
                        unreadCount > 0 && (
                            <button onClick={markAllRead} className='text-xs text-primary hover:underline'>
                                Mark all read
                            </button>
                        )
                    }
                </div>
                <div className='max-h-96 overflow-y-auto scroll-thin'>
                    {
                        notifications.length === 0 ? (
                            <div className='flex flex-col items-center justify-center text-center py-10 px-4'>
                                <BellRing className='h-7 w-7 text-muted-foreground mb-2' />
                                <p className='text-sm text-muted-foreground'>Nothing yet — we'll let you know when something changes.</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const Icon = typeIcon[n.type] || Bell;
                                return (
                                    <button
                                        key={n._id}
                                        onClick={() => clickNotification(n)}
                                        className={`flex items-start gap-3 w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                    >
                                        <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                                            <Icon className='h-4 w-4' />
                                        </span>
                                        <div className='min-w-0 flex-1'>
                                            <p className='text-sm font-medium leading-snug'>{n.title}</p>
                                            <p className='text-xs text-muted-foreground mt-0.5 line-clamp-2'>{n.message}</p>
                                            <p className='text-[11px] text-muted-foreground mt-1'>{timeAgo(n.createdAt)}</p>
                                        </div>
                                        {!n.read && <span className='h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5' />}
                                    </button>
                                )
                            })
                        )
                    }
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default NotificationBell
